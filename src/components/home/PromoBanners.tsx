import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as api from '../../services/api';

// Rotating gradients for dynamic banners
const gradients = [
  'from-blue-500 to-indigo-600',
  'from-orange-500 to-red-500',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-600',
];

const emojis = ['🔥', '⚡', '�', '✨', '🚀', '💎'];

export default function PromoBanners() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories()
      .then((r) => {
        const cats = r.data.categories || [];
        // Pick up to 3 categories for promo banners
        setCategories(cats.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className={`grid ${categories.length === 1 ? 'grid-cols-1' : categories.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        {categories.map((cat: any, i: number) => (
          <Link
            key={cat.slug || cat.name}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className={`bg-gradient-to-br ${gradients[i % gradients.length]} rounded-2xl p-6 text-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 text-6xl opacity-20 -mt-2 -mr-2 transform rotate-12 group-hover:rotate-6 transition-transform">
              {emojis[i % emojis.length]}
            </div>

            <h3 className="font-bold text-lg mb-1 relative z-10 line-clamp-1">{cat.name}</h3>
            <p className="text-white/80 text-xs mb-4 relative z-10">Explore our collection</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg group-hover:bg-white/30 transition-colors relative z-10">
              Shop Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
