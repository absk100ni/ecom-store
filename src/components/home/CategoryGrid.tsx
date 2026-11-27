import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes } from 'lucide-react';
import * as api from '../../services/api';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategoryTree()
      .then((response) => {
        const roots = (response.data.categories || []).filter((category: any) => category.level === 0);
        setCategories(roots);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-7">
        <p className="eyebrow">Departments</p>
        <h2 className="section-heading">Shop by category</h2>
        <p className="section-subheading">Find supplies by the way you work, repair or build.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 shimmer border border-slate-200" />)}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category: any) => (
            <Link
              key={category.slug || category.id}
              to={`/products?category=${encodeURIComponent(category.slug || category.name)}`}
              className="group category-tile"
            >
              <span className="w-11 h-11 border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {category.image ? (
                  <img src={category.image} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <Boxes className="w-5 h-5 text-slate-500" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm sm:text-base font-semibold text-slate-900 line-clamp-2">{category.name}</span>
                {category.product_count !== undefined && (
                  <span className="text-xs text-slate-500">{category.product_count} product{category.product_count === 1 ? '' : 's'}</span>
                )}
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-panel">Categories will appear here when the catalog is ready.</div>
      )}
    </section>
  );
}
