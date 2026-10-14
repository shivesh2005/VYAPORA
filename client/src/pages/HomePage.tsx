import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
  Mail,
  CheckCircle2,
  Check,
  Store,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Headphones,
  Laptop,
  Shirt,
  Home as HomeIcon,
  Star,
  Briefcase,
  Watch,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../config/brand';

const getCategoryDisplayName = (name: string, isHindi: boolean) => {
  if (!isHindi) return name;
  const map: Record<string, string> = {
    'Electronics': 'इलेक्ट्रॉनिक्स',
    'Audio & Sound': 'ऑडियो व साउंड',
    'Fashion & Apparel': 'फ़ैशन व परिधान',
    'Smart Living': 'स्मार्ट लिविंग',
    'Accessories & Bags': 'एक्सेसरीज़ व बैग्स',
    'Home & Workspace': 'घर व कार्यस्थल',
    'Home & Living': 'घर व जीवनशैली',
  };
  return map[name] || name;
};

export const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const { language, formatPrice } = useLanguage();
  const isHindi = language === 'hi';

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.products.getFeatured(),
          api.categories.list(),
        ]);
        if (prodRes.success) {
          setFeaturedProducts(prodRes.featured || []);
          setBestsellers(prodRes.bestsellers || []);
        }
        if (catRes.success) {
          setCategories(catRes.categories || []);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      setSubscribing(true);
      await api.contact.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterSubscribed(true);
      showToast(
        isHindi
          ? 'व्यापोरा न्यूज़लेटर में सफलतापूर्वक शामिल हुए!'
          : 'Successfully subscribed to VYAPORA updates!',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Subscription failed.', 'error');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={isHindi ? 'मार्केटप्लेस लोड हो रहा है...' : 'Loading VYAPORA Marketplace...'} />;
  }

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Shopping Hero Section (E-Commerce First) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-[#0B132B] dark:via-[#080E21] dark:to-[#070D1E] py-14 sm:py-20 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Subtitle, Badges, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide">
                <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {isHindi
                    ? 'विश्वसनीय मल्टी-वेंडर मार्केटप्लेस'
                    : 'Premier Multi-Vendor Marketplace'}
                </span>
              </div>

              {/* Shopping-Focused Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                {isHindi ? (
                  <>
                    आपकी पसंद,{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
                      अब एक ही जगह।
                    </span>
                  </>
                ) : (
                  <>
                    Everything You Love,{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
                      All in One Place.
                    </span>
                  </>
                )}
              </h1>

              {/* Supporting Subtext */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isHindi ? BRAND.heroSubtextHindi : BRAND.heroSubtext}
              </p>

              {/* Trust Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isHindi ? 'मल्टी-वेंडर स्टोर' : 'Multi-Vendor'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isHindi ? '100% असली उत्पाद' : '100% Genuine'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isHindi ? 'सुरक्षित भुगतान' : 'Secure Checkout'}</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isHindi ? 'तेज़ डिलीवरी' : 'Fast Delivery'}</span>
                </div>
              </div>

              {/* Primary & Secondary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isHindi ? 'खरीदारी शुरू करें' : 'Start Shopping'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/categories"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>{isHindi ? 'श्रेणियाँ देखें' : 'Explore Categories'}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Shopping Showcase Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                {/* Showcase Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {isHindi ? 'आज के मुख्य ऑफ़र' : "Today's Prime Highlights"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Live Catalog
                  </span>
                </div>

                {/* 3 Showcase Product Cards */}
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#08132B] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-400 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=140&q=80"
                        alt="Headphones"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          Audio • Vanguard
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          Horizon Pro Wireless ANC Headphones
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.8 (128)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                        ₹6,499
                      </span>
                      <span className="text-[10px] font-bold text-rose-500">35% OFF</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#08132B] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-400 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=140&q=80"
                        alt="Smartwatch"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          Wearables • ChronoX
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          ChronoPulse GPS Smartwatch
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.7 (89)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                        ₹4,999
                      </span>
                      <span className="text-[10px] font-bold text-rose-500">28% OFF</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#08132B] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-indigo-400 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=140&q=80"
                        alt="Sneakers"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                          Fashion • Velocity
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          Velocity Carbon Runner Sneakers
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>4.9 (112)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                        ₹3,299
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">In Stock</span>
                    </div>
                  </div>
                </div>

                {/* Micro CTA */}
                <Link
                  to="/shop"
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{isHindi ? 'सभी 26 उत्पाद देखें' : 'View All 26 Catalog Products'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Shortcuts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'श्रेणी के अनुसार खरीदारी करें' : 'Shop by Category'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi
                ? 'लोकप्रिय विभागों में हज़ारों चुनिंदा उत्पादों का अन्वेषण करें'
                : 'Explore thousands of verified items across popular departments'}
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{isHindi ? 'सभी श्रेणियाँ' : 'All Categories'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => {
            const displayName = getCategoryDisplayName(cat.name, isHindi);
            return (
              <Link
                key={cat._id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative rounded-2xl bg-white dark:bg-[#0B1528] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center justify-between h-44 sm:h-52 overflow-hidden"
              >
                {/* Category Image / Icon Container */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center overflow-hidden border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-all duration-200 shadow-xs">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : cat.name.includes('Audio') ? (
                    <Headphones className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : cat.name.includes('Electronics') ? (
                    <Laptop className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : cat.name.includes('Fashion') ? (
                    <Shirt className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : cat.name.includes('Bags') || cat.name.includes('Accessories') ? (
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : cat.name.includes('Workspace') ? (
                    <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" />
                  ) : (
                    <HomeIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                  )}
                </div>

                {/* Name & Real Product Count */}
                <div className="w-full space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {displayName}
                  </h3>
                  {typeof cat.itemCount === 'number' && cat.itemCount > 0 ? (
                    <span className="inline-block text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      {cat.itemCount} {isHindi ? 'उत्पाद' : 'Items'}
                    </span>
                  ) : (
                    <span className="inline-block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {isHindi ? 'देखें →' : 'Explore →'}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {isHindi ? 'विशेष चयन' : 'Handpicked'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'प्रमुख उत्पाद' : 'Featured Products'}
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{isHindi ? 'पूरा संग्रह देखें' : 'View Full Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Valid Offers & Festive Banner (Code: SAVE20) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800 text-white p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400 text-slate-900 tracking-wider">
              {isHindi ? 'सीमित समय की छूट' : 'Special Festive Offer'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {isHindi
                ? 'त्योहारी डील्स: हर ऑर्डर पर 20% तक की छूट'
                : 'Save Flat 20% on Orders Over ₹2,499'}
            </h3>
            <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
              {isHindi
                ? 'इलेक्ट्रॉनिक्स, ऑडियो और फ़ैशन पर सर्वोत्तम मूल्य प्राप्त करें। चेकआउट पर कूपन कोड SAVE20 का उपयोग करें।'
                : 'Upgrade your tech workspace, studio audio, and lifestyle gear with instant discount. Use coupon code SAVE20.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/shop?sort=discount"
                className="px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-md active:scale-95"
              >
                {isHindi ? 'छूट वाले उत्पाद देखें' : 'Shop Discounted Items'}
              </Link>
              <span className="font-mono text-sm tracking-wider bg-black/30 px-3 py-1.5 rounded-xl border border-white/20">
                Code: <strong>SAVE20</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trending Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>{isHindi ? 'सबसे लोकप्रिय' : 'Customer Favorites'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'ट्रेंडिंग बेस्टसेलर्स' : 'Trending Bestsellers'}
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{isHindi ? 'सभी लोकप्रिय उत्पाद' : 'See All Trending'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Multi-Vendor Marketplace Promotion (For Sellers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100 dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 transition-colors">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Store className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isHindi ? 'व्यापारी भागीदार' : 'Merchant Partnership'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isHindi
                ? 'व्यापोरा मार्केटप्लेस पर अपना सामान बेचें'
                : 'Sell on VYAPORA Multi-Vendor Marketplace'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isHindi
                ? 'हज़ारों सक्रिय खरीदारों तक पहुँचें, अपना कस्टमाइज़्ड स्टोरफ्रंट शुरू करें और पारदर्शी विक्रेता योजनाओं के साथ व्यवसाय बढ़ाएं।'
                : 'Reach thousands of daily shoppers, launch your private branded storefront, manage catalog inventory, and scale with transparent seller membership plans.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/become-seller"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{isHindi ? 'विक्रेता बनें' : 'Open Your Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-300 dark:border-slate-700 transition-all shadow-sm"
            >
              {isHindi ? 'सदस्यता प्लान देखें' : 'View Membership Plans'}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Optional Shopping Assistant Banner (Clean, Neutral Chat Icon) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#0B132B] dark:via-[#0C1936] dark:to-[#0F1E3D] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'खरीदारी में सहायता चाहिए?' : 'Need Shopping Advice?'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                  {isHindi ? 'वैकल्पिक' : 'Optional'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                {isHindi
                  ? 'कैटलॉग खोज, उत्पाद तुलना और बजट-अनुकूल सुझावों के लिए हमारे वैकल्पिक शॉपिंग सहायक का उपयोग करें।'
                  : 'Try our optional shopping assistant for quick catalog searches, product comparisons, and budget recommendations grounded in live MongoDB inventory.'}
              </p>
            </div>
          </div>

          <Link
            to="/ai-assistant"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isHindi ? 'शॉपिंग सहायक खोलें' : 'Open Shopping Assistant'}</span>
          </Link>
        </div>
      </section>

      {/* 8. Trust Highlights & Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 px-6 rounded-3xl bg-slate-100 dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isHindi ? 'तेज़ एक्सप्रेस डिलीवरी' : 'Express Delivery'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? '₹999+ पर मुफ़्त डिलीवरी' : 'Free on orders > ₹999'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isHindi ? '100% सुरक्षित भुगतान' : '100% Secure Checkout'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'एन्क्रिप्टेड सैंडबॉक्स चेकआउट' : 'Encrypted sandbox mode'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isHindi ? 'सत्यापित विक्रेता' : 'Verified Merchants'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'समीक्षित वास्तविक स्टोर' : 'Vetted authentic stores'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {isHindi ? 'सर्वोत्तम मूल्य गारंटी' : 'Best Price Guarantee'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'नियमित छूट और कूपन' : 'Regular deals & coupons'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isHindi ? 'व्यापोरा अपडेट्स के लिए सदस्यता लें' : 'Subscribe to VYAPORA Dispatches'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isHindi
              ? 'नए उत्पादों, विशेष कूपन और साप्ताहिक मार्केटप्लेस ऑफ़र की सूचना सीधे अपने इनबॉक्स में पाएं।'
              : 'Get early notifications on catalog deals, seasonal discounts, and marketplace news delivered to your inbox.'}
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={isHindi ? 'अपना ईमेल पता दर्ज करें...' : 'Enter your email address...'}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={subscribing || newsletterSubscribed}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-md shrink-0"
            >
              {newsletterSubscribed
                ? isHindi
                  ? 'शामिल हुए'
                  : 'Subscribed'
                : subscribing
                ? isHindi
                  ? '...'
                  : 'Subscribing...'
                : isHindi
                ? 'सदस्यता लें'
                : 'Subscribe'}
            </button>
          </form>

          {newsletterSubscribed && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isHindi ? 'आप सदस्यता सूची में जुड़ चुके हैं!' : 'You are now subscribed!'}</span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
