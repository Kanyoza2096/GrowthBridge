'use client';

import { useEffect, type ReactNode } from 'react';

const REVEAL_SELECTOR = '[data-gb-reveal]';

/**
 * Enables scroll reveals only after IntersectionObserver is available.
 * Without JavaScript support (or with reduced motion enabled), content stays visible.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('gb-motion-ready');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.dataset.gbReveal = 'visible';
            if (target.dataset.gbRevealOnce !== 'false') observer.unobserve(target);
          } else if (target.dataset.gbRevealOnce === 'false') {
            target.dataset.gbReveal = 'hidden';
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );

    const observe = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
        if (element.dataset.gbReveal !== 'visible') observer.observe(element);
      });
    };

    root.classList.add('gb-motion-ready');
    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        root.classList.remove('gb-motion-ready');
        observer.disconnect();
      } else {
        root.classList.add('gb-motion-ready');
        observe();
      }
    };

    reducedMotion.addEventListener?.('change', handlePreferenceChange);

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      reducedMotion.removeEventListener?.('change', handlePreferenceChange);
      root.classList.remove('gb-motion-ready');
    };
  }, []);

  return <>{children}</>;
}
