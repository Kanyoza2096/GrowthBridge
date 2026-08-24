'use client';

import React from 'react';

interface AnimatedBridgeProps {
  className?: string;
}

export function AnimatedBridge({ className }: AnimatedBridgeProps) {
  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className || ''}`}>
      <svg
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_10px_35px_rgba(22,163,106,0.25)]"
        role="img"
        aria-label="Growthbridge animated bridge illustration"
      >
        <defs>
          {/* Bridge Arc Gradient */}
          <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--gb-navy-700)" />
            <stop offset="50%" stopColor="var(--gb-green-600)" />
            <stop offset="100%" stopColor="var(--gb-orange-500)" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Node Gradient */}
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--gb-green-600)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--gb-navy-800)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Glowing Bridge Arc */}
        <path
          d="M 50 320 Q 400 60 750 320"
          stroke="url(#bridgeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-draw-bridge"
          filter="url(#glow)"
        />

        {/* Support Cables / Structural Network */}
        <g
          stroke="var(--text-tertiary)"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        >
          <line x1="200" y1="210" x2="200" y2="340" />
          <line x1="300" y1="145" x2="300" y2="340" />
          <line x1="400" y1="125" x2="400" y2="340" />
          <line x1="500" y1="145" x2="500" y2="340" />
          <line x1="600" y1="210" x2="600" y2="340" />
        </g>

        {/* Bridge Base Deck */}
        <line
          x1="30"
          y1="340"
          x2="770"
          y2="340"
          stroke="var(--gb-navy-700)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="340"
          x2="750"
          y2="340"
          stroke="var(--gb-green-600)"
          strokeWidth="2"
          strokeDasharray="12 8"
        />

        {/* Pillars */}
        <path
          d="M 180 340 L 190 220 L 210 220 L 220 340 Z"
          fill="url(#bridgeGradient)"
          opacity="0.3"
        />
        <path
          d="M 580 340 L 590 220 L 610 220 L 620 340 Z"
          fill="url(#bridgeGradient)"
          opacity="0.3"
        />

        {/* Animated Pulsing Tech Nodes */}
        {/* Node 1: Youth/Skills */}
        <g transform="translate(200, 210)">
          <circle r="16" fill="url(#nodeGlow)" className="animate-ping opacity-75" />
          <circle r="8" fill="var(--gb-navy-800)" stroke="var(--gb-navy-300)" strokeWidth="2" />
        </g>

        {/* Node 2: Core/Growthbridge */}
        <g transform="translate(400, 125)">
          <circle r="22" fill="url(#nodeGlow)" className="animate-ping opacity-60" />
          <circle r="12" fill="var(--gb-green-600)" stroke="white" strokeWidth="3" />
        </g>

        {/* Node 3: Solutions/Communities */}
        <g transform="translate(600, 210)">
          <circle r="16" fill="url(#nodeGlow)" className="animate-ping opacity-75" />
          <circle r="8" fill="var(--gb-orange-500)" stroke="var(--gb-orange-300)" strokeWidth="2" />
        </g>

        {/* Floating Text Markers — adjusted for mobile */}
        <g fill="var(--text-secondary)" textAnchor="middle">
          <text x="200" y="180" fontSize="11" fontWeight="600">Youth &amp; Skills</text>
        </g>
        <g fill="var(--text-accent)" textAnchor="middle">
          <text x="400" y="88" fontSize="13" fontWeight="700">Digital Solutions</text>
        </g>
        <g fill="var(--text-secondary)" textAnchor="middle">
          <text x="600" y="180" fontSize="11" fontWeight="600">Stronger Communities</text>
        </g>
      </svg>
    </div>
  );
}
