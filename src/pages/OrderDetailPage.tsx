import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Package, Home, ChevronRight, MapPin, CreditCard, Truck, CheckCircle, Clock, Circle, FileText, RotateCcw, X, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import { BUSINESS } from '../config/business';
import { STORE_NAME } from '../config/constants';
import { retryRazorpayPayment } from '../lib/razorpay';

const TIMELINE_STEPS = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  placed: 'Order Placed', confirmed: 'Confirmed', shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuth } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [returnRequest, setReturnRequest] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState<{ type: 'return' | 'replacement'; items: { product_id: string; quantity: number }[]; reason: string }>({ type: 'return', items: [], reason: '' });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [payingOrder, setPayingOrder] = useState(false);

  useEffect(() => {
    if (isAuth && id) {
      Promise.all([
        api.getOrder(id),
        api.getOrderTracking(id).catch(() => ({ data: null })),
        api.getReturnRequest(id).catch(() => ({ data: null })),
      ])
        .then(([or, tr, ret]) => {
          setOrder(or.data.order || or.data);
          setTracking(tr.data);
          setReturnRequest(ret.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuth, id]);

  if (!isAuth) return <Navigate to="/login" />;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="card p-6"><div className="h-6 shimmer rounded w-48 mb-4" /><div className="h-40 shimmer rounded" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
        <Link to="/orders" className="btn-primary mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  const orderNum = order.order_number || order.OrderNumber || order.id;
  const status = (order.status || 'placed').toLowerCase();
  const currentStepIndex = TIMELINE_STEPS.indexOf(status);
  const items = order.items || order.line_items || [];
  const addr = order.shipping_address || {};
  const advanceAmount = order.advance_amount || 0;
  const codAmount = order.cod_amount || 0;
  const paymentPlan = order.payment_plan || 'full';
  const trackingEvents = tracking?.events || [];

  const isPaid = order.payment_status === 'paid' || paymentPlan === 'full' || advanceAmount > 0;
  const isPendingPayment = order.payment_status !== 'paid' && order.payment_status !== 'completed'
    && status !== 'cancelled' && status !== 'delivered' && status !== 'expired';
  const isDelivered = status === 'delivered';

  const handleCompletePayment = async () => {
    setPayingOrder(true);
    try {
      const ok = await retryRazorpayPayment(id!, orderNum, {
        onSuccess: () => {
          setPayingOrder(false);
          toast.success('Payment completed!');
          // Refresh order data
          api.getOrder(id!).then((or) => setOrder(or.data.order || or.data)).catch(() => {});
        },
        onDismiss: () => { setPayingOrder(false); toast('Payment not completed. You can try again.'); },
        onVerifyFail: () => { setPayingOrder(false); },
      });
      if (!ok) {
        toast.error('Payment gateway unavailable.');
        setPayingOrder(false);
      }
    } catch {
      toast.error('Failed to initiate payment.');
      setPayingOrder(false);
    }
  };
  const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : null;
  const withinReturnWindow = deliveredAt
    ? (Date.now() - deliveredAt.getTime()) < BUSINESS.returnWindowDays * 24 * 60 * 60 * 1000
    : false;
  const canReturn = isDelivered && withinReturnWindow && !returnRequest;

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.getInvoiceHtml(id!);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const handleReturnSubmit = async () => {
    if (!returnForm.reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if (returnForm.items.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setSubmittingReturn(true);
    try {
      const res = await api.createReturnRequest(id!, returnForm);
      setReturnRequest(res.data);
      setShowReturnModal(false);
      toast.success('Return request submitted successfully');
    } catch {
      toast.error('Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const toggleReturnItem = (productId: string, maxQty: number) => {
    setReturnForm(prev => {
      const existing = prev.items.find(i => i.product_id === productId);
      if (existing) {
        return { ...prev, items: prev.items.filter(i => i.product_id !== productId) };
      }
      return { ...prev, items: [...prev.items, { product_id: productId, quantity: maxQty }] };
    });
  };

  const returnStatusBanner = returnRequest && (
    <div className={`card p-4 border-l-4 ${
      returnRequest.status === 'approved' ? 'border-green-500 bg-green-50' :
      returnRequest.status === 'rejected' ? 'border-red-500 bg-red-50' :
      returnRequest.status === 'completed' ? 'border-blue-500 bg-blue-50' :
      'border-amber-500 bg-amber-50'
    }`}>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm font-semibold capitalize">Return {returnRequest.status}</span>
      </div>
      {returnRequest.reason && <p className="text-xs text-gray-600 mt-1">Reason: {returnRequest.reason}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Helmet><title>Order #{orderNum} - {STORE_NAME}</title></Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/orders" className="hover:text-primary-600">Orders</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">#{orderNum}</span>
      </nav>

      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {isPaid && (
            <button onClick={handleDownloadInvoice} className="btn-secondary flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" /> Download Invoice
            </button>
          )}
          {isPendingPayment && (
            <button onClick={handleCompletePayment} disabled={payingOrder} className="btn-primary flex items-center gap-2 text-sm">
              {payingOrder ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Complete Payment</>}
            </button>
          )}
          {canReturn && (
            <button onClick={() => setShowReturnModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <RotateCcw className="w-4 h-4" /> Request Return
            </button>
          )}
        </div>

        {/* Return Status Banner */}
        {returnStatusBanner}

        {/* Status Timeline */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-600" /> Order Tracking
          </h2>

          <div className="relative">
            {TIMELINE_STEPS.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {STEP_LABELS[step] || step}
                    </p>
                    {trackingEvents.find((e: any) => e.status?.toLowerCase() === step) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {trackingEvents.find((e: any) => e.status?.toLowerCase() === step)?.description}
                        {' · '}
                        {new Date(trackingEvents.find((e: any) => e.status?.toLowerCase() === step)?.timestamp).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {tracking?.awb && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <p>AWB: <span className="font-mono font-medium">{tracking.awb}</span></p>
              {tracking.courier && <p>Courier: {tracking.courier}</p>}
              {tracking.tracking_url && (
                <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm mt-1 inline-block">
                  Track on courier website →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary-600" /> Items ({items.length})
          </h3>
          <div className="space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 border">
                  {item.image || item.thumbnail ? (
                    <img src={item.image || item.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name || item.product_name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{((item.price || 0) / 100).toLocaleString('en-IN')}</p>
                </div>
                <span className="text-sm font-bold text-gray-900 shrink-0">
                  ₹{(((item.price || 0) * (item.quantity || 1)) / 100).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-primary-600" /> Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold">₹{((order.total || 0) / 100).toLocaleString('en-IN')}</span></div>
              {paymentPlan === 'partial' && (
                <>
                  <div className="flex justify-between text-green-700"><span>Paid Online</span><span className="font-semibold">₹{(advanceAmount / 100).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-amber-700"><span>COD Due</span><span className="font-semibold">₹{(codAmount / 100).toLocaleString('en-IN')}</span></div>
                  {order.cod_collected && <p className="text-xs text-green-600 mt-1">✓ COD collected</p>}
                </>
              )}
              {paymentPlan === 'full' && (
                <div className="flex justify-between text-green-700"><span>Paid Online</span><span className="font-semibold">₹{((order.total || 0) / 100).toLocaleString('en-IN')}</span></div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
            </h3>
            <div className="text-sm text-gray-700 space-y-0.5">
              <p className="font-semibold text-gray-900">{addr.name}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p>{addr.city}, {addr.state} - {addr.pincode}</p>
              {addr.phone && <p className="text-gray-500">📞 {addr.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Request Return / Replacement</h3>
              <button onClick={() => setShowReturnModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border ${returnForm.type === 'return' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
                    onClick={() => setReturnForm(f => ({ ...f, type: 'return' }))}
                  >Return (Refund)</button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border ${returnForm.type === 'replacement' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'}`}
                    onClick={() => setReturnForm(f => ({ ...f, type: 'replacement' }))}
                  >Replacement</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Items</label>
                <div className="space-y-2">
                  {items.map((item: any) => {
                    const pid = item.product_id || item.id;
                    const selected = returnForm.items.some(i => i.product_id === pid);
                    return (
                      <label key={pid} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={selected} onChange={() => toggleReturnItem(pid, item.quantity)} className="rounded" />
                        <span className="text-sm text-gray-900 flex-1 line-clamp-1">{item.name || item.product_name}</span>
                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Tell us why you'd like to return..."
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm(f => ({ ...f, reason: e.target.value }))}
                />
              </div>

              <button
                onClick={handleReturnSubmit}
                disabled={submittingReturn}
                className="btn-primary w-full"
              >
                {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
