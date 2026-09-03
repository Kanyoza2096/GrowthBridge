'use client';

import React, { useState } from 'react';
import { useSocialFeed } from '@/lib/api/hooks/useSocialFeed';
import { SocialFeedCard } from '@/components/shared/SocialFeedCard';
import type { SocialPlatform } from '@/lib/types/social-feed';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const PLATFORM_FILTERS: { id: SocialPlatform | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Channels', icon: 'ALL' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'IN' },
  { id: 'twitter', label: 'Twitter / X', icon: 'X' },
  { id: 'instagram', label: 'Instagram', icon: 'IG' },
  { id: 'youtube', label: 'YouTube', icon: 'YT' },
  { id: 'facebook', label: 'Facebook', icon: 'FB' },
];

export function SocialFeedAggregator() {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform | 'all'>('all');
  const { data: feed, isLoading, refetch, isFetching } = useSocialFeed(activePlatform);

  return (
    <section className="py-16 sm:py-20 bg-[var(--surface-soft)] relative overflow-hidden border-t border-b border-[var(--border-subtle)]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gb-responsive-glow w-[min(600px,140vw)] h-[min(600px,110vw)] bg-gradient-to-tr from-[var(--gb-green-600)]/10 via-[var(--gb-navy-600)]/5 to-[var(--gb-orange-500)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 sm:space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <SectionHeading
            badge="LIVE SOCIAL AGGREGATOR"
            title="Growthbridge Across Channels"
            subtitle="Explore live updates, community stories, and career opportunities aggregated directly from our official social media channels."
            align="left"
          />

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="self-start md:self-auto text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
          >
            <span aria-hidden="true" className={cn('w-2 h-2 rounded-full bg-current', isFetching && 'animate-pulse')} />
            <span>{isFetching ? 'Syncing Feed...' : 'Live Sync'}</span>
          </Button>
        </div>

        {/* Platform Filter Bar — improved mobile spacing */}
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {PLATFORM_FILTERS.map((tab) => {
            const active = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 min-h-[40px]',
                  active
                    ? 'bg-[var(--gb-navy-600)] text-white border-[var(--gb-navy-600)] shadow-md'
                    : 'bg-[var(--surface-page)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                )}
              >
                <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none text-[var(--text-accent)]">{tab.icon}</span>
                <span className="text-xs sm:text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feed Cards Grid — improved mobile spacing */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-[var(--surface-subtle)] animate-pulse p-6" />
            ))}
          </div>
        ) : !feed || feed.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[var(--surface-page)] rounded-2xl border border-[var(--border-subtle)] space-y-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">No posts found for this channel.</p>
            <p className="text-xs text-[var(--text-tertiary)]">Try selecting "All Channels" or syncing again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {feed.map((item) => (
              <SocialFeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
