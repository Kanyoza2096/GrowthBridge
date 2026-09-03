'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/components/providers/ThemeProvider';
import { BrandMark, BrandWordmark } from '@/components/brand/BrandMark';
import { mainNavigation } from '@/lib/constants/navigation';
import { MobileNav } from './MobileNav';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  // Transparent chrome with light text ONLY on dark theme over dark hero bands.
  // In light theme we always use a solid nav so GROWTH/nav links stay readable.
  const onDarkHeroPage =
    pathname === '/' ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/services/');

  const solidNav = isScrolled || !isDarkTheme || !onDarkHeroPage;
  const overDarkHero = !solidNav;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
          solidNav
            ? 'bg-[var(--nav-bg)]/95 backdrop-blur-xl border-b border-[var(--nav-border)] shadow-[var(--nav-shadow)] py-2.5'
            : 'bg-transparent py-4'
        )}
      >
        <Container size="lg">
          <div className="flex items-center justify-between">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Bridge mark — navy / green / orange matching brand board */}
              <div
                className="w-10 h-10 rounded-xl bg-[var(--surface-page)] border border-[var(--border-subtle)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                aria-hidden
              >
                <BrandMark className="w-8 h-8" />
              </div>
              <div className="flex flex-col min-w-0">
                <BrandWordmark
                  className="text-lg sm:text-xl leading-none group-hover:opacity-90 transition-opacity"
                  onDark={overDarkHero}
                />
                <span className={cn('hidden sm:inline text-[10px] uppercase tracking-widest mt-0.5 font-semibold', overDarkHero ? 'text-white/70' : 'text-[var(--text-tertiary)]')}>
                  Bridging Skills. Driving Growth.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1">
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
                          'flex items-center space-x-1 px-2.5 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-xl transition-colors cursor-pointer',
                          isActive
                            ? overDarkHero
                              ? 'bg-white/15 text-white'
                              : 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                            : overDarkHero
                            ? 'text-white/85 hover:text-white hover:bg-white/10'
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
                      'flex items-center space-x-1 px-2.5 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-xl transition-colors',
                      isActive
                        ? overDarkHero
                          ? 'bg-white/15 text-white'
                          : 'bg-[var(--chip-green-bg)] text-[var(--chip-green-text)]'
                        : overDarkHero
                            ? 'text-white/85 hover:text-white hover:bg-white/10'
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
            <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
              <ThemeToggle size="md" variant="ghost" />
              <CommandPalette />
              
              {/* Staff Login Link - Added */}
              <Link
                href="/admin/login"
                className={cn('text-xs font-semibold px-2 py-2 transition-colors', overDarkHero ? 'text-white/70 hover:text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]')}
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
            <div className="md:hidden flex items-center gap-1.5">
              <ThemeToggle size="sm" variant="ghost" />
              <button
                onClick={() => setMobileNavOpen(true)}
                className={cn('gb-touch-target p-2.5 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center', overDarkHero ? 'text-white hover:bg-white/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]')}
                aria-label="Open Mobile Menu"
                aria-expanded={mobileNavOpen}
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
