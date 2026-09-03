import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Lightweight brand visual used where photography is unavailable. It encodes
 * the Growthbridge idea — people, systems and opportunity connected by a bridge.
 * It is intentionally SVG/CSS so it adds no network or image dependency.
 */
export function GrowthbridgeVisual({
  className,
  compact = false,
  label = 'Growthbridge bridge system',
}: {
  className?: string;
  compact?: boolean;
  label?: string;
}) {
  return (
    <div className={cn('gb-visual', compact && 'gb-visual--compact', className)}>
      <div className="gb-visual__grid" aria-hidden="true" />
      <svg viewBox="0 0 720 420" role="img" aria-label={label} className="gb-visual__svg">
        <defs>
          <linearGradient id="gbBridgeLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#123B5D" />
            <stop offset="0.52" stopColor="#16A36A" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="gbBridgeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16A36A" stopOpacity=".24" />
            <stop offset="1" stopColor="#123B5D" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d="M76 315 Q360 48 644 315" fill="none" stroke="url(#gbBridgeLine)" strokeWidth="8" strokeLinecap="round" />
        <path d="M105 315 Q360 92 615 315 L615 332 L105 332 Z" fill="url(#gbBridgeFill)" />
        <path d="M112 315 Q360 115 608 315" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
        <g fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="2">
          <path d="M166 259 V315" /><path d="M232 204 V315" /><path d="M300 160 V315" />
          <path d="M420 160 V315" /><path d="M488 204 V315" /><path d="M554 259 V315" />
        </g>
        <g>
          <circle cx="166" cy="259" r="7" fill="#123B5D" />
          <circle cx="300" cy="160" r="8" fill="#16A36A" />
          <circle cx="420" cy="160" r="8" fill="#16A36A" />
          <circle cx="554" cy="259" r="7" fill="#F59E0B" />
        </g>
        <g fill="white" opacity=".9">
          <circle cx="360" cy="95" r="5" />
          <circle cx="360" cy="315" r="4" />
        </g>
      </svg>
      <div className="gb-visual__caption">
        <span>BRIDGING</span><span>SKILLS</span><span>OPPORTUNITY</span>
      </div>
    </div>
  );
}
