import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from 'lucide-react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

export const ShopPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common']);
  const { formatPrice } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalProducts: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter States initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync category or search from query params when they change
  useEffect(() => {
    const q = searchParams.get('search') || '';
    const cat = searchParams.get('category') || 'All';
    setSearch(q);
    setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    api.categories.list().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  // Fetch Products based on current filters
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;
      if (inStock) params.inStock = true;

      const res = await api.products.list(params);
      if (res.success) {
        setProducts(res.products);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, sort, rating, inStock]);

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setInStock(false);
    setSearchParams({});
    fetchProducts(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== 'All' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(rating) ||
    inStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Marketplace Catalog</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showing {pagination.totalProducts} verified products across active multi-vendor stores
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('products:filters.title')}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">
              {t('products:filters.sortBy')}:
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="newest">{t('products:filters.sortOptions.newest')}</option>
              <option value="popular">{t('products:filters.sortOptions.popular')}</option>
              <option value="rating">{t('products:filters.sortOptions.rating')}</option>
              <option value="price_asc">{t('products:filters.sortOptions.priceLowHigh')}</option>
              <option value="price_desc">{t('products:filters.sortOptions.priceHighLow')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-violet-600 dark:text-violet-400" /> {t('products:filters.title')}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
              >
                {t('products:filters.clearAll')}
              </button>
            )}
          </div>

          {/* Search input in sidebar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-violet-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              {t('products:filters.category')}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t('common:allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-70">({cat.itemCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              {t('products:filters.priceRange')} (₹)
            </h3>
            <form onSubmit={handleApplyPriceFilter} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={t('products:filters.minPrice')}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder={t('products:filters.maxPrice')}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-bold bg-slate-900 dark:bg-violet-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-violet-700 transition-colors"
              >
                {t('common:actions.apply')}
              </button>
            </form>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
              {t('products:filters.rating')}
            </h3>
            <div className="space-y-1.5">
              {[
                { label: '4.5★ and above', val: '4.5' },
                { label: '4.0★ and above', val: '4.0' },
                { label: '3.0★ and above', val: '3.0' },
              ].map((r) => (
                <label key={r.val} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={rating === r.val}
                    onChange={() => setRating(r.val)}
                    className="text-violet-600 focus:ring-violet-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* In-Stock Filter */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span>{t('products:filters.inStockOnly')}</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-100/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  Search: "{search}"
                  <button onClick={() => { setSearch(''); fetchProducts(1); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); fetchProducts(1); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" />
                  </button>
                </span>
              )}
              {rating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {rating}★+
                  <button onClick={() => setRating('')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Cards */}
          {loading ? (
            <LoadingSpinner text="Querying catalog..." />
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No products match your filters</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try widening your price range, choosing another category, or clearing search keywords.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-slate-900 dark:bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-violet-700 transition-colors"
              >
                {t('products:filters.clearAll')}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => fetchProducts(pagination.page - 1)}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => fetchProducts(pagination.page + 1)}
                    className="flex items-center gap-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
