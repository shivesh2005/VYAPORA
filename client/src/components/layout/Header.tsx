import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  ChevronRight,
  Package,
  Store,
  LayoutDashboard,
  ShieldCheck,
  Tag,
  Grid,
  Info,
  HelpCircle,
  Mail,
  LogIn,
  LogOut,
  CreditCard,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { BRAND } from '../../config/brand';
import { SearchBar } from '../common/SearchBar';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, wishlistCount } = useCart();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [location.pathname]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setUserDropdownOpen(false);
        setLangDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };

    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [drawerOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All Categories') {
      params.set('category', selectedCategory);
    }
    navigate(`/shop?${params.toString()}`);
    setDrawerOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isHindi = language === 'hi';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm text-slate-800 dark:text-slate-100">
        {/* 1. Promotional Announcement Bar */}
        {!bannerDismissed && (
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-xs py-1.5 px-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-sm">🛍️</span>
                <p className="font-semibold text-xs tracking-wide">
                  {isHindi
                    ? BRAND.activePromoTextHindi
                    : BRAND.activePromoText}
                </p>
                <Link
                  to="/shop?sort=discount"
                  className="hidden md:inline-flex items-center gap-1 font-bold text-amber-300 hover:text-white transition-colors underline ml-2"
                >
                  {isHindi ? 'ऑफ़र देखें →' : 'Shop Deals →'}
                </Link>
              </div>

              {/* Countdown Pill & Close Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-mono text-cyan-200 border border-white/20">
                  <Clock className="w-3 h-3 text-cyan-300" />
                  <span>02 : 14 : 37</span>
                </div>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-white/80 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Main Navigation Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 py-2 gap-2 sm:gap-4">
            {/* Left: Brand Logo & Wordmark (ShoppingBag icon, no AI robot/sparkle) */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {BRAND.name}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hidden sm:inline">
                    {BRAND.hindiName}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  {isHindi ? BRAND.taglineHindi : BRAND.tagline}
                </span>
              </div>
            </Link>

            {/* Center: Professional Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2">
              <SearchBar variant="header" />
            </div>

            {/* Right: Controls Strip (Lang, Theme, Wishlist, Cart, User, Hamburger) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language Selector Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  aria-label="Select language"
                  title="Language Selector"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="uppercase font-mono">{language}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0F1E3D] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                        language === 'en'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇬🇧 EN | English</span>
                      {language === 'en' && <span className="text-xs">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('hi');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                        language === 'hi'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇮🇳 HI | हिन्दी</span>
                      {language === 'hi' && <span className="text-xs">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Mode Selector Dropdown */}
              <div className="relative" ref={themeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  aria-label="Toggle theme"
                  title="Theme Selector"
                >
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </button>

                {themeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0F1E3D] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('light');
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        theme === 'light'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isHindi ? 'लाइट मोड' : 'Light Mode'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('dark');
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        theme === 'dark'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isHindi ? 'डार्क मोड' : 'Dark Mode'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme('system');
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        theme === 'system'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isHindi ? 'सिस्टम डिफ़ॉल्ट' : 'System Default'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isHindi ? 'पसंदीदा' : 'Wishlist'}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon with Live Item Counter */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isHindi ? 'मेरी कार्ट' : 'My Cart'}
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-indigo-500/40">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Account Menu */}
              <div className="relative" ref={userDropdownRef}>
                {user ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Account Menu"
                  >
                    <img
                      src={
                        user.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80'
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'लॉगिन' : 'Sign In'}</span>
                  </Link>
                )}

                {/* Account Dropdown */}
                {userDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0F1E3D] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>{isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>{isHindi ? 'मेरे ऑर्डर' : 'My Orders'}</span>
                      </Link>

                      {user.role === 'seller' && (
                        <Link
                          to="/seller/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Store className="w-4 h-4" />
                          <span>{isHindi ? 'विक्रेता डैशबोर्ड' : 'Seller Dashboard'}</span>
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isHindi ? 'एडमिन कंसोल' : 'Admin Console'}</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isHindi ? 'साइन आउट' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger Menu Toggle Button */}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Navigation Menu"
                title="Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row (visible on small screens) */}
          <div className="md:hidden pb-3 pt-0.5">
            <SearchBar variant="mobile" />
          </div>
        </div>
      </header>

      {/* 3. Slide-Out Hamburger Navigation Drawer (Full 17-item Support) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay with blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#070D1E] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
              {/* Drawer Top Header */}
              <div>
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#0F1E3D]/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {BRAND.name}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isHindi ? 'नेविगेशन मेनू' : 'Navigation Menu'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Input */}
                <div className="p-4 md:hidden border-b border-slate-200 dark:border-slate-800">
                  <SearchBar variant="mobile" onSearchSubmit={() => setDrawerOpen(false)} />
                </div>

                {/* 17 Menu Items Navigation List */}
                <nav className="p-4 space-y-1 text-sm font-medium">
                  {/* 1. Home */}
                  <Link
                    to="/"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/') && location.pathname === '/'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'होम' : 'Home'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 2. Shop All */}
                  <Link
                    to="/shop"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/shop') && !location.search.includes('discount')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'सभी प्रोडक्ट' : 'Shop All'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 3. Categories */}
                  <Link
                    to="/categories"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/categories')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'श्रेणियाँ' : 'Categories'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 4. Deals */}
                  <Link
                    to="/shop?sort=discount"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span>{isHindi ? 'ऑफ़र' : 'Deals'}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      20% OFF
                    </span>
                  </Link>

                  {/* 5. Wishlist */}
                  <Link
                    to="/wishlist"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/wishlist')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{isHindi ? 'पसंदीदा' : 'Wishlist'}</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-600 px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* 6. My Cart */}
                  <Link
                    to="/cart"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/cart')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{isHindi ? 'मेरी कार्ट' : 'My Cart'}</span>
                    </div>
                    {itemCount > 0 && (
                      <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  {/* 7. My Orders */}
                  {user && (
                    <Link
                      to="/orders"
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive('/orders')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{isHindi ? 'मेरे ऑर्डर' : 'My Orders'}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}

                  {/* 8. My Profile */}
                  {user && (
                    <Link
                      to="/profile"
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive('/profile')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{isHindi ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}

                  {/* 9. Become a Seller */}
                  {(!user || user.role === 'customer') && (
                    <Link
                      to="/become-seller"
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>{isHindi ? 'विक्रेता बनें' : 'Become a Seller'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  {/* 10. Seller Dashboard (Authorized only) */}
                  {user && (user.role === 'seller' || user.role === 'admin') && (
                    <Link
                      to="/seller/dashboard"
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive('/seller')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{isHindi ? 'विक्रेता डैशबोर्ड' : 'Seller Dashboard'}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}

                  {/* 11. Membership Plans */}
                  <Link
                    to="/pricing"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/pricing')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'सदस्यता प्लान' : 'Membership Plans'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 12. Contact Us */}
                  <Link
                    to="/contact"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/contact')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'संपर्क करें' : 'Contact Us'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 13. Help and FAQs */}
                  <Link
                    to="/contact"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>{isHindi ? 'सहायता और सामान्य प्रश्न' : 'Help and FAQs'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 14. About Us */}
                  <Link
                    to="/about"
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                      isActive('/about')
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isHindi ? 'हमारे बारे में' : 'About Us'}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  {/* 15. Admin Dashboard & AI Provider Settings (Authorized only) */}
                  {user && user.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                          isActive('/admin/dashboard')
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{isHindi ? 'एडमिन डैशबोर्ड' : 'Admin Dashboard'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/admin/settings/ai-provider"
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                          isActive('/admin/ai-config') || isActive('/admin/settings/ai-provider')
                            ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold'
                            : 'text-violet-600 dark:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{isHindi ? 'AI प्रोवाइडर सेटिंग्स' : 'AI Provider Settings'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}

                  {/* Optional Assistant Link (Neutral icon) */}
                  <div className="pt-2">
                    <Link
                      to="/ai-assistant"
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{isHindi ? 'शॉपिंग सहायक (वैकल्पिक)' : 'Shopping Assistant (Optional)'}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        AI
                      </span>
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Drawer Bottom Actions: 16. Login / Register or 17. Sign Out */}
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1E3D]/40">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }}
                    className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isHindi ? 'साइन आउट' : 'Sign Out'}</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 py-2.5 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      {isHindi ? 'लॉगिन' : 'Login'}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 py-2.5 text-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
                    >
                      {isHindi ? 'रजिस्टर' : 'Register'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
