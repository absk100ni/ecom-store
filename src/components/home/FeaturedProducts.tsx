import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import * as api from '../../services/api';
import ProductCard from '../ui/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'bestseller' | 'new'>('featured');

  useEffect(() => {
    api.getProducts({ limit: 12 })
      .then((r) => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Simulate different tabs with different orderings
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'bestseller':
        return [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 8);
      case 'new':
        return [...products].reverse().slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  };

  const filtered = getFilteredProducts();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="section-heading">Featured Products</h2>
          </div>
          <p className="section-subheading">Handpicked selections just for you</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { key: 'featured', label: 'Featured' },
          { key: 'bestseller', label: 'Best Sellers' },
          { key: 'new', label: 'New Arrivals' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card">
              <div className="aspect-square shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-4 shimmer rounded w-3/4" />
                <div className="h-3 shimmer rounded w-1/2" />
                <div className="h-5 shimmer rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-20">
              No products available yet. Add products from the admin panel!
            </p>
          )}
        </div>
      )}
    </section>
  );
}
