// Analytics — Meta Pixel + GA4 gtag.js
// Values in RUPEES (paise / 100, 2dp). Currency: INR.
// Either tracker unset = silent no-op.

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || '';

let initialized = false;

/** Paise to Rupees, 2 decimal places */
function toRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/** Inject Meta Pixel & GA4 scripts once */
export function initAnalytics(): void {
  if (initialized) return;
  initialized = true;

  // Meta Pixel
  if (PIXEL_ID) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    /* eslint-enable */
  }

  // GA4
  if (GA4_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); } as any;
    window.gtag('js', new Date() as any);
    window.gtag('config', GA4_ID, { send_page_view: false });
  }
}

/** PageView — call on every route change */
export function trackPageView(path: string): void {
  if (PIXEL_ID) window.fbq?.('track', 'PageView');
  if (GA4_ID) window.gtag?.('event', 'page_view', { page_path: path });
}

/** ViewContent / view_item on PDP */
export function trackViewContent(productId: string, name: string, pricePaise: number): void {
  const value = toRupees(pricePaise);
  if (PIXEL_ID) window.fbq?.('track', 'ViewContent', {
    content_ids: [productId], content_type: 'product', value, currency: 'INR',
  });
  if (GA4_ID) window.gtag?.('event', 'view_item', {
    currency: 'INR', value,
    items: [{ item_id: productId, item_name: name, price: value }],
  });
}

/** AddToCart / add_to_cart */
export function trackAddToCart(productId: string, name: string, pricePaise: number, quantity: number): void {
  const value = toRupees(pricePaise * quantity);
  if (PIXEL_ID) window.fbq?.('track', 'AddToCart', {
    content_ids: [productId], content_type: 'product', value, currency: 'INR', num_items: quantity,
  });
  if (GA4_ID) window.gtag?.('event', 'add_to_cart', {
    currency: 'INR', value,
    items: [{ item_id: productId, item_name: name, price: toRupees(pricePaise), quantity }],
  });
}

/** InitiateCheckout / begin_checkout */
export function trackBeginCheckout(cartTotalPaise: number, numItems: number, items: { id: string; name: string; pricePaise: number; qty: number }[]): void {
  const value = toRupees(cartTotalPaise);
  if (PIXEL_ID) window.fbq?.('track', 'InitiateCheckout', {
    value, currency: 'INR', num_items: numItems, content_ids: items.map(i => i.id),
  });
  if (GA4_ID) window.gtag?.('event', 'begin_checkout', {
    currency: 'INR', value,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: toRupees(i.pricePaise), quantity: i.qty })),
  });
}

/** Purchase — fires EXACTLY ONCE per order (sessionStorage guard) */
export function trackPurchase(
  orderId: string, totalPaise: number,
  items: { id: string; name: string; pricePaise: number; qty: number }[]
): void {
  const key = `purchase_tracked_${orderId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const value = toRupees(totalPaise);
  const contentIds = items.map(i => i.id);
  const numItems = items.reduce((s, i) => s + i.qty, 0);

  if (PIXEL_ID) window.fbq?.('track', 'Purchase', {
    value, currency: 'INR', content_ids: contentIds, num_items: numItems,
  });
  if (GA4_ID) window.gtag?.('event', 'purchase', {
    transaction_id: orderId, currency: 'INR', value,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: toRupees(i.pricePaise), quantity: i.qty })),
  });
}
