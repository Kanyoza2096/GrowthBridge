'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface PartnerLogo {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
  initials: string;
  tagline: string;
  website: string;
  color: string;
}

interface PartnerCarouselProps {
  /** Optional override; when omitted, loads active partners from /api/public/partners */
  partners?: PartnerLogo[];
  enabled?: boolean;
}

async function fetchPublicPartners(): Promise<PartnerLogo[]> {
  try {
    const res = await fetch('/api/public/partners');
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data as PartnerLogo[]) || [];
  } catch {
    return [];
  }
}

function PartnerAvatar({ partner, size = 'md' }: { partner: PartnerLogo; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-14 h-14 text-lg' };
  if (partner.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.logoUrl}
        alt={partner.name}
        className={cn(sizes[size], 'rounded-xl object-contain bg-white border border-[var(--border-subtle)] p-1')}
      />
    );
  }
  return (
    <div
      className={cn(sizes[size], 'rounded-xl grid place-items-center font-extrabold text-white shadow-xs')}
      style={{ backgroundColor: partner.color || 'var(--gb-brand-navy)' }}
    >
      {partner.initials}
    </div>
  );
}

export function PartnerCarousel({ partners: partnersProp, enabled = true }: PartnerCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'marquee' | 'grid'>('marquee');
  const [activePartner, setActivePartner] = useState<PartnerLogo | null>(null);

  const { data: fetched = [] } = useQuery({
    queryKey: ['public-partners'],
    queryFn: fetchPublicPartners,
    enabled: enabled && !partnersProp,
    staleTime: 60_000,
  });

  const partners = partnersProp && partnersProp.length > 0 ? partnersProp : fetched;

  if (!enabled || !partners || partners.length === 0) {
    return null;
  }

  const marqueeItems = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 border-y border-[var(--border-subtle)] bg-[var(--surface-soft)] relative overflow-hidden transition-all duration-300">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[var(--gb-green-600)]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-[var(--gb-navy-800)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Badge variant="green" className="uppercase text-[10px] tracking-widest px-3 py-1">
              ECOSYSTEM PARTNERS
            </Badge>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Trusted by Leading Organizations & Industry Pioneers
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-[var(--card-surface)] border border-[var(--card-border)] p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('marquee')}
              className={cn(
                'px-3 py-1 min-h-[44px] text-xs font-semibold rounded-lg transition-all cursor-pointer',
                viewMode === 'marquee'
                  ? 'bg-[var(--action-secondary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Marquee
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-1 min-h-[44px] text-xs font-semibold rounded-lg transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[var(--action-secondary)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Grid View
            </button>
          </div>
        </div>

        {viewMode === 'marquee' ? (
          <div
            className="relative w-full overflow-hidden py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--surface-soft)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--surface-soft)] to-transparent z-10 pointer-events-none" />

            <div
              className={cn(
                'flex gap-6 w-max items-center',
                isPaused ? 'animate-none' : 'animate-marquee'
              )}
            >
              {marqueeItems.map((partner, idx) => (
                <div
                  key={`${partner.id}-${idx}`}
                  onClick={() => setActivePartner(partner)}
                  className="group relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-xs hover:shadow-md hover:border-[var(--border-accent)] transition-all duration-300 cursor-pointer shrink-0 hover:-translate-y-0.5"
                >
                  <div className="transition-transform group-hover:scale-105">
                    <PartnerAvatar partner={partner} size="sm" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors">
                      {partner.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)] block max-w-[180px] truncate">
                      {partner.tagline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                onClick={() => setActivePartner(partner)}
                className="group p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--card-border)] shadow-xs hover:shadow-lg hover:border-[var(--border-accent)] transition-all cursor-pointer flex flex-col items-center text-center space-y-2"
              >
                <div className="transition-transform group-hover:scale-110">
                  <PartnerAvatar partner={partner} size="md" />
                </div>
                <h4 className="font-extrabold text-xs text-[var(--text-primary)] group-hover:text-[var(--text-accent)]">
                  {partner.name}
                </h4>
                <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">
                  {partner.category}
                </span>
              </div>
            ))}
          </div>
        )}

        {activePartner && (
          <div
            className="fixed inset-0 z-50 bg-[var(--surface-overlay)] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setActivePartner(null)}
          >
            <div
              className="bg-[var(--card-surface)] rounded-3xl border border-[var(--card-border)] p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-in relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePartner(null)}
                className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-lg cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="flex items-center space-x-4">
                <PartnerAvatar partner={activePartner} size="lg" />
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                    {activePartner.name}
                  </h3>
                  <Badge variant="green" className="text-[10px] mt-1">
                    {activePartner.category}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {activePartner.tagline}
              </p>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-tertiary)]">
                  Official Growthbridge Ecosystem Partner
                </span>
                <a
                  href={activePartner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-link)] hover:underline"
                >
                  Visit Website ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
