'use client';

import React, { useState, createContext, useContext } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/providers/ToastProvider';
import type { Member } from '@/lib/types';

interface ShortlistContextType {
  shortlist: Member[];
  addToShortlist: (member: Member) => void;
  removeFromShortlist: (id: string) => void;
  isInShortlist: (id: string) => boolean;
  openDrawer: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { success, info } = useToast();

  const addToShortlist = (member: Member) => {
    if (!shortlist.some((m) => m.id === member.id)) {
      setShortlist((prev) => [...prev, member]);
      success('Talent Shortlisted', `${member.fullName} added to your team request list.`);
    } else {
      info('Already Shortlisted', `${member.fullName} is already in your shortlist.`);
    }
  };

  const removeFromShortlist = (id: string) => {
    setShortlist((prev) => prev.filter((m) => m.id !== id));
  };

  const isInShortlist = (id: string) => shortlist.some((m) => m.id === id);

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        addToShortlist,
        removeFromShortlist,
        isInShortlist,
        openDrawer: () => setIsOpen(true),
      }}
    >
      {children}

      {shortlist.length > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 px-4 py-3 rounded-full bg-[var(--action-secondary)] text-[var(--action-secondary-text)] border border-[var(--border-brand)] shadow-2xl flex items-center space-x-3 hover:scale-105 transition-all cursor-pointer"
        >
          <span className="w-6 h-6 rounded-full bg-[var(--action-primary)] flex items-center justify-center font-bold text-xs text-[var(--action-primary-text)]">
            {shortlist.length}
          </span>
          <span className="text-xs font-bold">Review Shortlisted Team</span>
        </button>
      )}

      <ShortlistDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error('useShortlist must be used within ShortlistProvider');
  return ctx;
}

function ShortlistDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { shortlist, removeFromShortlist } = useShortlist();
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success(
      'Hiring Request Submitted!',
      'Our Talent Operations team will get back to you within 24 hours.'
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Your Shortlisted Team (${shortlist.length})`}>
      {submitted ? (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--chip-success-bg)] text-[var(--chip-success-text)] flex items-center justify-center text-2xl mx-auto">
            ✓
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Team Request Received</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            We have received your shortlist request for {shortlist.length} professionals. Our team
            is preparing candidate portfolios.
          </p>
          <Button onClick={onClose} variant="primary" size="sm">
            Close
          </Button>
        </div>
      ) : shortlist.length === 0 ? (
        <div className="py-8 text-center text-xs text-[var(--text-tertiary)] space-y-2">
          <p>Your team shortlist is currently empty.</p>
          <p className="text-[11px] text-[var(--text-tertiary)]/70">
            Browse the Talent Hub and click &ldquo;Add to Shortlist&rdquo; on candidate cards.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {shortlist.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{m.fullName}</h4>
                  <p className="text-[10px] text-[var(--text-accent)]">{m.role}</p>
                </div>
                <button
                  onClick={() => removeFromShortlist(m.id)}
                  className="text-xs text-[var(--action-danger)] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
            <Input
              label="Company Name *"
              placeholder="Enterprise / Startup Name"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              label="Work Email *"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Request Team Match & Quotes
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
