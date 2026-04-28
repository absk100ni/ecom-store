import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Eye } from 'lucide-react';
import StarRating from './StarRating';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
  view?: 'grid' | 'list';
}

// Generate a consistent pseudo-random rating based on product name
function getProductRating(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return (Math.abs(hash) % 3) + 3; // returns 3, 4, or 5
}

function getReviewCount(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 3) + hash) + name.charCodeAt(i);
  return (Math.abs(hash) % 200) + 15;
}

export default function ProductCard({ product: p, view = 'grid' }: ProductCardProps) {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  const discount = p.compare_at_price > 0 ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0;
  const rating = getProductRating(p.name);
  const reviewCount = getReviewCount(p.name);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) { navigate('/login'); return; }
    try {
      await api.addToCart(p.id, 1);
      toast.success('Added to cart!');
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
    } catch {
      toast.error('Failed to add');
    }
  };

  if (view === 'list') {
    return (
      <Link to={`/products/${p.id}`} className="card hover:shadow-lg transition-all group flex">
        <div className="w-48 h-48 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative">
          {p.thumbnail ? (
            <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover product-image-zoom" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <Package className="w-12 h-12" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md">{discount}% OFF</span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-primary-600 font-medium mb-1">{p.category}</p>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{p.name}</h3>
            <StarRating rating={rating} showCount count={reviewCount} />
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description || 'Premium quality electronics with manufacturer warranty.'}</p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-gray-900">₹{((p.price || 0) / 100).toLocaleString('en-IN')}</span>
              {p.compare_at_price > 0 && (
                <span className="text-sm text-gray-400 line-through ml-2">₹{(p.compare_at_price / 100).toLocaleString('en-IN')}</span>
              )}
            </div>
            <button
              onClick={handleQuickAdd}
              disabled={p.stock <= 0}
              className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/products/${p.id}`} className="card-hover group relative">
      {/* Image */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover product-image-zoom" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Package className="w-14 h-14" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md">{discount}% OFF</span>}
          {p.stock <= 5 && p.stock > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">🔥 Few Left</span>}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={p.stock <= 0}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg hover:bg-primary-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Quick Add
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="bg-white text-gray-900 p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-[11px] text-primary-600 font-semibold uppercase tracking-wider mb-1">{p.category}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-primary-600 transition-colors">{p.name}</h3>
        <StarRating rating={rating} size="sm" showCount count={reviewCount} />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">₹{((p.price || 0) / 100).toLocaleString('en-IN')}</span>
          {p.compare_at_price > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{(p.compare_at_price / 100).toLocaleString('en-IN')}</span>
          )}
          {discount > 0 && (
            <span className="text-xs text-green-600 font-semibold">{discount}% off</span>
          )}
        </div>
        {p.stock <= 0 && (
          <p className="text-xs text-red-500 font-semibold mt-1.5">Out of Stock</p>
        )}
      </div>
    </Link>
  );
}
