import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((c) => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

// Auto-logout on 401: a stale/expired token otherwise leaves the app thinking
// it's logged in while every authed request silently fails.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const sendOTP = (phone: string) => api.post('/auth/send-otp', { phone });
export const verifyOTP = (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code });
export const googleLogin = (id_token: string) => api.post('/auth/google', { id_token });

// Products
export const getProducts = (params?: any) => api.get('/products', { params });
export const getProduct = (id: string) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/categories');
// Autocomplete suggestions — /search/suggest (NOT /products/suggest: gin
// route conflict with /products/:id forced the backend onto this path)
export const getSearchSuggestions = (q: string) => api.get('/search/suggest', { params: { q } });
// Category tree (3-level hierarchy)
export const getCategoryTree = () => api.get('/categories/tree');

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId: string, quantity: number, variantId?: string) =>
  api.post('/cart/add', { product_id: productId, quantity, variant_id: variantId });
export const updateCartQty = (productId: string, quantity: number) =>
  api.put(`/cart/item/${productId}`, { quantity });
export const removeFromCart = (productId: string) => api.delete(`/cart/item/${productId}`);
export const clearCart = () => api.delete('/cart');
export const applyCoupon = (code: string, subtotal: number) => api.post('/coupons/validate', { code, subtotal });

// Orders
export const createOrder = (data: any) => api.post('/orders', data);
// All-or-nothing checkout: dismissed/failed payment voids the order server-side
export const abandonOrder = (id: string) => api.post(`/orders/${id}/abandon`);
export const getOrders = () => api.get('/orders');
export const getOrder = (id: string) => api.get(`/orders/${id}`);
export const getOrderTracking = (id: string) => api.get(`/orders/${id}/tracking`);

// Payments
export const createPayment = (orderId: string) => api.post('/payment/create', { order_id: orderId });
export const verifyPayment = (data: any) => api.post('/payment/verify', data);

// Shipping
export const trackShipment = (orderId: string) => api.get(`/shipping/track/${orderId}`);

// User
export const getProfile = () => api.get('/user');
export const updateProfile = (data: any) => api.put('/user', data);
export const linkPhone = (phone: string) => api.post('/users/me/link-phone', { phone });
export const verifyPhone = (phone: string, otp: string) => api.post('/users/me/verify-phone', { phone, otp });

// Addresses
export const getAddresses = () => api.get('/user/addresses');
export const addAddress = (data: any) => api.post('/user/addresses', data);
export const updateAddress = (id: string, data: any) => api.put(`/user/addresses/${id}`, data);
export const deleteAddress = (id: string) => api.delete(`/user/addresses/${id}`);
export const setDefaultAddress = (id: string) => api.put(`/user/addresses/${id}/default`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId: string) => api.post('/wishlist', { product_id: productId });
export const removeFromWishlist = (productId: string) => api.delete(`/wishlist/${productId}`);

// Reviews
export const getProductReviews = (productId: string, params?: any) => api.get(`/reviews/product/${productId}`, { params });
export const createReview = (productId: string, data: any) => api.post('/reviews', { product_id: productId, ...data });

export default api;

// Contact
export const submitContact = (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
  api.post('/contact', data);

// Guest checkout (no auth required)
export const guestCreateOrder = (data: {
  items: { product_id: string; quantity: number }[];
  shipping_address: any;
  payment_plan: 'partial' | 'full';
  coupon_code?: string;
}) => api.post('/guest/orders', data);

export const guestCreatePayment = (orderId: string, guestToken: string) =>
  api.post('/guest/payment/create', { order_id: orderId, guest_token: guestToken });

export const guestVerifyPayment = (data: {
  order_id: string;
  guest_token: string;
  gateway: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => api.post('/guest/payment/verify', data);

export const guestAbandonOrder = (orderId: string, guestToken: string) =>
  api.post(`/guest/orders/${orderId}/abandon`, { guest_token: guestToken });

export const guestTrackOrder = (orderNumber: string, phone: string) =>
  api.get('/guest/orders/track', { params: { order_number: orderNumber, phone } });

// Returns
export const getReturnRequest = (orderId: string) => api.get(`/orders/${orderId}/return`);
export const createReturnRequest = (orderId: string, data: { type: 'return' | 'replacement'; items: { product_id: string; quantity: number }[]; reason: string }) =>
  // Backend contract: items[{product_id, qty, reason}] + optional top-level comment.
  // The UI collects one reason for the whole request, so it's applied per item.
  api.post(`/orders/${orderId}/return`, {
    type: data.type,
    comment: data.reason,
    items: data.items.map((it) => ({ product_id: it.product_id, qty: it.quantity, reason: data.reason })),
  });

// Invoice
export const getInvoiceHtml = (orderId: string) => api.get(`/orders/${orderId}/invoice`, { responseType: 'text' as any });
