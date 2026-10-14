import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, Palette, Image, Layout, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Store } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const PRESET_COLORS = [
  '#7C3AED', // Electric Violet
  '#4F46E5', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#E11D48', // Rose
  '#F59E0B', // Amber
  '#0F172A', // Slate Dark
];

export const SellerStorePage: React.FC = () => {
  const { store, updateStore } = useAuth();
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState(store?.storeName || '');
  const [description, setDescription] = useState(store?.description || '');
  const [logoUrl, setLogoUrl] = useState(store?.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(store?.bannerUrl || '');
  const [brandAccentColor, setBrandAccentColor] = useState(store?.brandAccentColor || '#7C3AED');
  const [theme, setTheme] = useState<'modern' | 'minimal' | 'bold'>(
    store?.layoutSettings?.theme || 'modern'
  );
  const [featuredTagline, setFeaturedTagline] = useState(
    store?.layoutSettings?.featuredTagline || 'Curated Premium Marketplace Collection'
  );

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!store);

  useEffect(() => {
    if (!store) {
      api.stores
        .getMyStore()
        .then((res) => {
          if (res.success && res.store) {
            updateStore(res.store);
            setStoreName(res.store.storeName);
            setDescription(res.store.description);
            setLogoUrl(res.store.logoUrl);
            setBannerUrl(res.store.bannerUrl);
            setBrandAccentColor(res.store.brandAccentColor);
            setTheme(res.store.layoutSettings?.theme || 'modern');
            setFeaturedTagline(res.store.layoutSettings?.featuredTagline || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [store]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.stores.updateCustomization({
        storeName,
        description,
        logoUrl,
        bannerUrl,
        brandAccentColor,
        layoutSettings: {
          theme,
          showBanner: true,
          featuredTagline,
          productGridColumns: 4,
        },
      });

      if (res.success && res.store) {
        updateStore(res.store);
        showToast('Storefront customization saved and published live!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save store customization.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading storefront settings..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Storefront Customizer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your merchant branding, logo, banner imagery, and layout theme with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Customization Form */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-600" /> Branding Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Featured Tagline
              </label>
              <input
                type="text"
                value={featuredTagline}
                onChange={(e) => setFeaturedTagline(e.target.value)}
                placeholder="e.g. Engineering the future of desktop computing"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Store Bio / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            {/* Brand Accent Color */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Brand Accent Color: <span className="font-mono text-violet-600">{brandAccentColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setBrandAccentColor(col)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      brandAccentColor === col ? 'scale-125 border-slate-900 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Hero Banner URL
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Storefront Layout Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['modern', 'minimal', 'bold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      theme === t
                        ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-200'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            {saving ? 'Publishing Changes...' : 'Save & Publish Customizer'}
          </button>
        </form>

        {/* Right: Live Preview Pane */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Live Interactive Preview</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Real-time Simulation
            </span>
          </div>

          {/* Store Mockup Card */}
          <div className="rounded-3xl border border-slate-300 shadow-xl overflow-hidden bg-white">
            {/* Mockup Banner */}
            <div className="h-44 relative bg-slate-900 overflow-hidden">
              <img
                src={
                  bannerUrl ||
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
                }
                alt="Banner"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            </div>

            {/* Mockup Header info */}
            <div className="px-6 pb-6 pt-0 relative space-y-4">
              <div className="flex items-end justify-between -mt-10 mb-2">
                <img
                  src={
                    logoUrl ||
                    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=256&q=80'
                  }
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                />
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
                  style={{ backgroundColor: brandAccentColor }}
                >
                  Follow Store
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">{storeName || 'My Store'}</h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color: brandAccentColor }}>
                  {featuredTagline}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {description || 'Official multi-vendor store on VYAPORA Marketplace.'}
                </p>
              </div>

              {/* Sample Mock Products */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Storefront Catalog Mockup ({theme} layout)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <div className="h-16 bg-slate-200 rounded-lg" />
                    <p className="text-xs font-bold text-slate-800">Sample Item 1</p>
                    <p className="text-xs font-extrabold" style={{ color: brandAccentColor }}>
                      ₹2,499
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <div className="h-16 bg-slate-200 rounded-lg" />
                    <p className="text-xs font-bold text-slate-800">Sample Item 2</p>
                    <p className="text-xs font-extrabold" style={{ color: brandAccentColor }}>
                      ₹4,999
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
