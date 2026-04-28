import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Truck, ChevronRight, Home, Package, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';

declare global {
  interface Window { Razorpay: any; }
}

type Step = 'address' | 'review' | 'payment' | 'success';

export default function CheckoutPage() {
  const { isAuth, cart, cartTotal, setCart } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('address');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [addr, setAddr] = useState({
    name: '', line1: '', line2: '', city: '', state: '', pincode: '', phone: ''
  });

  useEffect(() => {
    if (isAuth) {
      api.getCart()
        .then((r) => setCart(r.data.cart?.items || [], r.data.total || 0))
        .catch(() => {});
    }
  }, [isAuth]);

  const shippingCost = cartTotal >= 50000 ? 0 : 5000;
  const total = cartTotal + shippingCost;

  // Step 1: Validate address and go to review
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.name || !addr.line1 || !addr.city || !addr.state || !addr.pincode || !addr.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    if (addr.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (addr.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    setStep('review');
  };

  // Step 2: Create order, then initiate Razorpay payment
  const handlePlaceAndPay = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const orderRes = await api.createOrder({ shipping_address: addr });
      const order = orderRes.data;
      const oid = order.id || order.ID;
      const onum = order.order_number || order.OrderNumber;
      setOrderId(oid);
      setOrderNumber(onum);

      // 2. Create Payment (get Razorpay order)
      const payRes = await api.createPayment(oid);
      const payData = payRes.data;

      // 3. Check if Razorpay key exists — if not, skip payment (dev mode)
      if (!payData.razorpay_key_id) {
        toast.success('🎉 Order placed! (Payment skipped — no Razorpay key configured)');
        setCart([], 0);
        setStep('success');
        return;
      }

      // 4. Open Razorpay Checkout
      setStep('payment');
      const options = {
        key: payData.razorpay_key_id,
        amount: payData.amount,
        currency: payData.currency || 'INR',
        name: 'ElectroMart',
        description: `Order #${onum}`,
        order_id: payData.razorpay_order_id,
        prefill: {
          name: addr.name,
          contact: addr.phone,
        },
        theme: { color: '#4F46E5' },
        handler: async (response: any) => {
          // 5. Verify payment
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('🎉 Payment successful! Order confirmed.');
            setCart([], 0);
            setStep('success');
          } catch {
            toast.error('Payment verification failed. Please contact support.');
            setStep('review');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment was cancelled. Your order is saved — you can pay later from Orders.');
            setCart([], 0);
            setStep('success'); // Order is created, just unpaid
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) return <Navigate to="/login" />;

  const stepNum = step === 'address' ? 1 : step === 'review' ? 2 : step === 'payment' ? 3 : 4;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
      {step !== 'success' && (
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

      {/* ============ SUCCESS STEP ============ */}
      {step === 'success' && (
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-2">Your order <span className="font-semibold text-primary-600">#{orderNumber}</span> has been placed.</p>
          <p className="text-sm text-gray-400 mb-8">You'll receive an SMS update on {addr.phone}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary">View My Orders</button>
            <button onClick={() => navigate('/')} className="btn-secondary">Continue Shopping</button>
          </div>
        </div>
      )}

      {/* ============ ADDRESS & REVIEW STEPS ============ */}
      {(step === 'address' || step === 'review' || step === 'payment') && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* ADDRESS STEP */}
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

            {/* REVIEW STEP */}
            {(step === 'review' || step === 'payment') && (
              <div className="space-y-4">
                {/* Shipping Address Summary */}
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

                {/* Cart Items */}
                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary-600" /> Order Items ({cart.length})
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
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

                {/* Pay Now Button */}
                {step === 'review' && (
                  <button
                    onClick={handlePlaceAndPay}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating order & opening payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{(total / 100).toLocaleString('en-IN')} with Razorpay
                      </>
                    )}
                  </button>
                )}

                {step === 'payment' && (
                  <div className="card p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Razorpay payment window is open...</p>
                    <p className="text-sm text-gray-400 mt-1">Complete the payment in the popup</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20 space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>

              {/* Cart Items Preview (compact) */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1">{item.name} × {item.quantity}</span>
                    <span className="font-medium ml-2">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{(cartTotal / 100).toLocaleString('en-IN')}</span>
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

              {/* Trust */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { icon: Shield, label: 'Secure Checkout' },
                  { icon: Truck, label: 'Fast Delivery' },
                  { icon: CreditCard, label: 'Razorpay Secure' },
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
