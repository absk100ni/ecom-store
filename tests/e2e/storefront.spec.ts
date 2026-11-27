import { expect, Page, test } from '@playwright/test';

const product = {
  id: 'product-1',
  slug: 'led-work-light',
  name: '20W LED Work Light',
  description: 'Portable work light with a metal housing and adjustable stand.',
  category: 'lighting',
  price: 129900,
  compare_at_price: 149900,
  stock: 4,
  sku: 'LGT-WORK-20W',
  weight: 850,
  length_cm: 24,
  width_cm: 18,
  height_cm: 12,
  gst_percent: 18,
  hsn_code: '9405',
  is_active: true,
  thumbnail: 'https://images.example.test/work-light-main.webp',
  images: ['https://images.example.test/work-light-side.webp'],
  tags: ['work light', '20W'],
  advance_percent: 20,
};

const secondProduct = {
  ...product,
  id: 'product-2',
  slug: 'copper-wire-roll',
  name: 'Copper Wire Roll',
  category: 'electrical',
  price: 49900,
  compare_at_price: 0,
  stock: 12,
  sku: 'ELE-WIRE-01',
  thumbnail: '',
  images: [],
};

async function mockStoreApi(page: Page) {
  let orderStatus = 'confirmed';
  let pendingPaid = false;
  await page.route('https://accounts.google.com/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `window.google={accounts:{id:{initialize:function(options){window.__googleCallback=options.callback},renderButton:function(element){var button=document.createElement('button');button.textContent='Continue with Google';button.onclick=function(){window.__googleCallback({credential:'google-test-token'})};element.appendChild(button)}}}};`,
  }));
  await page.route('https://checkout.razorpay.com/**', (route) => route.abort());
  await page.route('https://sdk.cashfree.com/**', (route) => route.abort());
  await page.route('https://images.example.test/**', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e2e8f0"/></svg>' }));

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const method = request.method();
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    if (path === '/checkout/status' && method === 'GET') return json({ enabled: true });
    if (path === '/auth/google' && method === 'POST') {
      return json({ token: 'customer-token', user: { id: 'user-1', name: 'A Customer', email: 'customer@example.com', phone: '' } });
    }
    if (path === '/user' && method === 'GET') return json({ id: 'user-1', name: 'A Customer', email: 'customer@example.com', phone: '' });
    if (path === '/user' && method === 'PUT') return json({ message: 'Profile updated' });
    if (path === '/user/addresses' && method === 'GET') return json({ addresses: [] });
    if (path === '/user/addresses' && method === 'POST') return json({ address: { id: 'address-1', name: 'A Customer', line1: '10 Market Road', city: 'Faridabad', state: 'Haryana', pincode: '121003', phone: '9999999999', is_default: true } }, 201);
    if (path === '/wishlist' && method === 'GET') return json({ wishlist: [{ product_id: product.id, product }] });
    if (path === '/wishlist' && method === 'POST') return json({ message: 'Added to wishlist' });
    if (path.startsWith('/wishlist/') && method === 'DELETE') return json({ message: 'Removed from wishlist' });
    if (path === '/reviews' && method === 'POST') return json({ id: 'review-new', rating: 5, comment: 'Solid build quality' }, 201);

    if (path === '/categories' || path === '/categories/tree') {
      return json({ categories: [
        { id: 'cat-1', name: 'Lighting', slug: 'lighting', level: 1, is_active: true, children: [] },
        { id: 'cat-2', name: 'Electrical', slug: 'electrical', level: 1, is_active: true, children: [] },
      ] });
    }
    if (path === '/products' && method === 'GET') {
      const items = url.searchParams.get('category') === 'electrical' ? [secondProduct] : [product, secondProduct];
      return json({ products: items, total: items.length, page: 1, limit: 6, total_pages: 1 });
    }
    if (path === '/products/product-1' || path === '/products/led-work-light') return json(product);
    if (path === '/products/product-2' || path === '/products/copper-wire-roll') return json(secondProduct);
    if (path === '/reviews/product/product-1') {
      return json({ reviews: [{ id: 'review-1', rating: 4, comment: 'Useful on site', user_name: 'Customer', is_verified: true }], total: 2, total_reviews: 2, average_rating: 4.5 });
    }
    if (path === '/shipping/serviceability/121003') {
      return json({ pincode: '121003', serviceable: true, cod_available: true, estimated_days: 3, estimated_delivery: 'Tue, 17 Nov', source: 'shipmozo' });
    }
    if (path === '/cart/add' && method === 'POST') return json({ message: 'Item added' });
    if (path === '/coupons/validate' && method === 'POST') return json({ valid: true, discount: 10000 });
    if (path === '/guest/orders' && method === 'POST') {
      return json({ order: { id: 'order-guest-1', order_number: 'ORD-10001', total: 129900, advance_amount: 26000, cod_amount: 103900 }, guest_token: 'guest-token' }, 201);
    }
    if (path === '/guest/payment/create' && method === 'POST') return json({ gateway: 'mock', order_id: 'order-guest-1', amount: 27000 });
    if (path === '/guest/orders/track' && method === 'GET') {
      return json({ order_number: 'ORD-10001', status: 'shipped', payment_status: 'paid', total: 134800, advance_amount: 27000, cod_amount: 107800, created_at: '2026-11-14T10:00:00Z', items: [{ name: product.name, quantity: 1, price: product.price, image: product.thumbnail }], tracking: { awb: 'AWB123', courier_name: 'Test Courier', events: [{ status: 'shipped', description: 'Left the warehouse', timestamp: '2026-11-14T12:00:00Z' }] } });
    }
    if (path === '/contact' && method === 'POST') return json({ message: 'Message received' }, 201);
    if (path === '/orders/order-delivered' && method === 'GET') return json({ id: 'order-delivered', order_number: 'ORD-30001', status: 'delivered', payment_status: 'paid', payment_plan: 'full', total: product.price, delivered_at: new Date().toISOString(), items: [{ product_id: product.id, name: product.name, quantity: 2, price: product.price }], shipping_address: { name: 'A Customer', line1: '10 Market Road', city: 'Faridabad', state: 'Haryana', pincode: '121003', phone: '9999999999' } });
    if (path === '/orders/order-delivered/tracking' && method === 'GET') return json({ events: [{ status: 'delivered', description: 'Delivered', timestamp: new Date().toISOString() }] });
    if (path === '/orders/order-delivered/return' && method === 'GET') return json({ error: 'No return request found' }, 404);
    if (path === '/orders/order-delivered/return' && method === 'POST') return json({ return_request: { id: 'return-1', order_id: 'order-delivered', status: 'requested', type: 'return' } }, 201);
    if (path === '/orders/order-pending' && method === 'GET') return json({ id: 'order-pending', order_number: 'ORD-40001', status: pendingPaid ? 'confirmed' : 'placed', payment_status: pendingPaid ? 'paid' : 'pending', payment_plan: 'full', total: product.price, advance_amount: product.price, cod_amount: 0, items: [{ product_id: product.id, name: product.name, quantity: 1, price: product.price }], shipping_address: { name: 'A Customer', line1: '10 Market Road', city: 'Faridabad', state: 'Haryana', pincode: '121003', phone: '9999999999' } });
    if (path === '/orders/order-pending/tracking' && method === 'GET') return json({ error: 'Shipment not found' }, 404);
    if (path === '/orders/order-pending/return' && method === 'GET') return json({ error: 'No return request found' }, 404);
    if (path === '/payment/create' && method === 'POST') return json({ gateway: 'razorpay', razorpay_key_id: 'rzp_test_key', razorpay_order_id: 'order_gateway_1', amount: product.price, currency: 'INR' });
    if (path === '/payment/verify' && method === 'POST') { pendingPaid = true; return json({ message: 'Payment verified', order_number: 'ORD-40001' }); }
    if (path === '/orders' && method === 'GET') return json({ orders: [{ id: 'order-1', order_number: 'ORD-20001', status: orderStatus, payment_status: 'paid', payment_plan: 'full', total: product.price, advance_amount: product.price, cod_amount: 0, created_at: '2026-11-14T10:00:00Z', items: [{ product_id: product.id, name: product.name, quantity: 1, price: product.price }], shipping_address: { name: 'A Customer', line1: '10 Market Road', city: 'Faridabad', state: 'Haryana', pincode: '121003', phone: '9999999999' } }] });
    if (path === '/orders/order-1' && method === 'GET') return json({ id: 'order-1', order_number: 'ORD-20001', status: orderStatus, payment_status: 'paid', payment_plan: 'full', total: product.price, advance_amount: product.price, cod_amount: 0, created_at: '2026-11-14T10:00:00Z', items: [{ product_id: product.id, name: product.name, quantity: 1, price: product.price }], shipping_address: { name: 'A Customer', line1: '10 Market Road', city: 'Faridabad', state: 'Haryana', pincode: '121003', phone: '9999999999' } });
    if (path === '/orders/order-1/tracking' && method === 'GET') return json({ events: [] });
    if (path === '/orders/order-1/return' && method === 'GET') return json({ error: 'No return request found' }, 404);
    if (path === '/orders/order-1/cancel' && method === 'POST') { orderStatus = 'cancelled'; return json({ message: 'Order cancelled' }); }
    if (path === '/cart' && method === 'GET') return json({ cart: { items: [] }, total: 0 });
    return json({ error: `Unhandled test route ${method} ${path}` }, 404);
  });
}

