// src/repositories/impact-stats.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { ImpactStats } from '@/lib/types/common';

export class ImpactStatsRepository {
  async getStats(useAdminClient = false): Promise<ImpactStats> {
    const mapStats = (data: {
      projects_completed: number; youth_empowered: number; communities_served: number;
      client_satisfaction: number; active_members: number; events_hosted: number;
    }): ImpactStats => ({
      projectsCompleted: data.projects_completed,
      youthEmpowered: data.youth_empowered,
      communitiesServed: data.communities_served,
      clientSatisfaction: data.client_satisfaction,
      activeMembers: data.active_members,
      eventsHosted: data.events_hosted,
    });

    if (useAdminClient) {
      const { data, error } = await createAdminClient().from('impact_stats').select('*').limit(1).single();
      if (error || !data) throw error || new Error('Impact statistics are unavailable.');
      return mapStats(data);
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase.from('impact_stats').select('*').limit(1).single();
    if (error || !data) throw error || new Error('Impact statistics are unavailable.');
    return mapStats(data);
  }

  async updateStats(stats: Partial<ImpactStats>): Promise<ImpactStats> {
    const supabase = createAdminClient();
    const current = await this.getStats(true);
    const merged = { ...current, ...stats };

    const { error } = await supabase
      .from('impact_stats')
      .update({
        projects_completed: merged.projectsCompleted,
        youth_empowered: merged.youthEmpowered,
        communities_served: merged.communitiesServed,
        client_satisfaction: merged.clientSatisfaction,
        active_members: merged.activeMembers,
        events_hosted: merged.eventsHosted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) throw error;
    return merged;
  }
}
