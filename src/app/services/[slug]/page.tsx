import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClientServiceDetail from './ClientServiceDetail';
import { ServicesRepository } from '@/repositories/services.repository';

export const runtime = 'edge';
const repo = new ServicesRepository();
const getServicesRepositoryBySlug = cache((slug: string) => repo.getBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const service = await getServicesRepositoryBySlug(slug);
    if (!service) return { title: 'Service Not Found | Growthbridge' };
    return {
      title: `${service.title} | Growthbridge Services`,
      description: service.tagline || service.description,
      alternates: { canonical: `/services/${service.slug}` },
      openGraph: {
        title: service.title,
        description: service.tagline || service.description,
        type: 'website',
        images: service.image ? [{ url: service.image }] : undefined,
      },
      twitter: { card: 'summary_large_image', title: service.title, description: service.tagline || service.description },
    };
  } catch {
    return { title: 'Services | Growthbridge' };
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServicesRepositoryBySlug(slug);
  if (!service) notFound();
  return <ClientServiceDetail service={service} />;
}
