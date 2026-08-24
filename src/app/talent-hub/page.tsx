'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useMembers } from '@/lib/api/hooks/useMembers';
import { Skeleton } from '@/components/ui/Skeleton';
import { AVAILABILITY_LABELS, EXPERIENCE_LABELS } from '@/lib/types';
import { useShortlist } from '@/components/talent/TalentShortlistDrawer';
import { TalentApplicationForm } from '@/components/talent/TalentApplicationForm';

export default function TalentHubPage() {
  const { data: members, isLoading } = useMembers();
  const [activeTab, setActiveTab] = useState<'hire' | 'apply'>('hire');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const { addToShortlist, isInShortlist } = useShortlist();

  const departments = ['all', 'Digital', 'Business', 'Community', 'Leadership'];

  const filteredMembers = members?.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      departmentFilter === 'all' || m.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-[var(--gb-navy-800)]/30 via-transparent to-transparent">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="orange" className="uppercase tracking-widest text-[10px]">
              Youth Talent Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Growthbridge <span className="text-gradient-gb">Talent Hub</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Hire pre-vetted young professionals for your enterprise projects or apply to
              join our youth talent pipeline.
            </p>

            {/* Mode Switcher */}
            <div className="flex justify-center space-x-3 pt-4">
              <button
                onClick={() => setActiveTab('hire')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'hire'
                    ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)] shadow-lg shadow-[var(--action-primary)]/20'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}
              >
                Hire Vetted Talent (Corporate)
              </button>
              <button
                onClick={() => setActiveTab('apply')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'apply'
                    ? 'bg-[var(--action-secondary)] text-[var(--action-secondary-text)] shadow-lg shadow-[var(--action-secondary)]/20'
                    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}
              >
                Apply as Youth Talent (Job Seekers)
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Mode 1: Hire Talent Marketplace */}
      {activeTab === 'hire' && (
        <section>
          <Container size="lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-10">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search by skill, name, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDepartmentFilter(dept)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      departmentFilter === dept
                        ? 'bg-[var(--action-primary)] text-[var(--action-primary-text)]'
                        : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {dept === 'all' ? 'All Departments' : dept}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredMembers?.map((member, idx) => (
                  <ScrollReveal key={member.id} delay={idx * 100}>
                    <Card
                      variant="solid"
                      className="h-full flex flex-col justify-between p-6 space-y-4"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              member.availability === 'available' ? 'green' : 'orange'
                            }
                            className="text-[10px]"
                          >
                            {AVAILABILITY_LABELS[member.availability]}
                          </Badge>
                          <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                            {EXPERIENCE_LABELS[member.experience]}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-[var(--gradient-brand)] flex items-center justify-center font-bold text-white text-lg">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                              {member.fullName}
                            </h3>
                            <p className="text-xs text-[var(--text-accent)] font-semibold">
                              {member.role}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                          {member.bio}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-2">
                          {member.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant={
                            isInShortlist(member.id) ? 'outline' : 'accent'
                          }
                          onClick={() => addToShortlist(member)}
                        >
                          {isInShortlist(member.id)
                            ? '✓ Shortlisted'
                            : '+ Shortlist Candidate'}
                        </Button>
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            LinkedIn ↗
                          </a>
                        )}
                      </div>
                    </Card>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Mode 2: Apply as Youth Talent */}
      {activeTab === 'apply' && (
        <section>
          <Container size="sm">
            <TalentApplicationForm />
          </Container>
        </section>
      )}
    </div>
  );
}
