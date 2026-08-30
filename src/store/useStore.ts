import { create } from 'zustand';

interface CartItem { product_id: string; name: string; price: number; quantity: number; image?: string; stock?: number; }
interface User { id: string; phone: string; name?: string; }

// ── Guest (local) cart helpers ──
const GUEST_CART_KEY = 'guest_cart';

function loadGuestCart(): CartItem[] {
  try { const s = localStorage.getItem(GUEST_CART_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

interface Store {
  user: User | null; token: string | null; isAuth: boolean;
  // Server cart (authed)
  cart: CartItem[]; cartTotal: number; cartCount: number;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setCart: (items: CartItem[], total: number) => void;

  // Guest (local) cart
  guestCart: CartItem[];
  guestCartTotal: number;
  guestCartCount: number;
  addToGuestCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => boolean;
  updateGuestCartQty: (productId: string, qty: number) => void;
  removeFromGuestCart: (productId: string) => void;
  clearGuestCart: () => void;

  /** Unified cart count (server when authed, local when guest) */
  totalCartCount: () => number;
}

function computeGuestTotals(items: CartItem[]) {
  return {
    guestCartTotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
    guestCartCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

const initialGuest = loadGuestCart();
const initialGuestTotals = computeGuestTotals(initialGuest);

export const useStore = create<Store>((set, get) => ({
  user: (() => { try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; } })(),
  token: localStorage.getItem('token'),
  isAuth: !!localStorage.getItem('token'),
  cart: [], cartTotal: 0, cartCount: 0,
  setAuth: (user, token) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); set({ user, token, isAuth: true }); },
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); set({ user: null, token: null, isAuth: false }); },
  setCart: (items, total) => set({ cart: items, cartTotal: total, cartCount: items.reduce((s, i) => s + i.quantity, 0) }),

  // ── Guest cart ──
  guestCart: initialGuest,
  guestCartTotal: initialGuestTotals.guestCartTotal,
  guestCartCount: initialGuestTotals.guestCartCount,

  addToGuestCart: (item) => {
    const { guestCart } = get();
    const existing = guestCart.find((i) => i.product_id === item.product_id);
    const currentQty = existing ? existing.quantity : 0;
    const addQty = item.quantity ?? 1;
    const stock = item.stock ?? Infinity;
    if (currentQty + addQty > stock) return false; // stock cap
    let updated: CartItem[];
    if (existing) {
      updated = guestCart.map((i) => i.product_id === item.product_id ? { ...i, quantity: i.quantity + addQty, stock: item.stock } : i);
    } else {
      updated = [...guestCart, { product_id: item.product_id, name: item.name, price: item.price, image: item.image, stock: item.stock, quantity: addQty }];
    }
    saveGuestCart(updated);
    set({ guestCart: updated, ...computeGuestTotals(updated) });
    return true;
  },

  updateGuestCartQty: (productId, qty) => {
    if (qty < 1) return;
    const { guestCart } = get();
    const item = guestCart.find((i) => i.product_id === productId);
    if (!item) return;
    if (item.stock !== undefined && qty > item.stock) return;
    const updated = guestCart.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i);
    saveGuestCart(updated);
    set({ guestCart: updated, ...computeGuestTotals(updated) });
  },

  removeFromGuestCart: (productId) => {
    const updated = get().guestCart.filter((i) => i.product_id !== productId);
    saveGuestCart(updated);
    set({ guestCart: updated, ...computeGuestTotals(updated) });
  },

  clearGuestCart: () => {
    localStorage.removeItem(GUEST_CART_KEY);
    set({ guestCart: [], guestCartTotal: 0, guestCartCount: 0 });
  },

  totalCartCount: () => {
    const s = get();
    return s.isAuth ? s.cartCount : s.guestCartCount;
  },
}));