test.beforeEach(async ({ page }) => {
  await mockStoreApi(page);
});

test('home uses truthful marketplace content', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Parts and equipment for the work that matters.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible();
  await expect(page.getByText('20W LED Work Light').first()).toBeVisible();
  await expect(page.getByText(/Best Sellers|Deal of the Day|100% genuine/i)).toHaveCount(0);
});

test('catalog sends sorting and price filtering to the backend', async ({ page }, testInfo) => {
  const productRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/products?')) productRequests.push(request.url());
  });
  await page.goto('/products');
  await page.getByRole('combobox').selectOption('price_asc');
  if (testInfo.project.name.includes('mobile')) {
    await page.getByRole('button', { name: 'Filters' }).click();
  }
  await page.getByRole('button', { name: 'Under ₹500' }).click();
  await expect.poll(() => productRequests.some((url) => url.includes('sort=price_asc') && url.includes('max_price=49999'))).toBeTruthy();
});

test('product detail shows real reviews, gallery and courier result', async ({ page }) => {
  await page.goto('/p/led-work-light');
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await page.getByRole('button', { name: 'Reviews (2)' }).click();
  await expect(page.getByText('4.5')).toBeVisible();
  await expect(page.getByText('2 customer reviews')).toBeVisible();
  await expect(page.getByRole('button', { name: `View another image of ${product.name}` })).toHaveCount(2);
  await page.getByPlaceholder('Enter pincode').fill('121003');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/Estimated delivery: Tue, 17 Nov/)).toBeVisible();
});

