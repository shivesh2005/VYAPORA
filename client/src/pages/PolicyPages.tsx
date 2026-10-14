import React from 'react';
import { Shield, RotateCcw, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
        <FileText className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">VYAPORA — Multi-Vendor Marketplace Demonstration Agreement</p>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Platform Nature & Demonstration Scope</h3>
      <p>
        VYAPORA (व्यापोरा) is a full-stack educational and portfolio demonstration marketplace engineered using Node.js, Express, MongoDB, and React. Transactions executed within this platform utilize a sandbox demonstration environment.
      </p>
      <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Multi-Vendor Marketplace Responsibilities</h3>
      <p>
        Individual vendors registered on the platform manage their own product listings, pricing, and stock fulfillment statuses. Platform administrators reserve the authority to moderate or unpublish listings violating content guidelines.
      </p>
      <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Seller Membership Plans & Listing Quotas</h3>
      <p>
        Seller membership tiers (Starter, Growth, Scale) govern listing quotas and feature access. Quotas are enforced server-side in MongoDB.
      </p>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <Shield className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Data protection and authentication protocols</p>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Password Security</h3>
      <p>
        User passwords are never stored in plaintext. All credentials undergo 10 rounds of salted bcrypt hashing before persistence in MongoDB.
      </p>
      <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Session Management</h3>
      <p>
        Authentication tokens are transmitted via secure, HTTP-only cookies to mitigate XSS exposure, alongside optional Bearer token authorization for API endpoints.
      </p>
      <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Payment Information</h3>
      <p>
        No real credit card numbers, CVVs, or bank secrets are ever collected, processed, or stored. All checkout actions run in isolated sandbox mode.
      </p>
    </div>
  </div>
);

export const ShippingReturnsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
        <RotateCcw className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Shipping & Returns</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Fulfillment guarantees and cancellation policy</p>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Express Shipping</h3>
      <p>
        Orders totaling ₹999 or more automatically qualify for complimentary Free Express Shipping. Standard delivery applies a flat fee of ₹99.
      </p>
      <h3 className="font-bold text-slate-900 dark:text-white text-base">2. Instant Inventory Restocking Cancellation</h3>
      <p>
        Orders in Pending or Confirmed status can be immediately cancelled by customers with one click. Upon cancellation, all reserved item quantities are automatically restored back to MongoDB catalog inventory.
      </p>
    </div>
  </div>
);
