// src/repositories/audit-log.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { AuditLogEntry } from '@/lib/types/admin';

function mapDbToAudit(row: any): AuditLogEntry {
  return {
    id: row.id,
    actorId: row.actor_id || 'system',
    actorName: row.actor_name,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id || undefined,
    resourceName: row.resource_name || undefined,
    changes: row.changes || undefined,
    ipAddress: row.ip_address || undefined,
    userAgent: row.user_agent || undefined,
    timestamp: row.created_at,
  };
}

export class AuditLogRepository {
  async getAll(): Promise<AuditLogEntry[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[AuditLogRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToAudit);
  }

  async create(entry: Partial<AuditLogEntry>): Promise<AuditLogEntry> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_name: entry.actorName || 'System',
        action: entry.action || 'update',
        resource_type: entry.resourceType || 'system',
        resource_id: entry.resourceId,
        resource_name: entry.resourceName,
        changes: entry.changes,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToAudit(data);
  }
}
