'use client';

import React, { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@/lib/utils';

interface CountUpProps {
  end: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      hasAnimated.current = true;
      setCount(end);
      return;
    }

    // If the verified value updates after the first reveal, keep the display truthful.
    if (hasAnimated.current) {
      setCount(end);
      return;
    }

    let frameId = 0;
    let startTimestamp: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const step = (timestamp: number) => {
          if (startTimestamp === null) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / Math.max(250, duration), 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          setCount(Math.floor(easeOutQuart * end));

          if (progress < 1) {
            frameId = window.requestAnimationFrame(step);
          } else {
            setCount(end);
          }
        };

        frameId = window.requestAnimationFrame(step);
        observer.unobserve(entry.target);
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [end, duration]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${formatNumber(end)}${suffix}`}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
