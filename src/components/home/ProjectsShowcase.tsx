'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useProjects } from '@/lib/api/hooks/useProjects';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProjectsShowcase() {
  const { data: projects, isLoading } = useProjects();
  const featuredProjects = projects?.filter((p) => p.featured).slice(0, 3) || [];

  return (
    <section className="py-20 bg-[var(--surface-soft)] relative">
      <Container size="lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            badge="Featured Work"
            badgeVariant="blue"
            title="Real Projects, Measurable Impact"
            subtitle="Explore how our youth-led teams deliver enterprise applications and social programs."
            align="left"
            className="mb-0 max-w-2xl"
          />

          <Link href="/projects" className="mt-6 md:mt-0">
            <Button variant="outline" size="md">
              View All Projects
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 150}>
                <Card variant="glass" className="h-full flex flex-col justify-between group p-0 overflow-hidden">
                  {/* Decorative Banner Header */}
                  <div className="h-44 bg-[var(--gradient-brand)] p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                      <Badge variant="green" className="text-[10px]">
                        {project.category.replace('-', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs font-semibold text-white/85">
                        {project.client}
                      </span>
                    </div>

                    <div className="z-10">
                      <span className="text-xs font-bold text-white/70">IMPACT METRIC</span>
                      <div className="text-2xl font-extrabold text-white">
                        {project.impact.value} <span className="text-xs font-normal text-white/70">({project.impact.metric})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center text-xs font-bold text-[var(--text-accent)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <span>View Project Case Study</span>
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
  );
}
