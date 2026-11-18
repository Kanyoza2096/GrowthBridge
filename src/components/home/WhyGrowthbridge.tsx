'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function WhyGrowthbridge() {
  const values = [
    {
      title: 'Integrity',
      description:
        'Uncompromising honesty and ethical standards in everything we build and deliver. We honor our commitments to clients, communities, and team members.',
      number: '01',
    },
    {
      title: 'Excellence & Impact',
      description:
        'Delivering enterprise-grade solutions while measuring success by real-world social impact and economic empowerment created for African youth.',
      number: '02',
    },
    {
      title: 'Innovation',
      description:
        'Pioneering modern tech stacks, AI capabilities, and creative problem-solving methods to stay ahead of industry demands.',
      number: '03',
    },
    {
      title: 'Collaboration',
      description:
        'Building strong bridges between youth talent, enterprise partners, government bodies, and local community initiatives.',
      number: '04',
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
          {values.map((value, index) => (
            <ScrollReveal key={value.title} delay={index * 100}>
              <Card
                variant="glass"
                className="public-card h-full p-5 sm:p-7 md:p-8 space-y-5 group border-l-4 border-l-[var(--border-accent)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Badge
                    variant={index % 2 === 0 ? 'green' : 'orange'}
                    className="uppercase tracking-widest text-[10px]"
                  >
                    Core value
                  </Badge>
                  <span className="text-sm font-extrabold tracking-widest text-[var(--text-accent)]">
                    {value.number}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                    {value.title}
                  </h3>
                  <div className="h-px w-full bg-[var(--border-subtle)]" />
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
