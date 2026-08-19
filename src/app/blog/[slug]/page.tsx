'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBlogPostBySlug } from '@/lib/api/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';

// ─── ADD THIS LINE ──────────────────────────────────────────────────────
export const runtime = 'edge';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: post, isLoading } = useBlogPostBySlug(slug);

  if (isLoading) {
    return (
      <Container size="lg" className="py-16">
        <Skeleton className="h-96 w-full" />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container size="lg" className="py-16 text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Article Not Found</h1>
        <Link href="/blog">
          <Button variant="primary">Back to Knowledge Hub</Button>
        </Link>
      </Container>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-[#123B5D]/40 to-transparent">
        <Container size="sm">
          <div className="space-y-4">
            <Link href="/blog" className="text-xs font-semibold text-emerald-400 hover:underline">
              ← Back to Blog & Knowledge Hub
            </Link>
            <div className="flex items-center space-x-3">
              <Badge variant="green">{post.category.toUpperCase()}</Badge>
              <span className="text-xs text-slate-400">{post.readTime} min read</span>
              <span className="text-xs text-slate-400">• {formatDate(post.publishedAt)}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white">{post.title}</h1>

            <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#16A36A] flex items-center justify-center font-bold text-white">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{post.author.name}</p>
                <p className="text-xs text-slate-400">{post.author.role}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <section>
        <Container size="sm">
          <Card variant="glass" className="p-8 space-y-6 text-slate-300 text-sm leading-relaxed">
            <p className="text-base font-medium text-slate-100">{post.excerpt}</p>
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <p>{post.content}</p>
              <p>
                At Growthbridge Virtual Organization, our mission is to empower young talent through real-world software engineering, strategy execution, and digital transformation. As we scale across African markets, youth innovation remains at the absolute core of our culture.
              </p>
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                  #{t}
                </span>
              ))}
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
}
