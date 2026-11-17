/* GrowthBridge public-site service worker.
 * Policy: never cache admin, API, auth, or Supabase traffic.
 * HTML is network-only; offline fallback is limited to public navigations.
 */
'use strict';

const CACHE_PREFIX = 'growthbridge-public-v1';
const PRECACHE = `${CACHE_PREFIX}-shell`;
const STATIC_CACHE = `${CACHE_PREFIX}-static`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL, '/icons/icon-192.svg', '/icons/icon-512.svg', '/icons/icon-maskable.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('growthbridge-') && ![PRECACHE, STATIC_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isPrivateOrSensitivePath(pathname) {
  return pathname.startsWith('/admin') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup');
}

function isCacheableStaticAsset(url) {
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivateOrSensitivePath(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const offline = await caches.match(OFFLINE_URL);
        return offline || Response.error();
      })
    );
    return;
  }

  if (isCacheableStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone());
        }
        return response;
      })
    );
  }
});
