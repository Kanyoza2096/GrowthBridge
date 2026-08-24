import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] placeholder-[var(--form-placeholder)] px-4 py-3 text-sm transition-colors duration-200',
              'focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)]',
              'hover:border-[var(--form-border-hover)]',
              leftIcon && 'pl-10',
              error && 'border-[var(--form-error)] focus:border-[var(--form-error)] focus:ring-[var(--form-error)]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--form-error)] mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
