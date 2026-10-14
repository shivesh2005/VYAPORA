import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Mail, Lock, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../config/brand';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [submitting, setSubmitting] = useState(false);

  const isHindi = language === 'hi';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast(
        isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.',
        'error'
      );
      return;
    }

    try {
      setSubmitting(true);
      const success = await register(name.trim(), email.trim(), password, role);
      if (success) {
        if (role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/shop');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#0C1936] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
        <div className="text-center space-y-2">
          {/* Shopping Bag Logo */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-500/25">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'व्यापोरा पर नया खाता बनाएँ' : `Create a ${BRAND.name} Account`}
            </h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              {BRAND.tagline}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'प्रमुख मल्टी-वेंडर ई-कॉमर्स मार्केटप्लेस से जुड़ें'
              : 'Join the premier multi-vendor e-commerce marketplace'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'customer'
                ? 'bg-white dark:bg-[#0C1936] text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isHindi ? 'ग्राहक (Buyer)' : 'Buyer Account'}</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'seller'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>{isHindi ? 'विक्रेता (Seller)' : 'Merchant Seller'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'पूरा नाम' : 'Full Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
                placeholder="rohan@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {isHindi ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min 6 characters)'}
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

          {role === 'seller' && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300">
              {isHindi
                ? '🏪 विक्रेता के रूप में पंजीकरण करने पर आपका समर्पित स्टोरफ्रंट स्वतः सक्रिय हो जाएगा और स्टार्टर प्लान (10 उत्पाद सीमा) लागू होगा।'
                : '🏪 Registering as a seller auto-provisions your dedicated storefront and activates the Starter Plan (10 products quota) automatically.'}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
          >
            {submitting
              ? isHindi
                ? 'खाता बनाया जा रहा है...'
                : 'Creating Account...'
              : isHindi
              ? 'खाता बनाएँ'
              : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          {isHindi ? 'पहले से पंजीकृत हैं?' : 'Already registered?'}{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            {isHindi ? 'यहाँ लॉगिन करें' : 'Log in instead'}
          </Link>
        </p>
      </div>
    </div>
  );
};
