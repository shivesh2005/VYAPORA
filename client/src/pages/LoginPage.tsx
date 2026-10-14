import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../config/brand';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isHindi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate(redirect);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setSubmitting(true);
    const success = await login(demoEmail, 'password123');
    setSubmitting(false);
    if (success) {
      navigate(redirect);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#0C1936] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="text-center space-y-2">
          {/* Shopping Bag Logo (No sparkle or AI robot) */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/25">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'व्यापोरा में साइन इन करें' : `Sign In to ${BRAND.name}`}
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              {BRAND.tagline}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'अपनी शॉपिंग कार्ट, विक्रेता डैशबोर्ड या एडमिन पोर्टल तक पहुँचें'
              : 'Access your shopping cart, seller dashboard, or admin portal'}
          </p>
        </div>

        {/* 1-Click Demo Evaluation Pills */}
        <div className="p-4 bg-slate-50 dark:bg-[#08132B] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isHindi ? 'त्वरित 1-क्लिक डेमो लॉगिन:' : 'Fast Demo Evaluation Logins:'}</span>
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@vyapora.com')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900 transition-colors flex items-center justify-between"
            >
              <span>👑 {isHindi ? 'प्लेटफ़ॉर्म एडमिन' : 'Platform Admin'}</span>
              <span className="text-[10px] text-rose-500 font-mono">admin@vyapora.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller@vyapora.com')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900 transition-colors flex items-center justify-between"
            >
              <span>🏪 {isHindi ? 'सत्यापित विक्रेता' : 'Verified Seller'}</span>
              <span className="text-[10px] text-indigo-500 font-mono">seller@vyapora.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer@vyapora.com')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900 transition-colors flex items-center justify-between"
            >
              <span>👤 {isHindi ? 'ग्राहक (खरीदार)' : 'Customer (Buyer)'}</span>
              <span className="text-[10px] text-blue-500 font-mono">customer@vyapora.com</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'ईमेल पता' : 'Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'पासवर्ड' : 'Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
          >
            {submitting
              ? isHindi
                ? 'सत्यापन हो रहा है...'
                : 'Authenticating...'
              : isHindi
              ? 'साइन इन करें'
              : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {isHindi ? 'क्या अभी तक खाता नहीं है?' : "Don't have an account yet?"}{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            {isHindi ? 'यहाँ रजिस्टर करें' : 'Register here'}
          </Link>
        </p>
      </div>
    </div>
  );
};
