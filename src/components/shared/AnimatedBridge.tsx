'use client';

import React, { useEffect, useMemo, useState } from 'react';

export type BridgeSlide = { eyebrow: string; title: string; description: string };

const DEFAULT_SLIDES: BridgeSlide[] = [
  { eyebrow: 'Growthbridge system', title: 'Youth & Skills', description: 'Connecting emerging African talent with meaningful opportunities.' },
  { eyebrow: 'Digital solutions', title: 'Ideas into execution', description: 'Building useful digital products that solve real business challenges.' },
  { eyebrow: 'Business growth', title: 'Stronger organisations', description: 'Helping organisations grow through strategy, technology and delivery.' },
  { eyebrow: 'Community impact', title: 'Progress that connects', description: 'Creating measurable outcomes for businesses and communities.' },
];

interface AnimatedBridgeProps {
  className?: string;
  slides?: BridgeSlide[];
  autoplayMs?: number;
}

export function AnimatedBridge({ className, slides, autoplayMs = 6000 }: AnimatedBridgeProps) {
  const items = useMemo(() => slides?.length ? slides.slice(0, 4) : DEFAULT_SLIDES, [slides]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length < 2 || autoplayMs <= 0) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), Math.max(3500, autoplayMs));
    return () => window.clearInterval(timer);
  }, [autoplayMs, items.length, paused]);

  const active = items[activeIndex] || DEFAULT_SLIDES[0];

  return (
    <section
      className={`relative w-full max-w-2xl mx-auto rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-white/[.09] via-[#0d3548]/65 to-[#0b5146]/45 p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,.22)] backdrop-blur-sm ${className || ''}`}
      data-motion="signature-bridge"
      aria-label="Growthbridge system showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="flex items-center justify-between gap-3 text-[10px] sm:text-xs font-bold uppercase tracking-[.16em] text-white/55">
        <span>{active.eyebrow}</span>
        <span aria-live="polite" className="tabular-nums">{String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
      </div>

      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-4 w-full h-auto drop-shadow-[0_10px_35px_rgba(22,163,106,0.18)]" role="img" aria-label="An illuminated bridge connecting people, digital solutions and communities">
        <defs>
          <linearGradient id="gb-bridge-gradient" x1="50" y1="0" x2="750" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#17608a" /><stop offset=".52" stopColor="#20b887" /><stop offset="1" stopColor="#f5a623" />
          </linearGradient>
          <radialGradient id="gb-node-glow">
            <stop stopColor="#27c995" stopOpacity=".9" /><stop offset="1" stopColor="#27c995" stopOpacity="0" />
          </radialGradient>
          <filter id="gb-bridge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M50 320 Q400 60 750 320" stroke="url(#gb-bridge-gradient)" strokeWidth="7" strokeLinecap="round" filter="url(#gb-bridge-glow)" />
        <g stroke="#d8e8ef" strokeOpacity=".25" strokeWidth="1.5" strokeDasharray="5 6">
          <path d="M200 210V340M300 145V340M400 125V340M500 145V340M600 210V340" />
        </g>
        <path d="M30 340H770" stroke="#1c6580" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 340H750" stroke="#23b98a" strokeWidth="2" strokeDasharray="12 8" />
        <path d="M180 340L190 220H210L220 340ZM580 340L590 220H610L620 340Z" fill="url(#gb-bridge-gradient)" opacity=".28" />
        <g>
          <circle cx="200" cy="210" r="25" fill="url(#gb-node-glow)" /><circle cx="200" cy="210" r="8" fill="#123b5d" stroke="#77c5ed" strokeWidth="3" />
          <circle cx="400" cy="125" r="34" fill="url(#gb-node-glow)" /><circle cx="400" cy="125" r="12" fill="#20b887" stroke="white" strokeWidth="3" />
          <circle cx="600" cy="210" r="25" fill="url(#gb-node-glow)" /><circle cx="600" cy="210" r="8" fill="#f5a623" stroke="#ffd17a" strokeWidth="3" />
        </g>
        <g fill="#d5e4eb" textAnchor="middle" fontWeight="600">
          <text x="200" y="180" fontSize="12">Youth &amp; Skills</text>
          <text x="400" y="82" fontSize="14" fill="#56d6a9">Digital Solutions</text>
          <text x="600" y="180" fontSize="12">Communities</text>
        </g>
      </svg>

      <div className="mt-1 min-h-[92px] sm:min-h-[104px]">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300/80"> {active.eyebrow} </p>
        <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-white">{active.title}</h3>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/65">{active.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="group" aria-label="Choose Growthbridge showcase slide">
          {items.map((item, index) => (
            <button key={`${item.title}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show slide ${index + 1}: ${item.title}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 ${index === activeIndex ? 'w-8 bg-emerald-300' : 'w-2.5 bg-white/35 hover:bg-white/65'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300" aria-label="Previous showcase slide">‹</button>
          <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % items.length)} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300" aria-label="Next showcase slide">›</button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Slide {activeIndex + 1} of {items.length}: {active.title}</p>
    </section>
  );
}
