'use client';

import React from 'react';
import type { Person } from '@/lib/types/person';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PERSON_CATEGORY_LABELS } from '@/lib/types/person';

export default function PersonProfilePage(props: { person: Person }) {
  const person = props.person;
  if (!person) return null;

  const initials = person.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen pt-28 pb-20">
      <Container size="lg">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/team"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--gb-green-2)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to People Directory</span>
          </Link>
        </div>

        {/* Profile Header Card */}
        <div
          className="rounded-3xl p-8 md:p-12 border shadow-xl mb-12 space-y-8"
          style={{
            backgroundColor: 'var(--bg-soft)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.fullName}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 shadow-lg shrink-0"
                  style={{ borderColor: 'var(--gb-green-2)' }}
                />
              ) : (
                <div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-3xl grid place-items-center font-extrabold text-3xl text-white shadow-xl bg-gradient-to-br from-[color:var(--gb-navy)] to-[color:var(--gb-green-2)] shrink-0"
                >
                  {initials}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
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
                  >
                    {PERSON_CATEGORY_LABELS[person.category]}
                  </Badge>
                  {person.department && (
                    <span className="text-xs font-semibold text-[color:var(--text-subtle)]">
                      • {person.department}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
                  {person.fullName}
                </h1>
                <p className="text-lg font-semibold" style={{ color: 'var(--gb-green-2)' }}>
                  {person.title}
                </p>

                {person.location && (
                  <p className="text-xs flex items-center space-x-1" style={{ color: 'var(--text-muted)' }}>
                    <span><span aria-hidden="true">•</span> {person.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Social & Contact Actions */}
            <div className="flex flex-wrap gap-3">
              {person.socialLinks?.linkedin && (
                <a
                  href={person.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold rounded-xl border transition-colors bg-[color:var(--bg)] hover:border-[color:var(--gb-green-2)]"
                  style={{ color: 'var(--text)' }}
                >
                  LinkedIn ↗
                </a>
              )}
              {person.socialLinks?.github && (
                <a
                  href={person.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold rounded-xl border transition-colors bg-[color:var(--bg)] hover:border-[color:var(--gb-green-2)]"
                  style={{ color: 'var(--text)' }}
                >
                  GitHub ↗
                </a>
              )}
              {person.socialLinks?.website && (
                <a
                  href={person.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold rounded-xl border transition-colors bg-[color:var(--bg)] hover:border-[color:var(--gb-green-2)]"
                  style={{ color: 'var(--text)' }}
                >
                  Website ↗
                </a>
              )}
              {person.email && (
                <a href={`mailto:${person.email}`}>
                  <Button variant="accent" size="sm">
                    Contact Email
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Biography Column */}
          <div className="lg:col-span-2 space-y-8">
            <div
              className="rounded-3xl p-8 border space-y-4"
              style={{
                backgroundColor: 'var(--bg-soft)',
                borderColor: 'var(--border)',
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                Biography & Experience
              </h2>
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--text-muted)' }}
              >
                {person.bio}
              </p>
            </div>

            {/* Related Projects */}
            {person.projects && person.projects.length > 0 && (
              <div
                className="rounded-3xl p-8 border space-y-4"
                style={{
                  backgroundColor: 'var(--bg-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                  Contributed Projects
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {person.projects.map((proj) => (
                    <Link
                      key={proj.slug}
                      href={`/projects/${proj.slug}`}
                      className="p-4 rounded-2xl border transition-all hover:border-[color:var(--gb-green-2)] bg-[color:var(--bg)] group"
                    >
                      <h4 className="font-bold text-sm group-hover:text-[color:var(--gb-green-2)]">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-[color:var(--text-subtle)] mt-1">View case study →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Skills & Expertise */}
            {person.skills && person.skills.length > 0 && (
              <div
                className="rounded-3xl p-6 border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--gb-navy)' }}>
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--gb-green-2) 10%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--gb-green-2) 25%, transparent)',
                        color: 'var(--gb-green-2)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {person.certifications && person.certifications.length > 0 && (
              <div
                className="rounded-3xl p-6 border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--gb-navy)' }}>
                  Certifications
                </h3>
                <ul className="space-y-2">
                  {person.certifications.map((cert) => (
                    <li
                      key={cert}
                      className="text-xs font-medium flex items-center space-x-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <span className="text-[color:var(--gb-green-2)]">✓</span>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
