import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const AdminSellersPage: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getSellerApplications();
      if (res.success) setApplications(res.applications);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch seller applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenReview = (app: any, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setReviewAction(action);
    setReviewNote(action === 'approve' ? 'Approved by platform administrator.' : 'Rejected.');
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setSubmitting(true);
      const res = await api.admin.reviewSellerApplication(
        selectedApp._id,
        reviewAction,
        reviewNote
      );
      if (res.success) {
        showToast(res.message, 'success');
        setReviewModalOpen(false);
        fetchApplications();
      }
    } catch (err: any) {
      showToast(err.message || 'Review failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving seller applications queue..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Merchant Applications Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review business credentials and authorize verified multi-vendor storefronts
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Application Queue Clear</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            All merchant onboarding requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Proposed Store</th>
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Business Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{app.storeName}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{app.userId?.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{app.userId?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">{app.businessType}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      {app.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === 'approved'
                            ? 'success'
                            : app.status === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {app.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {app.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReview(app, 'approve')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(app, 'reject')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Decided ({app.status})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`${reviewAction === 'approve' ? 'Approve' : 'Reject'} Seller Application`}
        description={`Applicant: ${selectedApp?.storeName}`}
      >
        <form onSubmit={handleConfirmReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Administrator Review Note
            </label>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-50 ${
                reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
