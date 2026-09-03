'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'gb-modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Box — bottom sheet on phones, centered card on larger screens */}
      <div
        className={cn(
          'relative w-full z-10',
          'max-h-[min(92dvh,100%)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto',
          'rounded-t-2xl sm:rounded-2xl',
          'bg-[var(--card-surface)] border border-[var(--border-subtle)]',
          'p-4 sm:p-6 shadow-2xl',
          'max-w-lg sm:mx-auto',
          'gb-safe-pb',
          'animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          {title && (
            <h3 id="gb-modal-title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)] pr-2">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="gb-touch-target p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors ml-auto cursor-pointer flex-shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
