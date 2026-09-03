'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useServices } from '@/lib/api/hooks/useServices';
import { Skeleton } from '@/components/ui/Skeleton';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export function ServicesPreview() {
  const { data: services, isLoading } = useServices();

  return (
    <section className="public-section py-20 sm:py-24 relative bg-[var(--surface-page)]">
      <Container size="lg">
        <SectionHeading
          badge="What We Do"
          badgeVariant="green"
          title="Five Divisions, One Shared Mission"
          subtitle="Our integrated framework delivers end-to-end digital, business, talent, community, and event solutions."
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : !services || services.length === 0 ? (
          <PublicEmptyState
            title="Service divisions are being refreshed"
            description="Verified service information will appear here when the public data service is available."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.id} delay={index * 100}>
                <Card variant="glass" hoverEffect className="h-full flex flex-col justify-between group p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                        <span className="font-bold text-lg">0{service.order}</span>
                      </div>
                      <Badge variant={index % 2 === 0 ? 'green' : 'orange'} className="text-[10px]">
                        {service.division.toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs font-semibold text-[var(--chip-green-text)]">
                      {service.tagline}
                    </p>

                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features list bullet preview */}
                    <ul className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                      {service.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center text-xs text-[var(--text-secondary)]">
                          <svg className="w-3.5 h-3.5 text-[var(--gb-green-600)] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center text-xs font-bold text-[var(--text-accent)] hover:text-[var(--text-primary)] transition-colors group/link"
                    >
                      <span>Explore Division</span>
                      <svg className="w-4 h-4 ml-1.5 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
