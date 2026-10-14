import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Ban, CheckCircle, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getUsers({
        role: roleFilter,
        search: search.trim() || undefined,
      });
      if (res.success) setUsers(res.users);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleSuspend = async (user: User) => {
    if (user.role === 'admin') {
      showToast('Cannot suspend platform administrator accounts.', 'error');
      return;
    }

    try {
      setTogglingId(user.id);
      const res = await api.admin.toggleSuspendUser(user.id);
      if (res.success) {
        showToast(res.message, 'success');
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle account suspension.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            User Accounts Governance
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage buyers, merchant accounts, permissions, and security suspensions
          </p>
        </div>

        {/* Search & Role Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-violet-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving platform accounts..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u: any) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'danger'
                            : u.role === 'seller'
                            ? 'violet'
                            : 'default'
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          u.isSuspended ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          disabled={togglingId === (u._id || u.id)}
                          onClick={() => handleToggleSuspend({ ...u, id: u._id || u.id })}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
