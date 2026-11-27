import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as api from '../../services/api';
import ProductCard from '../ui/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ limit: 8, sort: 'newest' })
      .then((response) => setProducts(response.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <p className="eyebrow">Recently added</p>
          <h2 className="section-heading">Latest products</h2>
          <p className="section-subheading">New catalog entries, ordered by their published date.</p>
        </div>
        <Link to="/products?sort=newest" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900">
          View catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="card">
              <div className="aspect-square shimmer" />
              <div className="p-4 space-y-2"><div className="h-4 shimmer w-3/4" /><div className="h-5 shimmer w-1/3" /></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="empty-panel">
          <p className="font-semibold text-slate-800">The catalog is being prepared.</p>
          <p className="text-sm text-slate-500 mt-1">Please check again soon.</p>
        </div>
      )}

      <Link to="/products" className="sm:hidden mt-6 btn-secondary w-full inline-flex items-center justify-center gap-2">
        View catalog <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
