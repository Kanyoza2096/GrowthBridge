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
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-[var(--gb-navy-800)]/30 via-transparent to-transparent">
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
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredProjects?.map((project, idx) => (
                <ScrollReveal key={project.id} delay={idx * 100}>
                  <Card
                    variant="glass"
                    className="h-full flex flex-col justify-between p-0 overflow-hidden group"
                  >
                    {/* Banner */}
                    <div className="h-44 bg-[var(--gradient-brand)] p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <Badge variant="green" className="text-[10px]">
                          {project.category.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-white/70">{project.client}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[var(--gb-green-300)] uppercase tracking-wider">
                          Key Impact
                        </span>
                        <div className="text-xl font-bold text-white">
                          {project.impact.value}{' '}
                          <span className="text-xs font-normal text-white/60">
                            ({project.impact.metric})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
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
