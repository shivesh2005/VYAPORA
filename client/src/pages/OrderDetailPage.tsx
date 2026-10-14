import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.orders.getById(id);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading visual order tracking timeline..." />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/orders" className="text-violet-600 font-semibold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const steps: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'Cancelled';

  const canCancel = ['Pending', 'Confirmed'].includes(order.orderStatus);

  const handleConfirmCancel = async () => {
    try {
      setCancelling(true);
      const res = await api.orders.cancel(order._id, cancelReason);
      if (res.success) {
        setOrder(res.order);
        setCancelModalOpen(false);
        showToast('Order cancelled successfully. Stock has been restored.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order {order.orderNumber}
            </h1>
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
          <p className="text-xs text-slate-400">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            • Tracking: <strong className="text-slate-700 font-mono">{order.trackingNumber}</strong>
          </p>
        </div>

        {canCancel && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-center"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Visual Tracking Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8">
        <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          Delivery Status Stepper
        </h3>

        {isCancelled ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-800">
            <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                This order was cancelled and inventory has been replenished back to the active store catalog.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Stepper Line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0 hidden sm:block">
              <div
                className="h-full bg-violet-600 transition-all duration-700"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Stepper Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-violet-600 text-white ring-4 ring-violet-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-violet-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {st}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider block">
                          Current Phase
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status History Timeline Notes */}
        {order.statusHistory?.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Timeline Audit Activity
            </h4>
            <div className="space-y-2">
              {order.statusHistory.map((sh, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{sh.status}</span> — {sh.note}{' '}
                    <span className="text-slate-400 text-[11px]">
                      ({new Date(sh.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Grid: Address, Invoice, Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ordered Items List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Items in this Package ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    {item.variant && (
                      <p className="text-xs text-slate-500">
                        {item.variant.name}: <strong>{item.variant.value}</strong>
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Invoice Breakdown */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-violet-600" /> Delivery Address
            </h4>
            <p className="text-sm font-bold text-slate-900">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} - {order.shippingAddress.zipCode}
            </p>
            <p className="text-xs text-slate-500 font-mono">{order.shippingAddress.phone}</p>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Breakdown
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>Total Paid</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              Method: <strong>{order.paymentMethod.replace('_', ' ').toUpperCase()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Order"
        description="Are you sure you want to cancel? This will instantly release inventory back to the store."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Reason for Cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
            >
              <option value="Changed my mind">Changed my mind</option>
              <option value="Ordered duplicate items">Ordered duplicate items by mistake</option>
              <option value="Found alternative price">Found alternative product</option>
              <option value="Testing demo system">Testing demo checkout flow</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Keep Order
            </button>
            <button
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
