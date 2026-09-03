import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClientPersonProfile from './ClientPersonProfile';
import { PeopleRepository } from '@/repositories/people.repository';

export const runtime = 'edge';
const repo = new PeopleRepository();
const getPublicPersonBySlug = cache((slug: string) => repo.getPublicBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const person = await getPublicPersonBySlug(slug);
    if (!person) return { title: 'Profile Not Found | Growthbridge' };
    return {
      title: `${person.fullName} — ${person.title} | Growthbridge`,
      description: person.shortBio || person.bio,
      alternates: { canonical: `/team/${person.slug}` },
      openGraph: {
        title: `${person.fullName} — ${person.title}`,
        description: person.shortBio || person.bio,
        type: 'profile',
        images: person.photo ? [{ url: person.photo }] : undefined,
      },
    };
  } catch {
    return { title: 'Team | Growthbridge' };
  }
}

export default async function PersonProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await getPublicPersonBySlug(slug);
  if (!person) notFound();
  return <ClientPersonProfile person={person} />;
}
