'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminAuth } from '@/components/providers/AdminAuthProvider';
import { useAdminData } from '@/components/providers/AdminDataProvider';
import {
  LineChart,
  BarChart,
  DonutChart,
} from '@/components/admin/AdminCharts';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
function StatCard({
  title,
  value,
  change,
  color,
  icon,
  href,
}: {
  title: string;
  value: string;
  change: string;
  color: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'cyan';
  icon: string;
  href?: string;
}) {
  const colorClasses: Record<string, string> = {
    emerald:
      'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] border-[var(--gb-green-600)]/25',
    amber:
      'bg-amber-500/10 text-amber-300 border-amber-500/25',
    blue:
      'bg-blue-500/10 text-blue-300 border-blue-500/25',
    purple:
      'bg-purple-500/10 text-purple-300 border-purple-500/25',
    rose:
      'bg-rose-500/10 text-rose-300 border-rose-500/25',
    cyan:
      'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
  };

  const isPositive = !change.startsWith('-');

  return (
    <Card
      variant="admin"
      className={cn(
        'admin-panel p-4 sm:p-5 space-y-3 sm:space-y-4 cursor-pointer transition-all',
        href && 'hover:scale-[1.02]'
      )}
      onClick={
        href
          ? () => (window.location.href = href)
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-sm border',
            colorClasses[color]
          )}
        >
          <span className="font-mono text-[10px] font-bold tracking-wider">{icon}</span>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-1 rounded-full',
            isPositive
              ? 'bg-[var(--gb-green-600)]/15 text-[var(--gb-green-400)] border border-[var(--gb-green-600)]/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          )}
        >
          {isPositive ? '↑' : '↓'} {change.replace('-', '')}
        </span>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[var(--admin-text-primary)] tracking-tight">
          {value}
        </div>
        <p className="text-xs font-medium text-[var(--admin-text-secondary)] mt-1">{title}</p>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Default values — used when backend data is not yet available
// ---------------------------------------------------------------------------
const DEFAULT_STATS = {
  totalVisitors: 0,
  visitorsChange: 0,
  activeServices: 0,
  servicesChange: 0,
  publishedProjects: 0,
  projectsChange: 0,
  talentApplications: 0,
  applicationsChange: 0,
  partnerRequests: 0,
  partnerChange: 0,
  contactSubmissions: 0,
  contactChange: 0,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const { user, hasPermission } = useAdminAuth();
  const {
    dashboardStats,
    visitorTrend,
    applicationTrend,
    servicePopularity,
    projectEngagement,
    applications,
    talent,
    partners,
    auditLog,
    blogPosts,
  } = useAdminData();

  // Merge with defaults so the UI always renders — zeros shown until
  // a real backend is connected and populates actual data.
  const stats = { ...DEFAULT_STATS, ...(dashboardStats ?? {}) };

  const fmt = (n: number) => n.toLocaleString();

  const recentActivity = [
    ...auditLog.slice(0, 4).map((a) => ({
      icon:
        a.action === 'create'
          ? 'NEW'
          : a.action === 'update'
          ? 'EDIT'
          : a.action === 'approve'
          ? 'OK'
          : 'DEL',
      text: `${a.actorName} ${a.action}d ${a.resourceType}${
        a.resourceName ? `: ${a.resourceName}` : ''
      }`,
      time: new Date(a.timestamp).toLocaleString(),
      color: 'emerald' as const,
    })),
    ...applications.slice(0, 2).map((app) => ({
      icon:
        app.type === 'talent'
          ? 'USER'
          : app.type === 'partnership'
          ? 'PART'
          : 'EM',
      text: `New ${app.type} application from ${app.name}`,
      time: new Date(app.submittedAt).toLocaleString(),
      color: 'blue' as const,
    })),
  ].slice(0, 6);

  return (
    <div className="admin-page space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[linear-gradient(135deg,rgba(18,59,93,.34),rgba(12,26,42,.96)_58%,rgba(22,163,106,.10))] border border-[var(--admin-border-strong)] relative overflow-hidden">
        <div className="absolute -top-24 -right-16 w-64 h-64 bg-[var(--gb-green-600)]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <Badge variant="green" className="text-[9px] mb-1.5">
            WORKSPACE OVERVIEW
          </Badge>
          <h1 className="admin-title text-white">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'} 
          </h1>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
            Workspace:{' '}
            <span className="text-[var(--gb-green-400)] font-semibold">
              {user?.department ?? 'Administration'}
            </span>{' '}
            ·{' '}
            <span className="text-[var(--admin-text-secondary)]">
              Today is{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          {hasPermission('applications', 'read') && (
            <Link href="/admin/applications">
              <Button variant="accent" size="sm">
                Review Applications
              </Button>
            </Link>
          )}
          {hasPermission('projects', 'create') && (
            <Link href="/admin/projects">
              <Button variant="secondary" size="sm">
                + New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        <StatCard
          title="Total Website Visitors"
          value={fmt(stats.totalVisitors)}
          change={`${stats.visitorsChange}% vs last period`}
          color="emerald"
          icon="01"
          href="/admin/analytics"
        />
        <StatCard
          title="Active Services"
          value={`${stats.activeServices}`}
          change={`${stats.servicesChange}% this month`}
          color="blue"
          icon="02"
          href="/admin/services"
        />
        <StatCard
          title="Published Projects"
          value={`${stats.publishedProjects}`}
          change={`${stats.projectsChange}% growth`}
          color="purple"
          icon="03"
          href="/admin/projects"
        />
        <StatCard
          title="Talent Applications"
          value={`${stats.talentApplications}`}
          change={`${stats.applicationsChange}% new`}
          color="amber"
          icon="04"
          href="/admin/talent"
        />
        <StatCard
          title="Partner Requests"
          value={`${stats.partnerRequests}`}
          change={`${stats.partnerChange}% increase`}
          color="cyan"
          icon="05"
          href="/admin/partners"
        />
        <StatCard
          title="Contact Submissions"
          value={`${stats.contactSubmissions}`}
          change={`${stats.contactChange}%`}
          color="rose"
          icon="06"
          href="/admin/inquiries"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--admin-text-primary)]">
                Visitor Trends
              </h3>
              <p className="text-[11px] text-[var(--admin-text-secondary)]">
                Website traffic over the past 12 weeks
              </p>
            </div>
            <Badge variant="green" className="text-[9px]">
              ↑ {stats.visitorsChange}%
            </Badge>
          </div>
          <div className="-mx-2">
            {visitorTrend.length ? (
              <LineChart data={visitorTrend} color="var(--gb-green-600)" gradientId="visitor-grad" height={200} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-[var(--admin-text-secondary)]">
                Visitor analytics are not connected yet. No traffic numbers are fabricated.
              </div>
            )}
          </div>
        </Card>

        <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--admin-text-primary)]">
                Application Trends
              </h3>
              <p className="text-[11px] text-[var(--admin-text-secondary)]">
                Weekly talent & partnership applications
              </p>
            </div>
            <Badge variant="orange" className="text-[9px]">
              TALENT + PARTNERS
            </Badge>
          </div>
          <div className="-mx-2">
            <LineChart
              data={applicationTrend}
              color="var(--gb-orange-500)"
              gradientId="apps-grad"
              height={200}
            />
          </div>
        </Card>
      </div>

      {/* Service popularity + engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card variant="admin" className="admin-panel p-4 sm:p-5 lg:col-span-2 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--admin-text-primary)]">
                Service Popularity
              </h3>
              <p className="text-[11px] text-[var(--admin-text-secondary)]">
                Relative engagement across service divisions
              </p>
            </div>
            <Link href="/admin/services">
              <Badge
                variant="blue"
                className="text-[9px] cursor-pointer hover:bg-[var(--gb-navy-800)]"
              >
                MANAGE SERVICES →
              </Badge>
            </Link>
          </div>
          {servicePopularity.length ? (
            <BarChart data={servicePopularity} color="var(--gb-navy-800)" height={220} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-[var(--admin-text-secondary)]">
              Service engagement analytics are not connected yet.
            </div>
          )}
        </Card>

        <Card variant="admin" className="admin-panel p-4 sm:p-5 space-y-4 overflow-hidden">
          <div>
            <h3 className="text-base font-bold text-[var(--admin-text-primary)]">Distribution</h3>
            <p className="text-[11px] text-[var(--admin-text-secondary)]">
              Applications by type
            </p>
          </div>
          {applications.length ? (
            <DonutChart
              data={[
                { label: 'Talent', value: applications.filter((a) => a.type === 'talent').length },
                { label: 'Partners', value: applications.filter((a) => a.type === 'partnership').length },
                { label: 'Client', value: applications.filter((a) => a.type === 'client').length },
                { label: 'Volunteer', value: applications.filter((a) => a.type === 'volunteer').length },
              ].filter((item) => item.value > 0)}
              size={170}
              thickness={22}
            />
          ) : (
            <div className="h-[170px] flex items-center justify-center text-sm text-[var(--admin-text-secondary)]">
              No application data yet.
            </div>
          )}
        </Card>
      </div>

      {/* Management hub + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Management Hub</h3>
            <Badge variant="outline" className="text-[9px]">
              QUICK ACTIONS
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'Services',
                desc: 'Edit capabilities, taglines, and division scopes.',
                icon: '01',
                href: '/admin/services',
                resource: 'services',
                count: stats.activeServices,
                badgeVariant: 'blue' as const,
              },
              {
                label: 'Projects Portfolio',
                desc: 'Create case studies and edit technology stacks.',
                icon: '02',
                href: '/admin/projects',
                resource: 'projects',
                count: stats.publishedProjects,
                badgeVariant: 'purple' as const,
              },
              {
                label: 'Talent Hub',
                desc: 'Review, accept, or interview youth job seekers.',
                icon: '03',
                href: '/admin/talent',
                resource: 'talent',
                count: stats.talentApplications,
                badgeVariant: 'orange' as const,
              },
              {
                label: 'Inquiries & Leads',
                desc: 'View and respond to client contact & partnership forms.',
                icon: '04',
                href: '/admin/inquiries',
                resource: 'applications',
                count: stats.contactSubmissions,
                badgeVariant: 'green' as const,
              },
              {
                label: 'Content & Blog',
                desc: 'Blog posts, testimonials, FAQs, and announcements.',
                icon: '05',
                href: '/admin/blog',
                resource: 'content',
                count: blogPosts.length,
                badgeVariant: 'green' as const,
              },
              {
                label: 'Partners',
                desc: 'Manage partnerships and organizational relationships.',
                icon: '06',
                href: '/admin/partners',
                resource: 'partners',
                count: partners.length,
                badgeVariant: 'blue' as const,
              },
            ]
              .filter((m) => hasPermission(m.resource, 'read'))
              .map((m) => (
                <Link key={m.href} href={m.href}>
                  <Card
                    variant="solid"
                    className="p-5 space-y-2.5 hover:border-[var(--gb-green-600)]/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="w-9 h-9 rounded-lg border border-[var(--admin-border)] bg-white/[.025] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--admin-accent)]">{m.icon}</span>
                      <Badge variant={m.badgeVariant} className="text-[9px]">
                        {m.count}
                      </Badge>
                    </div>
                    <h4 className="text-base font-bold text-[var(--admin-text-primary)]">
                      {m.label}
                    </h4>
                    <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed">
                      {m.desc}
                    </p>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="admin-page space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Recent Activity</h3>
            {hasPermission('audit', 'read') && (
              <Link href="/admin/audit-log">
                <Badge
                  variant="outline"
                  className="text-[9px] cursor-pointer hover:bg-[var(--admin-surface-soft)]"
                >
                  VIEW ALL →
                </Badge>
              </Link>
            )}
          </div>
          <Card variant="admin" className="p-4 space-y-1">
            {recentActivity.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--admin-text-tertiary)]">
                No recent activity — connect a backend to see audit logs
              </div>
            )}
            {recentActivity.map((act, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 rounded-xl hover:bg-[var(--admin-surface-soft)]/40 transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--admin-surface-soft)]/80 border border-[var(--admin-border)] flex items-center justify-center text-[9px] font-bold text-[var(--admin-accent)]">
                  •
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--admin-text-primary)] leading-snug">
                    {act.text}
                  </p>
                  <p className="text-[10px] text-[var(--admin-text-tertiary)] mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </Card>

          {/* Mini engagement chart */}
          <Card variant="admin" className="p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--admin-text-primary)]">
                Project Engagement
              </h3>
              <p className="text-[11px] text-[var(--admin-text-secondary)]">
                Portfolio view activity
              </p>
            </div>
            <div className="-mx-2">
              {projectEngagement.length ? (
                <LineChart data={projectEngagement} color="var(--gb-navy-800)" gradientId="engagement-grad" height={150} />
              ) : (
                <div className="h-[150px] flex items-center justify-center text-sm text-[var(--admin-text-secondary)]">
                  Project engagement analytics are not connected yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
