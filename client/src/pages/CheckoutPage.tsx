import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  Plus,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Address } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';

export const CheckoutPage: React.FC = () => {
  const { formatPrice } = useLanguage();
  const { items, summary, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'demo_card' | 'demo_upi' | 'cod'>('demo_card');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Add Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '+91 98765 43210');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const loadAddresses = async () => {
      try {
        const res = await api.user.getAddresses();
        if (res.success && res.addresses.length > 0) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          // Pre-populate demo address if none exist
          const demoAddr = await api.user.addAddress({
            fullName: user.name,
            phone: '+91 98765 43210',
            street: '124, Cloud Heights, Tech Innovation Zone',
            city: 'Bengaluru',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India',
            isDefault: true,
          });
          if (demoAddr.success) {
            setAddresses([demoAddr.address]);
            setSelectedAddressId(demoAddr.address._id);
          }
        }
      } catch (err) {
        console.error('Error loading addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [user, items.length, navigate]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.user.addAddress({
        fullName: newFullName,
        phone: newPhone,
        street: newStreet,
        city: newCity,
        state: newState,
        zipCode: newZipCode,
        country: 'India',
        isDefault: addresses.length === 0,
      });
      if (res.success) {
        setAddresses([res.address, ...addresses]);
        setSelectedAddressId(res.address._id);
        setAddressModalOpen(false);
        showToast('Address saved successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save address.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    const chosenAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!chosenAddress) {
      showToast('Please select or add a shipping address.', 'error');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await api.orders.create({
        shippingAddress: {
          fullName: chosenAddress.fullName,
          phone: chosenAddress.phone,
          street: chosenAddress.street,
          city: chosenAddress.city,
          state: chosenAddress.state,
          zipCode: chosenAddress.zipCode,
          country: chosenAddress.country,
        },
        paymentMethod,
        couponCode: summary.appliedCoupon,
      });

      if (res.success && res.order) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast('Order confirmed! Inventory reserved in cloud database.', 'success');
        navigate(`/orders/${res.order._id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order.', 'error');
      setPlacingOrder(false);
    }
  };

  if (loadingAddresses) return <LoadingSpinner text="Preparing checkout session..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Checkout</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review destination address and select your simulated demo payment method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Address Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-600 dark:text-violet-400" /> 1. Shipping Address
              </h2>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{addr.fullName}</span>
                    {selectedAddressId === addr._id && (
                      <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">{addr.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" /> 2. Payment Method (Sandbox Simulation)
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Safe demo mode: No real payment credentials or bank details are required.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'demo_card',
                  title: 'Demo Credit / Debit Card',
                  desc: 'Instant simulation of VISA / Mastercard gateway approval',
                  icon: CreditCard,
                },
                {
                  id: 'demo_upi',
                  title: 'Demo UPI / Instant Pay',
                  desc: 'Instant QR simulation with zero gateway latency',
                  icon: Smartphone,
                },
                {
                  id: 'cod',
                  title: 'Cash on Delivery (COD)',
                  desc: 'Pay cash upon delivery at your doorstep',
                  icon: Banknote,
                },
              ].map((m) => {
                const IconComponent = m.icon;
                return (
                  <label
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as any)}
                      className="mt-1 text-violet-600 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                          DEMO
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary ({items.length} items)
            </h3>

            {/* Compact Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => {
                const prod = item.productId;
                if (!prod) return null;
                return (
                  <div key={item._id} className="flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={prod.images?.[0]}
                        alt={prod.title}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{prod.title}</p>
                        <p className="text-slate-400 dark:text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatPrice(prod.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount ({summary.appliedCoupon})</span>
                  <span>-{formatPrice(summary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {summary.shippingFee === 0 ? 'FREE' : formatPrice(summary.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span>{formatPrice(summary.total)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              disabled={placingOrder}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {placingOrder ? 'Confirming with Cloud Database...' : 'Confirm Order & Deduct Inventory'}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Transactional inventory decrement verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              required
              placeholder="House/Flat number, building, street, area"
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                required
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
