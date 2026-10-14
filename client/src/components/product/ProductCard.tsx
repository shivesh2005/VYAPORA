import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { formatPrice, language } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isFavorite = isInWishlist(product._id);
  const isHindi = language === 'hi';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAdding(true);
    const success = await addToCart(product._id, 1);
    setAdding(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const imageSrc =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-white dark:bg-[#0C1936] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800"
      >
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.discountBadge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-500 text-white shadow-sm">
              {product.discountBadge}
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-600 text-white shadow-sm">
              {isHindi ? 'प्रमुख' : 'Featured'}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500 shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Low Stock Warning */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-semibold py-0.5 text-center rounded-md">
            {isHindi ? `केवल ${product.stock} आइटम शेष!` : `Only ${product.stock} left in stock!`}
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-slate-700">
              {isHindi ? 'स्टॉक समाप्त' : 'Out of Stock'}
            </span>
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span className="truncate max-w-[120px]">{product.category}</span>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-2"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.rating ? product.rating.toFixed(1) : '4.5'}
            </span>
            <span className="text-xs text-slate-400">({product.numReviews || 0})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || adding}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              added
                ? 'bg-emerald-600 text-white'
                : product.stock <= 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-95'
            }`}
            title={isHindi ? 'कार्ट में जोड़ें' : 'Add to Cart'}
          >
            {added ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
