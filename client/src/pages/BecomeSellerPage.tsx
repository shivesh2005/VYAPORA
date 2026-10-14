import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const BecomeSellerPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('Consumer Electronics & Audio');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Please log in to apply as a merchant</h2>
        <Link to="/login?redirect=/become-seller" className="text-violet-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.seller.apply({
        storeName: storeName.trim(),
        businessType,
        description: description.trim(),
        phone: phone.trim(),
      });
      if (res.success) {
        setSubmitted(true);
        showToast('Application submitted for administrator review.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Application submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
          Merchant Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Join VYAPORA Multi-Vendor Marketplace
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          List your products, reach thousands of active buyers across India, and manage orders through our dedicated merchant portal.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your application for <strong>"{storeName}"</strong> has been queued for administrator review. Once approved, your role will be upgraded with full store customizer access.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-5 shadow-sm"
          >
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Store className="w-5 h-5 text-violet-600" /> Store Profile Information
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Proposed Store / Brand Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex Audio Labs"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Business Category *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              >
                <option value="Consumer Electronics & Audio">Consumer Electronics & Audio</option>
                <option value="Fashion & Apparel Brand">Fashion & Apparel Brand</option>
                <option value="Smart Living & Furniture">Smart Living & Furniture</option>
                <option value="Creator Tech & Accessories">Creator Tech & Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Store Bio & Catalog Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your manufacturing, product range, and customer promise."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Submit Merchant Application'}
            </button>
          </form>

          {/* Value Props Sidebar */}
          <div className="space-y-4">
            <div className="bg-brand-surface text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 block">
                Platform Privileges
              </span>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dedicated custom storefront URL with live brand styling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Integrated AI recommendation catalog indexing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Recharts analytics with order volume and average order value</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparent ईजन सेवा seller plans with product quota scaling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
