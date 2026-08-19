'use client';

import React from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--surface-overlay)] backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs p-6 flex flex-col justify-between bg-[var(--surface-page)] border-l border-[var(--border-subtle)] shadow-2xl z-10 animate-[gb-slide-left_0.3s_var(--ease-out)_both]">
        {/* Top Section */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[var(--border-subtle)]">
            <span className="font-bold text-lg text-[var(--text-primary)]">
              Growthbridge Menu
            </span>
            <div className="flex items-center gap-1">
              <ThemeToggle size="sm" variant="ghost" />
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'block px-4 py-3 text-base font-semibold rounded-xl transition-colors',
                      isActive
                        ? 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                    )}
                  >
                    {item.label}
                  </Link>

                  {item.children && (
                    <div className="pl-6 space-y-1 my-1 ml-4 border-l border-[var(--border-subtle)]">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={onClose}
                          className="block px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
          <Link href="/contact" onClick={onClose} className="block w-full">
            <Button variant="accent" size="lg" className="w-full">
              Talk to Growthbridge
            </Button>
          </Link>
          
          {/* Staff Login Link - Added */}
          <Link
            href="/admin/login"
            onClick={onClose}
            className="block text-center text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors py-1"
          >
            Staff login
          </Link>
        </div>
      </div>
    </div>
  );
}
