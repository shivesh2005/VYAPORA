import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Package,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { RatingStars } from '../components/ui/RatingStars';

export const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { formatPrice } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.products.getByIdOrSlug(slug);
        if (res.success && res.product) {
          const prod = res.product;
          setProduct(prod);
          setSelectedImage(prod.images?.[0] || '');

          // Initialize default variants
          const defaults: Record<string, string> = {};
          prod.variants?.forEach((v) => {
            if (v.options?.length > 0) defaults[v.name] = v.options[0];
          });
          setSelectedVariants(defaults);

          // Fetch reviews and related products
          const [revRes, relRes] = await Promise.all([
            api.reviews.getByProduct(prod._id).catch(() => null),
            api.products.getRelated(prod._id).catch(() => null),
          ]);
          if (revRes?.success) setReviews(revRes.reviews);
          if (relRes?.success) setRelated(relRes.products);
        }
      } catch (err: any) {
        showToast(err.message || 'Product not found.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading product details..." />;
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/shop" className="text-violet-600 font-semibold hover:underline">
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (product.stock < quantity) {
      showToast(`Only ${product.stock} units currently available.`, 'error');
      return;
    }
    setAddingToCart(true);
    await addToCart(product._id, quantity, selectedVariants);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product._id, quantity, selectedVariants);
    if (success) {
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to write a review.', 'info');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      showToast('Please enter both a title and review comment.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.reviews.create(product._id, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      if (res.success) {
        showToast('Review submitted successfully!', 'success');
        setReviews([res.review, ...reviews]);
        setReviewModalOpen(false);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err: any) {
      showToast(err.message || 'Review submission failed.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-800 dark:hover:text-white">{t('common:nav.home')}</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-800 dark:hover:text-white">{t('common:nav.shop')}</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-800 dark:hover:text-white">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Media Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-md relative">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountBadge && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-500 text-white shadow-md">
                {product.discountBadge}
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-violet-600 ring-2 ring-violet-200 dark:ring-violet-900'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price, Variants & Cart CTA */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider text-xs">
                {product.brand}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating Stars and review counter */}
            <div className="flex items-center gap-3 mt-3">
              <RatingStars rating={product.rating} numReviews={product.numReviews} size="md" />
              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Verified Listing
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants?.map((v) => (
            <div key={v.name} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {v.name}: <span className="text-violet-600 dark:text-violet-400">{selectedVariants[v.name]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                    }
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariants[v.name] === opt
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-2 ring-violet-200 dark:ring-violet-900'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {product.stock > 10 ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('products:status.inStock')} ({product.stock} units available)
              </span>
            ) : product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Only {product.stock} units left in stock!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {t('products:status.outOfStock')}
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-slate-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                disabled={product.stock <= 0 || addingToCart}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {t('common:actions.addToCart')}
              </button>

              {/* Wishlist Toggle */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3 rounded-xl border transition-all ${
                  isFavorite
                    ? 'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                    : 'border-slate-300 dark:border-slate-700 hover:border-rose-300 text-slate-600 dark:text-slate-300 hover:text-rose-500 bg-white dark:bg-slate-800'
                }`}
                title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Direct Buy Now */}
            <button
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
              className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:opacity-95 shadow-lg shadow-violet-500/25 transition-all text-center"
            >
              {t('common:actions.buyNow')}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
              <Truck className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t('common:trust.fastDelivery')}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Orders over ₹999</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">{t('common:trust.verifiedMerchants')}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Direct warranty</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 border border-slate-100 dark:border-slate-800">
              <RotateCcw className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mx-auto" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">7-Day Returns</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Product Specifications & Overview</h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
          {product.description}
        </p>

        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified feedback from certified marketplace customers
            </p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 bg-slate-900 dark:bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-violet-700 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No customer reviews yet. Be the first to share your experience with this product!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rev.customerName}</span>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <RatingStars rating={rev.rating} showNumber={false} size="sm" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rev.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Related Products in {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Customer Review"
        description={`Share your thoughts on ${product.title}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-700 ml-2">{reviewRating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Review Headline
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Exceptional build quality and soundstage"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Detailed Comments
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you like or dislike? How does it perform in daily use?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
