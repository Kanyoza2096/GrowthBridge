'use client';

import React from 'react';
import type { Service } from '@/lib/types/service';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';


export default function ServiceDetailPage(props: { service: Service }) {
  const service = props.service;
  if (!service) return null;

  const features = service.features || [];
  const process = service.process || [];

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 sm:pb-20">
      <section className="py-8 sm:py-12 bg-gradient-to-b from-[var(--gb-brand-navy)]/40 to-transparent">
        <Container size="lg">
          <div className="space-y-4 max-w-3xl">
            <Link
              href="/services"
              className="inline-flex items-center min-h-10 text-xs font-semibold text-[var(--text-accent)] hover:underline"
            >
              ← Back to All Services
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {service.division && (
                <Badge variant="green">{String(service.division).toUpperCase()}</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] leading-tight">
              {service.title}
            </h1>
            {service.tagline && (
              <p className="text-sm sm:text-base font-semibold text-[var(--text-accent)]">
                {service.tagline}
              </p>
            )}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {service.description}
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Card variant="glass" className="p-4 sm:p-6 space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Capabilities & Deliverables
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature: string) => (
                    <div
                      key={feature}
                      className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex items-center min-h-11"
                    >
                      <span className="w-2 h-2 rounded-full bg-[var(--gb-brand-green)] mr-2.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {process.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    Execution Lifecycle
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {process.map((p: { step: number; title: string; description: string }) => (
                      <Card key={p.step} variant="solid" className="p-4 space-y-2">
                        <span className="text-xs font-bold text-[var(--text-accent)]">
                          STEP {String(p.step).padStart(2, '0')}
                        </span>
                        <h4 className="text-base font-bold text-[var(--text-primary)]">{p.title}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">{p.description}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card
                variant="solid"
                className="p-4 sm:p-6 space-y-4 border-[var(--gb-brand-green)]/50 lg:sticky lg:top-28"
              >
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Inquire About This Service
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Ready to deploy {service.title} for your organization? Get in touch with our division lead.
                </p>
                <Link href={`/contact?service=${service.slug}`} className="block w-full">
                  <Button variant="accent" fullWidth>
                    Request Consultation
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
