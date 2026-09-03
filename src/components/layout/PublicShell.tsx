'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AIAssistantButton } from '@/components/shared/AIAssistantButton';

/**
 * Renders the public marketing chrome (header / footer / assistant).
 * Admin routes use their own layout and must not inherit this shell.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="public-site">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Header />
      <main id="main-content" className="flex-1 pt-24">{children}</main>
      <Footer />
      <AIAssistantButton />
    </div>
  );
}
