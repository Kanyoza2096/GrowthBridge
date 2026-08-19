import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'gradient';
  hoverEffect?: boolean;
}

export function Card({
  children,
  variant = 'glass',
  hoverEffect = false,
  className,
  ...props
}: CardProps) {
  const variants: Record<NonNullable<CardProps['variant']>, string> = {
    glass:
      'bg-[var(--card-surface)] border border-[var(--card-border)] text-[var(--text-primary)] shadow-[var(--card-shadow)]',
    solid:
      'bg-[var(--chip-navy-bg)] border border-[var(--border-brand)] text-[var(--text-primary)]',
    gradient:
      'bg-[var(--gradient-brand)] border border-white/10 text-white',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-md',
        variants[variant],
        hoverEffect && 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pb-4 border-b border-[var(--border-subtle)] space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-bold text-[var(--text-primary)] leading-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[var(--text-secondary)] leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
