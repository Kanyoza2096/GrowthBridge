import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClientProjectDetail from './ClientProjectDetail';
import { ProjectsRepository } from '@/repositories/projects.repository';

export const runtime = 'edge';
const repo = new ProjectsRepository();
const getProjectsRepositoryBySlug = cache((slug: string) => repo.getBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await getProjectsRepositoryBySlug(slug);
    if (!project) return { title: 'Project Not Found | Growthbridge' };
    return {
      title: `${project.title} | Growthbridge Projects`,
      description: project.shortDescription || project.description,
      alternates: { canonical: `/projects/${project.slug}` },
      openGraph: {
        title: project.title,
        description: project.shortDescription || project.description,
        type: 'article',
        images: project.image ? [{ url: project.image }] : undefined,
      },
      twitter: { card: 'summary_large_image', title: project.title, description: project.shortDescription || project.description },
    };
  } catch {
    return { title: 'Projects Portfolio | Growthbridge' };
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectsRepositoryBySlug(slug);
  if (!project) notFound();
  return <ClientProjectDetail project={project} />;
}
