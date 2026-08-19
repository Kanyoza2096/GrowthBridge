// src/components/home/HeroSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedBridge } from '@/components/shared/AnimatedBridge';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:py-24 bg-[var(--surface-page)]">
      {/* Dark band behind hero content for contrast */}
      <div className="absolute inset-0 bg-[var(--gradient-footer)] opacity-95 -z-10" />
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[var(--gb-navy-600)]/40 via-[var(--gb-green-600)]/20 to-[var(--gb-orange-500)]/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Container size="lg">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <ScrollReveal direction="down">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--gb-green-600)] animate-pulse" />
              <span className="text-xs font-semibold text-white">
                Youth Skills. Digital Solutions. Stronger Communities.
              </span>
            </div>
          </ScrollReveal>

          {/* Tagline / Main Title */}
          <ScrollReveal delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Bridging Skills.{' '}
              <span className="text-gradient-gb">Driving Growth.</span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal delay={200}>
            <p className="text-base sm:text-xl text-white/85 max-w-2xl font-normal leading-relaxed">
              Growthbridge Virtual Organization is an enterprise ecosystem connecting young tech talent with corporate and community challenges. We deliver high-impact digital products while nurturing the next generation of African tech leaders.
            </p>
          </ScrollReveal>

          {/* Action CTAs */}
          <ScrollReveal delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/services">
                <Button size="lg" variant="primary" rightIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                }>
                  Explore Our Services
                </Button>
              </Link>

              <Link href="/talent-hub">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  Hire Vetted Talent
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Value Badges */}
          <ScrollReveal delay={400}>
            <div className="pt-6 flex flex-wrap justify-center items-center gap-3">
              <Badge variant="blue">Integrity</Badge>
              <Badge variant="green">Excellence & Impact</Badge>
              <Badge variant="orange">Innovation</Badge>
              <Badge variant="purple">Collaboration</Badge>
            </div>
          </ScrollReveal>

          {/* Animated Bridge Hero Graphic */}
          <ScrollReveal delay={500} className="w-full pt-8">
            <AnimatedBridge />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
