'use client';

import React, { useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

    const focusable = getFocusable();
    (focusable[0] ?? dialogRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm transition-opacity cursor-default"
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
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
            <h3 id={titleId} className="text-lg sm:text-xl font-bold text-[var(--text-primary)] pr-2">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="gb-touch-target p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors ml-auto cursor-pointer flex-shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
