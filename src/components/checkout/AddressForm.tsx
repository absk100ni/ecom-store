import { useState } from 'react';

interface AddressData {
  name: string; line1: string; line2: string; city: string; state: string; pincode: string; phone: string;
}

interface Props {
  initial?: Partial<AddressData>;
  onSubmit: (data: AddressData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save Address', loading = false }: Props) {
  const [addr, setAddr] = useState<AddressData>({
    name: initial?.name || '', line1: initial?.line1 || '', line2: initial?.line2 || '',
    city: initial?.city || '', state: initial?.state || '', pincode: initial?.pincode || '', phone: initial?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(addr);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <input className="input-field" placeholder="10-digit phone" value={addr.phone}
            onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputMode="numeric" required />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        )}
      </div>
    </form>
  );
}
