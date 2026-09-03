import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Official Growthbridge bridge mark (board: navy / green / orange pillars + arrows).
 */
export function BrandMark({
  className,
  title = 'Growthbridge',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={cn('w-8 h-8', className)} role="img" aria-label={title}>
      <title>{title}</title>
      <path
        d="M6 34c6-12 12-18 18-18s12 6 18 18"
        fill="none"
        stroke="#123B5D"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M10 34c5-9 10-13.5 14-13.5S33 25 38 34"
        fill="none"
        stroke="#16A36A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="14.2" y="22" width="2.8" height="12" rx="1" fill="#123B5D" />
      <rect x="22.6" y="18" width="2.8" height="16" rx="1" fill="#16A36A" />
      <rect x="31" y="22" width="2.8" height="12" rx="1" fill="#F59E0B" />
      <path
        d="M15.6 20l0-6 M15.6 14l-2.2 2.4 M15.6 14l2.2 2.4"
        stroke="#123B5D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 16l0-7 M24 9l-2.2 2.4 M24 9l2.2 2.4"
        stroke="#16A36A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M32.4 20l0-6 M32.4 14l-2.2 2.4 M32.4 14l2.2 2.4"
        stroke="#F59E0B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Wordmark: GROWTH (navy) + BRIDGE (green) */
export function BrandWordmark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn('font-extrabold tracking-tight', className)}>
      <span className={onDark ? 'text-white' : 'text-[var(--gb-brand-navy)]'}>GROWTH</span>
      <span className={onDark ? 'text-[var(--gb-green-300)]' : 'text-[var(--gb-brand-green)]'}>
        BRIDGE
      </span>
    </span>
  );
}
