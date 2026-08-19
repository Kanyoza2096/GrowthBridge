'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { mainNavigation } from '@/lib/constants/navigation';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--nav-border)] shadow-[var(--nav-shadow)] py-3'
            : 'bg-transparent py-5'
        )}
      >
        <Container size="lg">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-[var(--gradient-brand)] flex items-center justify-center shadow-lg shadow-[var(--gb-green-600)]/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-primary)] group-hover:opacity-90 transition-opacity">
                  Growthbridge
                </span>
                <span className="text-[10px] uppercase tracking-widest -mt-1 font-semibold text-[var(--text-tertiary)]">
                  Bridging Skills. Driving Growth.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainNavigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));

                if (item.children) {
                  const isDropdownOpen = activeDropdown === item.label;

                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className={cn(
                          'flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer',
                          isActive
                            ? 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                        )}
                      >
                        <span>{item.label}</span>
                        <svg
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isDropdownOpen && 'rotate-180 text-[var(--text-accent)]'
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-64 pt-2 animate-[gb-fade-in_0.2s_var(--ease-out)_both]">
                          <div className="rounded-2xl bg-[var(--nav-dropdown-bg)] border border-[var(--nav-dropdown-border)] shadow-[var(--nav-dropdown-shadow)] p-2 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                className="block px-3.5 py-2.5 text-xs font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--chip-green-bg)] transition-colors"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors',
                      isActive
                        ? 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="orange" className="text-[9px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions: toggle → palette → staff login → CTA */}
            <div className="hidden lg:flex items-center space-x-2">
              <ThemeToggle size="md" variant="ghost" />
              <CommandPalette />
              
              {/* Staff Login Link - Added */}
              <Link
                href="/admin/login"
                className="text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] px-2 py-2 transition-colors"
              >
                Staff login
              </Link>
              
              <Link href="/contact">
                <Button size="sm" variant="accent">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile: toggle + hamburger */}
            <div className="lg:hidden flex items-center gap-1.5">
              <ThemeToggle size="sm" variant="ghost" />
              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
