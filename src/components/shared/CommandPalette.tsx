'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

interface CommandItem {
  title: string;
  category: string;
  href: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { title: 'Home Page', category: 'Navigation', href: '/' },
  { title: 'About Growthbridge', category: 'Navigation', href: '/about' },
  { title: 'Services', category: 'Navigation', href: '/services' },
  { title: 'Projects Portfolio', category: 'Navigation', href: '/projects' },
  { title: 'Talent Hub Marketplace', category: 'Navigation', href: '/talent-hub' },
  { title: 'Blog & Knowledge Hub', category: 'Navigation', href: '/blog' },
  { title: 'Contact & Partnerships', category: 'Navigation', href: '/contact' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setSearch('');
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors text-xs cursor-pointer"
      >
        <span>Quick Search...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[10px] font-mono text-[var(--text-secondary)]">
          Ctrl K
        </kbd>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-soft)]">
          <div className="relative">
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services, projects, talent, articles..."
              className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-placeholder)] focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-tertiary)]">
              No results found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.href)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--chip-green-bg)] flex items-center justify-between group transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {item.title}
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--surface-subtle)] text-[var(--text-accent)] border border-[var(--border-subtle)]">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[10px] text-[var(--text-tertiary)] flex items-center justify-between">
          <span>Navigate with mouse or enter key</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] font-mono text-[var(--text-secondary)]">
            ESC to close
          </kbd>
        </div>
      </Modal>
    </>
  );
}
