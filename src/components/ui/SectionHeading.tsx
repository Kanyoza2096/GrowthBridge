import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: 'green' | 'blue' | 'orange' | 'purple';
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  onDark?: boolean; // Optional: force light text when on dark backgrounds
}

export function SectionHeading({
  badge,
  badgeVariant = 'green',
  title,
  subtitle,
  align = 'center',
  className,
  onDark = false,
}: SectionHeadingProps) {
  const alignments = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div className={cn('flex flex-col space-y-3 mb-10 sm:mb-12', alignments[align], className)}>
      {badge && (
        <Badge variant={badgeVariant} className="uppercase tracking-widest text-[10px]">
          {badge}
        </Badge>
      )}
      <h2
        className={cn(
          'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
          onDark ? 'text-white' : 'text-[var(--text-primary)]'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-sm sm:text-base lg:text-lg max-w-2xl font-normal leading-relaxed',
            onDark ? 'text-white/70' : 'text-[var(--text-secondary)]'
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          'w-16 h-1 bg-gradient-to-r from-[var(--gb-green-600)] to-[var(--gb-orange-500)] rounded-full mt-2',
          align === 'center' && 'mx-auto'
        )}
      />
    </div>
  );
}
