import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Timer, Flame } from 'lucide-react';
import CountdownTimer from '../ui/CountdownTimer';
import * as api from '../../services/api';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DealOfTheDay() {
  const [products, setProducts] = useState<any[]>([]);
  const { isAuth } = useStore();
  const navigate = useNavigate();

  // Deal expires at end of today
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  useEffect(() => {
    api.getProducts({ limit: 12 })
      .then((r) => {
        const all = r.data.products || [];
        // Pick products with discount
        const discounted = all.filter((p: any) => p.compare_at_price > p.price);
        setProducts(discounted.length > 0 ? discounted.slice(0, 3) : all.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = async (p: any) => {
    if (!isAuth) { navigate('/login'); return; }
    try {
      await api.addToCart(p.id, 1);
      toast.success('Added to cart!');
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
    } catch {
      toast.error('Failed');
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden">
        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Deal of the Day</h2>
                  <p className="text-xs text-gray-400">Don't miss these incredible offers!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-medium">Ends in:</span>
              </div>
              <CountdownTimer targetDate={endOfDay} />
            </div>
          </div>

          {/* Deal Products */}
          <div className="grid md:grid-cols-3 gap-4">
            {products.map((p) => {
              const discount = p.compare_at_price > 0 ? Math.round((1 - p.price / p.compare_at_price) * 100) : 15;
              return (
                <div key={p.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden group hover:bg-white/10 transition-all">
                  <Link to={`/products/${p.id}`}>
                    <div className="aspect-[4/3] bg-white/5 flex items-center justify-center overflow-hidden relative">
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover product-image-zoom" />
                      ) : (
                        <Package className="w-16 h-16 text-gray-600" />
                      )}
                      <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {discount}% OFF
                      </span>
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-primary-400 font-medium mb-1">{p.category}</p>
                    <Link to={`/products/${p.id}`}>
                      <h3 className="text-white font-semibold mb-2 line-clamp-1 hover:text-primary-400 transition-colors">{p.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-white">₹{((p.price || 0) / 100).toLocaleString('en-IN')}</span>
                      {p.compare_at_price > 0 && (
                        <span className="text-sm text-gray-500 line-through">₹{(p.compare_at_price / 100).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {/* Progress bar for urgency */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Sold: {Math.floor(Math.random() * 40 + 20)}</span>
                        <span>Available: {p.stock}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-red-500 to-orange-400 h-1.5 rounded-full" style={{ width: `${Math.min(80, Math.random() * 40 + 40)}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
