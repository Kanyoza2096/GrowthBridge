'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function ImpactReportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="2026 African Youth Digital Impact Report">
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#123B5D] to-[#16A36A] border border-white/15 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--gb-orange-400)]">
            GROWTHBRIDGE INSIGHTS
          </span>
          <h3 className="text-base font-bold text-white">
            The State of Youth Digital Innovation in Africa
          </h3>
          <p className="text-xs text-white/75 leading-relaxed">
            The 2026 impact report is being prepared. Digital download and email delivery
            are not available yet.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Request an update
          </h4>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            We are not collecting email addresses through this panel because a report
            delivery service is not connected. Contact our team to ask about publication
            timing and availability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[var(--gb-green-600)] px-7 py-3.5 text-base font-medium text-[var(--action-primary-text)] shadow-[0_10px_25px_-10px_var(--gb-green-600)] transition-colors hover:bg-[var(--gb-green-700)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gb-green-600)]"
          >
            Contact Growthbridge
          </Link>
          <Button variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
