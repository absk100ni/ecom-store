import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Plus, Pencil, Trash2, Check, Home, ChevronRight, Shield, LogOut, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import AddressForm from '../components/checkout/AddressForm';

export default function ProfilePage() {
  const { isAuth, user, logout } = useStore();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [linkPhoneStep, setLinkPhoneStep] = useState<'idle' | 'phone' | 'otp'>('idle');
  const [linkPhone, setLinkPhone] = useState('');
  const [linkOtp, setLinkOtp] = useState('');

  useEffect(() => {
    if (isAuth) {
      Promise.all([api.getProfile(), api.getAddresses().catch(() => ({ data: { addresses: [] } }))])
        .then(([pr, ar]) => {
          const p = pr.data.user || pr.data;
          setProfile(p);
          setName(p.name || '');
          setEmail(p.email || '');
          setAddresses(ar.data.addresses || ar.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuth]);

  if (!isAuth) return <Navigate to="/login?redirect=/account" />;

  const handleUpdateProfile = async () => {
    try {
      await api.updateProfile({ name, email });
      setProfile({ ...profile, name, email });
      setEditingName(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleLinkPhone = async () => {
    try {
      await api.linkPhone(linkPhone);
      toast.success('OTP sent!');
      setLinkPhoneStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleVerifyLinkPhone = async () => {
    try {
      await api.verifyPhone(linkPhone, linkOtp);
      toast.success('Phone linked!');
      setLinkPhoneStep('idle');
      setProfile({ ...profile, phone: linkPhone });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    }
  };

  const handleAddAddress = async (data: any) => {
    try {
      const r = await api.addAddress(data);
      setAddresses([...addresses, r.data.address || r.data]);
      setShowAddAddress(false);
      toast.success('Address added!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add address');
    }
  };

  const handleUpdateAddress = async (data: any) => {
    try {
      await api.updateAddress(editingAddress.id, data);
      setAddresses(addresses.map((a) => a.id === editingAddress.id ? { ...a, ...data } : a));
      setEditingAddress(null);
      toast.success('Address updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses(addresses.map((a) => ({ ...a, is_default: a.id === id })));
      toast.success('Default address set');
    } catch {
      toast.error('Failed to set default');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="card p-6"><div className="h-6 shimmer rounded w-48 mb-4" /><div className="h-4 shimmer rounded w-64" /></div>
        <div className="card p-6"><div className="h-6 shimmer rounded w-48 mb-4" /><div className="h-20 shimmer rounded" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Helmet><title>My Account - LucubraElec</title><meta name="description" content="Manage your LucubraElec account" /></Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">My Account</span>
      </nav>

      <div className="space-y-6">
        {/* Profile Info */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" /> Profile
            </h2>
            {!editingName && (
              <button onClick={() => setEditingName(true)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {editingName ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdateProfile} className="btn-primary text-sm">Save</button>
                <button onClick={() => setEditingName(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{profile?.email || 'No email set'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{profile?.phone || user?.phone || 'No phone linked'}</span>
                {profile?.phone && <span className="badge text-xs">Verified</span>}
              </div>
              {profile?.google_linked && (
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Google account linked</span>
                  <span className="badge text-xs">Connected</span>
                </div>
              )}
            </div>
          )}

          {/* Link Phone */}
          {!profile?.phone && linkPhoneStep !== 'idle' && (
            <div className="mt-4 border-t pt-4">
              {linkPhoneStep === 'phone' && (
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="10-digit phone" value={linkPhone}
                    onChange={(e) => setLinkPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" />
                  <button onClick={handleLinkPhone} disabled={linkPhone.length !== 10} className="btn-primary text-sm">Send OTP</button>
                </div>
              )}
              {linkPhoneStep === 'otp' && (
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="Enter OTP" value={linkOtp}
                    onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" />
                  <button onClick={handleVerifyLinkPhone} disabled={linkOtp.length !== 6} className="btn-primary text-sm">Verify</button>
                </div>
              )}
            </div>
          )}
          {!profile?.phone && linkPhoneStep === 'idle' && (
            <button onClick={() => setLinkPhoneStep('phone')} className="mt-3 text-sm text-primary-600 hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Link Phone Number
            </button>
          )}
        </div>

        {/* Addresses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" /> Saved Addresses
            </h2>
            <button onClick={() => setShowAddAddress(true)} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {showAddAddress && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddAddress(false)} submitLabel="Add Address" />
            </div>
          )}

          {editingAddress && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <AddressForm initial={editingAddress} onSubmit={handleUpdateAddress} onCancel={() => setEditingAddress(null)} submitLabel="Update" />
            </div>
          )}

          {addresses.length === 0 && !showAddAddress ? (
            <p className="text-sm text-gray-500">No saved addresses yet.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className={`bg-gray-50 rounded-xl p-4 border ${a.is_default ? 'border-primary-300 ring-1 ring-primary-100' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <p className="font-semibold text-gray-900">{a.name} {a.is_default && <span className="text-xs text-primary-600 ml-1">Default</span>}</p>
                      <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                      <p>{a.city}, {a.state} - {a.pincode}</p>
                      <p className="text-gray-500">📞 {a.phone}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {!a.is_default && (
                        <button onClick={() => handleSetDefault(a.id)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded" title="Set default">
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setEditingAddress(a)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteAddress(a.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); toast.success('Logged out'); }} className="btn-secondary w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}
