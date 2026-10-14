import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Store,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.seller
      .getAnalytics()
      .then((res) => {
        if (res.success) setAnalytics(res.analytics);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Compiling merchant metrics from MongoDB..." />;

  const sub = analytics?.subscription;
  const plan = sub?.planId;
  const maxProducts = plan?.limits?.maxProducts || 10;
  const productUsagePercent = Math.min(
    100,
    Math.round(((analytics?.totalProducts || 0) / maxProducts) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
              Merchant Cloud Portal
            </span>
            <Badge variant="violet">
              {plan?.name || 'STARTER'} Plan
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales & Operational Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time analytics aggregated across your catalog listings
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <Link
            to="/seller/products"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Manage Catalog
          </Link>
          <Link
            to="/seller/store"
            className="px-4 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-xl text-xs transition-colors border border-violet-200 flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" /> Customizer
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            ₹{(analytics?.totalSales || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            Derived from confirmed cloud orders
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Fulfilled Orders</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {analytics?.totalOrders || 0}
          </p>
          <p className="text-xs text-slate-400">Total volume across customer carts</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Average Order Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            ₹{(analytics?.averageOrderValue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400">Per transaction merchant basket</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">
            {analytics?.lowStockCount || 0}
          </p>
          <p className="text-xs text-amber-600 font-semibold">
            {analytics?.lowStockCount > 0 ? 'Items below 10 units' : 'Inventory healthy'}
          </p>
        </div>
      </div>

      {/* Main Grid: Revenue Timeline Chart & Subscription Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recharts Revenue Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Merchant Sales Velocity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue trajectory (₹ INR)</p>
            </div>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              6-Month Cohort
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenueTimeline || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Entitlements & Meter */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" /> Plan Entitlements | व्यापार सुविधाएँ
              </h3>
              <Link to="/pricing" className="text-xs font-bold text-violet-600 hover:underline">
                Upgrade
              </Link>
            </div>

            <div className="p-4 bg-violet-50/70 rounded-2xl border border-violet-100 space-y-2">
              <span className="text-xs font-bold text-violet-900 uppercase tracking-wider block">
                Current Tier
              </span>
              <p className="text-2xl font-extrabold text-violet-900">
                {plan?.name || 'STARTER'}
              </p>
              <p className="text-xs text-violet-700">
                ₹{plan?.price ? plan.price.toLocaleString('en-IN') : 999} / month billing period
              </p>
            </div>

            {/* Product Limit Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Catalog Listings Limit</span>
                <span>
                  {analytics?.totalProducts || 0} / {maxProducts} items
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    productUsagePercent >= 90 ? 'bg-rose-500' : 'bg-violet-600'
                  }`}
                  style={{ width: `${productUsagePercent}%` }}
                />
              </div>
              {productUsagePercent >= 90 && (
                <p className="text-[11px] text-rose-600 font-semibold">
                  ⚠️ Approaching plan limit! Upgrade to Growth or Scale to list more.
                </p>
              )}
            </div>

            {/* AI Assistant Call Meter */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Monthly AI Queries</span>
                <span>
                  {sub?.usage?.aiRequestsThisMonth || 0} / {plan?.limits?.maxMonthlyAiRequests || 50}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((sub?.usage?.aiRequestsThisMonth || 0) /
                          (plan?.limits?.maxMonthlyAiRequests || 50)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Link
            to="/seller/subscription"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition-colors block"
          >
            Manage Billing & Limits
          </Link>
        </div>
      </div>

      {/* Top Performing Catalog Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Top Performing Store Products
          </h3>
          <Link
            to="/seller/products"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            View All ({analytics?.totalProducts || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Inventory</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(analytics?.topProducts || []).map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <img
                      src={p.images?.[0]}
                      alt={p.title}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.title}</span>
                  </td>
                  <td className="py-3 px-3">{p.category}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold ${
                        p.stock < 10 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">{p.rating}★ ({p.numReviews})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
