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
      'from-emerald-500/20 to-emerald-500/5 text-emerald-300 border-emerald-500/30',
    amber:
      'from-amber-500/20 to-amber-500/5 text-amber-300 border-amber-500/30',
    blue:
      'from-blue-500/20 to-blue-500/5 text-blue-300 border-blue-500/30',
    purple:
      'from-purple-500/20 to-purple-500/5 text-purple-300 border-purple-500/30',
    rose:
      'from-rose-500/20 to-rose-500/5 text-rose-300 border-rose-500/30',
    cyan:
      'from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/30',
  };

  const isPositive = !change.startsWith('-');

  return (
    <Card
      variant="glass"
      className={cn(
        'p-5 space-y-3 cursor-pointer',
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
            'w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br border',
            colorClasses[color]
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            'text-[10px] font-bold px-2 py-1 rounded-full',
            isPositive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          )}
        >
          {isPositive ? '↑' : '↓'} {change.replace('-', '')}
        </span>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        <p className="text-xs font-semibold text-slate-400 mt-1">{title}</p>
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
          ? '➕'
          : a.action === 'update'
          ? '✏️'
          : a.action === 'approve'
          ? '✅'
          : '🗑️',
      text: `${a.actorName} ${a.action}d ${a.resourceType}${
        a.resourceName ? `: ${a.resourceName}` : ''
      }`,
      time: new Date(a.timestamp).toLocaleString(),
      color: 'emerald' as const,
    })),
    ...applications.slice(0, 2).map((app) => ({
      icon:
        app.type === 'talent'
          ? '👤'
          : app.type === 'partnership'
          ? '🤝'
          : '✉️',
      text: `New ${app.type} application from ${app.name}`,
      time: new Date(app.submittedAt).toLocaleString(),
      color: 'blue' as const,
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#123B5D]/60 via-slate-900 to-[#16A36A]/30 border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-24 -right-16 w-64 h-64 bg-[#16A36A]/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10">
          <Badge variant="green" className="text-[9px] mb-1.5">
            CONTROL CENTER DASHBOARD
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Department:{' '}
            <span className="text-emerald-400 font-semibold">
              {user?.department ?? 'Administration'}
            </span>{' '}
            ·{' '}
            <span className="text-slate-400">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Website Visitors"
          value={fmt(stats.totalVisitors)}
          change={`${stats.visitorsChange}% vs last period`}
          color="emerald"
          icon="👁️"
          href="/admin/analytics"
        />
        <StatCard
          title="Active Services"
          value={`${stats.activeServices}`}
          change={`${stats.servicesChange}% this month`}
          color="blue"
          icon="⚙️"
          href="/admin/services"
        />
        <StatCard
          title="Published Projects"
          value={`${stats.publishedProjects}`}
          change={`${stats.projectsChange}% growth`}
          color="purple"
          icon="🚀"
          href="/admin/projects"
        />
        <StatCard
          title="Talent Applications"
          value={`${stats.talentApplications}`}
          change={`${stats.applicationsChange}% new`}
          color="amber"
          icon="👥"
          href="/admin/talent"
        />
        <StatCard
          title="Partner Requests"
          value={`${stats.partnerRequests}`}
          change={`${stats.partnerChange}% increase`}
          color="cyan"
          icon="🤝"
          href="/admin/partners"
        />
        <StatCard
          title="Contact Submissions"
          value={`${stats.contactSubmissions}`}
          change={`${stats.contactChange}%`}
          color="rose"
          icon="📥"
          href="/admin/inquiries"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Visitor Trends
              </h3>
              <p className="text-[11px] text-slate-400">
                Website traffic over the past 12 weeks
              </p>
            </div>
            <Badge variant="green" className="text-[9px]">
              ↑ {stats.visitorsChange}%
            </Badge>
          </div>
          <div className="-mx-2">
            <LineChart
              data={visitorTrend}
              color="#16A36A"
              gradientId="visitor-grad"
              height={200}
            />
          </div>
        </Card>

        <Card variant="glass" className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Application Trends
              </h3>
              <p className="text-[11px] text-slate-400">
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
              color="#F59E0B"
              gradientId="apps-grad"
              height={200}
            />
          </div>
        </Card>
      </div>

      {/* Service popularity + engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Service Popularity
              </h3>
              <p className="text-[11px] text-slate-400">
                Relative engagement across service divisions
              </p>
            </div>
            <Link href="/admin/services">
              <Badge
                variant="blue"
                className="text-[9px] cursor-pointer hover:bg-[#123B5D]"
              >
                MANAGE SERVICES →
              </Badge>
            </Link>
          </div>
          <BarChart
            data={servicePopularity}
            color="#123B5D"
            height={220}
          />
        </Card>

        <Card variant="glass" className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Distribution</h3>
            <p className="text-[11px] text-slate-400">
              Applications by type
            </p>
          </div>
          <DonutChart
            data={[
              { label: 'Talent', value: talent.length + 18 },
              { label: 'Partners', value: partners.length + 6 },
              {
                label: 'Client',
                value:
                  applications.filter((a) => a.type === 'client').length + 4,
              },
              { label: 'Volunteer', value: 3 },
            ]}
            size={170}
            thickness={22}
          />
        </Card>
      </div>

      {/* Management hub + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Management Hub</h3>
            <Badge variant="outline" className="text-[9px]">
              QUICK ACTIONS
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: 'Services',
                desc: 'Edit capabilities, taglines, and division scopes.',
                icon: '⚙️',
                href: '/admin/services',
                resource: 'services',
                count: stats.activeServices,
                badgeVariant: 'blue' as const,
              },
              {
                label: 'Projects Portfolio',
                desc: 'Create case studies and edit technology stacks.',
                icon: '🚀',
                href: '/admin/projects',
                resource: 'projects',
                count: stats.publishedProjects,
                badgeVariant: 'purple' as const,
              },
              {
                label: 'Talent Hub',
                desc: 'Review, accept, or interview youth job seekers.',
                icon: '👥',
                href: '/admin/talent',
                resource: 'talent',
                count: stats.talentApplications,
                badgeVariant: 'orange' as const,
              },
              {
                label: 'Inquiries & Leads',
                desc: 'View and respond to client contact & partnership forms.',
                icon: '📥',
                href: '/admin/inquiries',
                resource: 'applications',
                count: stats.contactSubmissions,
                badgeVariant: 'green' as const,
              },
              {
                label: 'Content & Blog',
                desc: 'Blog posts, testimonials, FAQs, and announcements.',
                icon: '📰',
                href: '/admin/blog',
                resource: 'content',
                count: blogPosts.length,
                badgeVariant: 'green' as const,
              },
              {
                label: 'Partners',
                desc: 'Manage partnerships and organizational relationships.',
                icon: '🤝',
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
                    className="p-5 space-y-2.5 hover:border-[#16A36A]/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-2xl">{m.icon}</span>
                      <Badge variant={m.badgeVariant} className="text-[9px]">
                        {m.count}
                      </Badge>
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {m.label}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            {hasPermission('audit', 'read') && (
              <Link href="/admin/audit-log">
                <Badge
                  variant="outline"
                  className="text-[9px] cursor-pointer hover:bg-slate-800"
                >
                  VIEW ALL →
                </Badge>
              </Link>
            )}
          </div>
          <Card variant="glass" className="p-4 space-y-1">
            {recentActivity.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent activity — connect a backend to see audit logs
              </div>
            )}
            {recentActivity.map((act, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 rounded-xl hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-base">
                  {act.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 leading-snug">
                    {act.text}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </Card>

          {/* Mini engagement chart */}
          <Card variant="glass" className="p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Project Engagement
              </h3>
              <p className="text-[11px] text-slate-400">
                Portfolio view activity
              </p>
            </div>
            <div className="-mx-2">
              <LineChart
                data={projectEngagement}
                color="#60A5FA"
                gradientId="engagement-grad"
                height={150}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
