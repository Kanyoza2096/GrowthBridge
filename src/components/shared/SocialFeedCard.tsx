'use client';

import React from 'react';
import type { SocialFeedItem, SocialPlatform } from '@/lib/types/social-feed';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; icon: string; badgeBg: string; actionLabel: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    badgeBg: 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20',
    actionLabel: 'View on LinkedIn ↗',
  },
  twitter: {
    label: 'Twitter / X',
    icon: '🐤',
    badgeBg: 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20',
    actionLabel: 'View on X ↗',
  },
  facebook: {
    label: 'Facebook',
    icon: '👥',
    badgeBg: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
    actionLabel: 'View on Facebook ↗',
  },
  instagram: {
    label: 'Instagram',
    icon: '📸',
    badgeBg: 'bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/20',
    actionLabel: 'View on Instagram ↗',
  },
  youtube: {
    label: 'YouTube',
    icon: '▶️',
    badgeBg: 'bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20',
    actionLabel: 'Watch on YouTube ↗',
  },
};

export function SocialFeedCard({ item }: { item: SocialFeedItem }) {
  const config = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.linkedin;

  // Highlight hashtags in content
  const renderContentWithHashtags = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, idx) => {
      if (part.startsWith('#')) {
        return (
          <span key={idx} className="font-semibold text-[var(--text-accent)] hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Card 
      hoverEffect 
      className="flex flex-col h-full bg-[var(--card-surface)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm transition-all duration-300"
    >
      {/* Header: Author & Platform Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.authorAvatar}
            alt={item.authorName}
            className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{item.authorName}</h4>
              {item.verified && (
                <span className="text-[var(--chip-green-text)] text-[10px] flex-shrink-0" title="Verified Official Channel">
                  ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] truncate">{item.authorHandle}</p>
          </div>
        </div>

        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0', config.badgeBg)}>
          <span>{config.icon}</span>
          <span className="hidden sm:inline">{config.label}</span>
        </span>
      </div>

      {/* Content Text */}
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">
        {renderContentWithHashtags(item.content)}
      </div>

      {/* Optional Media Preview */}
      {item.mediaUrl && (
        <div className="relative rounded-xl overflow-hidden mb-4 bg-[var(--surface-subtle)] aspect-video group">
          <img
            src={item.mediaUrl}
            alt="Social media post attachment"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.mediaType === 'video' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg font-bold">
                ▶
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: Date, Engagement Counters, External Link */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[11px] text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="whitespace-nowrap">{item.publishedAt}</span>
          <div className="flex items-center gap-2 font-medium">
            <span>Likes {item.likesCount}</span>
            <span>Comments {item.commentsCount}</span>
            {item.sharesCount !== undefined && <span>Shares {item.sharesCount}</span>}
          </div>
        </div>

        <a
          href={item.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:underline transition-colors text-[var(--text-accent)] whitespace-nowrap"
        >
          {config.actionLabel}
        </a>
      </div>
    </Card>
  );
}
