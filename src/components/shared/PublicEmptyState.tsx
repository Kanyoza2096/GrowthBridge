import React from 'react';
import { cn } from '@/lib/utils';

interface PublicEmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

/** Non-blocking, branded fallback for public data sections when content is unavailable. */
export function PublicEmptyState({ title, description, className }: PublicEmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'public-empty-state rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-6 py-10 sm:px-8 sm:py-12 text-center',
        className
      )}
    >
      <div className="mx-auto mb-4 h-10 w-10 rounded-xl border border-[var(--border-accent)] bg-[var(--chip-green-bg)] grid place-items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--gb-green-600)]" aria-hidden="true" />
      </div>
      <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 mx-auto max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
