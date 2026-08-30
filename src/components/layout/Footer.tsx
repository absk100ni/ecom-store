import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Facebook, Instagram, Youtube, CreditCard, Shield, Truck, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { SOCIAL_CHANNELS } from '../../config/social';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-4 h-4" />,
  YouTube: <Youtube className="w-4 h-4" />,
  Facebook: <Facebook className="w-4 h-4" />,
};

export default function Footer() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories()
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  // Show up to 6 categories in footer
  const footerCategories = categories.slice(0, 6);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="w-6 h-6" />, title: 'Free Shipping', desc: 'On orders over ₹999' },
              { icon: <Shield className="w-6 h-6" />, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: <CreditCard className="w-6 h-6" />, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: <Headphones className="w-6 h-6" />, title: '24/7 Support', desc: 'Dedicated help center' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-primary-400 shrink-0">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white">LucubraElec</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Your one-stop destination for quality products. Best prices, genuine items, fast delivery.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_CHANNELS.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${channel.name} (opens in new tab)`}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  {SOCIAL_ICONS[channel.name]}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/products" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                  All Products
                </Link>
              </li>
              {footerCategories.map((cat: any) => (
                <li key={cat.slug || cat.name}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors line-clamp-1"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Account</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'My Orders', to: '/orders' },
                { label: 'Shopping Cart', to: '/cart' },
                { label: 'Track Order', to: '/track' },
                { label: 'Login', to: '/login' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">+91-9876543210</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">help@lucubraelec.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© 2024 LucubraElec. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link to="/privacy-policy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-gray-300">Refund Policy</Link>
            <Link to="/shipping-policy" className="hover:text-gray-300">Shipping Policy</Link>
            <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
