'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { adminFetch } from '@/lib/api/admin-client';

type CrmSummary = {
  totalTracked: number;
  stages: Record<'new' | 'qualified' | 'proposal' | 'won' | 'lost', number>;
  followUpsDue: number;
  overdueFollowUps: number;
  wonCount: number;
  lostCount: number;
  winRate: number | null;
  wonValue: number;
  sources: Record<'application' | 'contact' | 'partnership', number>;
  monthlyConversions: { key: string; label: string; wins: number; value: number }[];
  generatedAt: string;
  truncated: boolean;
};

const STAGES = [
  { key: 'new', label: 'New', color: 'bg-sky-400' },
  { key: 'qualified', label: 'Qualified', color: 'bg-cyan-400' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-400' },
  { key: 'won', label: 'Won', color: 'bg-emerald-400' },
  { key: 'lost', label: 'Lost', color: 'bg-rose-400' },
] as const;

const SOURCES = [
  { key: 'contact', label: 'Contact enquiries' },
  { key: 'application', label: 'Applications' },
  { key: 'partnership', label: 'Partnerships' },
] as const;

function Metric({ label, value, hint, tone = 'default' }: { label: string; value: string; hint: string; tone?: 'default' | 'warning' | 'success' }) {
  const valueTone = tone === 'warning' ? 'text-amber-300' : tone === 'success' ? 'text-emerald-300' : 'text-[var(--admin-text-primary)]';
  return (
    <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-2">
      <p className="text-xs font-semibold text-[var(--admin-text-secondary)]">{label}</p>
      <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${valueTone}`}>{value}</p>
      <p className="text-[11px] text-[var(--admin-text-tertiary)]">{hint}</p>
    </Card>
  );
}

export default function CrmDashboardPage() {
  const [summary, setSummary] = useState<CrmSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = await adminFetch<CrmSummary>('/api/admin/crm?view=summary');
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CRM performance data could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const maxStage = Math.max(1, ...STAGES.map((stage) => summary?.stages[stage.key] || 0));
  const maxMonth = Math.max(1, ...(summary?.monthlyConversions.map((month) => month.wins) || [0]));
  const totalSources = summary ? Object.values(summary.sources).reduce((total, count) => total + count, 0) : 0;
  const number = (value: number) => value.toLocaleString();
  const money = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  return (
    <div className="admin-page space-y-6 sm:space-y-8">
      <AdminPageHeader
        title="CRM Performance"
        description="Pipeline health, follow-up discipline and recorded conversions."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void load(true)} disabled={loading || refreshing}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <Link href="/admin/inquiries"><Button size="sm" variant="accent">Open lead inbox</Button></Link>
          </div>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
          <button type="button" onClick={() => void load(true)} className="ml-2 underline font-semibold">Retry</button>
        </div>
      )}

      {loading ? (
        <Card variant="admin" className="p-10 text-center">
          <p className="text-sm text-[var(--admin-text-secondary)]" role="status">Loading CRM performance…</p>
        </Card>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <Metric label="Tracked leads" value={number(summary.totalTracked)} hint="Leads with a CRM record" />
            <Metric label="Follow-ups due" value={number(summary.followUpsDue)} hint="Due now or earlier" tone={summary.followUpsDue ? 'warning' : 'default'} />
            <Metric label="Overdue follow-ups" value={number(summary.overdueFollowUps)} hint="Require attention" tone={summary.overdueFollowUps ? 'warning' : 'success'} />
            <Metric label="Recorded win rate" value={summary.winRate === null ? '—' : `${summary.winRate}%`} hint={`${number(summary.wonCount)} won · ${number(summary.lostCount)} lost`} tone="success" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <Card variant="admin" className="admin-panel p-4 sm:p-5 xl:col-span-2 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--admin-text-primary)]">Pipeline distribution</h2>
                  <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Tracked leads by their current stage</p>
                </div>
                <Badge variant="outline">{number(summary.totalTracked)} total</Badge>
              </div>
              <div className="space-y-4">
                {STAGES.map((stage) => {
                  const count = summary.stages[stage.key] || 0;
                  const width = (count / maxStage) * 100;
                  return (
                    <div key={stage.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-[var(--admin-text-secondary)]">{stage.label}</span>
                        <span className="font-bold tabular-nums text-[var(--admin-text-primary)]">{number(count)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[var(--admin-surface-soft)] overflow-hidden" role="img" aria-label={`${stage.label}: ${count} leads`}>
                        <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[var(--admin-text-primary)]">Conversion value</h2>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Total value recorded on won leads</p>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-emerald-300">{money(summary.wonValue)}</p>
              <div className="pt-3 border-t border-[var(--admin-border)]">
                <p className="text-xs text-[var(--admin-text-secondary)]">Won leads</p>
                <p className="text-xl font-bold text-[var(--admin-text-primary)]">{number(summary.wonCount)}</p>
              </div>
              <p className="text-[10px] leading-relaxed text-[var(--admin-text-tertiary)]">Values are shown as entered in the CRM. Confirm the currency used by your team before financial reporting.</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[var(--admin-text-primary)]">Monthly conversions</h2>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Won leads recorded over the last six calendar months</p>
              </div>
              <div className="grid grid-cols-6 gap-2 items-end min-h-44">
                {summary.monthlyConversions.map((month) => (
                  <div key={month.key} className="flex flex-col items-center justify-end gap-2 h-40">
                    <span className="text-[10px] font-bold tabular-nums text-[var(--admin-text-secondary)]">{month.wins}</span>
                    <div className="w-full max-w-10 flex-1 flex items-end rounded-t-md bg-[var(--admin-surface-soft)] overflow-hidden">
                      <div className="w-full rounded-t-md bg-emerald-400" style={{ height: `${(month.wins / maxMonth) * 100}%` }} role="img" aria-label={`${month.label}: ${month.wins} wins`} />
                    </div>
                    <span className="text-[10px] text-[var(--admin-text-tertiary)]">{month.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-[var(--admin-text-primary)]">Lead sources</h2>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Where tracked CRM leads originated</p>
              </div>
              {SOURCES.map((source) => {
                const count = summary.sources[source.key] || 0;
                const percent = totalSources ? Math.round((count / totalSources) * 100) : 0;
                return (
                  <div key={source.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--admin-text-secondary)]">{source.label}</span>
                      <span className="font-bold text-[var(--admin-text-primary)]">{number(count)} <span className="font-normal text-[var(--admin-text-tertiary)]">({percent}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--admin-surface-soft)] overflow-hidden">
                      <div className="h-full rounded-full bg-sky-400" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
              {totalSources === 0 && <p className="text-xs text-[var(--admin-text-tertiary)]">No tracked lead sources yet. Add a lead to the CRM from the inquiry inbox to begin.</p>}
            </Card>
          </div>

          {summary.truncated && (
            <p role="status" className="text-xs text-amber-300">This summary is based on the latest 10,000 tracked leads. Ask an administrator to run a full historical report for larger datasets.</p>
          )}
          <p className="text-[10px] text-[var(--admin-text-tertiary)]">Updated {new Date(summary.generatedAt).toLocaleString()} · Metrics include CRM-tracked leads only, not every untracked website enquiry.</p>
        </>
      ) : (
        <Card variant="admin" className="p-10 text-center space-y-3">
          <h2 className="text-base font-bold text-[var(--admin-text-primary)]">CRM data is not available yet</h2>
          <p className="text-xs text-[var(--admin-text-secondary)]">Once enquiries are added to the pipeline, this dashboard will report actual CRM activity. It never fills gaps with estimated numbers.</p>
          <Link href="/admin/inquiries"><Button size="sm" variant="accent">Go to inquiries</Button></Link>
        </Card>
      )}
    </div>
  );
}
