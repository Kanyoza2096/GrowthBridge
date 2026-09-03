'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useBlogPosts } from '@/lib/api/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="public-page space-y-10 sm:space-y-16 pb-16 sm:pb-20">
      {/* Hero */}
      <section className="public-page-hero py-12 sm:py-16 md:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="purple" className="uppercase tracking-widest text-[10px]">
              Knowledge Hub
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Insights & <span className="text-gradient-gb">Impact Stories</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Read our latest articles on youth technology, digital transformation,
              community building, and entrepreneurship across Africa.
            </p>
          </div>
        </Container>
      </section>

      {/* Grid */}
      <section>
        <Container size="lg">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 w-full" />
              ))}
            </div>
          ) : !posts || posts.length === 0 ? (
            <PublicEmptyState
              title="Insights are being refreshed"
              description="Our latest articles and impact stories will appear here as soon as published content is available."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {posts.map((post, idx) => (
                <ScrollReveal key={post.id} delay={idx * 100}>
                  <Card
                    variant="glass"
                    className="public-card h-full flex flex-col justify-between p-4 sm:p-6 space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="green" className="text-[10px]">
                          {post.category.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {post.readTime} min read
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--action-primary)] flex items-center justify-center text-xs font-bold text-[var(--action-primary-text)]">
                          {post.author.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">
                            {post.author.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">
                            {formatDate(post.publishedAt)}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-[var(--text-link)] hover:text-[var(--text-link-hover)] transition-colors"
                      >
                        Read Article →
                      </Link>
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
