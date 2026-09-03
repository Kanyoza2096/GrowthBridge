'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { AnimatedBridge } from '@/components/shared/AnimatedBridge';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

type PublicSiteConfig = {
  organization: { name: string; tagline: string; description: string; logo: string };
  homepage: { heroImage: string; heroHeadline: string; heroSubheadline: string };
  seo: { ogImage: string };
};

async function fetchSiteConfig(): Promise<PublicSiteConfig | null> {
  try {
    const res = await fetch('/api/public/site-config', { next: { revalidate: 60 } as any });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as PublicSiteConfig) || null;
  } catch {
    return null;
  }
}

export function HeroSection() {
  const { data } = useQuery({
    queryKey: ['public-site-config'],
    queryFn: fetchSiteConfig,
    staleTime: 60_000,
  });

  const heroImage = data?.homepage?.heroImage || '';
  const headline = data?.homepage?.heroHeadline || 'Bridging Skills. Driving Growth.';
  const sub = data?.homepage?.heroSubheadline ||
    'Growthbridge Virtual Organization is an enterprise ecosystem connecting young tech talent with corporate and community challenges. We deliver high-impact digital products while nurturing the next generation of African tech leaders.';

  const parts = headline.split('.');
  const mainLine = parts[0]?.trim() || headline;
  const accentLine = parts.slice(1).join('.').trim();

  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16 md:pt-36 md:pb-24 bg-[#070F1B]">
      {heroImage ? (
        <>
          <div className="absolute inset-0 z-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#070F1B] via-[#0C2D47]/95 to-[#070F1B]/75" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_30%,rgba(22,163,106,.18),transparent_28%),radial-gradient(circle_at_18%_20%,rgba(245,158,11,.10),transparent_22%),linear-gradient(135deg,#123B5D_0%,#0C2D47_48%,#070F1B_100%)]" />
      )}
      <div className="absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" aria-hidden />

      <Container size="lg" className="relative z-10">
        <div className="hero-grid">
          <div className="max-w-3xl">
            <ScrollReveal direction="down">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/7 border border-white/12 text-white/80 text-[10px] sm:text-xs font-bold uppercase tracking-[.13em]">
                <span className="w-2 h-2 rounded-full bg-[var(--gb-green-400)] shadow-[0_0_0_5px_rgba(52,211,153,.10)]" />
                Youth talent · Digital execution · Community impact
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="public-display mt-7 text-[clamp(2.8rem,7vw,5.8rem)] font-black text-white leading-[.98]">
                {mainLine}{accentLine ? <> <span className="text-gradient-gb">{accentLine}</span></> : null}
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <p className="mt-7 text-base sm:text-lg md:text-xl text-white/72 max-w-2xl leading-relaxed">
                {sub}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={260}>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/contact">
                  <Button size="lg" variant="accent" fullWidth className="sm:w-auto">
                    Start a conversation
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" fullWidth className="sm:w-auto text-white border-white/20 hover:bg-white/8">
                    See our work
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={340}>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/55">
                <span>Enterprise-ready delivery</span><span>•</span><span>African youth talent</span><span>•</span><span>Measured outcomes</span>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={220} direction="left">
            <div className="hero-art-frame">
              <div className="hero-bridge-stage" aria-hidden="false">
                <AnimatedBridge />
              </div>
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-white/45">
                <span>Growthbridge system</span><span>01 / 04</span>
              </div>
              <div className="hero-proof-card">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">Our promise</p>
                    <p className="mt-1 text-sm font-semibold text-white">Build useful things. Create opportunity. Leave measurable impact.</p>
                  </div>
                  <span className="shrink-0 w-9 h-9 rounded-full grid place-items-center bg-[var(--gb-green-600)] text-white" aria-hidden="true">↗</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
