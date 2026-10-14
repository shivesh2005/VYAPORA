import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/product/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, wishlistCount, toggleWishlist, addToCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Please log in to view your wishlist</h2>
        <Link to="/login" className="text-violet-600 font-semibold hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
        <p className="text-sm text-slate-500 mt-1">
          {wishlistCount} saved {wishlistCount === 1 ? 'item' : 'items'} for your future orders
        </p>
      </div>

      {wishlistCount === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Save items you like by clicking the heart icon on any product card or detail page.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
