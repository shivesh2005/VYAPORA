import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const SellerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.seller.getOrders();
      if (res.success) setOrders(res.orders);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch seller orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await api.seller.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching merchant orders..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Order Fulfillment Desk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track customer packages, update fulfillment milestones, and prepare shipments
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No merchant orders yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            When customers purchase your listed products, their orders will appear here for packaging and shipping.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // Find allowed next transitions
            const nextOptions: string[] = [];
            if (order.orderStatus === 'Confirmed') nextOptions.push('Processing', 'Cancelled');
            else if (order.orderStatus === 'Processing') nextOptions.push('Shipped', 'Cancelled');
            else if (order.orderStatus === 'Shipped') nextOptions.push('Delivered');

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      <Badge
                        variant={
                          order.orderStatus === 'Delivered'
                            ? 'success'
                            : order.orderStatus === 'Cancelled'
                            ? 'danger'
                            : 'violet'
                        }
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Destination: {order.shippingAddress.city}, {order.shippingAddress.state} •{' '}
                      {order.shippingAddress.fullName}
                    </p>
                  </div>

                  {/* Transition Action */}
                  <div className="flex items-center gap-3">
                    {nextOptions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Advance to:</span>
                        {nextOptions.map((opt) => (
                          <button
                            key={opt}
                            disabled={updatingId === order._id}
                            onClick={() => handleUpdateStatus(order._id, opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              opt === 'Cancelled'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                : 'bg-violet-600 hover:bg-violet-700 text-white'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items in this order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-slate-500">
                          Qty: {item.quantity} • Total: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
