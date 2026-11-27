import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cable, Facebook, Instagram, Mail, MapPin, PackageCheck, Phone, ShieldCheck, Truck, Youtube } from 'lucide-react';
import * as api from '../../services/api';
import { BUSINESS } from '../../config/business';
import { SOCIAL_CHANNELS } from '../../config/social';

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-4 h-4" />,
  YouTube: <Youtube className="w-4 h-4" />,
  Facebook: <Facebook className="w-4 h-4" />,
};

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategoryTree()
      .then((response) => setCategories((response.data.categories || []).filter((category: any) => category.level === 0)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-auto bg-slate-950 text-slate-300 border-t-4 border-amber-400">
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FooterFact icon={Truck} title="Free shipping" detail="On orders of ₹999 or more" />
          <FooterFact icon={ShieldCheck} title="Protected checkout" detail="Payments handled by the configured gateway" />
          <FooterFact icon={PackageCheck} title="Order tracking" detail="Track with your order number and phone" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <span className="w-9 h-9 border border-slate-700 flex items-center justify-center text-amber-400"><Cable className="w-5 h-5" /></span>
            <span className="font-extrabold text-lg">LucubraElec</span>
          </Link>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">Electrical supplies, electronics components, lighting and practical hardware.</p>
          {SOCIAL_CHANNELS.length > 0 && (
            <div className="flex gap-2 mt-5">
              {SOCIAL_CHANNELS.map((channel) => (
                <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" aria-label={`${channel.name}, opens in a new tab`} className="w-9 h-9 border border-slate-700 flex items-center justify-center hover:text-amber-400 hover:border-amber-400">
                  {socialIcons[channel.name]}
                </a>
              ))}
            </div>
          )}
        </div>

        <FooterColumn title="Catalog">
          <li><Link to="/products">All products</Link></li>
          {categories.slice(0, 5).map((category) => (
            <li key={category.slug || category.id}><Link to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}>{category.name}</Link></li>
          ))}
        </FooterColumn>

        <FooterColumn title="Orders and support">
          <li><Link to="/cart">Shopping cart</Link></li>
          <li><Link to="/orders">My orders</Link></li>
          <li><Link to="/track">Track an order</Link></li>
          <li><Link to="/contact">Contact support</Link></li>
          <li><Link to="/refund-policy">Returns and refunds</Link></li>
        </FooterColumn>

        <div>
          <h3 className="footer-heading">Contact</h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-2"><Mail className="w-4 h-4 mt-0.5 shrink-0" /><a href={`mailto:${BUSINESS.supportEmail}`} className="hover:text-white break-all">{BUSINESS.supportEmail}</a></li>
            <li className="flex gap-2"><Phone className="w-4 h-4 mt-0.5 shrink-0" /><span>{BUSINESS.supportPhone}</span></li>
            <li className="flex gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /><span>{BUSINESS.address}</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col lg:flex-row justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LucubraElec. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/refund-policy" className="hover:text-white">Refund policy</Link>
            <Link to="/shipping-policy" className="hover:text-white">Shipping policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterFact({ icon: Icon, title, detail }: { icon: React.ElementType; title: string; detail: string }) {
  return <div className="flex gap-3 items-center"><Icon className="w-5 h-5 text-amber-400 shrink-0" /><div><p className="text-sm font-semibold text-white">{title}</p><p className="text-xs text-slate-500">{detail}</p></div></div>;
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="footer-heading">{title}</h3><ul className="space-y-2.5 text-sm text-slate-400 [&_a:hover]:text-white">{children}</ul></div>;
}
