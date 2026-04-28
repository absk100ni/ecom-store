import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Minus, Plus, ChevronRight, Home, Truck, Shield, RefreshCw, Share2, Heart, Check, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/ui/ProductCard';

function getProductRating(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return (Math.abs(hash) % 3) + 3;
}

function getReviewCount(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 3) + hash) + name.charCodeAt(i);
  return (Math.abs(hash) % 200) + 15;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const { isAuth } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.getProduct(id).then((r) => {
        setProduct(r.data);
        // Fetch related products
        if (r.data.category) {
          api.getProducts({ category: r.data.category, limit: 4 })
            .then((res) => {
              const related = (res.data.products || []).filter((p: any) => p.id !== id);
              setRelatedProducts(related.slice(0, 4));
            })
            .catch(() => {});
        }
      }).catch(() => {});
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuth) { navigate('/login'); return; }
    try {
      await api.addToCart(product.id, qty);
      toast.success(`Added ${qty} item(s) to cart!`);
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuth) { navigate('/login'); return; }
    try {
      await api.addToCart(product.id, qty);
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
      navigate('/cart');
    } catch {
      toast.error('Failed');
    }
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo('Delivery available! Estimated delivery in 3-5 business days.');
    } else {
      setDeliveryInfo('Please enter a valid 6-digit pincode');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 shimmer rounded w-1/4" />
            <div className="h-8 shimmer rounded w-3/4" />
            <div className="h-6 shimmer rounded w-1/3" />
            <div className="h-24 shimmer rounded" />
            <div className="h-12 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  const discount = product.compare_at_price > 0 ? Math.round((1 - product.price / product.compare_at_price) * 100) : 0;
  const rating = getProductRating(product.name);
  const reviewCount = getReviewCount(product.name);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600">
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden relative border border-gray-100">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <Package className="w-24 h-24" />
                <span className="text-sm font-medium">Product Image</span>
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold">
                {discount}% OFF
              </span>
            )}
          </div>
          {/* Thumbnail strip placeholder */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center ${i === 1 ? 'border-primary-500' : 'border-gray-100'} bg-gray-50 cursor-pointer hover:border-primary-300 transition-colors`}>
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Package className="w-6 h-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-primary-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={rating} size="md" showCount count={reviewCount} />
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{((product.price || 0) / 100).toLocaleString('en-IN')}
            </span>
            {product.compare_at_price > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{(product.compare_at_price / 100).toLocaleString('en-IN')}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {product.description || 'Premium quality electronics product with manufacturer warranty. Experience the best in technology with this top-rated product.'}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium">{t}</span>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border-2 border-gray-200 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 hover:bg-gray-50 rounded-l-lg transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-5 font-semibold text-sm tabular-nums">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-2.5 hover:bg-gray-50 rounded-r-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="btn-accent flex-1 flex items-center justify-center gap-2"
            >
              Buy Now
            </button>
            <button onClick={handleShare} className="btn-secondary !px-3">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Check */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Check Delivery</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field !py-2 text-sm flex-1"
                inputMode="numeric"
              />
              <button onClick={checkDelivery} className="btn-dark !py-2 !px-4 text-sm">
                Check
              </button>
            </div>
            {deliveryInfo && (
              <p className={`text-xs mt-2 ${deliveryInfo.includes('available') ? 'text-green-600' : 'text-red-500'}`}>
                {deliveryInfo}
              </p>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'Above ₹999' },
              { icon: Shield, label: 'Warranty', sub: 'Brand warranty' },
              { icon: RefreshCw, label: 'Easy Return', sub: '7-day return' },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                <badge.icon className="w-5 h-5 text-primary-600 mb-1" />
                <span className="text-xs font-semibold text-gray-800">{badge.label}</span>
                <span className="text-[10px] text-gray-500">{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* SKU */}
          <p className="text-xs text-gray-400 mt-4">SKU: {product.sku || 'N/A'}</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-12">
        <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
          {[
            { key: 'description', label: 'Description' },
            { key: 'specs', label: 'Specifications' },
            { key: 'reviews', label: `Reviews (${reviewCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {activeTab === 'description' && (
            <div className="prose prose-sm text-gray-600 leading-relaxed">
              <p>{product.description || 'This premium electronics product comes with the latest features and technology. Built for performance and designed for excellence.'}</p>
              <ul className="mt-4 space-y-2">
                <li>✅ Premium build quality with attention to detail</li>
                <li>✅ Latest technology and features</li>
                <li>✅ Manufacturer warranty included</li>
                <li>✅ Free shipping on prepaid orders</li>
              </ul>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Brand', product.name?.split(' ')[0] || 'N/A'],
                    ['Category', product.category || 'N/A'],
                    ['SKU', product.sku || 'N/A'],
                    ['In Stock', product.stock > 0 ? 'Yes' : 'No'],
                    ['Stock Quantity', String(product.stock || 0)],
                    ['Tags', product.tags?.join(', ') || 'N/A'],
                  ].map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-medium text-gray-700 w-1/3">{key}</td>
                      <td className="px-4 py-3 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="text-center py-10">
              <p className="text-gray-500">Customer reviews coming soon!</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <StarRating rating={rating} size="md" />
                <span className="text-sm font-medium text-gray-700">{rating}.0 out of 5</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Based on {reviewCount} ratings</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="section-heading mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:hidden z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 line-through">
              {product.compare_at_price > 0 && `₹${(product.compare_at_price / 100).toLocaleString('en-IN')}`}
            </p>
            <p className="text-lg font-bold text-gray-900">₹{((product.price || 0) / 100).toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn-primary flex items-center gap-2 !py-3"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
