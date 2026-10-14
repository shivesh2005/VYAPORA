import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type LanguageCode = 'en' | 'hi';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  formatPrice: (amount: number) => string;
  formatDate: (date: Date | string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const saved = window.localStorage.getItem('vyapora_lang');
        if (saved === 'hi' || saved === 'en') {
          return saved;
        }
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem('vyapora_lang', language);
      }
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('lang', language);
    }
  }, [language, i18n]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const formatPrice = (amount: number): string => {
    const formatted = amount.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN');
    return `₹${formatted}`;
  };

  const formatDate = (date: Date | string | number): string => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, formatPrice, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
