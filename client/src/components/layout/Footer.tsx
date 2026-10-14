import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Store,
  Send,
  CheckCircle2,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { BRAND } from '../../config/brand';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast(isHindi ? 'कृपया एक मान्य ईमेल दर्ज करें।' : 'Please enter a valid email address.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.contact.subscribeNewsletter(email);
      if (res.success) {
        setSubscribed(true);
        setEmail('');
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Subscription failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#050B1B] text-slate-600 dark:text-slate-300 pt-16 pb-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
      {/* Trust Highlights Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 px-6 rounded-2xl bg-white/80 dark:bg-[#08132B]/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">
                {isHindi ? 'मल्टी-वेंडर मार्केटप्लेस' : 'Multi-Vendor Marketplace'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'सत्यापित विक्रेताओं से वास्तविक उत्पादों की विस्तृत श्रृंखला।'
                  : 'Curated products from independent, verified brand stores.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">
                {isHindi ? '100% सुरक्षित भुगतान' : 'Secure Transactions'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'सुरक्षित सैंडबॉक्स और डिजिटल ऑर्डर सुरक्षा की गारंटी।'
                  : 'Encrypted checkout and seamless order fulfillment.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">
                {isHindi ? 'अखिल भारतीय डिलीवरी' : 'Pan-India Delivery'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'त्वरित शिपिंग और वास्तविक समय में ऑर्डर ट्रैकिंग।'
                  : 'Fast courier shipping with live tracking updates.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Brand Overview */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group inline-flex">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {BRAND.name}
              </span>
              <span className="text-[10px] tracking-widest text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                {BRAND.tagline}
              </span>
            </div>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-6">
            {isHindi ? BRAND.heroSubtextHindi : BRAND.heroSubtext}
          </p>

          {/* Newsletter Input */}
          <form onSubmit={handleSubscribe} className="max-w-sm">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {isHindi ? 'व्यापोरा अपडेट्स के लिए सदस्यता लें' : 'Subscribe to VYAPORA Dispatches'}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={loading || subscribed}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                {subscribed ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {subscribed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                ✓ {isHindi ? 'आप सदस्यता सूची में जुड़ चुके हैं!' : 'You are now subscribed to updates!'}
              </p>
            )}
          </form>
        </div>

        {/* Marketplace Links */}
        <div>
          <h5 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">
            {isHindi ? 'मार्केटप्लेस' : 'Marketplace'}
          </h5>
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <li>
              <Link to="/shop" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'सभी उत्पाद' : 'All Products'}
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'श्रेणियाँ' : 'Categories Showcase'}
              </Link>
            </li>
            <li>
              <Link to="/shop?sort=discount" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'ऑफ़र व डील्स' : 'Deals & Offers'}
              </Link>
            </li>
            <li>
              <Link to="/shop?sort=popular" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'ट्रेंडिंग बेस्टसेलर्स' : 'Trending Bestsellers'}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'मेरी कार्ट' : 'My Cart'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Merchants & Membership */}
        <div>
          <h5 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">
            {isHindi ? 'विक्रेताओं के लिए' : 'For Merchants'}
          </h5>
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <li>
              <Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'सदस्यता प्लान' : 'Seller Membership Plans'}
              </Link>
            </li>
            <li>
              <Link to="/become-seller" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'विक्रेता बनें' : 'Become a Seller'}
              </Link>
            </li>
            <li>
              <Link to="/seller/dashboard" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'विक्रेता डैशबोर्ड' : 'Merchant Portal'}
              </Link>
            </li>
            <li>
              <Link to="/seller/store" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'स्टोरफ्रंट कस्टमाइज़र' : 'Storefront Customizer'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform & Legal */}
        <div>
          <h5 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-4">
            {isHindi ? 'कंपनी व सहायता' : 'Company & Legal'}
          </h5>
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <li>
              <Link to="/about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'हमारे बारे में' : 'About VYAPORA'}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'संपर्क व सहायता' : 'Contact & Support'}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'सेवा की शर्तें' : 'Terms & Conditions'}
              </Link>
            </li>
            <li>
              <Link to="/shipping-returns" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                {isHindi ? 'शिपिंग व वापसी' : 'Shipping & Returns'}
              </Link>
            </li>
            <li className="pt-1">
              <Link to="/ai-assistant" className="hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isHindi ? 'शॉपिंग सहायक' : 'Shopping Assistant'}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
        <p>© 2026 {BRAND.name} — {BRAND.tagline}. College Mini-Project & Portfolio Edition.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> Sandbox Simulation Mode
          </span>
          <span>•</span>
          <span>MongoDB & Express REST Engine</span>
        </div>
      </div>
    </footer>
  );
};
