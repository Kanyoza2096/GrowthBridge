import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'blue' | 'orange' | 'outline' | 'purple' | 'gray';
  children: React.ReactNode;
}

export function Badge({
  variant = 'green',
  children,
  className,
  ...props
}: BadgeProps) {
  const variants = {
    green: 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)] border border-[var(--chip-green-border)]',
    blue: 'bg-[var(--chip-navy-bg)] text-[var(--chip-navy-text)] border border-[var(--chip-navy-border)]',
    orange: 'bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)] border border-[var(--chip-orange-border)]',
    purple: 'bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)] border border-[var(--chip-orange-border)]',
    outline: 'border border-[var(--border-subtle)] text-[var(--text-secondary)] bg-[var(--surface-soft)]',
    gray: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
