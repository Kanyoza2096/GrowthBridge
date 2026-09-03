'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { CountUp } from '@/components/shared/CountUp';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useStats } from '@/lib/api/hooks/useStats';

export function ImpactStats() {
  const { data: stats, isLoading, isError } = useStats();

  const statItems = [
    { label: 'Projects Completed', value: stats?.projectsCompleted ?? 0, suffix: '+' },
    { label: 'Youth Empowered', value: stats?.youthEmpowered ?? 0, suffix: '+' },
    { label: 'Communities Served', value: stats?.communitiesServed ?? 0, suffix: '' },
    { label: 'Client Satisfaction', value: stats?.clientSatisfaction ?? 0, suffix: '%' },
  ];

  const showUnavailable = isError && !stats;

  return (
    <section className="py-12 sm:py-14 bg-[var(--surface-soft)] border-y border-[var(--border-subtle)] relative">
      <Container size="lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
          {statItems.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 100}>
              <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                <div
                  className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-accent)]"
                  aria-live="polite"
                >
                  {isLoading ? (
                    <span className="inline-block h-10 sm:h-12 w-20 rounded-lg bg-[var(--skeleton-base)] animate-pulse" aria-label="Loading" />
                  ) : showUnavailable ? (
                    <span className="text-xl sm:text-2xl text-[var(--text-tertiary)]">—</span>
                  ) : (
                    <CountUp end={item.value} suffix={item.suffix} />
                  )}
                </div>
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  {item.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        {showUnavailable && (
          <p className="mt-6 text-center text-xs sm:text-sm text-[var(--text-tertiary)]" role="status">
            Impact metrics are temporarily unavailable. We&apos;ll show verified figures here when the data service is restored.
          </p>
        )}
      </Container>
    </section>
  );
}
