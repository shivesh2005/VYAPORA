import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Store,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
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
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getAnalytics()
      .then((res) => {
        if (res.success) setAnalytics(res.analytics);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Querying platform administration metrics..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Platform Command Center
            </span>
            <Badge variant="danger">ADMIN ACCESS</Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Overview & Governance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated multi-vendor marketplace telemetry and operational metrics
          </p>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/ai-config"
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Gemini AI Engine
          </Link>
          <Link
            to="/admin/sellers"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" /> Seller Approvals ({analytics?.pendingApplicationsCount || 0})
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-slate-500" /> Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Platform GMV
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{(analytics?.platformGmv || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">Total marketplace gross value</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Orders
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {analytics?.totalOrders || 0}
          </p>
          <p className="text-[11px] text-slate-400">Across all vendor stores</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Merchants
          </span>
          <p className="text-2xl font-extrabold text-violet-600">
            {analytics?.totalSellers || 0}
          </p>
          <p className="text-[11px] text-violet-600 font-semibold">Verified vendor stores</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Customers
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {analytics?.totalCustomers || 0}
          </p>
          <p className="text-[11px] text-slate-400">Registered platform buyers</p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Catalog Listings
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {analytics?.totalProducts || 0}
          </p>
          <p className="text-[11px] text-slate-400">Indexed in database</p>
        </div>
      </div>

      {/* GMV Timeline Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Platform Gross Merchandise Value (GMV)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate marketplace transactional flow (₹)</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Real-time Aggregation
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.platformTimeline || []}>
              <defs>
                <linearGradient id="adminGmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Platform GMV']}
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
                dataKey="gmv"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#adminGmvGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders & Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Recent Platform Orders
          </h3>
          <div className="divide-y divide-slate-100">
            {(analytics?.recentOrders || []).map((o: any) => (
              <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{o.orderNumber}</p>
                  <p className="text-slate-400">
                    {new Date(o.createdAt).toLocaleDateString('en-IN')} • {o.items?.length} items
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-extrabold text-slate-900 block">
                    ₹{o.totalAmount?.toLocaleString('en-IN')}
                  </span>
                  <Badge variant={o.orderStatus === 'Delivered' ? 'success' : 'violet'}>
                    {o.orderStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Recently Registered Users
          </h3>
          <div className="divide-y divide-slate-100">
            {(analytics?.recentUsers || []).map((u: any) => (
              <div key={u._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-400">{u.email}</p>
                  </div>
                </div>
                <Badge variant={u.role === 'seller' ? 'violet' : 'default'}>
                  {u.role.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
