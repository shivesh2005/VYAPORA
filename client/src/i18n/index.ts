import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import homeEn from './locales/en/home.json';
import productsEn from './locales/en/products.json';
import authEn from './locales/en/auth.json';
import checkoutEn from './locales/en/checkout.json';
import dashboardEn from './locales/en/dashboard.json';
import assistantEn from './locales/en/assistant.json';

import commonHi from './locales/hi/common.json';
import homeHi from './locales/hi/home.json';
import productsHi from './locales/hi/products.json';
import authHi from './locales/hi/auth.json';
import checkoutHi from './locales/hi/checkout.json';
import dashboardHi from './locales/hi/dashboard.json';
import assistantHi from './locales/hi/assistant.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    products: productsEn,
    auth: authEn,
    checkout: checkoutEn,
    dashboard: dashboardEn,
    assistant: assistantEn,
  },
  hi: {
    common: commonHi,
    home: homeHi,
    products: productsHi,
    auth: authHi,
    checkout: checkoutHi,
    dashboard: dashboardHi,
    assistant: assistantHi,
  },
} as const;

const getInitialLang = (): 'en' | 'hi' => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      const saved = window.localStorage.getItem('vyapora_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    }
  } catch {
    // ignore
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLang(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home', 'products', 'auth', 'checkout', 'dashboard', 'assistant'],
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
