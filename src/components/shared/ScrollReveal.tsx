'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Prefer visible content over a stuck opacity-0 state (mobile IO edge cases).
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(el);

    // If already in viewport on mount (common for hero), show without waiting.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      observer.unobserve(el);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 opacity-100 scale-100';
    switch (direction) {
      case 'up':
        return 'translate-y-10 opacity-0 scale-95';
      case 'down':
        return '-translate-y-10 opacity-0 scale-95';
      case 'left':
        return 'translate-x-10 opacity-0 scale-95';
      case 'right':
        return '-translate-x-10 opacity-0 scale-95';
      default:
        return 'opacity-0 scale-95';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
      className={cn(
        'transition-all duration-700 ease-out transform-gpu',
        getTransform(),
        className
      )}
    >
      {children}
    </div>
  );
}
