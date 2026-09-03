'use client';

import React from 'react';
import type { BlogPost } from '@/lib/types/blog';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';


export default function BlogDetailPage(props: { post: BlogPost }) {
  const post = props.post;
  if (!post) return null;

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 sm:pb-20">
      <section className="py-8 sm:py-12 bg-gradient-to-b from-[var(--gb-brand-navy)]/40 to-transparent">
        <Container size="sm">
          <div className="space-y-4">
            <Link
              href="/blog"
              className="inline-flex items-center min-h-10 text-xs font-semibold text-[var(--text-accent)] hover:underline"
            >
              ← Back to Blog & Knowledge Hub
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant="green">{post.category.toUpperCase()}</Badge>
              <span className="text-xs text-[var(--text-secondary)]">{post.readTime} min read</span>
              <span className="text-xs text-[var(--text-secondary)]">• {formatDate(post.publishedAt)}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-[var(--gb-brand-green)] flex items-center justify-center font-bold text-white flex-shrink-0">
                {post.author.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{post.author.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{post.author.role}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container size="sm">
          <Card variant="glass" className="p-4 sm:p-6 md:p-8 space-y-6 text-[var(--text-secondary)] text-sm leading-relaxed">
            <p className="text-base font-medium text-[var(--text-primary)]">{post.excerpt}</p>
            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              <p className="whitespace-pre-wrap">{post.content}</p>
              <p>
                At Growthbridge Virtual Organization, our mission is to empower young talent through real-world software engineering, strategy execution, and digital transformation. As we scale across African markets, youth innovation remains at the absolute core of our culture.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap gap-2">
              {(post.tags || []).map((t: string) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-[var(--surface-soft)] text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                >
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
