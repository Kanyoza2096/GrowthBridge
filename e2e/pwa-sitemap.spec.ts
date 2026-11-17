import { test, expect } from '@playwright/test';

test.describe('Public SEO and PWA delivery', () => {
  test('serves an installable web app manifest with branded icons', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toMatch(/Growthbridge/i);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192' }),
      expect.objectContaining({ sizes: '512x512' }),
      expect.objectContaining({ purpose: 'maskable' }),
    ]));
  });

  test('serves the native Apple touch icon', async ({ request }) => {
    const response = await request.get('/icons/apple-touch-icon.png');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  });

  test('serves the public offline fallback and service worker', async ({ request }) => {
    const [offline, worker] = await Promise.all([
      request.get('/offline.html'),
      request.get('/sw.js'),
    ]);

    expect(offline.ok()).toBeTruthy();
    expect(await offline.text()).toContain("You're temporarily offline.");
    expect(worker.ok()).toBeTruthy();
    const workerSource = await worker.text();
    expect(workerSource).toContain('isPrivateOrSensitivePath');
    expect(workerSource).toContain('/admin');
  });

  test('serves a sitemap with canonical public routes', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('xml');

    const xml = await response.text();
    expect(xml).toContain('https://growthbridge.org/');
    expect(xml).toContain('https://growthbridge.org/about');
    expect(xml).toContain('https://growthbridge.org/contact');
  });
});
