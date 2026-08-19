'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { CountUp } from '@/components/shared/CountUp';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useStats } from '@/lib/api/hooks/useStats';

export function ImpactStats() {
  const { data: stats, isLoading } = useStats();

  const statItems = [
    { label: 'Projects Completed', value: stats?.projectsCompleted || 47, suffix: '+' },
    { label: 'Youth Empowered', value: stats?.youthEmpowered || 1200, suffix: '+' },
    { label: 'Communities Served', value: stats?.communitiesServed || 15, suffix: '' },
    { label: 'Client Satisfaction', value: stats?.clientSatisfaction || 98, suffix: '%' },
  ];

  return (
    <section className="py-12 sm:py-14 bg-[var(--surface-soft)] border-y border-[var(--border-subtle)] relative">
      <Container size="lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
          {statItems.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 100}>
              <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--text-accent)]">
                  {isLoading ? (
                    '...'
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
      </Container>
    </section>
  );
}
