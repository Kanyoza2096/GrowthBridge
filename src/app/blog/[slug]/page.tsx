import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import ClientBlogDetail from './ClientBlogDetail';
import { BlogRepository } from '@/repositories/blog.repository';

export const runtime = 'edge';

const repo = new BlogRepository();
const getBlogRepositoryBySlug = cache((slug: string) => repo.getBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getBlogRepositoryBySlug(slug);
    if (!post) return { title: 'Article Not Found | Growthbridge' };
    return {
      title: `${post.title} | Growthbridge`,
      description: post.excerpt,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author.name],
        images: post.image ? [{ url: post.image }] : undefined,
      },
      twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
    };
  } catch {
    return { title: 'Knowledge Hub | Growthbridge' };
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogRepositoryBySlug(slug);
  if (!post) notFound();
  return <ClientBlogDetail post={post} />;
}
