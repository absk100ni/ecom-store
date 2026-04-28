import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Truck, ChevronRight, Home, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { isAuth, cart, cartTotal, setCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addr.name || !addr.line1 || !addr.city || !addr.pincode || !addr.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.createOrder({ shipping_address: addr });
      toast.success('🎉 Order placed successfully!');
      setCart([], 0);
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) return <Navigate to="/login" />;

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
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { step: 1, label: 'Cart', done: true },
          { step: 2, label: 'Shipping', done: false, active: true },
          { step: 3, label: 'Payment', done: false },
        ].map((s, i) => (
          <div key={s.step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${s.done ? 'bg-green-500 text-white' : s.active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s.done ? '✓' : s.step}
            </div>
            <span className={`text-sm font-medium ${s.active ? 'text-primary-600' : s.done ? 'text-green-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`w-12 h-0.5 ${s.done ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleOrder} className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={addr.name}
                  onChange={(e) => setAddr({ ...addr, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  className="input-field"
                  placeholder="House/Flat No., Street Name"
                  value={addr.line1}
                  onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  className="input-field"
                  placeholder="Landmark, Area (Optional)"
                  value={addr.line2}
                  onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    className="input-field"
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    className="input-field"
                    placeholder="State"
                    value={addr.state}
                    onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    className="input-field"
                    placeholder="6-digit pincode"
                    value={addr.pincode}
                    onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    inputMode="numeric"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    className="input-field"
                    placeholder="10-digit phone number"
                    value={addr.phone}
                    onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Place Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20 space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>

            {/* Cart Items Preview */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                  </span>
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
                <span className="font-medium text-green-600">
                  {cartTotal >= 99900 ? 'FREE' : '₹49'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{((cartTotal + (cartTotal >= 99900 ? 0 : 4900)) / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { icon: Shield, label: 'Secure Checkout' },
                { icon: Truck, label: 'Fast Delivery' },
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
    </div>
  );
}
