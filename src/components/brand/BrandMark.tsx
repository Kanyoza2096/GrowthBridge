import React from 'react';
import { cn } from '@/lib/utils';

/** Official GrowthBridge bridge mark in the approved navy, green and gold palette. */
export function BrandMark({
  className,
  title = 'GrowthBridge Virtual',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={cn('w-8 h-8', className)} role="img" aria-label={title}>
      <title>{title}</title>
      <path d="M6 34c6-12 12-18 18-18s12 6 18 18" fill="none" stroke="var(--gb-brand-navy)" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M10 34c5-9 10-13.5 14-13.5S33 25 38 34" fill="none" stroke="var(--gb-brand-green)" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="14.2" y="22" width="2.8" height="12" rx="1" fill="var(--gb-brand-navy)" />
      <rect x="22.6" y="18" width="2.8" height="16" rx="1" fill="var(--gb-brand-green)" />
      <rect x="31" y="22" width="2.8" height="12" rx="1" fill="var(--gb-brand-orange)" />
      <path d="M15.6 20v-6m0 0-2.2 2.4m2.2-2.4 2.2 2.4" stroke="var(--gb-brand-navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M24 16V9m0 0-2.2 2.4M24 9l2.2 2.4" stroke="var(--gb-brand-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M32.4 20v-6m0 0-2.2 2.4m2.2-2.4 2.2 2.4" stroke="var(--gb-brand-orange)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/** Public-facing wordmark: GrowthBridge is the parent; Virtual is the public brand. */
export function BrandWordmark({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn('font-extrabold tracking-tight', className)} aria-label="GrowthBridge Virtual">
      <span className={onDark ? 'text-white' : 'text-[var(--gb-brand-navy)]'}>GROWTH</span>
      <span className={onDark ? 'text-[var(--gb-green-300)]' : 'text-[var(--gb-brand-green)]'}>BRIDGE</span>
      <span className={cn('ml-1.5 text-[0.48em] font-bold tracking-[0.16em] align-middle', onDark ? 'text-white/75' : 'text-[var(--gb-brand-navy)]')}>VIRTUAL</span>
    </span>
  );
}
