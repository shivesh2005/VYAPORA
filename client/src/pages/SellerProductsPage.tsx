import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const SellerProductsPage: React.FC = () => {
  const { subscription } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [discountBadge, setDiscountBadge] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('20');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.seller.getProducts();
      if (res.success) setProducts(res.products);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch seller products.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setBrand('');
    setCategory('Electronics');
    setPrice('');
    setCompareAtPrice('');
    setDiscountBadge('');
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setStock('20');
    setImageUrl('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingId(p._id);
    setTitle(p.title);
    setDescription(p.description);
    setBrand(p.brand);
    setCategory(p.category);
    setPrice(String(p.price));
    setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '');
    setDiscountBadge(p.discountBadge || '');
    setSku(p.sku);
    setStock(String(p.stock));
    setImageUrl(p.images?.[0] || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brand.trim() || !price || !sku.trim()) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || 'Premium item listed on VYAPORA Marketplace.',
        brand: brand.trim(),
        category,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        discountBadge: discountBadge.trim() || undefined,
        sku: sku.trim().toUpperCase(),
        stock: Number(stock),
        images: [
          imageUrl.trim() ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        ],
      };

      if (editingId) {
        const res = await api.seller.updateProduct(editingId, payload);
        if (res.success) {
          showToast('Product updated successfully!', 'success');
          setModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.seller.createProduct(payload);
        if (res.success) {
          showToast('Product created successfully!', 'success');
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await api.seller.deleteProduct(id);
      if (res.success) {
        showToast('Product removed.', 'info');
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  const maxProducts = subscription?.planId?.limits?.maxProducts || 10;
  const isAtLimit = products.length >= maxProducts;

  if (loading) return <LoadingSpinner text="Loading catalog listings..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Store Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {products.length} of {maxProducts} listings utilized on your{' '}
            <strong className="text-violet-600">{subscription?.planId?.name || 'STARTER'}</strong> plan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={isAtLimit}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
            isAtLimit
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/30'
          }`}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Plan limit warning banner */}
      {isAtLimit && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800 gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              You have reached your <strong>{subscription?.planId?.name || 'STARTER'}</strong> plan limit of{' '}
              <strong>{maxProducts} products</strong>. Upgrade your seller plan to list more items.
            </span>
          </div>
          <a
            href="/pricing"
            className="px-4 py-1.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shrink-0"
          >
            Upgrade Plan
          </a>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0]}
                      alt={p.title}
                      className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</p>
                      <p className="text-[11px] text-slate-400">{p.brand}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{p.category}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{p.sku}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-bold ${
                        p.stock < 10 ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.isPublished ? 'success' : 'default'}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Catalog Product' : 'Add New Product to Store'}
        description="Configure product specifications, pricing, and high-resolution imagery."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ApexBook M3 Ultra Thin Laptop"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Vanguard"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product features, materials, and warranty information"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Audio & Sound">Audio & Sound</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Smart Living">Smart Living</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="3999"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                SKU Identifier *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Inventory Stock *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Discount Badge
              </label>
              <input
                type="text"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                placeholder="e.g. 25% OFF"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Image URL (Unsplash or direct image link)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Listing'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
