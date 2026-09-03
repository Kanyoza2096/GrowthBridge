import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Stretch to full width of parent (useful for mobile stacked CTAs). */
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[var(--gb-green-600)] text-[var(--action-primary-text)] shadow-[0_10px_25px_-10px_var(--gb-green-600)] hover:bg-[var(--gb-green-700)] focus-visible:ring-[var(--gb-green-600)]',
  secondary:
    'bg-[var(--gb-navy-800)] text-white shadow-[0_10px_25px_-10px_var(--gb-navy-800)] hover:bg-[var(--gb-navy-900)] focus-visible:ring-[var(--gb-navy-800)]',
  accent:
    'bg-[var(--gb-orange-500)] text-[var(--gb-navy-900)] font-semibold shadow-[0_10px_25px_-10px_var(--gb-orange-500)] hover:bg-[var(--gb-orange-600)] focus-visible:ring-[var(--gb-orange-500)]',
  outline:
    'bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--surface-subtle)] focus-visible:ring-[var(--gb-green-600)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] focus-visible:ring-[var(--gb-green-600)]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  // min-h ensures ≥44px touch targets on mobile even for sm
  sm: 'min-h-10 px-3 py-2 text-xs gap-1.5 rounded-lg',
  md: 'min-h-11 px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'min-h-12 px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'cursor-pointer active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span className={cn(isLoading && 'opacity-70')}>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}
