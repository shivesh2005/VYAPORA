import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, AIMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export const FloatingAssistant: React.FC = () => {
  const location = useLocation();
  const { language, formatPrice } = useLanguage();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [assistantLang, setAssistantLang] = useState<'en' | 'hi'>(() => {
    try {
      const saved = sessionStorage.getItem('vyapora_floating_assistant_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {}
    return language === 'hi' ? 'hi' : 'en';
  });

  const isAssistantHindi = assistantLang === 'hi';
  const isHindi = language === 'hi';

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('vyapora_floating_assistant_msgs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('vyapora_floating_assistant_sid');
    if (!sid) {
      sid = `float-session-${Date.now()}`;
      sessionStorage.setItem('vyapora_floating_assistant_sid', sid);
    }
    return sid;
  });

  const [isDisabled, setIsDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not display on full-screen assistant page
  const isFullScreenAssistant =
    location.pathname === '/assistant' || location.pathname === '/ai-assistant';
  // Avoid covering critical controls on checkout page
  const isCheckoutPage = location.pathname === '/checkout';

  // Persist messages in sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('vyapora_floating_assistant_msgs', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Keyboard accessibility: Escape to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  if (isFullScreenAssistant || isCheckoutPage) {
    return null;
  }

  const handleSend = async (messageToSend?: string) => {
    const query = (messageToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg: AIMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyContext = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.ai.chat({
        message: query,
        sessionId,
        history: historyContext,
        language: assistantLang,
      });

      if (res.success) {
        const assistantMsg: AIMessage = {
          role: 'assistant',
          content: res.reply,
          products: res.products,
          suggestions: res.suggestions,
          mode: res.mode,
          tokensUsed: res.tokensUsed,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        if ((res as any).isAssistantDisabled) {
          setIsDisabled(true);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              res.reply ||
              (isAssistantHindi
                ? 'शॉपिंग सहायक वर्तमान में अक्षम या अनुपलब्ध है। कृपया सर्च बार का उपयोग करें।'
                : 'The shopping assistant is currently disabled or unavailable. Please use the search bar.'),
            suggestions: isAssistantHindi ? ['सभी उत्पाद खोजें', 'श्रेणियां देखें'] : ['Search all products', 'Browse categories'],
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAssistantHindi
            ? 'इस समय सहायक से कनेक्ट करने में असमर्थ। आप हमारे कैटलॉग को खोजने के लिए ऊपर दिए गए सर्च बार का उपयोग कर सकते हैं।'
            : 'Unable to connect to the assistant right now. You can use the search bar above to browse our catalog.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateMessage = async (idx: number) => {
    const msg = messages[idx];
    if (!msg || msg.role !== 'assistant') return;
    const targetLang: 'en' | 'hi' = assistantLang === 'hi' ? 'en' : 'hi';
    try {
      setTranslatingIndex(idx);
      const res = await api.ai.translate({
        text: msg.content,
        targetLanguage: targetLang,
      });
      if (res.success && res.translatedText) {
        setMessages((prev) =>
          prev.map((m, i) => (i === idx ? { ...m, content: res.translatedText } : m))
        );
        showToast(
          targetLang === 'hi' ? 'हिंदी में अनुवादित!' : 'Translated to English!',
          'success'
        );
      } else {
        showToast('Translation service unavailable.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Translation failed.', 'error');
    } finally {
      setTranslatingIndex(null);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem('vyapora_floating_assistant_msgs');
    } catch {}
    showToast('Conversation cleared.', 'info');
  };

  const quickPrompts = isAssistantHindi
    ? [
        '50,000 के अंदर सबसे अच्छा लैपटॉप',
        'Noise-cancelling हेडफोन दिखाओ',
        '2,000 के अंदर गिफ्ट सुझाव',
      ]
    : [
        'Laptops under ₹50,000',
        'Noise-cancelling headphones',
        'Gifts under ₹2,000',
      ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            aria-label={isHindi ? 'शॉपिंग सहायक से पूछें' : 'Ask Shopping Assistant'}
            className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-full shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-wide pr-1">
              {isHindi ? 'शॉपिंग सहायक से पूछें' : 'Ask Shopping Assistant'}
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Shopping Assistant Chat Drawer"
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-16' : 'h-[560px] max-h-[85vh]'
          }`}
        >
          {/* Drawer Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  {isAssistantHindi ? 'व्यापोरा शॉपिंग सहायक' : 'VYAPORA Assistant'}
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-indigo-200/80">
                  {isAssistantHindi ? 'कैटलॉग-आधारित सहायता' : 'Live catalog discovery'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* In-assistant Language Toggle */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[10px] font-bold border border-white/15 mr-1">
                <button
                  type="button"
                  onClick={() => {
                    setAssistantLang('en');
                    try {
                      sessionStorage.setItem('vyapora_floating_assistant_lang', 'en');
                    } catch {}
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    assistantLang === 'en'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                  title="English Mode"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssistantLang('hi');
                    try {
                      sessionStorage.setItem('vyapora_floating_assistant_lang', 'hi');
                    } catch {}
                  }}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    assistantLang === 'hi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-200 hover:text-white'
                  }`}
                  title="हिन्दी मोड"
                >
                  HI
                </button>
              </div>

              {messages.length > 0 && !isMinimized && (
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close Assistant"
                className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body (Hidden if minimized) */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Welcome Message if empty */}
                {messages.length === 0 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {isAssistantHindi ? 'नमस्ते! मैं आपकी क्या मदद करूँ?' : 'Hi! How can I help you shop?'}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] max-w-xs mx-auto">
                        {isAssistantHindi
                          ? 'बजट, फीचर्स या प्रोडक्ट्स की तुलना करने के लिए मुझसे कुछ भी पूछें।'
                          : 'Ask for budget recommendations, compare specs, or discover products in our catalog.'}
                      </p>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {isAssistantHindi ? 'सुझावित प्रश्न' : 'Suggested Questions'}
                      </span>
                      <div className="flex flex-col gap-1.5 text-left">
                        {quickPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-100 dark:border-slate-700 transition-colors text-[11px] flex items-center justify-between"
                          >
                            <span>{prompt}</span>
                            <span className="text-indigo-500">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages list */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-[11px] sm:text-xs whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Translate response button for assistant messages */}
                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleTranslateMessage(i)}
                        disabled={translatingIndex === i}
                        className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-0.5 rounded transition-colors"
                        title={
                          isAssistantHindi
                            ? 'Translate response to English'
                            : 'Translate response to Hindi'
                        }
                      >
                        <Globe className="w-3 h-3" />
                        <span>
                          {translatingIndex === i
                            ? isAssistantHindi
                              ? 'अनुवाद हो रहा है...'
                              : 'Translating...'
                            : isAssistantHindi
                            ? 'Translate to English'
                            : 'हिंदी में अनुवाद करें'}
                        </span>
                      </button>
                    )}

                    {/* Product Recommendation Cards (if any) */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 w-full space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isHindi ? 'सुझाए गए उत्पाद' : 'Recommended Products'}
                        </span>
                        <div className="space-y-2">
                          {msg.products.map((product) => (
                            <div
                              key={product._id}
                              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-400 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={product.images?.[0] || 'https://placehold.co/80x80'}
                                  alt={product.title}
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shrink-0"
                                />
                                <div className="min-w-0">
                                  <Link
                                    to={`/product/${product.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="font-bold text-slate-900 dark:text-white truncate block hover:text-indigo-600 dark:hover:text-indigo-400"
                                  >
                                    {product.title}
                                  </Link>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                      {formatPrice(product.price)}
                                    </span>
                                    {product.rating > 0 && (
                                      <span>★ {product.rating.toFixed(1)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Link
                                  to={`/product/${product.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="View Details"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => {
                                    addToCart(product._id, 1);
                                    showToast(`${product.title} added to cart!`, 'success');
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  + Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(s)}
                            className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium border border-indigo-200/50 dark:border-indigo-800 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading Bubble */}
                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-500">
                      {isHindi ? 'कैटलॉग में खोज रहे हैं...' : 'Searching live catalog...'}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isHindi
                        ? 'शॉपिंग से जुड़ा सवाल पूछें...'
                        : 'Ask e.g. headphones under ₹3,000...'
                    }
                    disabled={loading || isDisabled}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || isDisabled}
                    aria-label="Send message"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 px-1">
                  <span>Grounded in MongoDB catalog</span>
                  <Link
                    to="/assistant"
                    onClick={() => setIsOpen(false)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Open full assistant &rarr;
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
