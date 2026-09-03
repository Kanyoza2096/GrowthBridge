'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { useMembers } from '@/lib/api/hooks/useMembers';
import { Skeleton } from '@/components/ui/Skeleton';
import { GrowthbridgeVisual } from '@/components/brand/GrowthbridgeVisual';
import { PublicEmptyState } from '@/components/shared/PublicEmptyState';

export default function AboutPage() {
  const { data: members, isLoading } = useMembers();

  return (
    <div className="public-page space-y-20 pb-20">
      {/* Hero Banner */}
      <section className="public-page-hero relative py-12 sm:py-16 md:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="green" className="uppercase tracking-widest text-[10px]">
              About Growthbridge
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Youth-Led. Technology-Driven.{' '}
              <span className="text-gradient-gb">Community-Focused.</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed">
              Growthbridge Virtual Organization was founded to bridge the digital skills gap
              and provide scalable software and business solutions for organizations across
              Africa and beyond.
            </p>
          </div>
        </Container>
      </section>

      {/* Vision, Mission, Purpose */}
      <section>
        <Container size="lg">
          <div className="mb-10 grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-8 items-stretch">
            <GrowthbridgeVisual className="min-h-[20rem] lg:min-h-full" label="Growthbridge bridge connecting skills, organizations and opportunity" />
            <div className="public-card p-7 sm:p-9 flex flex-col justify-between">
              <div><span className="public-kicker">The Growthbridge thesis</span><h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Talent becomes impact when the right systems connect it.</h2></div>
              <p className="mt-8 public-lede text-sm">We combine youth capability, technology and practical delivery so ideas can move from potential to measurable outcomes.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <Card variant="glass" className="public-card h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--chip-navy-bg)] flex items-center justify-center text-2xl text-[var(--chip-navy-text)]">
                  01
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Our Vision</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  To build Africa&apos;s premier youth-led virtual innovation ecosystem —
                  where skill meets opportunity, driving sustainable economic growth and
                  digital transformation.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card variant="glass" className="public-card h-full space-y-3 border-[var(--border-accent)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--chip-green-bg)] flex items-center justify-center text-2xl text-[var(--chip-green-text)]">
                  02
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Our Mission</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  To equip young talent with cutting-edge digital capabilities, connect
                  them with corporate and social projects, and deliver top-tier tech and
                  business solutions.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card variant="glass" className="public-card h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--chip-orange-bg)] flex items-center justify-center text-2xl text-[var(--chip-orange-text)]">
                  03
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Core Purpose</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Transforming potential into prosperity by ensuring no young
                  person&apos;s skill goes unused and no community&apos;s problem goes
                  unsolved.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Leadership & Team Section */}
      <section>
        <Container size="lg">
          <SectionHeading
            badge="Our People"
            badgeVariant="green"
            title="The Leadership & Innovators"
            subtitle="Meet the team driving Growthbridge's divisions and programs."
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : !members || members.length === 0 ? (
            <PublicEmptyState
              title="Our people directory is being refreshed"
              description="Leadership and team profiles will appear here when the public directory is available."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, idx) => (
                <ScrollReveal key={member.id} delay={idx * 100}>
                  <Card variant="solid" className="h-full flex flex-col justify-between p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center font-bold text-xl text-white shadow-md">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {member.fullName}
                          </h3>
                          <p className="text-xs font-semibold text-[var(--text-accent)]">
                            {member.role}
                          </p>
                          <Badge variant="outline" className="text-[9px] mt-1">
                            {member.department}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {member.bio}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface-subtle)] text-[var(--text-secondary)]"
                        >
                          {skill}
                        </span>
                      ))}
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
