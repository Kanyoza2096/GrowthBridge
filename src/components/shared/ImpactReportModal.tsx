'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/providers/ToastProvider';

export function ImpactReportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setDownloaded(true);
    success('Report Access Granted!', 'A download link has been sent to your email.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="2026 African Youth Digital Impact Report">
      {downloaded ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--chip-success-bg)] text-[var(--chip-success-text)] flex items-center justify-center text-2xl mx-auto">
            📄
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            Your Download is Ready
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Thank you for subscribing to Growthbridge Insights. We have dispatched the
            report to{' '}
            <span className="text-[var(--text-accent)] font-semibold">{email}</span>.
          </p>
          <Button variant="primary" size="md" onClick={onClose}>
            Explore Knowledge Hub
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--gradient-brand)] border border-white/10 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--gb-orange-400)]">
              EXCLUSIVE WHITE PAPER
            </span>
            <h4 className="text-base font-bold text-white">
              The State of Youth Digital Innovation in Africa (2026 Edition)
            </h4>
            <p className="text-xs text-white/75 leading-relaxed">
              Explore key data on developer demographics, remote work trends, digital
              skill demand, and community case studies across Southern Africa.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
            <Input
              label="Enter Work Email for Instant Access *"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Download Free Report PDF →
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
