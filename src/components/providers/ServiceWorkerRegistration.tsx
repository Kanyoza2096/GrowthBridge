'use client';

import { useEffect } from 'react';

/**
 * Registers the public-site service worker in production only.
 * The worker deliberately never caches admin pages, API responses, or user data.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;

    let cancelled = false;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        if (cancelled) return;
        void registration.update().catch((error: unknown) => {
          console.warn('[PWA] Service worker update check failed.', error);
        });
      })
      .catch((error: unknown) => {
        console.error('[PWA] Service worker registration failed.', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
