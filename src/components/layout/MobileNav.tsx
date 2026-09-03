'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNavigation } from '@/lib/constants/navigation';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--surface-overlay)] backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 w-full max-w-xs z-10',
          'flex flex-col bg-[var(--surface-page)] border-l border-[var(--border-subtle)] shadow-2xl',
          'pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]',
          'pl-6 pr-[max(1.5rem,env(safe-area-inset-right))]',
          'animate-[gb-slide-left_0.3s_var(--ease-out)_both]'
        )}
      >
        {/* Top Section */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <span className="font-bold text-lg text-[var(--text-primary)]">
            Growthbridge Menu
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle size="sm" variant="ghost" />
            <button
              onClick={onClose}
              className="gb-touch-target p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable nav */}
        <nav className="mt-4 flex-1 overflow-y-auto overscroll-contain space-y-1 pr-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'block px-4 py-3.5 text-base font-semibold rounded-xl transition-colors min-h-11',
                    isActive
                      ? 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                  )}
                >
                  {item.label}
                </Link>

                {item.children && (
                  <div className="pl-4 space-y-0.5 my-1 ml-3 border-l border-[var(--border-subtle)]">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={onClose}
                        className="block px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-10"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <div className="pt-5 border-t border-[var(--border-subtle)] space-y-3 flex-shrink-0">
          <Link href="/contact" onClick={onClose} className="block w-full">
            <Button variant="accent" size="lg" fullWidth>
              Talk to Growthbridge
            </Button>
          </Link>

          <Link
            href="/admin/login"
            onClick={onClose}
            className="block text-center text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors py-2 min-h-10"
          >
            Staff login
          </Link>
        </div>
      </div>
    </div>
  );
}
