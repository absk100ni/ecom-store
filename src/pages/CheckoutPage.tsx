import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Truck, ChevronRight, Home, Package, CheckCircle, ArrowLeft, Loader2, Tag, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import StripePaymentForm from '../components/checkout/StripePaymentForm';
import { trackBeginCheckout, trackPurchase } from '../lib/analytics';
import { STORE_NAME, getShippingCost, FREE_SHIPPING_THRESHOLD } from '../config/constants';
import { retryRazorpayPayment } from '../lib/razorpay';

declare global {
  interface Window { Cashfree: any; }
}

type Step = 'address' | 'review' | 'payment' | 'success' | 'payment-pending';

export default function CheckoutPage() {
  const { isAuth, cart, cartTotal, setCart, guestCart, guestCartTotal, clearGuestCart } = useStore();
  const navigate = useNavigate();
  const isGuest = !isAuth;
  const activeCart = isGuest ? guestCart : cart;
  const activeTotal = isGuest ? guestCartTotal : cartTotal;

  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [guestToken, setGuestToken] = useState('');
  const [addr, setAddr] = useState({
    name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: ''
  });
  const [paymentPlan, setPaymentPlan] = useState<'partial' | 'full'>('partial');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [successData, setSuccessData] = useState<any>(null);
  const [stripePayData, setStripePayData] = useState<any>(null);
  const [retryingPayment, setRetryingPayment] = useState(false);

  // P0-2: double-click guard
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isAuth) {
      api.getCart()
        .then((r) => {
          const cartItems = r.data.cart?.items || [];
          const cartTot = r.data.total || 0;
          setCart(cartItems, cartTot);
          if (cartItems.length > 0) {
            trackBeginCheckout(
              cartTot,
              cartItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
              cartItems.map((i: any) => ({ id: i.product_id || i.id, name: i.name || i.product_name || '', pricePaise: i.price || 0, qty: i.quantity || 1 }))
            );
          }
        })
        .catch(() => {});
    }
  }, [isAuth]);

  // P0-4: centralized shipping threshold
  const shippingCost = getShippingCost(activeTotal);
  const total = activeTotal + shippingCost - couponDiscount;
  const advancePercent = activeCart.length ? Math.max(...activeCart.map((i: any) => i.advance_percent ?? 20)) : 20;
  const advanceAmount = paymentPlan === 'partial'
    ? Math.min(Math.ceil((total * advancePercent) / 100 / 100) * 100, total)
    : total;
  const codAmount = total - advanceAmount;

  const validateCheckoutCoupon = async (code: string) => {
    try {
      const res = await api.applyCoupon(code, activeTotal);
      setCouponCode(code);
      setCouponDiscount(res.data.discount || 0);
      toast.success(`Coupon ${code} applied! You save ₹${((res.data.discount || 0) / 100).toLocaleString('en-IN')}`);
    } catch (err: any) {
      setCouponCode('');
      setCouponDiscount(0);
      toast.error(err.response?.data?.error || 'Invalid coupon code');
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.name || !addr.line1 || !addr.city || !addr.state || !addr.pincode || !addr.phone) {
      toast.error('Please fill all required fields'); return;
    }
    if (addr.phone.length !== 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    if (addr.pincode.length !== 6) { toast.error('Please enter a valid 6-digit pincode'); return; }
    setStep('review');
  };

  // ========== CASHFREE PAYMENT ==========
  const openCashfree = async (payData: any, oid: string, onum: string) => {
    setStep('payment');
    try {
      const cashfree = await window.Cashfree({
        mode: payData.cashfree_env === 'production' ? 'production' : 'sandbox',
      });
      const result = await cashfree.checkout({
        paymentSessionId: payData.payment_session_id,
        redirectTarget: '_modal',
      });

      if (result.error) {
        toast.error('Payment failed: ' + (result.error.message || 'Unknown error'));
        setStep('review');
        return;
      }
      if (result.paymentDetails) {
        try {
          await api.verifyPayment({
            gateway: 'cashfree',
            order_id: oid,
          });
          toast.success('🎉 Payment successful! Order confirmed.');
          isGuest ? clearGuestCart() : setCart([], 0);
          setStep('success');
        } catch {
          toast.error('Payment verification failed.');
          setStep('review');
        }
      } else {
        try {
          const r = isGuest
            ? await api.guestAbandonOrder(oid, guestToken)
            : await api.abandonOrder(oid);
          if (r.data?.paid) { isGuest ? clearGuestCart() : setCart([], 0); setStep('success'); return; }
        } catch { /* sweeper fallback */ }
        toast('Payment not completed — your cart is unchanged.', { icon: 'ℹ️' });
        setStep('review');
      }
    } catch (err: any) {
      toast.error('Cashfree checkout error: ' + (err.message || 'Unknown'));
      setStep('review');
    }
  };

  // ========== Shared dismiss handler ==========
  const handlePaymentDismiss = async (oid: string) => {
    try {
      const r = isGuest
        ? await api.guestAbandonOrder(oid, guestToken)
        : await api.abandonOrder(oid);
      if (r.data?.paid) { isGuest ? clearGuestCart() : setCart([], 0); setStep('success'); return; }
    } catch { /* order voids via expiry sweeper as fallback */ }
    toast('Payment not completed — your cart is unchanged.', { icon: 'ℹ️' });
    setStep('review');
  };

  const handlePaymentSuccess = () => {
    isGuest ? clearGuestCart() : setCart([], 0);
    setStep('success');
  };

  // ========== PLACE ORDER & PAY ==========
  const handlePlaceAndPay = async () => {
    if (isSubmittingRef.current) return;
    if (activeCart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);
    try {
      let oid: string, onum: string, order: any;

      if (isGuest) {
        // Guest order flow
        const orderRes = await api.guestCreateOrder({
          items: guestCart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          shipping_address: addr,
          payment_plan: paymentPlan,
          ...(couponCode ? { coupon_code: couponCode } : {}),
        });
        order = orderRes.data.order || orderRes.data;
        oid = order.id || order.ID;
        onum = order.order_number || order.OrderNumber;
        const gt = orderRes.data.guest_token || '';
        setGuestToken(gt);
        setOrderId(oid);
        setOrderNumber(onum);
        setSuccessData(order);

        // Guest payment
        const payRes = await api.guestCreatePayment(oid, gt);
        const payData = payRes.data;
        if (payData.gateway === 'razorpay' && payData.razorpay_key_id) {
          setStep('payment');
          retryRazorpayPayment(oid, onum, {
            onSuccess: handlePaymentSuccess,
            onDismiss: () => handlePaymentDismiss(oid),
            onVerifyFail: () => { setStep('review'); },
          }, gt).catch(() => { setStep('review'); });
        } else if (payData.gateway === 'cashfree' && payData.payment_session_id) {
          openCashfree(payData, oid, onum);
        } else {
          toast.success('🎉 Order placed!');
          clearGuestCart();
          setStep('success');
        }
      } else {
        // Authed order flow (unchanged)
        const orderRes = await api.createOrder({ shipping_address: addr, payment_plan: paymentPlan, ...(couponCode ? { coupon_code: couponCode } : {}) });
        order = orderRes.data;
        oid = order.id || order.ID;
        onum = order.order_number || order.OrderNumber;
        setOrderId(oid);
        setOrderNumber(onum);
        setSuccessData(order);

        const payRes = await api.createPayment(oid);
        const payData = payRes.data;
        const gateway = payData.gateway;

        if (gateway === 'stripe' && payData.client_secret) {
          setStripePayData(payData);
          setStep('payment');
        } else if (gateway === 'razorpay' && payData.razorpay_key_id) {
          setStep('payment');
          retryRazorpayPayment(oid, onum, {
            onSuccess: handlePaymentSuccess,
            onDismiss: () => handlePaymentDismiss(oid),
            onVerifyFail: () => { setStep('review'); },
          }).catch(() => { setStep('review'); });
        } else if (gateway === 'cashfree' && payData.payment_session_id) {
          openCashfree(payData, oid, onum);
        } else {
          toast.success('🎉 Order placed! (Payment skipped — no gateway configured)');
          setCart([], 0);
          setStep('success');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
      setStep('review');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // P1-1: retry payment from payment-pending screen
  const handleRetryPayment = async () => {
    if (!orderId) return;
    setRetryingPayment(true);
    try {
      const ok = await retryRazorpayPayment(orderId, orderNumber, {
        onSuccess: () => { setStep('success'); setRetryingPayment(false); },
        onDismiss: () => { setRetryingPayment(false); toast('Payment not completed. You can try again or pay from Orders.'); },
        onVerifyFail: () => { setRetryingPayment(false); },
      }, isGuest ? guestToken : undefined);
      if (!ok) {
        toast.error('Payment gateway unavailable. Please try from Orders page.');
        setRetryingPayment(false);
      }
    } catch {
      toast.error('Failed to create payment. Please try from Orders page.');
      setRetryingPayment(false);
    }
  };

  // Redirect to cart if empty (direct URL access) -- works for both guest and authed
  if (activeCart.length === 0 && step !== 'success' && step !== 'payment-pending' && step !== 'payment') {
    return <Navigate to="/cart" />;
  }

  const stepNum = step === 'address' ? 1 : step === 'review' ? 2 : step === 'payment' ? 3 : 4;

  // Fire purchase event exactly once per order
  useEffect(() => {
    if (step === 'success' && orderId && activeCart.length > 0) {
      trackPurchase(
        orderId,
        successData?.total || total,
        activeCart.map((i: any) => ({ id: i.product_id || i.id, name: i.name || i.product_name || '', pricePaise: i.price || 0, qty: i.quantity || 1 }))
      );
    }
  }, [step, orderId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Helmet><title>Checkout - {STORE_NAME}</title><meta name="description" content="Complete your purchase" /></Helmet>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/cart" className="hover:text-primary-600">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Checkout</span>
      </nav>

      {/* Progress Steps */}
      {step !== 'success' && step !== 'payment-pending' && (
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { step: 1, label: 'Shipping' },
            { step: 2, label: 'Review' },
            { step: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${s.step < stepNum ? 'bg-green-500 text-white' : s.step === stepNum ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-gray-200 text-gray-500'}`}>
                {s.step < stepNum ? '✓' : s.step}
              </div>
              <span className={`text-sm font-medium ${s.step === stepNum ? 'text-primary-600' : s.step < stepNum ? 'text-green-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-12 h-0.5 ${s.step < stepNum ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* SUCCESS */}
      {step === 'success' && (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-2">Your order <span className="font-semibold text-primary-600">#{orderNumber}</span> has been placed.</p>
          {paymentPlan === 'partial' && successData && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-left mx-auto max-w-xs mb-4 mt-4">
              <p className="font-medium text-amber-800 mb-1">Payment Breakdown</p>
              <p className="text-amber-700">Paid now: ₹{((successData.advance_amount || advanceAmount) / 100).toLocaleString('en-IN')}</p>
              <p className="text-amber-700">Due on delivery: ₹{((successData.cod_amount || codAmount) / 100).toLocaleString('en-IN')}</p>
            </div>
          )}
          <p className="text-sm text-gray-400 mb-4">You'll receive an SMS update on {addr.phone}</p>
          {isGuest && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-left mx-auto max-w-sm mb-6">
              <p className="font-semibold text-primary-800 mb-1">📋 Save this to track your order</p>
              <p className="text-primary-700">Order number: <span className="font-mono font-bold">{orderNumber}</span></p>
              <p className="text-primary-700">Phone: <span className="font-mono font-bold">{addr.phone}</span></p>
              <Link to="/track" className="inline-block mt-2 text-primary-600 font-semibold underline hover:text-primary-800">
                Track your order →
              </Link>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            {isAuth ? (
              <button onClick={() => navigate('/orders')} className="btn-primary">View My Orders</button>
            ) : (
              <button onClick={() => navigate('/track')} className="btn-primary">Track Order</button>
            )}
            <button onClick={() => navigate('/')} className="btn-secondary">Continue Shopping</button>
          </div>
        </div>
      )}

      {/* P1-1: PAYMENT PENDING */}
      {step === 'payment-pending' && (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h2>
          <p className="text-gray-500 mb-2">
            Your order <span className="font-semibold text-primary-600">#{orderNumber}</span> has been created, but payment was not completed.
          </p>
          <p className="text-sm text-gray-400 mb-8">Complete the payment now or pay later from your Orders page.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRetryPayment} disabled={retryingPayment} className="btn-primary flex items-center gap-2">
              {retryingPayment ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Complete Payment</>}
            </button>
            {isAuth ? (
              <button onClick={() => navigate('/orders')} className="btn-secondary">View Orders</button>
            ) : (
              <button onClick={() => navigate('/track')} className="btn-secondary">Track Order</button>
            )}
          </div>
        </div>
      )}

      {/* ADDRESS / REVIEW / PAYMENT */}
      {(step === 'address' || step === 'review' || step === 'payment') && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Guest notice */}
            {isGuest && step === 'address' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0" />
                <span>Checking out as guest. <Link to="/login" className="font-semibold underline">Login</Link> to save your order history.</span>
              </div>
            )}

            {/* ADDRESS */}
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit} className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input className="input-field" placeholder="John Doe" value={addr.name}
                      onChange={(e) => setAddr({ ...addr, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input className="input-field" placeholder="House/Flat No., Street Name" value={addr.line1}
                      onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input className="input-field" placeholder="Landmark, Area (Optional)" value={addr.line2}
                      onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input className="input-field" placeholder="City" value={addr.city}
                        onChange={(e) => setAddr({ ...addr, city: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input className="input-field" placeholder="State" value={addr.state}
                        onChange={(e) => setAddr({ ...addr, state: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input className="input-field" placeholder="6-digit pincode" value={addr.pincode}
                        onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        inputMode="numeric" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input className="input-field" placeholder="10-digit phone number" value={addr.phone}
                        onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        inputMode="numeric" required />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REVIEW */}
            {(step === 'review' || step === 'payment') && (
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" /> Shipping Address
                    </h3>
                    {step === 'review' && (
                      <button onClick={() => setStep('address')} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
                    <p className="font-semibold text-gray-900">{addr.name}</p>
                    <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500">📞 {addr.phone}</p>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary-600" /> Order Items ({activeCart.length})
                  </h3>
                  <div className="space-y-3">
                    {activeCart.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 border">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{(item.price / 100).toLocaleString('en-IN')}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 shrink-0">
                          ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {step === 'review' && (
                  <>
                    {/* Coupon */}
                    <div className="card p-5">
                      <h3 className="font-bold text-gray-900 text-sm mb-3">Have a coupon?</h3>
                      {couponCode ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                          <Tag className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-sm font-semibold text-green-700 flex-1">{couponCode} {couponDiscount > 0 && <span className="text-xs font-normal">(-₹{(couponDiscount/100).toLocaleString('en-IN')})</span>}</span>
                          <button onClick={() => { setCouponCode(''); setCouponDiscount(0); }} className="text-green-600 hover:text-green-800 text-xs font-medium">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input className="input-field flex-1 text-sm" placeholder="Enter coupon code" id="checkout-coupon"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const v = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                if (v) validateCheckoutCoupon(v);
                              }
                            }} />
                          <button onClick={() => {
                            const el = document.getElementById('checkout-coupon') as HTMLInputElement;
                            const v = el?.value.trim().toUpperCase();
                            if (v) { validateCheckoutCoupon(v); el.value = ''; }
                          }} className="btn-primary px-4 text-sm">Apply</button>
                        </div>
                      )}
                    </div>

                    {/* Payment Plan */}
                    <div className="card p-5">
                      <h3 className="font-bold text-gray-900 text-sm mb-3">Payment Method</h3>
                      <div className="space-y-2">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentPlan === 'partial' ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-100' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="plan" checked={paymentPlan === 'partial'} onChange={() => setPaymentPlan('partial')} className="accent-primary-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Pay ₹{(advanceAmount / 100).toLocaleString('en-IN')} now + ₹{(codAmount / 100).toLocaleString('en-IN')} on delivery</p>
                            <p className="text-xs text-gray-500">Pay {advancePercent}% advance, rest via Cash on Delivery</p>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentPlan === 'full' ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-100' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="plan" checked={paymentPlan === 'full'} onChange={() => setPaymentPlan('full')} className="accent-primary-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Pay in full online — ₹{(total / 100).toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-500">Complete payment now via UPI / Card / Netbanking</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button onClick={handlePlaceAndPay} disabled={loading || isSubmittingRef.current}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Creating order & opening payment...</>
                      ) : (
                        <><CreditCard className="w-5 h-5" /> Pay ₹{((paymentPlan === 'partial' ? advanceAmount : total) / 100).toLocaleString('en-IN')}{paymentPlan === 'partial' ? ' (Advance)' : ''}</>
                      )}
                    </button>
                  </>
                )}

                {step === 'payment' && (
                  stripePayData ? (
                    <StripePaymentForm
                      clientSecret={stripePayData.client_secret}
                      publishableKey={stripePayData.publishable_key}
                      amount={stripePayData.amount}
                      onSuccess={async (paymentIntentId: string) => {
                        try {
                          await api.verifyPayment({
                            order_id: orderId,
                            gateway: 'stripe',
                            payment_intent_id: paymentIntentId,
                          });
                          toast.success('🎉 Payment successful! Order confirmed.');
                          isGuest ? clearGuestCart() : setCart([], 0);
                          setStripePayData(null);
                          setStep('success');
                        } catch {
                          toast.error('Payment verification failed. Please contact support.');
                          setStripePayData(null);
                          setStep('review');
                        }
                      }}
                      onCancel={() => {
                        isGuest ? clearGuestCart() : setCart([], 0);
                        setStripePayData(null);
                        setStep('payment-pending');
                      }}
                    />
                  ) : (
                    <div className="card p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Payment window is open...</p>
                      <p className="text-sm text-gray-400 mt-1">Complete the payment in the popup</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20 space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeCart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1">{item.name} × {item.quantity}</span>
                    <span className="font-medium ml-2">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{(activeTotal / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'FREE' : `₹${(shippingCost / 100).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₹{(total / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { icon: Shield, label: 'Secure Checkout' },
                  { icon: Truck, label: 'Fast Delivery' },
                  { icon: CreditCard, label: 'Secure Payment' },
                  { icon: CheckCircle, label: '100% Genuine' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    <b.icon className="w-3.5 h-3.5 text-primary-600" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
