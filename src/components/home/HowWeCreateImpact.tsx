'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function HowWeCreateImpact() {
  const steps = [
    {
      step: '01',
      title: 'Skills Development',
      description:
        'We identify talented young individuals and nurture their capabilities through rigorous bootcamps, practical mentorship, and hands-on projects.',
      tag: 'Youth Empowerment',
    },
    {
      step: '02',
      title: 'Digital Solutions',
      description:
        'Our developers and designers engineer enterprise-grade web applications, mobile platforms, and business tools for organizations.',
      tag: 'Enterprise Execution',
    },
    {
      step: '03',
      title: 'Sustainable Growth',
      description:
        'We enable businesses to scale digitally while providing fair revenue and long-term career growth for youth creators.',
      tag: 'Economic Value',
    },
    {
      step: '04',
      title: 'Stronger Communities',
      description:
        'Profits and knowledge are reinvested into community tech hubs, digital literacy programs, and grass-roots initiatives.',
      tag: 'Social Transformation',
    },
  ];

  return (
    <section className="public-section py-20 sm:py-24 relative bg-[var(--surface-page)]">
      <Container size="lg">
        <SectionHeading
          badge="Impact Engine"
          badgeVariant="purple"
          title="How We Create Lasting Impact"
          subtitle="Our 4-step impact lifecycle bridges skill gaps and creates economic opportunities across Africa."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((item, idx) => (
            <ScrollReveal key={item.step} delay={idx * 150}>
              <div className="relative p-5 sm:p-6 rounded-2xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4 h-full flex flex-col justify-between group hover:border-[var(--border-accent)] transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-[var(--text-tertiary)] group-hover:text-[var(--text-accent)] transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 sm:px-2.5 sm:py-1 rounded-full bg-[var(--chip-green-bg)] text-[var(--chip-green-text)] border border-[var(--border-subtle)] whitespace-nowrap">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="w-full h-1 bg-gradient-brand rounded-full opacity-40 group-hover:opacity-100 transition-opacity mt-4" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
