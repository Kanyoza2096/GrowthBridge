'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function CTASection() {
  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <Container size="lg">
        <ScrollReveal>
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[var(--gb-navy-800)] via-[var(--gb-navy-900)] to-[var(--gb-green-600)] p-6 sm:p-10 md:p-14 border border-white/10 shadow-2xl overflow-hidden text-center space-y-5 sm:space-y-6">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gb-green-600)]/20 blur-3xl rounded-full pointer-events-none" />

            <span className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-[var(--gb-green-300)] text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Let&apos;s Build Together
            </span>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
              Have a Problem That Needs a Solution? Let&apos;s Build the Bridge.
            </h2>

            <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Whether you need software engineering, strategic brand consulting, youth talent
              sourcing, or community impact programs — Growthbridge is your trusted execution
              partner.
            </p>

            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/contact?type=partnership" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
