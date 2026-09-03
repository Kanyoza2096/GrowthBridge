'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePeople } from '@/lib/api/hooks/usePeople';
import { BackendUnavailable } from '@/components/shared/BackendUnavailable';
import { GrowthbridgeVisual } from '@/components/brand/GrowthbridgeVisual';
import {
  PERSON_CATEGORIES,
  PERSON_CATEGORY_LABELS,
  PERSON_CATEGORY_DESCRIPTIONS,
  type PersonCategory,
  type Person,
} from '@/lib/types/person';

export default function TeamPage() {
  const [selectedCategory, setSelectedCategory] = useState<PersonCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: people, isLoading, isError, error, refetch } = usePeople({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    onlyActive: true,
  });

  const filteredPeople = useMemo(() => {
    if (!people) return [];
    if (!searchQuery.trim()) return people;
    const q = searchQuery.toLowerCase().trim();
    return people.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.department && p.department.toLowerCase().includes(q)) ||
        (p.skills && p.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [people, searchQuery]);

  return (
    <div className="public-page min-h-screen pt-28 pb-20">
      {/* Hero Section */}
      <section className="public-page-hero relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--gb-green-600)/10_0%,_transparent_70%)] pointer-events-none" />
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="green" className="uppercase tracking-widest text-[11px] px-3 py-1">
              Ecosystem People & Leadership
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)]">
              The Mindset & Talent Behind Growthbridge
            </h1>
            <p className="text-lg sm:text-xl font-normal leading-relaxed text-[var(--text-secondary)]">
              Meet the core team, advisory leaders, board members, alumni fellows, partner
              delegates, and community contributors shaping digital opportunities across Africa.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-12 space-y-6">
            <div className="max-w-md mx-auto">
              <Input
                type="search"
                placeholder="Search by name, role, department, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--action-secondary)] text-[var(--action-secondary-text)] shadow-md'
                    : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                All Categories ({people?.length ?? 0})
              </button>
              {PERSON_CATEGORIES.map((cat) => {
                const count = people ? people.filter((p) => p.category === cat).length : 0;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] shadow-md'
                        : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {PERSON_CATEGORY_LABELS[cat]}
                    {selectedCategory === 'all' && count > 0 ? ` (${count})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Active Category Description */}
            {selectedCategory !== 'all' && (
              <p className="text-center text-xs italic max-w-xl mx-auto text-[var(--text-tertiary)]">
                {PERSON_CATEGORY_DESCRIPTIONS[selectedCategory]}
              </p>
            )}
          </div>
        </Container>
        <div className="mt-8 max-w-5xl mx-auto"><GrowthbridgeVisual compact label="Growthbridge people and opportunity visual" /></div>
      </section>

      {/* Main People Grid Content */}
      <section className="py-10">
        <Container size="lg">
          {isError ? (
            <BackendUnavailable
              error={error}
              context="load the Growthbridge People directory"
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 border animate-pulse space-y-4 bg-[var(--surface-soft)] border-[var(--border-subtle)]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--skeleton-base)] shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[var(--skeleton-base)] rounded w-3/4" />
                      <div className="h-3 bg-[var(--skeleton-base)] rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-12 bg-[var(--skeleton-base)] rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border bg-[var(--surface-soft)] border-[var(--border-subtle)]">
              <div className="w-12 h-12 rounded-full mx-auto grid place-items-center mb-3 text-sm font-black bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)]">
                0
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                No People Found
              </h3>
              <p className="text-sm mt-1 max-w-sm mx-auto text-[var(--text-secondary)]">
                We couldn&apos;t find anyone matching your current category or search filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPeople.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

function PersonCard({ person }: { person: Person }) {
  const initials = person.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="group relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 bg-[var(--surface-soft)] border-[var(--border-subtle)]">
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.fullName}
                className="w-14 h-14 rounded-2xl object-cover border-2 shadow-sm"
                style={{ borderColor: 'var(--border-accent)' }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl grid place-items-center font-bold text-lg text-white shadow-md bg-gradient-brand">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-lg group-hover:text-[var(--text-accent)] transition-colors text-[var(--text-primary)]">
                {person.fullName}
              </h3>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {person.title}
              </p>
              {person.department && (
                <p className="text-[11px] font-semibold text-[var(--text-accent)]">
                  {person.department}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant={
              person.category === 'team'
                ? 'green'
                : person.category === 'advisor'
                ? 'orange'
                : person.category === 'board'
                ? 'blue'
                : 'gray'
            }
            className="text-[10px] shrink-0"
          >
            {PERSON_CATEGORY_LABELS[person.category]}
          </Badge>
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs leading-relaxed line-clamp-3 text-[var(--text-tertiary)]">
          {person.shortBio || person.bio}
        </p>

        {/* Skills Pills */}
        {person.skills && person.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {person.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md border bg-[var(--chip-green-bg)] border-[var(--border-accent)]/20 text-[var(--chip-green-text)]"
              >
                {skill}
              </span>
            ))}
            {person.skills.length > 4 && (
              <span className="text-[10px] self-center text-[var(--text-tertiary)]">
                +{person.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Link */}
      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {person.socialLinks?.linkedin && (
            <a
              href={person.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors hover:text-[var(--text-accent)] text-[var(--text-tertiary)]"
              title="LinkedIn Profile"
            >
              LinkedIn
            </a>
          )}
          {person.socialLinks?.github && (
            <a
              href={person.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors hover:text-[var(--text-accent)] text-[var(--text-tertiary)]"
              title="GitHub Profile"
            >
              GitHub
            </a>
          )}
        </div>

        <Link
          href={`/team/${person.slug}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-[var(--text-link)] hover:underline"
        >
          <span>View Profile</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
