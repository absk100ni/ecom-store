import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, Home, ChevronRight, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { isAuth } = useStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuth) {
      api.getWishlist()
        .then((r) => setItems(r.data.items || r.data.wishlist || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuth]);

  if (!isAuth) return <Navigate to="/login?redirect=/wishlist" />;

  const handleRemove = async (productId: string) => {
    try {
      await api.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => (i.product_id || i.id) !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToCart = async (item: any) => {
    try {
      await api.addToCart(item.product_id || item.id, 1);
      await api.removeFromWishlist(item.product_id || item.id);
      setItems((prev) => prev.filter((i) => (i.product_id || i.id) !== (item.product_id || item.id)));
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
      toast.success('Moved to cart!');
    } catch {
      toast.error('Failed to move to cart');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Helmet><title>Wishlist - LucubraElec</title><meta name="description" content="Your saved items" /></Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Wishlist</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> My Wishlist
        {items.length > 0 && <span className="text-sm font-normal text-gray-400">({items.length} items)</span>}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="aspect-square shimmer rounded-xl" />
              <div className="h-4 shimmer rounded w-3/4" />
              <div className="h-4 shimmer rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const product = item.product || item;
            const pid = item.product_id || product.id;
            return (
              <div key={pid} className="card overflow-hidden group">
                <Link to={`/p/${pid}`} className="block">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <Link to={`/p/${pid}`} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                    {product.name}
                  </Link>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{((product.price || 0) / 100).toLocaleString('en-IN')}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleMoveToCart(item)} className="btn-primary text-xs flex-1 py-2 flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(pid)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
