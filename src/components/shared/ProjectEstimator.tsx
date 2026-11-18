'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/providers/ToastProvider';

type Division = 'digital' | 'business' | 'people' | 'community' | 'events';
type Scope = 'mvp' | 'standard' | 'enterprise';

export function ProjectEstimator() {
  const [division, setDivision] = useState<Division>('digital');
  const [scope, setScope] = useState<Scope>('standard');
  const [features, setFeatures] = useState<string[]>(['ui-design', 'api-integration']);
  const { success } = useToast();
  const router = useRouter();

  const toggleFeature = (f: string) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleTransferToContact = () => {
    success('Project details saved', 'Taking you to the contact form to discuss your requirements.');
    const params = new URLSearchParams({ division, scope, features: features.join(',') });
    router.push(`/contact?${params.toString()}`);
  };

  const divisionOptions: { key: Division; label: string }[] = [
    { key: 'digital', label: 'Growthbridge Digital' },
    { key: 'business', label: 'Growthbridge Business' },
    { key: 'people', label: 'Growthbridge People' },
    { key: 'community', label: 'Growthbridge Community' },
    { key: 'events', label: 'Growthbridge Events' },
  ];

  const scopeOptions: { key: Scope; label: string }[] = [
    { key: 'mvp', label: 'MVP / Startup Launch' },
    { key: 'standard', label: 'Standard Growth Platform' },
    { key: 'enterprise', label: 'Enterprise Ecosystem' },
  ];

  const featureOptions: { key: string; label: string }[] = [
    { key: 'ui-design', label: 'Custom UI/UX Design' },
    { key: 'api-integration', label: 'API & Database Integration' },
    { key: 'ai-capabilities', label: 'AI Assistant / ML Integration' },
    { key: 'mobile-app', label: 'Mobile App Companion' },
    { key: 'seo-marketing', label: 'SEO & Growth Strategy' },
  ];

  return (
    <Card variant="glass" className="p-8 space-y-8 border-l-4 border-l-[var(--border-accent)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <Badge variant="orange" className="mb-1 text-[10px]">
            PROJECT PLANNER
          </Badge>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            Project Scope Planner
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Division Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            1. Select Division
          </label>
          <div className="space-y-2">
            {divisionOptions.map((item) => (
              <button
                key={item.key}
                onClick={() => setDivision(item.key)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  division === item.key
                    ? 'bg-[var(--chip-green-bg)] border-[var(--border-accent)] text-[var(--chip-green-text)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope & Scale */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            2. Project Scale
          </label>
          <div className="space-y-2">
            {scopeOptions.map((item) => (
              <button
                key={item.key}
                onClick={() => setScope(item.key)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  scope === item.key
                    ? 'bg-[var(--chip-navy-bg)] border-[var(--border-brand)] text-[var(--chip-navy-text)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Add-ons */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            3. Capabilities Add-ons
          </label>
          <div className="space-y-2">
            {featureOptions.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleFeature(item.key)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                  features.includes(item.key)
                    ? 'bg-[var(--chip-orange-bg)] border-[var(--chip-orange-text)]/30 text-[var(--chip-orange-text)]'
                    : 'bg-[var(--surface-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{item.label}</span>
                <span>{features.includes(item.key) ? '✓' : '+'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[var(--text-tertiary)]">
          Tell us what you need. Our team will discuss the right solution and a tailored proposal with you.
        </p>
        <Button onClick={handleTransferToContact} variant="primary" size="lg">
          Discuss Project & Book Consultation →
        </Button>
      </div>
    </Card>
  );
}
