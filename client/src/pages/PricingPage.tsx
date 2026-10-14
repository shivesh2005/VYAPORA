import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { api } from '../services/api';
import { SubscriptionPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { BRAND } from '../config/brand';

export const PricingPage: React.FC = () => {
  const { user, subscription, reloadUser } = useAuth();
  const { showToast } = useToast();
  const { language, formatPrice } = useLanguage();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Upgrade Modal State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const isHindi = language === 'hi';

  useEffect(() => {
    api.subscriptions
      .getPlans()
      .then((res) => {
        if (res.success) setPlans(res.plans);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }
    if (user.role !== 'seller') {
      navigate('/become-seller');
      return;
    }
    setSelectedPlan(plan);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      setUpgrading(true);
      const res = await api.subscriptions.upgrade(selectedPlan.slug);
      if (res.success) {
        showToast(res.message, 'success');
        await reloadUser();
        setUpgradeModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Upgrade failed.', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={isHindi ? 'योजनाएँ लोड हो रही हैं...' : 'Loading membership plans...'} />;
  }

  const currentPlanName = subscription?.planId?.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070D1E] text-slate-800 dark:text-slate-100 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            {isHindi ? 'व्यापारी सदस्यता योजनाएँ' : 'Merchant Membership Plans'}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {isHindi ? 'पारदर्शी विक्रेता सदस्यता योजनाएँ' : 'Transparent Seller Membership Plans'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isHindi
              ? 'अपनी बिक्री मात्रा के अनुसार सही योजना चुनें। निश्चित उत्पाद सीमाओं और 100% पारदर्शी शुल्क के साथ व्यवसाय बढ़ाएं।'
              : 'Choose the tier that fits your sales volume. Scale smoothly with predictable listing limits and zero hidden fees.'}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isCurrent = currentPlanName === plan.name;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan._id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'bg-white dark:bg-[#0C1936] border-2 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white dark:bg-[#0C1936] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md">
                    {isHindi ? 'सबसे लोकप्रिय' : 'Most Popular'}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {isHindi ? 'वर्तमान सक्रिय प्लान' : 'Current Active Plan'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs mb-6 leading-relaxed text-slate-500 dark:text-slate-400">
                    {plan.tagline}
                  </p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      /{isHindi ? 'माह' : 'month'}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 mb-8 text-xs sm:text-sm">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    disabled={isCurrent}
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isCurrent ? (
                      isHindi ? 'सक्रिय सदस्यता' : 'Active Subscription'
                    ) : user?.role === 'seller' ? (
                      <>
                        <span>{isHindi ? `${plan.name} में अपग्रेड करें` : `Upgrade to ${plan.name}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>{isHindi ? `${plan.name} विक्रेता बनें` : `Join as ${plan.name} Merchant`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-[#0C1936] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'विस्तृत प्लान सुविधाएँ' : 'Comprehensive Plan Entitlements'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">{isHindi ? 'सुविधा / क्षमता' : 'Capability'}</th>
                  <th className="py-3 px-4 font-semibold text-center">Starter</th>
                  <th className="py-3 px-4 font-semibold text-center text-indigo-600 dark:text-indigo-400">Pro</th>
                  <th className="py-3 px-4 font-semibold text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'अधिकतम उत्पाद सूची (Max Products)' : 'Max Active Products'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold">10</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">50</td>
                  <td className="py-3.5 px-4 text-center font-bold">200</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'मासिक AI क्वेरीज़ (Monthly AI Queries)' : 'Monthly AI Queries'}
                  </td>
                  <td className="py-3.5 px-4 text-center">50</td>
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">250</td>
                  <td className="py-3.5 px-4 text-center font-bold">1,000</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'उन्नत विश्लेषण और चार्ट (Advanced Analytics)' : 'Advanced Analytics & Charts'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'कूपन कोड क्रिएटर (Coupon Generator)' : 'Coupon Code Creator'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'कस्टम स्टोरफ्रंट ब्रांडिंग (Custom Storefront)' : 'Custom Storefront Branding'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {isHindi ? 'प्राथमिकता सहायता (Priority SLA)' : 'Priority Support SLA'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">✓ 24/7 Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Simulation Modal */}
        <Modal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          title={isHindi ? `${selectedPlan?.name} प्लान में अपग्रेड करें` : `Upgrade to ${selectedPlan?.name} Plan`}
          description={
            isHindi
              ? 'व्यापोरा सदस्यता सक्रियण: तुरंत मोंगोडीबी में नए कोटा लागू करता है।'
              : 'Demonstrates instant entitlement recalculation in MongoDB.'
          }
        >
          <div className="space-y-4 text-slate-800 dark:text-slate-200">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <p className="font-bold text-sm">
                {formatPrice(selectedPlan?.price || 0)} /{isHindi ? 'माह' : 'month'}
              </p>
              <p>• Max Products: {selectedPlan?.limits.maxProducts}</p>
              <p>• AI Monthly Calls: {selectedPlan?.limits.maxMonthlyAiRequests}</p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
              ⚠️ <strong>Demo Sandbox Mode:</strong> No real billing charge will occur. Clicking confirm immediately upgrades your merchant limits in MongoDB.
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                disabled={upgrading}
                onClick={handleConfirmUpgrade}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/25"
              >
                {upgrading
                  ? isHindi
                    ? 'अपग्रेड हो रहा है...'
                    : 'Upgrading...'
                  : isHindi
                  ? 'अपग्रेड की पुष्टि करें'
                  : 'Confirm Demo Upgrade'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
