import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Address } from '../types';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addrName, setAddrName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAvatar(user.avatar || '');
    setPhone(user.phone || '');

    api.user.getAddresses().then((res) => {
      if (res.success) setAddresses(res.addresses);
    });
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.user.updateProfile({ name, avatar, phone });
      if (res.success) {
        updateUser(res.user);
        showToast('Profile information updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    try {
      setChangingPassword(true);
      const res = await api.user.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.user.addAddress({
        fullName: addrName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        country: 'India',
        isDefault: addresses.length === 0,
      });
      if (res.success) {
        setAddresses([res.address, ...addresses]);
        setAddressModalOpen(false);
        showToast('Address added.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.user.deleteAddress(id);
      setAddresses(addresses.filter((a) => a._id !== id));
      showToast('Address removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove address.', 'error');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await api.user.setDefaultAddress(id);
      if (res.success) {
        setAddresses(
          addresses.map((a) => ({
            ...a,
            isDefault: a._id === id,
          }))
        );
        showToast('Default delivery address updated.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to set default address.', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account & Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal credentials, address book, and security settings
          </p>
        </div>
        <Badge
          variant={
            user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'violet' : 'default'
          }
        >
          {user.role.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-violet-600" /> Personal Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-600" /> Security & Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl text-xs hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Account Security Status:</p>
            <p>• Password hashed with salted bcrypt (10 rounds)</p>
            <p>• Session authenticated via HTTP-only secure cookie</p>
          </div>
        </div>
      </div>

      {/* Address Book Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-600" /> Address Book
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Saved delivery addresses for rapid checkout
            </p>
          </div>
          <button
            onClick={() => setAddressModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No addresses saved yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-5 rounded-2xl border border-slate-200/80 space-y-3 relative bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                </p>
                <p className="text-xs text-slate-500 font-mono">{addr.phone}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr._id)}
                      className="text-violet-600 font-semibold hover:underline"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-rose-500 hover:text-rose-700 ml-auto p-1"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={addrName}
                onChange={(e) => setAddrName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                required
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Street
            </label>
            <input
              type="text"
              required
              value={addrStreet}
              onChange={(e) => setAddrStreet(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
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
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={addrState}
                onChange={(e) => setAddrState(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                required
                value={addrZip}
                onChange={(e) => setAddrZip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
