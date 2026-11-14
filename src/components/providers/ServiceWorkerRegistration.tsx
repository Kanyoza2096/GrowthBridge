'use client';

import { useEffect } from 'react';

/**
 * Register the public-site service worker only in production.
 * The worker deliberately avoids caching authenticated pages and API traffic.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    let cancelled = false;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (cancelled) return;
        void registration.update().catch(() => {
          // A transient update check must not affect normal page usage.
        });
      })
      .catch((error: unknown) => {
        console.error('[pwa] Service worker registration failed.', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
