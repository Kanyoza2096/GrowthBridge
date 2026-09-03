'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useProjects } from '@/lib/api/hooks/useProjects';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ProjectCategory } from '@/lib/types';
import { GrowthbridgeVisual } from '@/components/brand/GrowthbridgeVisual';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'web-development', label: 'Web Development' },
    { key: 'mobile-app', label: 'Mobile Apps' },
    { key: 'branding', label: 'Branding' },
    { key: 'training', label: 'Training' },
    { key: 'events', label: 'Events' },
  ];

  const filteredProjects =
    selectedCategory === 'all'
      ? projects
      : projects?.filter((p) => p.category === selectedCategory);

  return (
    <div className="public-page space-y-10 sm:space-y-16 pb-16 sm:pb-20">
      {/* Hero */}
      <section className="public-page-hero py-12 sm:py-16 md:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="blue" className="uppercase tracking-widest text-[10px]">
              Portfolio & Case Studies
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Our <span className="text-gradient-gb">Projects Portfolio</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Explore how Growthbridge empowers youth developers and consultants to build
              production-grade web applications, digital solutions, and community training
              programs.
            </p>
          </div>
        </Container>
      </section>

      {/* Filter Tabs & Grid */}
      <section>
        <Container size="lg">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] shadow-lg shadow-[var(--action-primary)]/20'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : !filteredProjects || filteredProjects.length === 0 ? (
            <PublicEmptyState
              title="No published projects yet"
              description="Published case studies will appear here as projects are approved for the public portfolio."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredProjects.map((project, idx) => (
                <ScrollReveal key={project.id} delay={idx * 100}>
                  <Card
                    variant="glass"
                    className="public-card h-full flex flex-col justify-between p-0 overflow-hidden group"
                  >
                    {/* Banner */}
                    <div className="relative h-52 overflow-hidden">
                      <GrowthbridgeVisual compact className="h-full min-h-0 rounded-none border-0 shadow-none" label={`${project.title} — Growthbridge project visual`} />
                      <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                        <Badge variant="green" className="text-[10px]">{project.category.replace('-', ' ').toUpperCase()}</Badge>
                        <span className="text-xs font-medium text-white/75">{project.client}</span>
                      </div>
                      <div className="absolute inset-x-4 bottom-4">
                        <span className="text-[10px] font-bold text-[var(--gb-green-300)] uppercase tracking-wider">Key Impact</span>
                        <div className="text-xl font-bold text-white">{project.impact.value} <span className="text-xs font-normal text-white/60">({project.impact.metric})</span></div>
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded text-[9px] bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/projects/${project.slug}`}
                          className="inline-flex items-center text-xs font-bold text-[var(--text-link)] hover:text-[var(--text-link-hover)] transition-colors"
                        >
                          <span>Read Full Case Study</span>
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
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
