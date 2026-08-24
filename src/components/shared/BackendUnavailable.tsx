'use client';

import React from 'react';
import {
  BackendUnavailableError,
  isBackendUnavailable,
} from '@/lib/api/errors';
import { backendConnectionStatus } from '@/lib/api/providers';
import { Button } from '@/components/ui/Button';

interface BackendUnavailableProps {
  error?: unknown;
  context?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function BackendUnavailable({
  error,
  context,
  onRetry,
  compact = false,
}: BackendUnavailableProps) {
  const status = backendConnectionStatus();
  const bue = isBackendUnavailable(error)
    ? (error as BackendUnavailableError)
    : null;

  const devHint = (
    <div className="rounded-xl p-3 text-xs border border-dashed border-[var(--border-strong)] bg-[var(--chip-orange-bg)] text-[var(--text-secondary)]">
      <div className="font-bold uppercase tracking-widest mb-1.5 text-[var(--gb-orange-500)]">
        Developers
      </div>
      <p className="mb-2 font-medium text-[var(--text-primary)]">
        To continue developing locally without a backend:
      </p>
      <pre className="px-2.5 py-1.5 rounded-lg text-[11px] select-all bg-[var(--surface-inverse)] text-white border border-[var(--border-strong)]">
        NEXT_PUBLIC_USE_MOCK_DATA=true
      </pre>
      <p className="mt-2 opacity-80">
        Or set{' '}
        <code className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--text-primary)]">
          NEXT_PUBLIC_BACKEND_PROVIDER=mock
        </code>{' '}
        alongside the flag.
      </p>
    </div>
  );

  const checks = [
    { label: 'API URL configured', ok: Boolean(status.apiUrl) },
    {
      label: 'Authentication / Plugin enabled',
      ok: bue ? bue.statusCode !== 401 && bue.statusCode !== 403 : null,
    },
    {
      label: 'Backend service running',
      ok: bue ? bue.statusCode !== null && bue.statusCode < 500 : null,
    },
  ];

  const heading = 'Backend Not Connected';
  const subheading = context
    ? `We couldn't ${context}.`
    : 'This Growthbridge website requires a backend connection.';

  if (compact) {
    return (
      <div className="rounded-2xl p-6 border border-[var(--border-strong)] bg-[var(--surface-soft)] shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 md:items-start">
          <div className="w-11 h-11 rounded-xl shrink-0 grid place-items-center bg-[var(--chip-orange-bg)] text-[var(--gb-orange-500)]">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{heading}</h3>
              <p className="text-sm mt-0.5 text-[var(--text-secondary)]">{subheading}</p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs font-medium text-[var(--text-tertiary)]">
                  <span className={`w-4 h-4 rounded-full shrink-0 grid place-items-center ${
                    c.ok === true
                      ? 'bg-[var(--chip-success-bg)] text-[var(--chip-success-text)]'
                      : c.ok === false
                      ? 'bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)]'
                      : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'
                  }`}>
                    {c.ok === true ? '✓' : c.ok === false ? '✗' : '?'}
                  </span>
                  {c.label}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 pt-2">
              {onRetry && (
                <Button variant="primary" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
              {bue?.endpoint && (
                <code className="text-[11px] px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] text-[var(--text-tertiary)]">
                  {bue.endpoint}
                </code>
              )}
            </div>

            {!status.allowMock && devHint}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[70vh] grid place-items-center py-12" aria-label="Backend connection error">
      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-3xl border border-[var(--border-strong)] p-8 md:p-10 shadow-2xl bg-[var(--surface-soft)]">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl grid place-items-center shrink-0 bg-[var(--chip-orange-bg)] text-[var(--gb-orange-500)]">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            <div className="flex-1">
              <h1 className="font-extrabold tracking-tight text-2xl md:text-3xl text-[var(--text-primary)]">
                {heading}
              </h1>
              <p className="mt-2 text-sm md:text-base text-[var(--text-secondary)]">
                {subheading} The frontend is intentionally showing this notice instead of
                falling back to stale mock data so the real connection problem is never hidden.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-6 md:grid-cols-[1.3fr_1fr]">
            <div className="space-y-4">
              <div>
                <h2 className="uppercase tracking-widest text-[10px] font-black text-[var(--text-accent)]">
                  Please configure
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {checks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-center gap-3 rounded-xl p-2.5 -mx-2.5 ${
                        c.ok === false
                          ? 'bg-[var(--chip-orange-bg)]'
                          : c.ok === true
                          ? 'bg-[var(--chip-success-bg)]'
                          : ''
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 text-[11px] font-black ${
                        c.ok === true
                          ? 'bg-[var(--chip-success-bg)] text-[var(--chip-success-text)]'
                          : c.ok === false
                          ? 'bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)]'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'
                      }`}>
                        {c.ok === true ? '✓' : c.ok === false ? '✗' : '?'}
                      </span>
                      <div>
                        <p className="font-semibold text-sm text-[var(--text-primary)]">{c.label}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {c.ok === true
                            ? 'Detected successfully'
                            : c.ok === false
                            ? 'Fix required before website can display live content'
                            : 'Waiting for backend response to verify'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {onRetry && (
                  <Button variant="primary" size="md" onClick={onRetry}>
                    Retry Connection
                  </Button>
                )}
                <a
                  href="mailto:hello@growthbridge.org"
                  className="text-sm font-semibold transition-colors text-[var(--text-link)]"
                >
                  Contact Support →
                </a>
              </div>
            </div>

            <div className="space-y-4">
              {!status.allowMock && devHint}

              <div className="rounded-xl p-3.5 text-xs border border-[var(--border-subtle)] bg-[var(--surface-page)] text-[var(--text-tertiary)]">
                <div className="uppercase tracking-widest text-[10px] font-black mb-2 text-[var(--text-accent)]">
                  Current environment
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-y-1.5 gap-x-3">
                  <dt className="font-bold text-[var(--text-secondary)]">Provider</dt>
                  <dd className="font-mono text-[11px] text-[var(--text-primary)]">{status.provider}</dd>

                  <dt className="font-bold text-[var(--text-secondary)]">API URL</dt>
                  <dd className="font-mono text-[11px] truncate text-[var(--text-primary)]" title={status.apiUrl}>
                    {status.apiUrl}
                  </dd>

                  <dt className="font-bold text-[var(--text-secondary)]">Mock data</dt>
                  <dd className="text-[11px]">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold ${
                      status.allowMock
                        ? 'bg-[var(--chip-success-bg)] text-[var(--chip-success-text)]'
                        : 'bg-[var(--chip-orange-bg)] text-[var(--chip-orange-text)]'
                    }`}>
                      {status.allowMock ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </dd>

                  {bue?.statusCode !== null && bue?.statusCode !== undefined && (
                    <>
                      <dt className="font-bold text-[var(--text-secondary)]">Status</dt>
                      <dd className="font-mono text-[11px] text-[var(--text-primary)]">
                        HTTP {bue?.statusCode ?? 'network'}
                      </dd>
                    </>
                  )}

                  {bue?.endpoint && (
                    <>
                      <dt className="font-bold text-[var(--text-secondary)]">Failed</dt>
                      <dd className="font-mono text-[11px] break-all text-[var(--text-primary)]">
                        {bue.endpoint}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
