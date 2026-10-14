import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  X,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CartPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { formatPrice } = useLanguage();
  const { items, summary, updateQuantity, removeFromCart, applyCoupon, removeCoupon, loading } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in to view your cart</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your cart is synchronized across devices once you log in.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-slate-900 dark:bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-violet-700 transition-colors inline-block"
          >
            {t('common:nav.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Refreshing cart details..." />;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('products:cart.empty')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t('products:cart.emptySub')}
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all"
        >
          {t('common:shopNow')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponInput.trim());
    setApplyingCoupon(false);
    setCouponInput('');
  };

  const freeShippingProgress = Math.min(
    100,
    Math.round((summary.subtotal / summary.freeShippingThreshold) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('products:cart.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your items, apply vouchers, and proceed to checkout
        </p>
      </div>

      {/* Free Shipping Meter */}
      <div className="p-4 bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-violet-900 dark:text-violet-300 font-semibold">
          <Truck className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
          {summary.subtotal >= summary.freeShippingThreshold ? (
            <span>🎉 Congratulations! You have unlocked <strong>FREE Express Shipping</strong>!</span>
          ) : (
            <span>
              Add <strong>{formatPrice(summary.amountNeededForFreeShipping)}</strong> more to claim <strong>FREE Express Delivery</strong>!
            </span>
          )}
        </div>
        <div className="w-full sm:w-48 bg-violet-200 dark:bg-violet-900/60 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-violet-600 dark:bg-violet-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const prod = item.productId;
            if (!prod) return null;

            return (
              <div
                key={item._id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={prod.images?.[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <Link
                      to={`/product/${prod.slug}`}
                      className="text-sm font-bold text-slate-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors block line-clamp-1"
                    >
                      {prod.title}
                    </Link>
                    {item.selectedVariant && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.selectedVariant.name}: <strong>{item.selectedVariant.value}</strong>
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatPrice(prod.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= prod.stock}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatPrice(prod.price * item.quantity)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title={t('products:cart.remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          {/* Coupon Input */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Apply Promo Code
            </h3>
            {summary.appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Coupon <strong>{summary.appliedCoupon}</strong> Applied (-{formatPrice(summary.discountAmount)})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VYAPORA10, SAVE20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono tracking-wider outline-none focus:border-violet-500 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-slate-900 dark:bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-violet-700 disabled:opacity-40 transition-colors"
                >
                  {applyingCoupon ? '...' : t('products:cart.applyCoupon')}
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
              <p>💡 Available Demo Coupons:</p>
              <p>• <strong>VYAPORA10</strong>: 10% off (Orders &gt; ₹999)</p>
              <p>• <strong>SAVE20</strong>: 20% off (Orders &gt; ₹2,499)</p>
              <p>• <strong>WELCOME50</strong>: Flat ₹500 off (Orders &gt; ₹1,999)</p>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Breakdown
            </h3>
            <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>{t('products:cart.subtotal')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>{t('products:cart.discount')} ({summary.appliedCoupon})</span>
                  <span>-{formatPrice(summary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('products:cart.shipping')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {summary.shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 uppercase text-xs font-bold">{t('products:cart.free')}</span>
                  ) : (
                    formatPrice(summary.shippingFee)
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-slate-900 dark:text-white block">{t('products:cart.total')}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Includes all platform taxes</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(summary.total)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-slate-900 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              {t('products:cart.proceedToCheckout')}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Simulated Payment & Stock Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
