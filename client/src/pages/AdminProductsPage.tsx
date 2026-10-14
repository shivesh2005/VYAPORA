import React, { useState, useEffect } from 'react';
import { Layers, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getAllProducts();
      if (res.success) setProducts(res.products);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch platform products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.admin.togglePublish(id);
      if (res.success) {
        showToast(res.message, 'success');
        setProducts(
          products.map((p) => (p._id === id ? { ...p, isPublished: !p.isPublished } : p))
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle product status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product from the platform?')) return;
    try {
      const res = await api.admin.deleteProduct(id);
      if (res.success) {
        showToast('Product removed from platform.', 'info');
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Querying platform catalog moderation queue..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Product Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit vendor listings, toggle public storefront visibility, and moderate catalog quality
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Merchant</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Visibility</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0]}
                      alt={p.title}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</p>
                      <p className="text-[11px] text-slate-400">{p.brand}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{p.category}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">
                    {p.sellerId?.name || 'Seller'}
                  </td>
                  <td className="py-3.5 px-4">{p.stock}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.isPublished ? 'success' : 'default'}>
                      {p.isPublished ? 'Live' : 'Unpublished'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(p._id)}
                        className={`p-1.5 rounded-lg font-bold text-xs transition-colors ${
                          p.isPublished
                            ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={p.isPublished ? 'Unpublish from store' : 'Publish to store'}
                      >
                        {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
