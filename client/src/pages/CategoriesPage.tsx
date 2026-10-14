import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Category } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then((res) => {
      if (res.success) setCategories(res.categories);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
          Cloud Catalog Taxonomy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Product Categories
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Discover high-performance electronics, studio-grade acoustics, modern lifestyle apparel, and ergonomic smart living furniture.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading taxonomy categories..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden rounded-3xl h-80 border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">
                  {cat.itemCount} Products Available
                </span>
                <h3 className="text-2xl font-extrabold group-hover:text-violet-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-violet-400 group-hover:translate-x-1 transition-transform">
                  Browse Collection <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
