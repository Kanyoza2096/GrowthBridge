import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-xl bg-[var(--form-bg)] border border-[var(--form-border)] text-[var(--form-text)] placeholder-[var(--form-placeholder)] px-4 py-3 text-base sm:text-sm transition-colors duration-200',
            'focus:outline-none focus:border-[var(--form-border-focus)] focus:ring-1 focus:ring-[var(--form-border-focus)]',
            'hover:border-[var(--form-border-hover)]',
            'min-h-[120px] resize-y',
            error && 'border-[var(--form-error)] focus:border-[var(--form-error)] focus:ring-[var(--form-error)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--form-error)] mt-1">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
