import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Phone, Lock, ArrowLeft, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useStore();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    try {
      const r = await api.sendOTP(phone);
      toast.success('OTP sent to your phone!');
      if (r.data.otp) setOtp(r.data.otp);
      setStep('otp');
    } catch {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.verifyOTP(phone, otp);
      setAuth(r.data.user, r.data.token);
      toast.success('Welcome to ElectroMart! 🎉');
      navigate('/');
    } catch {
      toast.error('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </Link>

        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-sm text-gray-500 mt-1">Login to your ElectroMart account</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">+91</span>
                    <span className="w-px h-5 bg-gray-300" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="input-field pl-[5.5rem] text-lg tracking-wider"
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                We'll send a 6-digit OTP to verify your number
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                  <span className="text-xs text-gray-400">Sent to +91 {phone}</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field pl-10 text-center text-xl tracking-[0.5em] font-mono"
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('OTP resent!')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Dev hint */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-xs text-amber-700 font-medium">🔧 Dev Mode: OTP is always <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">123456</code></p>
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Your data is protected with end-to-end encryption</span>
        </div>
      </div>
    </div>
  );
}
