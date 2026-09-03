'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function WhyGrowthbridge() {
  const values = [
    {
      title: 'Integrity',
      description:
        'Uncompromising honesty and ethical standards in everything we build and deliver. We honor our commitments to clients, communities, and team members.',
      icon: '01',
    },
    {
      title: 'Excellence & Impact',
      description:
        'Delivering enterprise-grade solutions while measuring success by real-world social impact and economic empowerment created for African youth.',
      icon: '02',
    },
    {
      title: 'Innovation',
      description:
        'Pioneering modern tech stacks, AI capabilities, and creative problem-solving methods to stay ahead of industry demands.',
      icon: '03',
    },
    {
      title: 'Collaboration',
      description:
        'Building strong bridges between youth talent, enterprise partners, government bodies, and local community initiatives.',
      icon: '04',
    },
  ];

  return (
    <section className="public-section py-20 sm:py-24 bg-[var(--surface-soft)] relative">
      <Container size="lg">
        <SectionHeading
          badge="Core Values"
          badgeVariant="orange"
          title="Why Partner With Growthbridge?"
          subtitle="Built on strong principles that guarantee technical excellence, social responsibility, and continuous growth."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {values.map((val, idx) => (
            <ScrollReveal key={val.title} delay={idx * 100}>
              <Card variant="solid" className="h-full group hover:border-[var(--border-accent)]">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:space-x-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--chip-green-bg)] border border-[var(--border-subtle)] flex items-center justify-center text-sm sm:text-base font-black tracking-wider text-[var(--text-accent)] group-hover:scale-105 transition-transform flex-shrink-0">
                    {val.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                      {val.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
