import { useState } from 'react';
import { X, Zap, Truck, Gift, Percent } from 'lucide-react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const announcements = [
    { icon: <Zap className="w-3.5 h-3.5" />, text: '⚡ Flash Sale: Up to 40% OFF on Smartphones!' },
    { icon: <Truck className="w-3.5 h-3.5" />, text: '🚚 Free Delivery on orders above ₹999' },
    { icon: <Gift className="w-3.5 h-3.5" />, text: '🎁 Use code WELCOME10 for 10% OFF your first order' },
    { icon: <Percent className="w-3.5 h-3.5" />, text: '💰 FLAT500 — ₹500 OFF on orders above ₹2000' },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="marquee-container py-2">
        <div className="marquee-content">
          {[...announcements, ...announcements].map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 mx-8 text-xs font-medium tracking-wide">
              {a.icon}
              <span>{a.text}</span>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
