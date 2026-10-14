import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  RotateCcw,
  User as UserIcon,
  ShoppingBag,
  Check,
  Zap,
  AlertTriangle,
  Cpu,
  ArrowRight,
  ChevronRight,
  Star,
  ShieldCheck,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { AIMessage, Product, AIStatusInfo } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../config/brand';

interface PopularQuestion {
  hindi: string;
  english: string;
  category: string;
}

const POPULAR_QUESTIONS: PopularQuestion[] = [
  {
    hindi: '50,000 के अंदर सबसे अच्छा लैपटॉप कौन सा है?',
    english: 'Recommend the best laptop under ₹50,000',
    category: 'Laptops',
  },
  {
    hindi: 'नॉइज़-कैंसलिंग हेडफ़ोन और वायरलेस ईयरबड्स में क्या अंतर है?',
    english: 'Compare ANC headphones vs wireless earbuds',
    category: 'Audio',
  },
  {
    hindi: 'कॉलेज के लिए टिकाऊ और वाटरप्रूफ बैग दिखाएं',
    english: 'Show durable waterproof backpacks for college',
    category: 'Bags',
  },
  {
    hindi: '2,000 के अंदर बेहतरीन बर्थडे गिफ्ट सुझाव दें',
    english: 'Find a great birthday gift under ₹2,000',
    category: 'Gifts',
  },
  {
    hindi: 'व्यापोरा पर रिटर्न और रिफंड पॉलिसी क्या है?',
    english: 'What is the return and refund policy on VYAPORA?',
    category: 'Support',
  },
  {
    hindi: 'आज के सबसे बड़े डिस्काउंट और ऑफ़र क्या हैं?',
    english: "What are today's top discounts and deals?",
    category: 'Deals',
  },
];

