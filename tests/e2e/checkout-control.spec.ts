import { expect, test } from '@playwright/test';

const product = {
  id: 'product-control', slug: 'control-test-product', name: 'Control Test Product',
  description: 'Checkout control test product', category: 'electrical', price: 99900,
  compare_at_price: 0, stock: 5, sku: 'CTRL-1', is_active: true,
  thumbnail: '', images: [], tags: [], advance_percent: 20,
};

test('disabled checkout preserves browsing and cart but blocks order creation', async ({ page }) => {
  let orderCalls = 0;
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (path === '/checkout/status') return json({ enabled: false });
    if (path === '/products/control-test-product') return json(product);
    if (path === '/shipping/serviceability/121003') return json({ serviceable: true });
    if (path === '/guest/orders' && request.method() === 'POST') { orderCalls++; return json({ error: 'Checkout is temporarily unavailable', code: 'ECHK001' }, 503); }
    return json({ error: `Unhandled test route ${request.method()} ${path}` }, 404);
  });

  await page.goto('/p/control-test-product');
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await page.goto('/checkout');
  await expect(page.getByText('Checkout is temporarily unavailable').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue to Review/ })).toBeDisabled();
  expect(orderCalls).toBe(0);
});
