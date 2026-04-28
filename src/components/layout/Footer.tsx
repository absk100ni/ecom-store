import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowRight, CreditCard, Shield, Truck, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories()
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      toast.success('Subscribed successfully! 🎉');
      setEmail('');
    }
  };

  // Show up to 6 categories in footer
  const footerCategories = categories.slice(0, 6);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-gradient-to-r from-primary-900/50 to-primary-800/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Stay in the loop!</h3>
              <p className="text-sm text-gray-400">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white
                    placeholder:text-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>
              <button type="submit" className="btn-primary !py-3 !px-6 whitespace-nowrap flex items-center gap-2">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

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
              <span className="font-bold text-lg text-white">ElectroMart</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Your one-stop destination for quality products. Best prices, genuine items, fast delivery.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
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
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
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
                <span className="text-sm text-gray-400">help@electromart.com</span>
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
          <p className="text-xs text-gray-500">© 2024 ElectroMart. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
