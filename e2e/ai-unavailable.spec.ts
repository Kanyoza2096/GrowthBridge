// e2e/ai-unavailable.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Autonomous Platform Graceful Degradation', () => {
  test('public pages should load normally even when Autonomous Platform is disabled', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Growthbridge/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
