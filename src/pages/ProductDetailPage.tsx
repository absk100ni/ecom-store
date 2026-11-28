import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Minus, Plus, ChevronRight, Home, Truck, Shield, RefreshCw, Share2, Check, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store/useStore';
import * as api from '../services/api';
import toast from 'react-hot-toast';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/ui/ProductCard';
import { trackViewContent, trackAddToCart } from '../lib/analytics';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loadError, setLoadError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const { isAuth } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoadError('');
      api.getProduct(id).then((r) => {
        setProduct(r.data);
        setActiveImage(r.data.thumbnail || r.data.images?.[0] || '');
        setSelectedVariantId('');
        setQty(1);
        // Canonicalize: any arrival path (/products/:id, /p/:uuid) silently
        // upgrades to the one shareable URL — /p/:slug — without a reload.
        if (r.data.slug && window.location.pathname !== `/p/${r.data.slug}`) {
          window.history.replaceState(null, '', `/p/${r.data.slug}`);
        }
        trackViewContent(r.data.id || id, r.data.name || '', r.data.price || 0);
        api.getProductReviews(r.data.id || id, { page: 1, limit: 1 })
          .then((reviewResponse) => {
            setAverageRating(Number(reviewResponse.data.average_rating) || 0);
            setReviewCount(Number(reviewResponse.data.total_reviews ?? reviewResponse.data.total) || 0);
          })
          .catch(() => {
            setAverageRating(0);
            setReviewCount(0);
          });
        // Fetch related products
        if (r.data.category) {
          api.getProducts({ category: r.data.category, limit: 4 })
            .then((res) => {
              const related = (res.data.products || []).filter(
                (candidate: any) => candidate.id !== r.data.id && candidate.slug !== r.data.slug,
              );
              setRelatedProducts(related.slice(0, 4));
            })
            .catch(() => {});
        }
      }).catch((error: any) => {
        setLoadError(error.response?.status === 404 ? 'Product not found' : 'Product details could not be loaded');
      });
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (requiresVariant && !selectedVariant) {
      toast.error('Select a product option first');
      return;
    }
    if (!isAuth) {
      // Guest: local cart
      const ok = useStore.getState().addToGuestCart({ product_id: product.id, variant_id: selectedVariantId || undefined, variant_label: selectedVariantLabel || undefined, name: product.name, price: effectivePrice, image: product.thumbnail, stock: effectiveStock, quantity: qty });
      if (!ok) { toast.error(`Only ${effectiveStock} available in stock`); return; }
      toast.success(`Added ${qty} item(s) to cart!`);
      trackAddToCart(product.id, product.name || '', effectivePrice || 0, qty);
      return;
    }
    try {
      await api.addToCart(product.id, qty, selectedVariantId || undefined);
      toast.success(`Added ${qty} item(s) to cart!`);
      trackAddToCart(product.id, product.name || '', effectivePrice || 0, qty);
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (requiresVariant && !selectedVariant) {
      toast.error('Select a product option first');
      return;
    }
    if (!isAuth) {
      // Guest: add to local cart then go to cart
      const added = useStore.getState().addToGuestCart({ product_id: product.id, variant_id: selectedVariantId || undefined, variant_label: selectedVariantLabel || undefined, name: product.name, price: effectivePrice, image: product.thumbnail, stock: effectiveStock, quantity: qty });
      if (!added) {
        toast.error(`Only ${effectiveStock} available in stock`);
        return;
      }
      navigate('/cart');
      return;
    }
    try {
      await api.addToCart(product.id, qty, selectedVariantId || undefined);
      const c = await api.getCart();
      useStore.getState().setCart(c.data.cart?.items || [], c.data.total || 0);
      navigate('/cart');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed');
    }
  };

  const checkDelivery = async () => {
    if (pincode.length !== 6 || pincode.startsWith('0')) {
      setDeliveryInfo('Please enter a valid 6-digit pincode');
      return;
    }
    setDeliveryInfo('Checking delivery availability...');
    try {
      const response = await api.checkServiceability(pincode, { product_id: product.id, variant_id: selectedVariantId || undefined, quantity: qty });
      const result = response.data;
      if (!result.serviceable) {
        setDeliveryInfo('Delivery is not available for this pincode.');
        return;
      }
      const estimate = result.estimated_delivery
        ? ` Estimated delivery: ${result.estimated_delivery}.`
        : result.estimated_days
          ? ` Estimated in ${result.estimated_days} business days.`
          : '';
      const cod = result.cod_available ? ' COD is available.' : '';
      setDeliveryInfo(`Delivery is available.${estimate}${cod}`);
    } catch (err: any) {
      setDeliveryInfo(err.response?.data?.error || 'Delivery availability could not be confirmed. Please try again.');
    }
  };

  const handleShare = () => {
    // Canonical short link for reels/comments — slug-based, resolves via /p/:slug
    const shareUrl = `${window.location.origin}/p/${product.slug || product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.name, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Product link copied — paste it in your reel/video comments!');
    }
  };

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-950">{loadError}</h1>
        <p className="text-sm text-slate-500 mt-2">The product may be unavailable or the catalog service may need another attempt.</p>
        <Link to="/products" className="btn-primary inline-flex mt-6">Return to catalog</Link>
      </div>
    );
  }

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

  const galleryImages = Array.from(new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))) as string[];
  const selectedVariant = (product.variants || []).find((variant: any) => variant.id === selectedVariantId);
  const requiresVariant = (product.variants || []).length > 0;
  const effectivePrice = selectedVariant?.price > 0 ? selectedVariant.price : product.price;
  const effectiveStock = selectedVariant ? Math.min(product.stock, selectedVariant.stock) : (requiresVariant ? 0 : product.stock);
  const selectedVariantLabel = selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : '';
  const discount = product.compare_at_price > effectivePrice ? Math.round((1 - effectivePrice / product.compare_at_price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Helmet>
        <title>{product.name} - LucubraElec</title>
        <meta name="description" content={product.description || `Buy ${product.name} at the best price on LucubraElec`} />
      </Helmet>
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
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="w-full h-full object-contain p-4" />
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
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center bg-white shrink-0 ${activeImage === image ? 'border-primary-500' : 'border-gray-200 hover:border-gray-400'}`}
                  aria-label={`View another image of ${product.name}`}
                >
                  <img src={image} alt="" className="w-full h-full object-contain p-1 rounded-md" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-primary-600 font-semibold mb-1 uppercase tracking-wider">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            {reviewCount > 0 ? (
              <StarRating rating={averageRating} size="md" showCount count={reviewCount} />
            ) : (
              <span className="text-sm text-gray-500">No customer reviews yet</span>
            )}
            <span className="text-sm text-gray-500">|</span>
            <span className={`text-sm font-medium flex items-center gap-1 ${effectiveStock > 0 ? 'text-green-700' : 'text-amber-700'}`}>
              <Check className="w-3.5 h-3.5" /> {requiresVariant && !selectedVariant ? 'Select an option' : effectiveStock > 0 ? `In Stock (${effectiveStock} units)` : 'Out of stock'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{((effectivePrice || 0) / 100).toLocaleString('en-IN')}
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
            {product.description || 'Product details are being updated. Contact support if you need information before ordering.'}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 font-medium">{t}</span>
              ))}
            </div>
          )}

          {requiresVariant && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-800 mb-2">Choose an option *</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant: any) => {
                  const variantStock = Math.min(product.stock, variant.stock);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={variantStock <= 0}
                      onClick={() => { setSelectedVariantId(variant.id); setQty(1); }}
                      className={`px-3 py-2 border rounded-md text-sm text-left ${selectedVariantId === variant.id ? 'border-amber-500 bg-amber-50 text-slate-950' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      <span className="font-medium">{variant.name}: {variant.value}</span>
                      {variant.price > 0 && <span className="block text-xs mt-0.5">₹{(variant.price / 100).toLocaleString('en-IN')} · {variantStock} available</span>}
                    </button>
                  );
                })}
              </div>
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
              <button onClick={() => setQty(Math.min(effectiveStock, qty + 1))} disabled={effectiveStock <= 0} className="p-2.5 hover:bg-gray-50 rounded-r-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={effectiveStock <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {requiresVariant && !selectedVariant ? 'Choose Option' : effectiveStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={effectiveStock <= 0}
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
              <p className={`text-xs mt-2 ${deliveryInfo.startsWith('Delivery is available.') ? 'text-green-600' : deliveryInfo.startsWith('Checking') ? 'text-gray-500' : 'text-red-500'}`}>
                {deliveryInfo}
              </p>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'Above ₹999' },
              { icon: Shield, label: 'Protected checkout', sub: 'Gateway payment' },
              { icon: RefreshCw, label: 'Returns', sub: 'See return policy' },
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

          {/* Partial payment hint */}
          {effectivePrice > 100000 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
              Pay ₹{Math.ceil((effectivePrice * (product.advance_percent || 20)) / 100 / 100).toLocaleString('en-IN')} online, with the remaining amount due on delivery
            </p>
          )}
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
              <p>{product.description || 'No detailed description is available yet.'}</p>
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
                    ['Weight', product.weight ? `${product.weight} g` : 'Not provided'],
                    ['Package size', product.length_cm && product.width_cm && product.height_cm ? `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm` : 'Not provided'],
                    ['GST rate', product.gst_percent ? `${product.gst_percent}%` : 'Not provided'],
                    ['HSN code', product.hsn_code || 'Not provided'],
                    ['In Stock', effectiveStock > 0 ? 'Yes' : requiresVariant && !selectedVariant ? 'Select an option' : 'No'],
                    ['Stock Quantity', requiresVariant && !selectedVariant ? 'Select an option' : String(effectiveStock)],
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
            <ReviewsSection productId={product.id} rating={averageRating} reviewCount={reviewCount} />
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
            <p className="text-lg font-bold text-gray-900">₹{((effectivePrice || 0) / 100).toLocaleString('en-IN')}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={effectiveStock <= 0}
            className="btn-primary flex items-center gap-2 !py-3"
          >
            <ShoppingCart className="w-4 h-4" />
            {requiresVariant && !selectedVariant ? 'Choose Option' : effectiveStock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ productId, rating, reviewCount }: { productId: string; rating: number; reviewCount: number }) {
  const { isAuth } = useStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [summaryRating, setSummaryRating] = useState(rating);
  const [summaryCount, setSummaryCount] = useState(reviewCount);

  useEffect(() => {
    api.getProductReviews(productId, { page, limit: 5 })
      .then((r) => {
        setReviews(r.data.reviews || []);
        setTotal(r.data.total || 0);
        setSummaryRating(Number(r.data.average_rating) || 0);
        setSummaryCount(Number(r.data.total_reviews ?? r.data.total) || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createReview(productId, { rating: newRating, comment: newText });
      toast.success('Review submitted for moderation');
      setShowForm(false);
      setNewText('');
      const r = await api.getProductReviews(productId, { page: 1, limit: 5 });
      setReviews(r.data.reviews || []);
      setTotal(r.data.total || 0);
      setSummaryRating(Number(r.data.average_rating) || 0);
      setSummaryCount(Number(r.data.total_reviews ?? r.data.total) || 0);
      setPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{summaryRating.toFixed(1)}</p>
          <StarRating rating={summaryRating} size="md" />
          <p className="text-xs text-gray-500 mt-1">{summaryCount} customer review{summaryCount === 1 ? '' : 's'}</p>
        </div>
        <div className="flex-1" />
        {isAuth && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setNewRating(s)}
                  className={`text-2xl ${s <= newRating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Your Review</label>
            <textarea className="input-field min-h-[80px]" placeholder="Share your experience..." value={newText}
              onChange={(e) => setNewText(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Review List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any, idx: number) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{[1, 2, 3, 4, 5].map((s) => <span key={s} className={`text-sm ${s <= (r.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`}>★</span>)}</div>
                <span className="text-sm font-medium text-gray-700">{r.user_name || 'Customer'}</span>
                {r.is_verified && <span className="badge text-[10px]">Verified Purchase</span>}
              </div>
              <p className="text-sm text-gray-600">{r.text || r.comment}</p>
              {r.created_at && <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>}
            </div>
          ))}
          {total > 5 && (
            <div className="flex justify-center gap-2 pt-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm px-3 py-1.5">Prev</button>
              <span className="text-sm text-gray-500 py-1.5">Page {page}</span>
              <button disabled={reviews.length < 5} onClick={() => setPage(page + 1)} className="btn-secondary text-sm px-3 py-1.5">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
