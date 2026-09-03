import { createAdminClient } from '@/lib/supabase/server';
import type { ChartDataPoint, DashboardStats } from '@/lib/types/admin';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function weekLabels(count: number): Date[] {
  const current = startOfWeek(new Date());
  return Array.from({ length: count }, (_, index) => {
    const d = new Date(current);
    d.setUTCDate(current.getUTCDate() - (count - 1 - index) * 7);
    return d;
  });
}

function weeklySeries(dates: string[], count = 12): ChartDataPoint[] {
  const weeks = weekLabels(count);
  const values = new Map(weeks.map((week) => [week.toISOString().slice(0, 10), 0]));
  for (const value of dates) {
    const key = startOfWeek(new Date(value)).toISOString().slice(0, 10);
    if (values.has(key)) values.set(key, (values.get(key) || 0) + 1);
  }
  return weeks.map((week) => ({
    label: week.toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    value: values.get(week.toISOString().slice(0, 10)) || 0,
  }));
}

async function countSince(table: string, column: string, since: Date, filter?: { column: string; values: string[] }) {
  const supabase = createAdminClient();
  let query = supabase.from(table).select('id', { count: 'exact', head: true }).gte(column, since.toISOString());
  if (filter) query = query.in(filter.column, filter.values);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function countBetween(table: string, column: string, start: Date, end: Date, filter?: { column: string; values: string[] }) {
  const supabase = createAdminClient();
  let query = supabase.from(table).select('id', { count: 'exact', head: true }).gte(column, start.toISOString()).lt(column, end.toISOString());
  if (filter) query = query.in(filter.column, filter.values);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const currentStart = new Date(now.getTime() - 30 * MS_PER_DAY);
    const previousStart = new Date(now.getTime() - 60 * MS_PER_DAY);

    const supabase = createAdminClient();
    const [services, projects, talentCurrent, talentPrevious, partnerCurrent, partnerPrevious, contactCurrent, contactPrevious] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      countBetween('applications', 'submitted_at', currentStart, now, { column: 'type', values: ['talent'] }),
      countBetween('applications', 'submitted_at', previousStart, currentStart, { column: 'type', values: ['talent'] }),
      countBetween('partnership_requests', 'created_at', currentStart, now),
      countBetween('partnership_requests', 'created_at', previousStart, currentStart),
      countBetween('contact_submissions', 'created_at', currentStart, now),
      countBetween('contact_submissions', 'created_at', previousStart, currentStart),
    ]);

    for (const result of [services, projects]) if (result.error) throw result.error;

    // Visitor analytics are intentionally not fabricated. The current schema has
    // no first-party page-view table, so the UI receives an explicit unavailable state.
    const talentTotal = await countSince('applications', 'submitted_at', new Date(0), { column: 'type', values: ['talent'] });
    const partnerTotal = await countSince('partnership_requests', 'created_at', new Date(0));
    const contactTotal = await countSince('contact_submissions', 'created_at', new Date(0));

    return {
      totalVisitors: 0,
      visitorsChange: 0,
      activeServices: services.count || 0,
      servicesChange: 0,
      publishedProjects: projects.count || 0,
      projectsChange: 0,
      talentApplications: talentTotal,
      applicationsChange: percentChange(talentCurrent, talentPrevious),
      partnerRequests: partnerTotal,
      partnerChange: percentChange(partnerCurrent, partnerPrevious),
      contactSubmissions: contactTotal,
      contactChange: percentChange(contactCurrent, contactPrevious),
    };
  }

  async getTrends() {
    const since = new Date(Date.now() - 84 * MS_PER_DAY);
    const supabase = createAdminClient();
    const [applications, partnerships] = await Promise.all([
      supabase.from('applications').select('submitted_at').gte('submitted_at', since.toISOString()).in('type', ['talent', 'partnership']),
      supabase.from('partnership_requests').select('created_at').gte('created_at', since.toISOString()),
    ]);
    if (applications.error) throw applications.error;
    if (partnerships.error) throw partnerships.error;

    const dates = [
      ...(applications.data || []).map((row: any) => row.submitted_at),
      ...(partnerships.data || []).map((row: any) => row.created_at),
    ];

    return {
      visitorTrend: [] as ChartDataPoint[],
      applicationTrend: weeklySeries(dates),
      servicePopularity: [] as ChartDataPoint[],
      projectEngagement: [] as ChartDataPoint[],
    };
  }
}

export const dashboardRepository = new DashboardRepository();
