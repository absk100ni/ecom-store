import { expect, test } from '@playwright/test';

test('website maintenance flag hides the storefront', async ({ page }) => {
  await page.route('**/api/v1/feature-flags', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ flags: { website_maintenance: true } }) }));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'LucubraElec is temporarily under maintenance' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Browse catalog/i })).toHaveCount(0);
});
