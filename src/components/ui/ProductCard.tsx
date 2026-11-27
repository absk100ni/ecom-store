import { Link } from 'react-router-dom';
import { Heart, Package, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as api from '../../services/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
  view?: 'grid' | 'list';
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const isAuth = useStore((state) => state.isAuth);
  const discount = product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const hasVariants = (product.variants || []).length > 0;

  const handleQuickAdd = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock <= 0) return;

    if (!isAuth) {
      const added = useStore.getState().addToGuestCart({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.thumbnail,
        stock: product.stock,
      });
      if (!added) {
        toast.error(`Only ${product.stock} available in stock`);
        return;
      }
      toast.success('Added to cart');
      return;
    }

    try {
      await api.addToCart(product.id, 1);
      const cart = await api.getCart();
      useStore.getState().setCart(cart.data.cart?.items || [], cart.data.total || 0);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not add this product');
    }
  };

  const handleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuth) {
      toast('Sign in to save products');
      return;
    }
    try {
      await api.addToWishlist(product.id);
      toast.success('Saved to wishlist');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not save this product');
    }
  };

  if (view === 'list') {
    return (
      <article className="card flex overflow-hidden">
        <Link to={`/p/${product.slug || product.id}`} className="w-32 sm:w-44 bg-white border-r border-slate-200 flex items-center justify-center shrink-0">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full max-h-44 object-contain p-3" />
          ) : (
            <Package className="w-10 h-10 text-slate-300" />
          )}
        </Link>
        <div className="p-4 flex-1 min-w-0 flex flex-col">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{product.category}</p>
          <Link to={`/p/${product.slug || product.id}`} className="font-semibold text-slate-950 mt-1 hover:text-primary-700 line-clamp-2">
            {product.name}
          </Link>
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 hidden sm:block">{product.description || 'Product details are being updated.'}</p>
          <div className="mt-auto pt-4 flex items-end justify-between gap-3">
            <Price product={product} discount={discount} />
            {hasVariants ? (
              <Link to={`/p/${product.slug || product.id}`} className="btn-secondary !px-4 !py-2 text-sm">Choose options</Link>
            ) : (
              <button onClick={handleQuickAdd} disabled={product.stock <= 0} className="btn-primary !px-4 !py-2 text-sm inline-flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> {product.stock > 0 ? 'Add' : 'Unavailable'}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card-hover group flex flex-col min-w-0">
      <div className="relative aspect-square bg-white border-b border-slate-200 flex items-center justify-center overflow-hidden">
        <Link to={`/p/${product.slug || product.id}`} className="absolute inset-0 flex items-center justify-center">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-4 product-image-zoom" />
          ) : (
            <div className="text-center text-slate-300"><Package className="w-12 h-12 mx-auto" /><span className="text-xs">Image unavailable</span></div>
          )}
        </Link>
        {discount > 0 && <span className="absolute top-3 left-3 badge-sale">{discount}% off</span>}
        <button onClick={handleWishlist} className="absolute top-3 right-3 w-9 h-9 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-300" aria-label={`Save ${product.name} to wishlist`}>
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 line-clamp-1">{product.category}</p>
        <Link to={`/p/${product.slug || product.id}`} className="text-sm font-semibold text-slate-950 mt-1.5 line-clamp-2 min-h-10 hover:text-primary-700">
          {product.name}
        </Link>
        <div className="mt-3"><Price product={product} discount={discount} /></div>
        <p className={`text-xs mt-2 font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        {hasVariants ? (
          <Link to={`/p/${product.slug || product.id}`} className="btn-secondary mt-4 !py-2.5 !px-3 text-sm inline-flex items-center justify-center">Choose options</Link>
        ) : (
          <button onClick={handleQuickAdd} disabled={product.stock <= 0} className="btn-primary mt-4 !py-2.5 !px-3 text-sm inline-flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" /> {product.stock > 0 ? 'Add to cart' : 'Unavailable'}
          </button>
        )}
      </div>
    </article>
  );
}

function Price({ product, discount }: { product: any; discount: number }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-lg font-extrabold text-slate-950">₹{((product.price || 0) / 100).toLocaleString('en-IN')}</span>
        {product.compare_at_price > product.price && (
          <span className="text-xs text-slate-400 line-through">₹{(product.compare_at_price / 100).toLocaleString('en-IN')}</span>
        )}
      </div>
      {discount > 0 && <span className="text-[11px] font-semibold text-emerald-700">Save {discount}%</span>}
    </div>
  );
}
