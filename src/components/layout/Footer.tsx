'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { footerNavigation } from '@/lib/constants/navigation';
import { ImpactReportModal } from '@/components/shared/ImpactReportModal';
import { cn } from '@/lib/utils';

/**
 * Footer uses the navy band gradient — intentionally dark regardless of theme.
 * Uses CSS custom properties where available, falls back to navy hex values.
 */
export function Footer() {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      <footer className="pt-16 pb-12 bg-[var(--gradient-footer)] text-[var(--text-on-dark)] border-t border-white/10">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--gradient-brand)] flex items-center justify-center">
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
                <span className="font-extrabold text-xl text-white">Growthbridge</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-sm text-white/65">
                Youth-led. Technology-driven. Community-focused. Growthbridge Virtual
                Organization bridges youth skills with enterprise digital solutions.
              </p>

              {/* Impact Report Card */}
              <div className="p-3.5 rounded-2xl max-w-sm space-y-2 bg-[var(--chip-navy-bg)] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-orange-300)]">
                    2026 Impact Report
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--chip-success-bg)] text-[var(--chip-success-text)] font-bold">
                    FREE PDF
                  </span>
                </div>
                <p className="text-xs font-semibold text-white">
                  The State of Youth Digital Innovation in Africa
                </p>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-xs font-bold text-[var(--gb-green-400)] hover:text-[var(--gb-green-300)] transition-colors cursor-pointer"
                >
                  Download Free White Paper →
                </button>
              </div>
            </div>

            {/* Navigation Columns */}
            {[
              { title: 'Services', items: footerNavigation.services },
              { title: 'Organization', items: footerNavigation.quickLinks },
              {
                title: 'Resources',
                items: footerNavigation.resources,
              },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-white/65 hover:text-[var(--gb-green-400)] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  {/* Impact Report link in Resources column */}
                  {col.title === 'Resources' && (
                    <li>
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="text-white/65 hover:text-[var(--gb-green-400)] transition-colors cursor-pointer text-sm"
                      >
                        2026 Impact Report
                      </button>
                    </li>
                  )}
                  {/* Staff login link in Resources column */}
                  {col.title === 'Resources' && (
                    <li>
                      <Link
                        href="/admin/login"
                        className="text-white/65 hover:text-[var(--gb-green-400)] transition-colors"
                      >
                        Staff login
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>
              © {new Date().getFullYear()} Growthbridge Virtual Organization. All rights
              reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="hover:text-white/80 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white/80 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-white/80 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/admin/login"
                className="hover:text-white/80 transition-colors"
              >
                Staff login
              </Link>
            </div>
          </div>
        </Container>
      </footer>

      <ImpactReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </>
  );
}
