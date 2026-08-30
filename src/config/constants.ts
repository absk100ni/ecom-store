// Centralized store-wide constants — single source of truth.

const env = import.meta.env;

/** Store name used in titles, toasts, Razorpay modal, and legal references. */
export const STORE_NAME = env.VITE_STORE_NAME || 'LucubraElec';

/** Shipping thresholds (in paise). Must match backend: internal/order/handler.go line ~207. */
export const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
export const SHIPPING_CHARGE = 4900; // ₹49

/** Compute shipping cost from cart total in paise. */
export const getShippingCost = (cartTotalPaise: number): number =>
  cartTotalPaise >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
