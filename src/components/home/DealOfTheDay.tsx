import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import * as api from '../../services/api';
import ProductCard from '../ui/ProductCard';

export default function DealOfTheDay() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.getProducts({ limit: 24, sort: 'newest' })
      .then((response) => {
        const discounted = (response.data.products || []).filter(
          (product: any) => product.compare_at_price > product.price,
        );
        setProducts(discounted.slice(0, 4));
      })
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="border-y border-slate-200 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="eyebrow flex items-center gap-2"><Tag className="w-3.5 h-3.5" /> Current reductions</p>
            <h2 className="section-heading">Products priced below MRP</h2>
            <p className="section-subheading">Discounts shown here come directly from the current catalog price.</p>
          </div>
          <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}
