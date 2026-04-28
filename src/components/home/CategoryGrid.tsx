import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid3X3, Loader2 } from 'lucide-react';
import * as api from '../../services/api';

// Rotating color palette for dynamic categories - cycles through these
const colorPalette = [
  { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
  { color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
  { color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
  { color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
  { color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
  { color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50' },
  { color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50' },
  { color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
  { color: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
  { color: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-50' },
  { color: 'from-lime-500 to-green-500', bg: 'bg-lime-50' },
  { color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50' },
  { color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50' },
  { color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50' },
];

function getColorForIndex(index: number) {
  return colorPalette[index % colorPalette.length];
}

// Generate a short abbreviation from category name (first 2 chars)
function getCategoryAbbr(name: string): string {
  const words = name.split(/[\s,&]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="section-heading">Shop by Category</h2>
          <p className="section-subheading mx-auto">Browse our wide range of products</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100">
              <div className="w-14 h-14 shimmer rounded-2xl" />
              <div className="h-3 shimmer rounded w-16" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  // Dynamically determine grid columns based on category count
  const getGridCols = () => {
    const count = categories.length;
    if (count <= 4) return 'grid-cols-2 sm:grid-cols-4';
    if (count <= 6) return 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-6';
    if (count <= 8) return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-8';
    return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8';
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="section-heading">Shop by Category</h2>
        <p className="section-subheading mx-auto">Browse our wide range of products</p>
      </div>

      <div className={`grid ${getGridCols()} gap-3 md:gap-4`}>
        {categories.map((cat: any, i: number) => {
          const palette = getColorForIndex(i);
          const abbr = getCategoryAbbr(cat.name);
          return (
            <Link
              key={cat.slug || cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 ${palette.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={`w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br ${palette.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{abbr}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs md:text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                  {cat.name}
                </p>
                {cat.product_count !== undefined && (
                  <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                    {cat.product_count} {cat.product_count === 1 ? 'Product' : 'Products'}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
