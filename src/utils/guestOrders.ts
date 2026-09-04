// Local history of guest orders so a returning guest can re-find their order
// without remembering the order number (WhatsApp confirmation may not exist yet,
// and reel-traffic guests close the webview immediately after paying).
// Stored device-locally only — same privacy footprint as the guest cart.

const KEY = 'guest_orders';
const MAX_ENTRIES = 10;

export interface GuestOrderRef {
  order_number: string;
  phone: string;
  total: number; // paise
  created_at: string; // ISO
}

export function getGuestOrders(): GuestOrderRef[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveGuestOrder(entry: GuestOrderRef) {
  try {
    const list = getGuestOrders().filter((o) => o.order_number !== entry.order_number);
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage unavailable (private mode quota) — non-fatal
  }
}

export function removeGuestOrder(orderNumber: string) {
  try {
    const list = getGuestOrders().filter((o) => o.order_number !== orderNumber);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // non-fatal
  }
}
