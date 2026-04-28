import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Home, Calendar, MapPin, CreditCard, Truck, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';

const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  placed: { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: '📦' },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: '✅' },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: '🚚' },
  delivered: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: '🎉' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: '❌' },
};

export default function OrdersPage() {
  const { isAuth } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (isAuth) {
      api.getOrders()
        .then((r) => setOrders(r.data.orders || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuth]);

  if (!isAuth) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">My Orders</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 shimmer rounded w-32" />
                <div className="h-6 shimmer rounded w-20" />
              </div>
              <div className="h-3 shimmer rounded w-48" />
              <div className="h-3 shimmer rounded w-32" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping and your orders will appear here</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.placed;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {order.order_number || `#${order.id?.slice(0, 8)}`}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.color}`}>
                          {config.icon} {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        <span>{order.items?.length || 0} item(s)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{((order.total || 0) / 100).toLocaleString('en-IN')}
                      </p>
                      <button className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-1">
                        <Eye className="w-3 h-3" />
                        {isExpanded ? 'Less' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                    {/* Items */}
                    {order.items?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <span className="text-sm font-semibold">
                                ₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Shipping Address
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.shipping_address.name}, {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                        </p>
                      </div>
                    )}

                    {/* Tracking */}
                    {order.tracking_id && (
                      <div className="flex items-center gap-2 bg-primary-50 text-primary-700 rounded-xl px-4 py-2.5">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm font-medium">Tracking: {order.tracking_id}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
