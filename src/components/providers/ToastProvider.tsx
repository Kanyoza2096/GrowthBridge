'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}

// ---------------------------------------------------------------------------
// Toast variant styles — uses CSS custom properties so they respect the theme
// ---------------------------------------------------------------------------
const toastStyles: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: 'border-l-4 border-emerald-500 bg-[var(--card-surface)] text-[var(--text-primary)]',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  error: {
    container: 'border-l-4 border-red-500 bg-[var(--card-surface)] text-[var(--text-primary)]',
    icon: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
  info: {
    container: 'border-l-4 border-blue-500 bg-[var(--card-surface)] text-[var(--text-primary)]',
    icon: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  warning: {
    container: 'border-l-4 border-amber-500 bg-[var(--card-surface)] text-[var(--text-primary)]',
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Clear the timer if it exists
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = generateId();
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ type: 'success', title, message }),
    [toast]
  );

  const error = useCallback(
    (title: string, message?: string) => toast({ type: 'error', title, message }),
    [toast]
  );

  const info = useCallback(
    (title: string, message?: string) => toast({ type: 'info', title, message }),
    [toast]
  );

  const warning = useCallback(
    (title: string, message?: string) => toast({ type: 'warning', title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const styles = toastStyles[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border border-[var(--card-border)] shadow-xl flex items-start gap-3 transition-all duration-300 animate-slide-up ${styles.container}`}
              role="alert"
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${styles.icon}`}
              >
                {toastIcons[t.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm flex-shrink-0 cursor-pointer transition-colors duration-150"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
