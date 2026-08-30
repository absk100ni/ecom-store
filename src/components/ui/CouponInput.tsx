import { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
  onApplied: (code: string, discount: number) => void;
  onRemoved: () => void;
  appliedCode?: string;
  discount?: number;
  subtotal: number;
}

export default function CouponInput({ onApplied, onRemoved, appliedCode, discount, subtotal }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const r = await api.applyCoupon(trimmed, subtotal);
      const disc = r.data.discount || 0;
      onApplied(trimmed, disc);
      toast.success(`Coupon ${trimmed} applied!`);
      setCode('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    // Coupon is applied server-side only at order creation; removal is client state.
    onRemoved();
    toast.success('Coupon removed');
  };

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
        <Tag className="w-4 h-4 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-green-700">{appliedCode}</span>
          {discount ? (
            <span className="text-xs text-green-600 ml-2">-₹{(discount / 100).toLocaleString('en-IN')} off</span>
          ) : null}
        </div>
        <button onClick={handleRemove} className="p-1 hover:bg-green-100 rounded-full transition-colors">
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="input-field pl-9 text-sm uppercase"
        />
      </div>
      <button onClick={handleApply} disabled={loading || !code.trim()} className="btn-primary px-4 text-sm shrink-0">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
      </button>
    </div>
  );
}
