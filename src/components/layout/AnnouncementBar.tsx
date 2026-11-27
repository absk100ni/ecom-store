import { Link } from 'react-router-dom';
import { PackageCheck, Truck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-amber-400 text-slate-950 border-b border-amber-500">
      <div className="max-w-7xl mx-auto px-4 min-h-9 flex items-center justify-between gap-4 text-xs font-semibold">
        <p className="flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Free shipping on orders of ₹999 or more
        </p>
        <Link to="/track" className="hidden sm:flex items-center gap-2 hover:underline underline-offset-2">
          <PackageCheck className="w-4 h-4" /> Track order
        </Link>
      </div>
    </div>
  );
}
