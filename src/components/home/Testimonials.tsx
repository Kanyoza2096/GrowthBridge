'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useTestimonials } from '@/lib/api/hooks/useStats';
import { Skeleton } from '@/components/ui/Skeleton';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export function Testimonials() {
  const { data: testimonials, isLoading } = useTestimonials();

  return (
    <section className="public-section py-20 sm:py-24 relative bg-[var(--surface-page)]">
      <Container size="lg">
        <SectionHeading
          badge="Testimonials"
          badgeVariant="green"
          title="What Partners & Graduates Say"
          subtitle="Real stories from business leaders, government officers, and young tech leaders empowered by Growthbridge."
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : !testimonials || testimonials.length === 0 ? (
          <PublicEmptyState
            title="Testimonials are being refreshed"
            description="Verified partner and graduate stories will appear here when published testimonials are available."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <ScrollReveal key={t.id} delay={idx * 150}>
                <Card variant="glass" hoverEffect className="h-full flex flex-col justify-between p-6 space-y-4">
                  <div className="space-y-3">
                    {/* Rating Stars */}
                    <div className="flex space-x-1 text-[var(--gb-orange-500)]">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-white text-sm">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{t.author}</h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {t.role}, <span className="text-[var(--chip-green-text)]">{t.organization}</span>
                      </p>
                    </div>
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