export const AIAssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { language, formatPrice } = useLanguage();
  const isHindi = language === 'hi';

  const [assistantLang, setAssistantLang] = useState<'en' | 'hi'>(() => {
    const saved = sessionStorage.getItem('ejan_assistant_lang');
    return (saved as 'en' | 'hi') || (language === 'hi' ? 'hi' : 'en');
  });
  const isAssistantHindi = assistantLang === 'hi';

  const toggleAssistantLang = (lang: 'en' | 'hi') => {
    setAssistantLang(lang);
    sessionStorage.setItem('ejan_assistant_lang', lang);
  };

  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [aiStatus, setAiStatus] = useState<AIStatusInfo | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [sessionTokensUsed, setSessionTokensUsed] = useState<number>(0);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);

  const defaultGreeting = isAssistantHindi
    ? 'नमस्ते! मैं व्यापोरा (VYAPORA) शॉपिंग सहायक हूँ। मैं आपको सही प्रोडक्ट खोजने, विकल्पों की तुलना करने, बजट के अनुसार सुझाव देने और खरीदारी से जुड़े सवालों के जवाब देने में मदद कर सकता हूँ।'
    : 'Hello! I am the VYAPORA Shopping Assistant. I can help you discover products, compare technical specifications side-by-side, filter by exact budget, and find verified in-stock items from our marketplace catalog.';

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: defaultGreeting,
      suggestions: [
        isAssistantHindi
          ? '50,000 के अंदर सबसे अच्छा लैपटॉप कौन सा है?'
          : 'Recommend a laptop under ₹50,000',
        isAssistantHindi
          ? 'नॉइज़-कैंसलिंग हेडफ़ोन और ईयरबड्स में अंतर बताएं'
          : 'Compare ANC headphones vs earbuds',
        isAssistantHindi
          ? '2,000 के अंदर बेहतरीन गिफ्ट दिखाएं'
          : 'Best gifts under ₹2,000',
        isAssistantHindi
          ? 'व्यापोरा पर रिटर्न पॉलिसी क्या है?'
          : 'What is the return policy?',
      ],
      mode: 'catalog_grounded_demo',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend Gemini status on load
  useEffect(() => {
    api.ai
      .getStatus()
      .then((res) => {
        if (res.success) {
          setAiStatus(res.ai);
        }
      })
      .catch(() => {});
  }, []);

  // Update initial message when assistant language toggles if user has not typed yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([
        {
          role: 'assistant',
          content: isAssistantHindi
            ? 'नमस्ते! मैं व्यापोरा (VYAPORA) शॉपिंग सहायक हूँ। मैं आपको सही प्रोडक्ट खोजने, विकल्पों की तुलना करने, बजट के अनुसार सुझाव देने और खरीदारी से जुड़े सवालों के जवाब देने में मदद कर सकता हूँ।'
            : 'Hello! I am the VYAPORA Shopping Assistant. I can help you discover products, compare technical specifications side-by-side, filter by exact budget, and find verified in-stock items from our marketplace catalog.',
          suggestions: [
            isAssistantHindi
              ? '50,000 के अंदर सबसे अच्छा लैपटॉप कौन सा है?'
              : 'Recommend a laptop under ₹50,000',
            isAssistantHindi
              ? 'नॉइज़-कैंसलिंग हेडफ़ोन और ईयरबड्स में अंतर बताएं'
              : 'Compare ANC headphones vs earbuds',
            isAssistantHindi
              ? '2,000 के अंदर बेहतरीन गिफ्ट दिखाएं'
              : 'Best gifts under ₹2,000',
            isAssistantHindi
              ? 'व्यापोरा पर रिटर्न पॉलिसी क्या है?'
              : 'What is the return policy?',
          ],
          mode: 'catalog_grounded_demo',
        },
      ]);
    }
  }, [assistantLang]);

  const handleTranslateMessage = async (index: number) => {
    const msg = messages[index];
    if (!msg || msg.role !== 'assistant' || translatingIndex !== null) return;
    const targetLanguage = isAssistantHindi ? 'en' : 'hi';
    setTranslatingIndex(index);
    try {
      const res = await api.ai.translate({
        text: msg.content,
        targetLanguage,
      });
      if (res.success && res.translatedText) {
        setMessages((prev) =>
          prev.map((m, i) => (i === index ? { ...m, content: res.translatedText } : m))
        );
        showToast(
          targetLanguage === 'hi' ? 'अनुवाद पूरा हुआ' : 'Translated to English',
          'info'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Translation failed', 'error');
    } finally {
      setTranslatingIndex(null);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle incoming prompt parameter from homepage
  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt && messages.length === 1) {
      sendMessage(prompt);
    }
  }, [searchParams]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userText = text.trim();
    setInputMessage('');
    setRequestError(null);
    setLastUserMessage(userText);

    // Append user message immediately
    const userMsg: AIMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.ai.chat({
        message: userText,
        sessionId,
        history: historyPayload,
        language: assistantLang,
      });

      if (res.success) {
        if (res.tokensUsed) {
          setSessionTokensUsed((prev) => prev + res.tokensUsed!);
        }
        if (typeof res.quotaRemaining === 'number') {
          setQuotaRemaining(res.quotaRemaining);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            products: res.products,
            suggestions: res.suggestions,
            mode: res.mode,
            tokensUsed: res.tokensUsed,
          },
        ]);
      }
    } catch (err: any) {
      const errMsg =
        err.message ||
        (isAssistantHindi
          ? 'कैटलॉग से संपर्क करने में समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Encountered an issue querying the catalog. Please try again.');
      setRequestError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errMsg}`,
          mode: 'catalog_grounded_demo',
        },
      ]);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleResetChat = () => {
    setSessionId(`session-${Date.now()}`);
    setRequestError(null);
    setMessages([
      {
        role: 'assistant',
        content: isAssistantHindi
          ? 'नई शॉपिंग चैट शुरू हुई! मैं आपकी खरीदारी में कैसे मदद कर सकता हूँ?'
          : 'New shopping session started! How can I assist with your purchase decisions today?',
        suggestions: [
          isAssistantHindi
            ? '50,000 के अंदर सबसे अच्छा लैपटॉप कौन सा है?'
            : 'Recommend a laptop under ₹50,000',
          isAssistantHindi
            ? 'नॉइज़-कैंसलिंग हेडफ़ोन और ईयरबड्स में अंतर बताएं'
            : 'Compare ANC headphones vs earbuds',
          isAssistantHindi
            ? '2,000 के अंदर बेहतरीन गिफ्ट दिखाएं'
            : 'Best gifts under ₹2,000',
        ],
        mode: 'catalog_grounded_demo',
      },
    ]);
  };

  const handleQuickAdd = async (product: Product) => {
    const success = await addToCart(product._id, 1);
    if (success) {
      setAddedItemIds((prev) => ({ ...prev, [product._id]: true }));
      showToast(
        isHindi ? `कार्ट में जोड़ा गया: ${product.title}` : `Added ${product.title} to cart!`,
        'success'
      );
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [product._id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] bg-slate-50 dark:bg-[#070D1E] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Header / Control Strip (Neutral Chat Icon) */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isHindi ? BRAND.assistantNameHindi : BRAND.assistantName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {aiStatus?.keyPresent ? 'Google Gemini' : 'Catalog Grounded Demo'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                {isHindi
                  ? 'लाइव मोंगोडीबी कैटलॉग इन्वेंटरी • शून्य काल्पनिक मूल्य'
                  : 'Live MongoDB catalog inventory • Zero hallucinated pricing'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Session Stats */}
        <div className="flex items-center gap-2">
          {sessionTokensUsed > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0F1E3D] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Session: <strong className="text-slate-900 dark:text-white">{sessionTokensUsed}</strong> tokens
              </span>
            </div>
          )}

          {quotaRemaining !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0F1E3D] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              <span>
                Quota: <strong className="text-indigo-600 dark:text-indigo-400">{quotaRemaining}</strong> remaining
              </span>
            </div>
          )}

          {/* In-Assistant Bilingual Selector Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0F1E3D] rounded-xl p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => toggleAssistantLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                assistantLang === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => toggleAssistantLang('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                assistantLang === 'hi'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0F1E3D] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={isAssistantHindi ? 'नयी चैट' : 'New Chat'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isAssistantHindi ? 'नयी चैट' : '+ New Chat'}</span>
          </button>
        </div>
      </div>

      {/* Main Conversation & Popular Questions Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto">
        {/* Welcome & Popular Questions Banner (Visible when only 1 message) */}
        {messages.length === 1 && (
          <div className="space-y-5 animate-fadeIn">
            {/* Greeting Card */}
            <div className="bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'व्यापोरा शॉपिंग सहायक में आपका स्वागत है' : 'Welcome to VYAPORA Shopping Assistant'}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Catalog Grounded
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {messages[0].content}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                    {isHindi
                      ? 'वास्तविक समय में मोंगोडीबी कैटलॉग से जुड़ा हुआ। सटीक मूल्य, विशिष्टताएं और वास्तविक स्टॉक उपलब्धता।'
                      : 'Grounded in real-time MongoDB catalog data. Compare specs side-by-side, filter by exact budget in ₹, and verify stock availability before purchasing.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Popular Questions Card */}
            <div className="bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    {isAssistantHindi ? 'अक्सर पूछे जाने वाले सवाल (Popular Questions)' : 'Popular Shopping Questions'}
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {isAssistantHindi ? 'पूछने के लिए क्लिक करें' : 'Click any prompt to ask'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {POPULAR_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(isAssistantHindi ? q.hindi : q.english)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#08132B] hover:bg-slate-100 dark:hover:bg-[#102044] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-left transition-all group flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                          {q.category}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {isAssistantHindi ? q.english : q.hindi}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                        "{isAssistantHindi ? q.hindi : q.english}"
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Flow */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 sm:gap-4 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                <MessageSquare className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm space-y-3 leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}
            >
              {/* Formatted Markdown Message */}
              <div className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
                {msg.content}
              </div>

              {/* Translate response button for assistant messages */}
              {msg.role === 'assistant' && (
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleTranslateMessage(idx)}
                    disabled={translatingIndex === idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-0.5 rounded transition-colors"
                    title={
                      isAssistantHindi
                        ? 'Translate response to English'
                        : 'Translate response to Hindi'
                    }
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>
                      {translatingIndex === idx
                        ? isAssistantHindi
                          ? 'अनुवाद हो रहा है...'
                          : 'Translating...'
                        : isAssistantHindi
                        ? 'Translate to English'
                        : 'हिंदी में अनुवाद करें'}
                    </span>
                  </button>
                </div>
              )}

              {/* Mode & Grounding Indicator */}
              {msg.role === 'assistant' && msg.mode && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-indigo-500" />
                    {msg.mode === 'gemini_official'
                      ? 'Google Gemini API'
                      : 'VYAPORA Catalog Grounding'}
                  </span>
                  <span className="text-[10px] font-medium">
                    Verified MongoDB Catalog
                  </span>
                </div>
              )}

              {/* Recommended Product Cards Grid */}
              {msg.products && msg.products.length > 0 && (
                <div className="pt-3 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isHindi ? 'सुझाए गए उत्पाद' : 'Recommended Products'} ({msg.products.length})
                    </p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Live Inventory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.products.map((p, pIdx) => {
                      const isAdded = addedItemIds[p._id];

                      return (
                        <div
                          key={p._id}
                          className="p-3.5 bg-slate-50 dark:bg-[#08132B] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all group flex flex-col justify-between relative shadow-sm"
                        >
                          {/* "Best Value" Pill */}
                          {pIdx === 0 && (
                            <div className="absolute top-2.5 right-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Best Value
                              </span>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                              alt={p.title}
                              className="w-16 h-16 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                            />
                            <div className="flex-1 min-w-0 pr-8">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
                                {p.brand} • {p.category}
                              </span>
                              <Link
                                to={`/product/${p.slug}`}
                                className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors line-clamp-1 block mt-0.5"
                                title={p.title}
                              >
                                {p.title}
                              </Link>

                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex items-center text-amber-400 text-xs">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="ml-0.5 font-bold text-slate-700 dark:text-slate-300">{p.rating}</span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  ({p.numReviews || 24})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Actions */}
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {formatPrice(p.price)}
                              </span>
                              {p.compareAtPrice && p.compareAtPrice > p.price && (
                                <span className="text-[10px] text-slate-400 line-through ml-1.5">
                                  {formatPrice(p.compareAtPrice)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Link
                                to={`/product/${p.slug}`}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <span>{isHindi ? 'विवरण' : 'Details'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>

                              <button
                                onClick={() => handleQuickAdd(p)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                                  isAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                }`}
                                title={isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart'}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3 h-3" />
                                    <span>+ Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-2.5 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      <span>"{s}"</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-1">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Animated Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                {isHindi
                  ? 'व्यापोरा कैटलॉग से लाइव डेटा खोजा जा रहा है...'
                  : 'Grounding with live VYAPORA MongoDB catalog...'}
              </span>
            </div>
          </div>
        )}

        {/* Retry Banner on Error */}
        {requestError && !loading && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              {isHindi
                ? 'अनुरोध पूरा नहीं हो सका। क्या आप पुनः प्रयास करना चाहेंगे?'
                : 'Request encountered an issue. Would you like to retry?'}
            </span>
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Capsule Chat Composer */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md p-4 sm:p-5 sticky bottom-0 z-20 transition-colors">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto">
          {/* Rounded Capsule Bar */}
          <div className="relative flex items-center bg-slate-100 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-700 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-full px-4 py-1.5 shadow-sm transition-all">
            <div className="text-indigo-600 dark:text-indigo-400 mr-2.5 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>

            <input
              type="text"
              placeholder={
                isHindi
                  ? 'व्यापोरा सहायक से कुछ भी पूछें... जैसे: लैपटॉप की तुलना करें, छूट खोजें...'
                  : 'Ask VYAPORA assistant... e.g. Compare laptops, find discounts, or get product suggestions...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-2"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center shrink-0 ml-2"
              title={isHindi ? 'पूछें' : 'Send'}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Subtitle Grounding Disclaimer */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>
              {isHindi
                ? 'व्यापोरा शॉपिंग सहायक • लाइव मोंगोडीबी कैटलॉग इन्वेंटरी • गूगल जेमिनी समर्थित'
                : 'VYAPORA Shopping Assistant • Grounded in verified MongoDB catalog inventory • Powered by Google Gemini'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
