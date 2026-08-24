// src/app/projects/[slug]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useProjectBySlug } from '@/lib/api/hooks/useProjects';
import { Skeleton } from '@/components/ui/Skeleton';

export const runtime = 'edge';
export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: project, isLoading } = useProjectBySlug(slug);

  if (isLoading) {
    return (
      <Container size="lg" className="py-16">
        <Skeleton className="h-96 w-full" />
      </Container>
    );
  }

  if (!project) {
    return (
      <Container size="lg" className="py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
        <Link href="/projects">
          <Button variant="primary">Back to Projects</Button>
        </Link>
      </Container>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-[#123B5D]/40 to-transparent">
        <Container size="lg">
          <div className="space-y-4 max-w-3xl">
            <Link href="/projects" className="text-xs font-semibold text-emerald-400 hover:underline">
              ← Back to Projects Portfolio
            </Link>
            <div className="flex items-center space-x-3">
              <Badge variant="green">{project.category.replace('-', ' ').toUpperCase()}</Badge>
              <span className="text-xs text-slate-400">Client: {project.client}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">{project.title}</h1>
            <p className="text-slate-300 text-base leading-relaxed">{project.description}</p>
          </div>
        </Container>
      </section>

      {/* Details */}
      <section>
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Impact Card */}
              <Card variant="glass" className="p-6 space-y-3 border-l-4 border-l-[#16A36A]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivered Impact</h3>
                <div className="text-3xl font-extrabold text-white">{project.impact.value}</div>
                <p className="text-xs text-slate-300">{project.impact.description}</p>
              </Card>

              {/* Technologies */}
              <Card variant="solid" className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-white">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-emerald-300">
                      {t}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar CTA */}
            <div>
              <Card variant="glass" className="p-6 space-y-4 sticky top-28">
                <h3 className="text-xl font-bold text-white">Need a Similar Solution?</h3>
                <p className="text-xs text-slate-300">
                  Our youth-led team can build a custom application tailored for your goals.
                </p>
                <Link href="/contact" className="block w-full">
                  <Button variant="accent" className="w-full">
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