test('guest can complete the guarded checkout journey', async ({ page }) => {
  await page.goto('/p/led-work-light');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/cart');
  await expect(page.getByText(product.name).first()).toBeVisible();
  await page.getByRole('button', { name: /Proceed to Checkout/ }).click();
  await page.getByLabel('Full Name *').fill('A Customer');
  await page.getByLabel('Address Line 1 *').fill('10 Market Road');
  await page.getByLabel('City *').fill('Faridabad');
  await page.getByLabel('State *').fill('Haryana');
  await page.getByLabel('Pincode *').fill('121003');
  await page.getByLabel('Phone *').fill('9999999999');
  await page.getByRole('button', { name: /Continue to Review/ }).click();
  await expect(page.getByText('Payment Method')).toBeVisible();
  await page.locator('label').filter({ hasText: 'Pay in full online' }).click();
  await page.getByRole('button', { name: /Pay ₹1,299/ }).click();
  await expect(page.getByRole('heading', { name: 'Order Placed Successfully!' })).toBeVisible();
  await expect(page.getByText('ORD-10001', { exact: true })).toBeVisible();
});

test('guest tracking renders the backend shipment contract', async ({ page }) => {
  await page.goto('/track');
  await page.getByLabel('Order Number *').fill('ORD-10001');
  await page.getByLabel('Phone Number *').fill('9999999999');
  await page.getByRole('button', { name: 'Track Order' }).click();
  await expect(page.getByText('AWB123')).toBeVisible();
  await expect(page.getByText('Test Courier')).toBeVisible();
  await expect(page.getByText('Left the warehouse')).toBeVisible();
});

test('signed-in customer can cancel an eligible order', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer', phone: '9999999999' }));
  });
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto('/orders/order-1');
  await page.getByRole('button', { name: 'Cancel order' }).click();
  await expect(page.getByText('Order cancelled')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel order' })).toHaveCount(0);
});

test('contact form submits and clears successfully', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Name *').fill('A Customer');
  await page.getByLabel('Email *').fill('customer@example.com');
  await page.getByLabel('Subject *').fill('Product question');
  await page.getByLabel('Message *').fill('Please confirm whether this product includes a power cable.');
  await page.getByRole('button', { name: /Send Message/ }).click();
  await expect(page.getByLabel('Message *')).toHaveValue('');
});


