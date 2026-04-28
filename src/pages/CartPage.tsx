import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, ChevronRight, Home, Truck, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, cartTotal, isAuth, setCart } = useStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuth) {
      api.getCart()
        .then((r) => setCart(r.data.cart?.items || [], r.data.total || 0))
        .catch(() => {});
    }
  }, [isAuth]);

  const updateQty = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(productId);
    try {
      await api.updateCartQty(productId, newQty);
      const c = await api.getCart();
      setCart(c.data.cart?.items || [], c.data.total || 0);
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.removeFromCart(productId);
      const c = await api.getCart();
      setCart(c.data.cart?.items || [], c.data.total || 0);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      const disc = Math.round(cartTotal * 0.1);
      setDiscount(disc);
      setCouponApplied(true);
      toast.success('Coupon WELCOME10 applied! 10% off');
    } else if (code === 'FLAT500') {
      if (cartTotal >= 200000) { // min ₹2000
        setDiscount(50000); // ₹500
        setCouponApplied(true);
        toast.success('Coupon FLAT500 applied! ₹500 off');
      } else {
        toast.error('Minimum order ₹2,000 required for FLAT500');
      }
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscount(0);
    toast.success('Coupon removed');
  };

  if (!isAuth) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login to view your cart</h2>
        <p className="text-gray-500 mb-6">Please login to add items and view your shopping cart</p>
        <Link to="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  const shipping = cartTotal >= 99900 ? 0 : 4900; // Free above ₹999, else ₹49
  const finalTotal = cartTotal - discount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart {cart.length > 0 && <span className="text-gray-400 font-normal text-lg">({cart.length} items)</span>}
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.product_id} className="card p-4 md:p-5">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link to={`/products/${item.product_id}`} className="shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product_id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-sm md:text-base">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ₹{((item.price || 0) / 100).toLocaleString('en-IN')} per unit
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-gray-200 rounded-xl">
                        <button
                          onClick={() => updateQty(item.product_id, item.quantity - 1)}
                          disabled={updatingId === item.product_id || item.quantity <= 1}
                          className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-semibold text-sm tabular-nums">
                          {updatingId === item.product_id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product_id, item.quantity + 1)}
                          disabled={updatingId === item.product_id}
                          className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">
                          ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-700 mt-4">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-20 space-y-5">
              <h3 className="font-bold text-lg text-gray-900">Order Summary</h3>

              {/* Coupon */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" /> Coupon Code
                </label>
                {couponApplied ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold text-green-700">{couponCode.toUpperCase()}</span>
                      <p className="text-xs text-green-600">Saving ₹{(discount / 100).toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 font-medium hover:text-red-600">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="input-field !py-2.5 text-sm flex-1"
                    />
                    <button onClick={applyCoupon} className="btn-dark !py-2.5 !px-4 text-sm">
                      Apply
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5">Try: WELCOME10, FLAT500</p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{(cartTotal / 100).toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-medium">-₹{(discount / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : `₹${(shipping / 100).toLocaleString('en-IN')}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-amber-600">Add ₹{((99900 - cartTotal) / 100).toLocaleString('en-IN')} more for free shipping!</p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(finalTotal / 100).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">Including all taxes</p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {[
                  { icon: Shield, label: 'Secure' },
                  { icon: Truck, label: 'Fast Delivery' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-1 text-xs text-gray-400">
                    <b.icon className="w-3.5 h-3.5" />
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
