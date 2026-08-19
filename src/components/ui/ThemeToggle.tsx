'use client';

import React, { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'outline';
  className?: string;
  showLabel?: boolean;
}

/**
 * Professional sun ⇄ moon toggle with a smooth icon cross-fade.
 * Follows Growthbridge's color tokens so it blends with both modes.
 */
export function ThemeToggle({
  size = 'md',
  variant = 'ghost',
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, isUserChosen } = useTheme();
  const [pressed, setPressed] = useState(false);

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-[18px] h-[18px]',
    lg: 'w-5 h-5',
  };

  const variants = {
    ghost:
      'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]',
    solid:
      'bg-[var(--surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--text-accent)]',
    outline:
      'border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]',
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => {
        setPressed(true);
        window.setTimeout(() => setPressed(false), 420);
        toggleTheme();
      }}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={
        isDark
          ? `Switch to light theme${isUserChosen ? '' : ' (currently following system — light)'}`
          : `Switch to dark theme${isUserChosen ? '' : ' (currently following system — dark)'}`
      }
      className={cn(
        'theme-toggle group relative inline-flex items-center gap-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface-page)] cursor-pointer disabled:opacity-50',
        pressed && 'scale-90',
        sizes[size],
        variants[variant],
        className
      )}
    >
      <span
        className={cn(
          'relative inline-grid place-items-center',
          iconSizes[size]
        )}
        aria-hidden
      >
        {/* Sun */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'theme-toggle-icon col-start-1 row-start-1 absolute inset-0 m-auto',
            iconSizes[size],
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100',
            'group-hover:[transform:rotate(25deg)]'
          )}
          style={{
            transition:
              'transform .38s cubic-bezier(.4,.2,.2,1), opacity .24s ease',
          }}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>

        {/* Moon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'theme-toggle-icon col-start-1 row-start-1 absolute inset-0 m-auto',
            iconSizes[size],
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          )}
          style={{
            transition:
              'transform .38s cubic-bezier(.4,.2,.2,1), opacity .24s ease',
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {showLabel && (
        <span className="hidden sm:inline text-xs font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
