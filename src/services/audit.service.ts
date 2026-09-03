// src/services/audit.service.ts
import { AuditLogRepository } from '@/repositories/audit-log.repository';
import type { AuditLogEntry } from '@/lib/types/admin';

export class AuditService {
  private repo = new AuditLogRepository();

  async getLogs(): Promise<AuditLogEntry[]> {
    return this.repo.getAll();
  }

  async log(entry: Partial<AuditLogEntry>): Promise<AuditLogEntry> {
    return this.repo.create(entry);
  }
}

export const auditService = new AuditService();
