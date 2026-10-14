import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { BRAND } from '../config/brand';

export const SellerSubscriptionPage: React.FC = () => {
  const { subscription, reloadUser } = useAuth();
  const { showToast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const plan = subscription?.planId;

  const handleToggleCancel = async () => {
    try {
      setCancelling(true);
      const res = await api.subscriptions.toggleCancel();
      if (res.success) {
        showToast(res.message, 'info');
        await reloadUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {BRAND.myMembershipHindi} | My Membership
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            व्यापोरा (VYAPORA) विक्रेता प्लान, उत्पाद सीमा और शॉपिंग सहायक उपयोग कोटा प्रबंधन
          </p>
        </div>
        <Link
          to="/pricing"
          className="px-5 py-2.5 bg-gradient-to-r from-[#6345FF] to-[#3478FF] hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-[#6345FF]/25 flex items-center gap-1.5 self-start sm:self-center"
        >
          {BRAND.upgradePlanHindi} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              सक्रिय प्लान (Active Plan)
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900">
                {plan?.name || 'STARTER'} प्लान
              </h2>
              <Badge variant="violet">
                {subscription?.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹{plan?.price ? plan.price.toLocaleString('en-IN') : 0}
            </span>
            <span className="text-xs text-slate-400 block">/ महीना (Demo sandbox)</span>
          </div>
        </div>

        {/* Quotas Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>उत्पाद लिस्टिंग कोटा (Product Listings Quota)</span>
              <span>
                {subscription?.usage?.productsCount || 0} / {plan?.limits?.maxProducts || 10}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-violet-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((subscription?.usage?.productsCount || 0) /
                        (plan?.limits?.maxProducts || 10)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>मासिक AI क्वेरीज़ (Monthly AI Queries)</span>
              <span>
                {subscription?.usage?.aiRequestsThisMonth || 0} /{' '}
                {plan?.limits?.maxMonthlyAiRequests || 50}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((subscription?.usage?.aiRequestsThisMonth || 0) /
                        (plan?.limits?.maxMonthlyAiRequests || 50)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            प्लान सुविधाएँ (Entitlements)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {plan?.features?.map((f, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Renewal Details & Cancel Action */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="text-slate-500">
              वैधता समाप्ति तिथि:{' '}
              <strong className="text-slate-800">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '30 Days from activation'}
              </strong>
            </p>
            {subscription?.cancelAtPeriodEnd && (
              <p className="text-rose-600 font-semibold mt-0.5">
                सदस्यता इस बिलिंग चक्र के अंत में समाप्त हो जाएगी।
              </p>
            )}
          </div>

          <button
            disabled={cancelling}
            onClick={handleToggleCancel}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              subscription?.cancelAtPeriodEnd
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            {cancelling
              ? 'Processing...'
              : subscription?.cancelAtPeriodEnd
              ? 'Resume Auto-Renewal'
              : 'Cancel at Period End'}
          </button>
        </div>
      </div>
    </div>
  );
};
