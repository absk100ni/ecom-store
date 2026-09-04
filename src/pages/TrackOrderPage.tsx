import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, ChevronRight, Home, MapPin, CreditCard, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import { STORE_NAME } from '../config/constants';
import { getGuestOrders, removeGuestOrder, GuestOrderRef } from '../utils/guestOrders';

interface TrackedOrder {
  order_number: string;
  status: string;
  payment_status: string;
  items: { product_id: string; name: string; quantity: number; price: number; image?: string }[];
  total: number;
  advance_amount: number;
  cod_amount: number;
  created_at: string;
  tracking?: { carrier?: string; tracking_number?: string; url?: string; status?: string; estimated_delivery?: string };
}

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

function getStatusIndex(status: string): number {
  const s = status?.toLowerCase() || '';
  if (s.includes('deliver')) return 3;
  if (s.includes('ship') || s.includes('transit')) return 2;
  if (s.includes('confirm') || s.includes('processing')) return 1;
  return 0;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [recentOrders, setRecentOrders] = useState<GuestOrderRef[]>(getGuestOrders());

  const trackOrder = async (onum: string, ph: string) => {
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await api.guestTrackOrder(onum, ph);
      setOrder(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setNotFound(true);
        // Purged/abandoned orders 404 forever — drop them from local history
        removeGuestOrder(onum);
        setRecentOrders(getGuestOrders());
      } else {
        toast.error(err.response?.data?.error || 'Failed to track order');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const onum = orderNumber.trim();
    const ph = phone.trim();
    if (!onum) { toast.error('Please enter your order number'); return; }
    if (ph.length !== 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
    await trackOrder(onum, ph);
  };

  const handleRecentClick = (ref: GuestOrderRef) => {
    setOrderNumber(ref.order_number);
    setPhone(ref.phone);
    trackOrder(ref.order_number, ref.phone);
  };

  const statusIdx = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Helmet>
        <title>Track Order - {STORE_NAME}</title>
        <meta name="description" content="Track your order status" />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Track Order</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-primary-600" /> Track Your Order
      </h1>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="card p-6 mb-6">
        <p className="text-sm text-gray-500 mb-4">Enter your order number and the phone number used during checkout.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
            <input
              className="input-field"
              placeholder="e.g. ORD-123456789"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              className="input-field"
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <><Clock className="w-4 h-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="w-4 h-4" /> Track Order</>
            )}
          </button>
        </div>
      </form>

      {/* Recent orders on this device — saved at checkout so guests don't need
          to remember their order number */}
      {recentOrders.length > 0 && !order && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your recent orders on this device</h2>
          <div className="space-y-2">
            {recentOrders.map((ref) => (
              <button
                key={ref.order_number}
                onClick={() => handleRecentClick(ref)}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
              >
                <div>
                  <span className="font-mono font-semibold text-primary-700">{ref.order_number}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {ref.total > 0 && <> · ₹{Math.round(ref.total / 100)}</>}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Not Found */}
      {notFound && (
        <div className="card p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Order not found</h3>
          <p className="text-sm text-gray-500">Please check your order number and phone number and try again.</p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div className="space-y-4">
          {/* Status Timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order #{order.order_number}</h3>
              <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between mb-8">
              {STATUS_STEPS.map((s, i) => (
                <div key={s.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      i <= statusIdx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium ${i <= statusIdx ? 'text-green-700' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-6 ${i < statusIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Tracking details */}
            {order.tracking?.tracking_number && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                {order.tracking.carrier && <p className="text-gray-600">Carrier: <span className="font-medium">{order.tracking.carrier}</span></p>}
                <p className="text-gray-600">Tracking #: <span className="font-mono font-medium">{order.tracking.tracking_number}</span></p>
                {order.tracking.estimated_delivery && <p className="text-gray-600">Est. delivery: <span className="font-medium">{order.tracking.estimated_delivery}</span></p>}
                {order.tracking.url && (
                  <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-medium hover:underline inline-block mt-1">
                    Track with carrier →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" /> Payment
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="font-bold text-gray-900">₹{(order.total / 100).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Paid Online</p>
                <p className="font-bold text-green-700">₹{(order.advance_amount / 100).toLocaleString('en-IN')}</p>
              </div>
              {order.cod_amount > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">COD</p>
                  <p className="font-bold text-amber-700">₹{(order.cod_amount / 100).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
            <p className={`text-xs mt-2 font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
              Payment status: {order.payment_status}
            </p>
          </div>

          {/* Items */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600" /> Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
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
        </div>
      )}
    </div>
  );
}
