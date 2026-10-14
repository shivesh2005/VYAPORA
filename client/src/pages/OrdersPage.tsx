import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.orders
      .list()
      .then((res) => {
        if (res.success) setOrders(res.orders);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Please log in to view your orders</h2>
        <Link to="/login" className="text-violet-600 font-semibold hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Fetching your order history..." />;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
      case 'Processing':
        return 'violet';
      case 'Confirmed':
        return 'default';
      case 'Cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review placed orders, view status timelines, and access delivery invoices
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No orders placed yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Browse our catalog, add premium gear to your cart, and experience the demo order flow.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-slate-900">
                      {order.orderNumber}
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.orderStatus) as any}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      {order.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-violet-50 text-slate-700 hover:text-violet-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    View Timeline <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Items Thumbnails Preview */}
              <div className="flex items-center gap-3 overflow-x-auto py-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-200"
                    />
                    <div className="text-xs max-w-[140px] truncate">
                      <p className="font-medium text-slate-800 truncate">{item.title}</p>
                      <p className="text-slate-400">x{item.quantity} • ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
