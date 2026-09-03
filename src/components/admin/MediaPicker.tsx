'use client';

import React, { useMemo, useState } from 'react';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Standard pattern for all CMS image fields:
 * 1. Upload in Admin → Media (Supabase Storage)
 * 2. Pick the asset here (or paste a public URL as fallback)
 *
 * Team photos, hero, logo, OG image, project covers should all use this.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  helper = 'Upload under Admin → Media, then select here. Same pattern for team photos and homepage images.',
  acceptHint = 'Images from the media library (JPEG, PNG, WebP, GIF)',
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  helper?: string;
  acceptHint?: string;
}) {
  const { media, isLoading } = useAdminData();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const images = useMemo(() => {
    const list = (media || []).filter((m) =>
      String(m.mimeType || '').startsWith('image/')
    );
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (m) =>
        m.name?.toLowerCase().includes(needle) ||
        m.fileName?.toLowerCase().includes(needle) ||
        m.url?.toLowerCase().includes(needle)
    );
  }, [media, q]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[var(--admin-text-secondary)]">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/storage/…/media/uploads/… or /images/…"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setOpen((v) => !v)}
          className="sm:w-auto w-full"
        >
          {open ? 'Close library' : 'Choose from Media'}
        </Button>
      </div>

      {value ? (
        <div className="flex items-center gap-3 p-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)]/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="w-14 h-14 rounded-lg object-cover border border-[var(--admin-border)] bg-black/20"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-[var(--admin-text-secondary)] truncate">{value}</p>
            <button
              type="button"
              className="text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer mt-0.5"
              onClick={() => onChange('')}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {open && (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-card)] p-3 space-y-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search media library…"
          />
          <p className="text-[10px] text-[var(--admin-text-tertiary)]">{acceptHint}</p>
          {isLoading ? (
            <p className="text-xs text-[var(--admin-text-secondary)]">Loading media…</p>
          ) : images.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-secondary)]">
              No images yet. Open <strong>Admin → Media</strong>, upload a file, then return here.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto">
              {images.map((item) => {
                const selected = value === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all',
                      selected
                        ? 'border-[var(--gb-brand-green)] ring-2 ring-[var(--gb-brand-green)]/40'
                        : 'border-[var(--admin-border)] hover:border-[var(--gb-brand-green)]/50'
                    )}
                    title={item.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.altText || item.name} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {helper ? (
        <p className="text-[10px] text-[var(--admin-text-tertiary)] leading-relaxed">{helper}</p>
      ) : null}
    </div>
  );
}
