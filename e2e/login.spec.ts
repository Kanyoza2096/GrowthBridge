// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Authentication Flow', () => {
  test('unauthenticated users should be redirected from /admin to /admin/login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin\/login/);
  });

  test('admin login page should show login form with email and password inputs', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test('admin login page should provide a clear route back to the public website', async ({ page }) => {
    await page.goto('/admin/login');
    const backLink = page.getByRole('link', { name: /back to website/i }).first();
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
