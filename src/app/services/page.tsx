'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useServices } from '@/lib/api/hooks/useServices';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProjectEstimator } from '@/components/shared/ProjectEstimator';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();

  return (
    <div className="public-page space-y-12 sm:space-y-20 pb-16 sm:pb-20">
      {/* Hero Header */}
      <section className="public-page-hero py-12 sm:py-16 md:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="green" className="uppercase tracking-widest text-[10px]">
              Services Ecosystem
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Enterprise Solutions Powered by{' '}
              <span className="text-gradient-gb">Youth Talent</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Explore Growthbridge&apos;s 5 core service divisions designed to take your
              digital products, business strategies, talent pipeline, and community impact
              to the next level.
            </p>
          </div>
        </Container>
      </section>

      {/* Interactive Project Cost Estimator */}
      <section>
        <Container size="lg">
          <ScrollReveal>
            <ProjectEstimator />
          </ScrollReveal>
        </Container>
      </section>

      {/* Services List */}
      <section>
        <Container size="lg">
          <SectionHeading
            badge="Divisions Breakdown"
            badgeVariant="blue"
            title="Our 5 Core Divisions"
            subtitle="Explore each specialized service division."
          />

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !services || services.length === 0 ? (
            <PublicEmptyState
              title="Service information is being refreshed"
              description="Our service divisions are temporarily unavailable. Please check back shortly or contact Growthbridge to discuss your needs."
            />
          ) : (
            <div className="space-y-12">
              {services.map((service, idx) => (
                <ScrollReveal key={service.id} delay={idx * 100}>
                  <Card
                    variant="glass"
                    className="public-card p-4 sm:p-6 md:p-8 space-y-6 group border-l-4 border-l-[var(--border-accent)]"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <Badge
                          variant={idx % 2 === 0 ? 'green' : 'orange'}
                          className="mb-2"
                        >
                          {service.division.toUpperCase()} DIVISION
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                          {service.title}
                        </h2>
                        <p className="text-xs font-semibold text-[var(--text-accent)] mt-1">
                          {service.tagline}
                        </p>
                      </div>

                      <Link href={`/services/${service.slug}`}>
                        <Button variant="primary" size="md">
                          View Details & Scope
                        </Button>
                      </Link>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Key Capabilities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.features.map((feat) => (
                            <div
                              key={feat}
                              className="flex items-center text-xs text-[var(--text-secondary)]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--action-primary)] mr-2 flex-shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Strategic Benefits
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.benefits.map((ben) => (
                            <div
                              key={ben}
                              className="flex items-center text-xs text-[var(--text-secondary)]"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gb-orange-400)] mr-2 flex-shrink-0" />
                              <span>{ben}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
