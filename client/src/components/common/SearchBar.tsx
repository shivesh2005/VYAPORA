import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Product } from '../../types';

interface SearchBarProps {
  variant?: 'header' | 'mobile' | 'hero';
  className?: string;
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
}

const STORAGE_KEY = 'vyapora_recent_searches';
const MAX_RECENT_SEARCHES = 6;

export const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'header',
  className = '',
  onSearchSubmit,
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const { language, formatPrice } = useLanguage();
  const isHindi = language === 'hi';

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [liveSuggestions, setLiveSuggestions] = useState<Product[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch {}
  }, []);

  // Click outside to collapse suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live autocomplete debounced search against MongoDB catalog
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setLiveSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.products.list({ search: trimmed, limit: 4 });
        if (res.success) {
          setLiveSuggestions(res.products || []);
        }
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = (searchTerm: string) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) return;

    try {
      const updated = [cleanTerm, ...recentSearches.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const executeSearch = (targetQuery: string) => {
    const term = targetQuery.trim();
    if (!term) return;

    saveRecentSearch(term);
    setIsOpen(false);
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    if (onSearchSubmit) onSearchSubmit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setLiveSuggestions([]);
    inputRef.current?.focus();
  };

  const popularTrends = isHindi
    ? ['हेडफ़ोन', 'लैपटॉप 50,000 के अंदर', 'रनिंग शूज', 'स्मार्टवॉच', 'बैकपैक']
    : ['Noise Cancelling Headphones', 'Laptops under ₹50,000', 'Running Shoes', 'Smartwatches', 'Backpacks'];

  const placeholderText = isHindi
    ? 'प्रोडक्ट, ब्रांड और कैटेगरी खोजें...'
    : 'Search products, brands and categories...';

  const buttonText = isHindi ? 'खोजें' : 'Search';

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${variant === 'mobile' ? 'max-w-full' : 'max-w-2xl'} ${className}`}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full bg-slate-50 dark:bg-[#0B1528] rounded-2xl border border-slate-300 dark:border-slate-700/80 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white dark:focus-within:bg-[#0F1E3D] transition-all p-1"
      >
        {/* Left Search Icon */}
        <div className="pl-3 pr-2 text-slate-400 dark:text-slate-400 pointer-events-none flex items-center justify-center">
          <Search className="w-4 h-4" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholderText}
          autoFocus={autoFocus}
          aria-label={placeholderText}
          className="w-full bg-transparent py-2 px-1 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none leading-relaxed"
        />

        {/* Clear Button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors shrink-0 mr-1"
            aria-label="Clear search input"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Professional Search Button */}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
          aria-label={buttonText}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>{buttonText}</span>
        </button>
      </form>

      {/* Autocomplete & Recent Searches Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0D1836] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/90 py-3 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn"
        >
          {/* 1. Live Database Product Suggestions */}
          {liveSuggestions.length > 0 && (
            <div className="p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
                {isHindi ? 'सत्यापित उत्पाद सुझाव' : 'Matching Catalog Products'}
              </span>
              <div className="space-y-1">
                {liveSuggestions.map((prod) => (
                  <button
                    key={prod._id}
                    type="button"
                    onClick={() => {
                      saveRecentSearch(prod.title);
                      setIsOpen(false);
                      navigate(`/product/${prod.slug}`);
                      if (onSearchSubmit) onSearchSubmit();
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.images?.[0] || 'https://placehold.co/60x60'}
                        alt={prod.title}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {prod.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {prod.brand} • {prod.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Recent Searches (if available) */}
          {recentSearches.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {isHindi ? 'हाल की खोजें' : 'Recent Searches'}
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 hover:underline"
                >
                  {isHindi ? 'हटाएं' : 'Clear all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      executeSearch(term);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/70 dark:border-slate-700 transition-colors"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Popular Trending Keyword Chips */}
          <div className="p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              {isHindi ? 'लोकप्रिय खोजें' : 'Trending in Catalog'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularTrends.map((trend, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(trend);
                    executeSearch(trend);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{trend}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
