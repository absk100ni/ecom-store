import { create } from 'zustand';

interface CartItem { product_id: string; name: string; price: number; quantity: number; image?: string; }
interface User { id: string; phone: string; name?: string; }

interface Store {
  user: User | null; token: string | null; isAuth: boolean;
  cart: CartItem[]; cartTotal: number; cartCount: number;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setCart: (items: CartItem[], total: number) => void;
}

export const useStore = create<Store>((set) => ({
  user: (() => { try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; } })(),
  token: localStorage.getItem('token'),
  isAuth: !!localStorage.getItem('token'),
  cart: [], cartTotal: 0, cartCount: 0,
  setAuth: (user, token) => { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); set({ user, token, isAuth: true }); },
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); set({ user: null, token: null, isAuth: false }); },
  setCart: (items, total) => set({ cart: items, cartTotal: total, cartCount: items.reduce((s, i) => s + i.quantity, 0) }),
}));
