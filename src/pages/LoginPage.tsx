import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Zap, Phone, Lock, ArrowLeft, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import { STORE_NAME } from '../config/constants';

// P1-3: phone login gated by env flag
const PHONE_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_PHONE_LOGIN === 'true';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleResponse = useCallback(async (response: any) => {
    try {
      const r = await api.googleLogin(response.credential);
      setAuth(r.data.user, r.data.token);
      // Merge guest cart to server
      const { guestCart, clearGuestCart } = useStore.getState();
      if (guestCart.length > 0) {
        for (const item of guestCart) {
          try { await api.addToCart(item.product_id, item.quantity); } catch { /* best-effort */ }
        }
        clearGuestCart();
        const c = await api.getCart();
        useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
        toast.success('Welcome! Cart restored 🛒');
      } else {
        toast.success('Welcome! 🎉');
      }
      navigate(redirectTo);
    } catch {
      toast.error('Google sign-in failed');
    }
  }, [setAuth, navigate, redirectTo]);

  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
      });
      (window as any).google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
      );
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [googleClientId, handleGoogleResponse]);

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
      // Merge guest cart to server
      const { guestCart, clearGuestCart } = useStore.getState();
      if (guestCart.length > 0) {
        for (const item of guestCart) {
          try { await api.addToCart(item.product_id, item.quantity); } catch { /* best-effort */ }
        }
        clearGuestCart();
        const c = await api.getCart();
        useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
        toast.success(`Welcome to ${STORE_NAME}! Cart restored 🛒`);
      } else {
        toast.success(`Welcome to ${STORE_NAME}! 🎉`);
      }
      navigate(redirectTo);
    } catch {
      toast.error('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Helmet><title>Login - {STORE_NAME}</title><meta name="description" content={`Login to your ${STORE_NAME} account`} /></Helmet>
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
            <p className="text-sm text-gray-500 mt-1">Login to your {STORE_NAME} account</p>
          </div>

          {/* P1-3: Phone login only when VITE_ENABLE_PHONE_LOGIN=true */}
          {PHONE_LOGIN_ENABLED && (
            <>
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

              {/* Dev hint — only visible when phone login is enabled */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-700 font-medium">🔧 Dev Mode: OTP is always <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">123456</code></p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="px-3 text-xs text-gray-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {/* Google Sign-In — always visible */}
          <div className={PHONE_LOGIN_ENABLED ? '' : 'mt-2'}>
            {googleClientId ? (
              <div id="google-signin-btn" className="flex justify-center" />
            ) : (
              <div className="relative group">
                <button disabled className="w-full py-2.5 px-4 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#9CA3AF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#9CA3AF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#9CA3AF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#9CA3AF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google Sign-in
                </button>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Google sign-in not configured
                </div>
              </div>
            )}
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
