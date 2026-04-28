import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((c) => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

// Auth
export const sendOTP = (phone: string) => api.post('/auth/send-otp', { phone });
export const verifyOTP = (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code });

// Products
export const getProducts = (params?: any) => api.get('/products', { params });
export const getProduct = (id: string) => api.get(`/products/${id}`);
export const getCategories = () => api.get('/categories');

// Cart
export const getCart = () => api.get('/cart');
export const addToCart = (productId: string, quantity: number, variantId?: string) =>
  api.post('/cart/add', { product_id: productId, quantity, variant_id: variantId });
export const updateCartQty = (productId: string, quantity: number) =>
  api.put(`/cart/item/${productId}`, { quantity });
export const removeFromCart = (productId: string) => api.delete(`/cart/item/${productId}`);
export const clearCart = () => api.delete('/cart');

// Orders
export const createOrder = (data: any) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const getOrder = (id: string) => api.get(`/orders/${id}`);

// Payments
export const createPayment = (orderId: string) => api.post('/payment/create', { order_id: orderId });
export const verifyPayment = (data: any) => api.post('/payment/verify', data);

// Shipping
export const trackShipment = (orderId: string) => api.get(`/shipping/track/${orderId}`);

// User
export const getProfile = () => api.get('/user');

export default api;
