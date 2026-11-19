'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';
import { useFAQs } from '@/lib/api/hooks/useFAQs';

export default function FAQPage() {
  const { data: faqs, isLoading, isError, refetch, isFetching } = useFAQs();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set((faqs ?? []).map((faq) => faq.category))).sort((a, b) => a.localeCompare(b))],
    [faqs]
  );

  const filteredFAQs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (faqs ?? []).filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch = !query || [faq.question, faq.answer, faq.category].some((value) => value.toLocaleLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, activeCategory]);

  const groupedFAQs = useMemo(() => {
    return filteredFAQs.reduce<Record<string, typeof filteredFAQs>>((groups, faq) => {
      (groups[faq.category] ??= []).push(faq);
      return groups;
    }, {});
  }, [filteredFAQs]);

  return (
    <main className="public-page pb-20">
      <section className="public-page-hero py-14 sm:py-18 md:py-24">
        <Container size="lg">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <Badge variant="green" className="mb-4 uppercase tracking-[.16em] text-[10px]">Help centre</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.04] text-[var(--text-primary)]">
              Clear answers. <span className="text-gradient-gb">Confident next steps.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
              Learn how Growthbridge works, explore our services and find the right way to start a conversation with our team.
            </p>
          </ScrollReveal>
        </Container>
      </section>

      <section className="-mt-5">
        <Container size="lg">
          <ScrollReveal>
            <Card variant="glass" className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--text-accent)]">Find what you need</p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Search frequently asked questions</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Search by topic, service or question.</p>
                </div>
                <Badge variant="blue">{faqs?.length ?? 0} published answers</Badge>
              </div>

              <div className="mt-5">
                <Input
                  label="Search the help centre"
                  type="search"
                  placeholder="For example: website development, partnerships, talent…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter questions by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-green-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)] ${
                      activeCategory === category
                        ? 'border-[var(--gb-green-600)] bg-[var(--gb-green-600)] text-white'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {category}
                    {category === 'All' ? ` (${faqs?.length ?? 0})` : ` (${faqs?.filter((faq) => faq.category === category).length ?? 0})`}
                  </button>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </Container>
      </section>

      <section className="pt-12 sm:pt-16">
        <Container size="lg">
          {isLoading ? (
            <div className="mx-auto max-w-4xl space-y-3" aria-label="Loading frequently asked questions" aria-busy="true">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : isError ? (
            <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-6 py-10 text-center" role="alert">
              <h2 className="text-lg font-extrabold text-[var(--text-primary)]">The help centre is temporarily unavailable</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Your connection may be interrupted. Please try again.</p>
              <Button className="mt-5" onClick={() => void refetch()} isLoading={isFetching}>Try again</Button>
            </div>
          ) : !faqs?.length ? (
            <PublicEmptyState
              title="Answers are being prepared"
              description="Our help centre is being updated. In the meantime, our team can help with your questions directly."
            />
          ) : filteredFAQs.length === 0 ? (
            <div className="mx-auto max-w-3xl py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-accent)]" aria-hidden="true">⌕</div>
              <h2 className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">No matching answers</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Try another search term or choose a different category.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Clear filters</Button>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--text-secondary)]" aria-live="polite">
                  Showing <strong className="text-[var(--text-primary)]">{filteredFAQs.length}</strong> {filteredFAQs.length === 1 ? 'answer' : 'answers'}
                </p>
                <button type="button" onClick={() => setOpenId(openId ? null : filteredFAQs[0]?.id ?? null)} className="text-xs font-bold text-[var(--text-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-green-600)] rounded">
                  {openId ? 'Close open answer' : 'Open first answer'}
                </button>
              </div>

              {Object.entries(groupedFAQs).map(([category, items]) => (
                <section key={category} aria-labelledby={`faq-category-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 id={`faq-category-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`} className="text-xs font-extrabold uppercase tracking-[.18em] text-[var(--text-tertiary)]">{category}</h2>
                    <span className="h-px flex-1 bg-[var(--border-subtle)]" />
                    <span className="text-xs tabular-nums text-[var(--text-tertiary)]">{items.length}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((faq, index) => {
                      const isOpen = openId === faq.id;
                      return (
                        <ScrollReveal key={faq.id} delay={Math.min(index, 5) * 55}>
                          <Card variant="glass" className={`p-0 transition-colors ${isOpen ? 'border-[var(--border-accent)]' : ''}`}>
                            <h3>
                              <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${faq.id}`}
                                onClick={() => setOpenId(isOpen ? null : faq.id)}
                                className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--gb-green-600)] sm:px-6"
                              >
                                <span className="font-bold leading-snug text-[var(--text-primary)]">{faq.question}</span>
                                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--border-subtle)] text-lg text-[var(--text-accent)] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
                              </button>
                            </h3>
                            <div id={`faq-answer-${faq.id}`} hidden={!isOpen} className="px-5 pb-5 sm:px-6">
                              <div className="border-t border-[var(--border-subtle)] pt-4 text-sm leading-7 text-[var(--text-secondary)] whitespace-pre-line">{faq.answer}</div>
                            </div>
                          </Card>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="pt-12 sm:pt-16">
        <Container size="lg">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border border-[var(--border-accent)] bg-[var(--surface-soft)] px-6 py-10 text-center sm:px-10 md:py-14">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[var(--gb-green-500)]/10 blur-3xl" />
              <Badge variant="orange">Still have a question?</Badge>
              <h2 className="relative mt-4 text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)]">Let’s talk about what you’re building.</h2>
              <p className="relative mx-auto mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">Tell us what you’re trying to achieve. We’ll help you explore the right next step.</p>
              <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact"><Button size="lg" fullWidth className="sm:w-auto">Start a conversation</Button></Link>
                <Link href="/services"><Button size="lg" variant="outline" fullWidth className="sm:w-auto">Explore services</Button></Link>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
