'use client';

import React from 'react';
import type { Project } from '@/lib/types/project';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GrowthbridgeVisual } from '@/components/brand/GrowthbridgeVisual';


export default function ProjectDetailPage(props: { project: Project }) {
  const project = props.project;
  if (!project) return null;

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 sm:pb-20">
      <section className="py-8 sm:py-12 bg-gradient-to-b from-[var(--gb-brand-navy)]/40 to-transparent">
        <Container size="lg">
          <div className="space-y-4 max-w-4xl">
            <Link
              href="/projects"
              className="inline-flex items-center min-h-10 text-xs font-semibold text-[var(--text-accent)] hover:underline"
            >
              ← Back to Projects Portfolio
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="green">{project.category.replace('-', ' ').toUpperCase()}</Badge>
              <span className="text-xs text-[var(--text-secondary)]">Client: {project.client}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] leading-tight">
              {project.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>
            <div className="mt-7 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] aspect-[16/8]">
              {project.image ? (
                <img src={project.image} alt={`${project.title} project`} className="h-full w-full object-cover" loading="eager" decoding="async" />
              ) : (
                <GrowthbridgeVisual compact label={`${project.title} Growthbridge project visual`} className="h-full" />
              )}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <Card variant="glass" className="p-4 sm:p-6 space-y-3 border-l-4 border-l-[var(--gb-brand-green)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-accent)]">
                  Outcome & Impact
                </h3>
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {project.impact?.value}
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{project.impact?.description}</p>
              </Card>

              <Card variant="solid" className="p-4 sm:p-6 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Delivery Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(project.technologies || []).map((t: string) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-accent)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card variant="glass" className="p-4 sm:p-6 space-y-4 lg:sticky lg:top-28">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                  Need a Similar Solution?
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Our youth-led team can build a custom application tailored for your goals.
                </p>
                <Link href="/contact" className="block w-full">
                  <Button variant="accent" fullWidth>
                    Start Your Project
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