test('Google sign-in establishes a customer session', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBe('customer-token');
});

test('signed-in customer can save and open a wishlist item', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer', phone: '9999999999' }));
  });
  await page.goto('/products');
  await page.getByRole('button', { name: `Save ${product.name} to wishlist` }).click();
  await page.goto('/wishlist');
  await expect(page.getByText(product.name).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Add to Cart/ }).first()).toBeVisible();
});

test('signed-in customer can add a validated address', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer', phone: '' }));
  });
  await page.goto('/account');
  await page.getByRole('button', { name: 'Add New' }).click();
  await page.getByLabel('Full Name *').fill('A Customer');
  await page.getByLabel('Address Line 1 *').fill('10 Market Road');
  await page.getByLabel('City *').fill('Faridabad');
  await page.getByLabel('State *').fill('Haryana');
  await page.getByLabel('Pincode *').fill('121003');
  await page.getByLabel('Phone *').fill('9999999999');
  await page.getByRole('button', { name: 'Add Address' }).click();
  await expect(page.getByText('10 Market Road')).toBeVisible();
});

test('delivered customer can submit a return request', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer', phone: '9999999999' }));
  });
  await page.goto('/orders/order-delivered');
  await page.getByRole('button', { name: 'Request Return' }).click();
  await page.getByRole('checkbox').check();
  await page.getByPlaceholder('Tell us why you\'d like to return...').fill('The housing arrived damaged.');
  await page.getByRole('button', { name: 'Submit Return Request' }).click();
  await expect(page.getByText('Return requested')).toBeVisible();
});

test('pending order can complete a Razorpay retry', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer', phone: '9999999999' }));
    (window as any).Razorpay = function Razorpay(options: any) {
      return { open: () => options.handler({ razorpay_order_id: 'order_gateway_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'signature_1' }) };
    };
  });
  await page.goto('/orders/order-pending');
  await expect(page.getByText('Online Payment Due')).toBeVisible();
  await page.getByRole('button', { name: 'Complete Payment' }).click();
  await expect(page.getByText('Paid Online')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete Payment' })).toHaveCount(0);
});

test('checkout stops when delivery cannot be confirmed', async ({ page }) => {
  await page.route('**/api/v1/shipping/serviceability/900001', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ pincode: '900001', serviceable: false, source: 'unavailable' }) }));
  await page.goto('/p/led-work-light');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/checkout');
  await page.getByLabel('Full Name *').fill('A Customer');
  await page.getByLabel('Address Line 1 *').fill('10 Market Road');
  await page.getByLabel('City *').fill('Faridabad');
  await page.getByLabel('State *').fill('Haryana');
  await page.getByLabel('Pincode *').fill('900001');
  await page.getByLabel('Phone *').fill('9999999999');
  await page.getByRole('button', { name: /Continue to Review/ }).click();
  await expect(page.getByText('Payment Method')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Continue to Review/ })).toBeVisible();
});

test('expired customer session returns to login', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'A Customer' }));
  });
  await page.route('**/api/v1/user', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Invalid or expired token' }) }));
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('missing product deep link shows a recoverable state', async ({ page }) => {
  await page.route('**/api/v1/products/missing-product', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Product not found' }) }));
  await page.goto('/p/missing-product');
  await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to catalog' })).toBeVisible();
});


test('variant product requires and preserves an explicit option', async ({ page }) => {
  const variantProduct = {
    ...product,
    id: 'product-variant',
    slug: 'cable-roll',
    name: 'Copper Cable Roll',
    price: 80000,
    stock: 10,
    variants: [
      { id: 'variant-10m', name: 'Length', value: '10 metre', price: 95000, stock: 3 },
      { id: 'variant-20m', name: 'Length', value: '20 metre', price: 170000, stock: 2 },
    ],
  };
  await page.route('**/api/v1/products/cable-roll', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(variantProduct) }));
  await page.route('**/api/v1/products/product-variant', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(variantProduct) }));
  await page.goto('/p/cable-roll');
  await expect(page.getByRole('button', { name: 'Choose Option' }).first()).toBeDisabled();
  await page.getByRole('button', { name: /Length: 10 metre/ }).click();
  await expect(page.getByText('₹950').first()).toBeVisible();
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.goto('/cart');
  await expect(page.getByText('Option: Length: 10 metre')).toBeVisible();
  await expect(page.getByText('₹950 per unit')).toBeVisible();
});