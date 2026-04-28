import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X, ChevronRight, Home } from 'lucide-react';
import * as api from '../services/api';
import ProductCard from '../components/ui/ProductCard';

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹20,000', min: 0, max: 2000000 },
  { label: '₹20,000 - ₹50,000', min: 2000000, max: 5000000 },
  { label: '₹50,000 - ₹1,00,000', min: 5000000, max: 10000000 },
  { label: 'Above ₹1,00,000', min: 10000000, max: Infinity },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const limit = 6;

  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getProducts({ search: search || undefined, category: category || undefined, page, limit })
      .then((r) => {
        const prods = r.data.products || [];
        setAllProducts(prods);
        setTotalPages(r.data.total_pages || 1);
        setTotal(r.data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  // Client-side sort and price filter
  useEffect(() => {
    let filtered = [...allProducts];

    // Price filter
    if (priceRange > 0) {
      const range = PRICE_RANGES[priceRange];
      filtered = filtered.filter((p) => p.price >= range.min && p.price < range.max);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.reverse();
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setProducts(filtered);
  }, [allProducts, sortBy, priceRange]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat); else params.delete('category');
    params.delete('search');
    setSearchParams(params);
    setPage(1);
  };

  const setSearch = (s: string) => {
    const params = new URLSearchParams(searchParams);
    if (s) params.set('search', s); else params.delete('search');
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSortBy('');
    setPriceRange(0);
    setPage(1);
  };

  const hasFilters = category || search || sortBy || priceRange > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Products</span>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{category}</span>
          </>
        )}
      </nav>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 space-y-6">
            {/* Categories */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </button>
                {categories.map((c: any) => (
                  <button
                    key={c.slug || c.name}
                    onClick={() => setCategory(c.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === c.name ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
              <div className="space-y-1">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => setPriceRange(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      priceRange === i ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-1 py-2"
              >
                <X className="w-4 h-4" /> Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {category || 'All Products'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {total} products {search && `matching "${search}"`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-48 appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2.5 ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2.5 ${view === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-10 !py-2.5"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                  {category}
                  <button onClick={() => setCategory('')} className="hover:bg-primary-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {priceRange > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                  {PRICE_RANGES[priceRange].label}
                  <button onClick={() => setPriceRange(0)} className="hover:bg-amber-100 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                  "{search}"
                  <button onClick={() => setSearch('')} className="hover:bg-gray-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className={`grid ${view === 'list' ? 'grid-cols-1 gap-4' : 'grid-cols-2 md:grid-cols-3 gap-4'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className={`${view === 'list' ? 'space-y-4' : 'grid grid-cols-2 md:grid-cols-3 gap-4'}`}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} view={view} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <div className="text-gray-300 text-5xl mb-4">🔍</div>
                  <p className="text-gray-500 font-medium">No products found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
                  <button onClick={clearFilters} className="btn-primary mt-4 !py-2 !px-5 text-sm">
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 space-y-4">
              {/* Showing info */}
              <p className="text-center text-sm text-gray-500">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} products
              </p>

              {/* Pagination controls */}
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page <= 1}
                  className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  ← Prev
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (page > 3) pages.push('...');
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                    if (page < totalPages - 2) pages.push('...');
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                          p === page
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page >= totalPages}
                  className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Show total even on single page */}
          {totalPages <= 1 && products.length > 0 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              Showing all {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => { setCategory(''); setSidebarOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'}`}
                  >
                    All Products
                  </button>
                  {categories.map((c: any) => (
                    <button
                      key={c.slug || c.name}
                      onClick={() => { setCategory(c.name); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${category === c.name ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => { setPriceRange(i); setSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${priceRange === i ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear & Apply */}
              <div className="flex gap-2 pt-4 border-t">
                <button onClick={() => { clearFilters(); setSidebarOpen(false); }} className="btn-secondary flex-1 !py-2.5 text-sm">
                  Clear All
                </button>
                <button onClick={() => setSidebarOpen(false)} className="btn-primary flex-1 !py-2.5 text-sm">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
