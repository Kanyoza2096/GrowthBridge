// src/repositories/applications.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Application, ApplicationStatus, ApplicationType } from '@/lib/types/admin';

function mapDbToApplication(row: any): Application {
  return {
    id: row.id,
    type: row.type as ApplicationType,
    name: row.applicant_name,
    email: row.email,
    phone: row.phone || '',
    subject: row.subject || undefined,
    message: row.message || undefined,
    role: row.role || undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    portfolio: row.portfolio || undefined,
    status: row.status as ApplicationStatus,
    assignee: row.assignee_id || undefined,
    notes: Array.isArray(row.notes) ? row.notes : [],
    history: Array.isArray(row.history) ? row.history : [],
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

export class ApplicationsRepository {
  async getAll(): Promise<Application[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[ApplicationsRepository.getAll]', error);
      throw error;
    }
    return (data || []).map(mapDbToApplication);
  }

  async getById(id: string): Promise<Application | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    return mapDbToApplication(data);
  }

  async create(app: Partial<Application>): Promise<Application> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('applications')
      .insert({
        type: app.type || 'talent',
        applicant_name: app.name!,
        email: app.email!,
        phone: app.phone,
        subject: app.subject,
        message: app.message,
        role: app.role,
        skills: app.skills || [],
        portfolio: app.portfolio,
        status: app.status || 'submitted',
        notes: app.notes || [],
        history: app.history || [],
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToApplication(data);
  }

  async update(id: string, updates: Partial<Application>): Promise<Application> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.name !== undefined) payload.applicant_name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.message !== undefined) payload.message = updates.message;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.portfolio !== undefined) payload.portfolio = updates.portfolio;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.assignee !== undefined) payload.assignee_id = updates.assignee;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.history !== undefined) payload.history = updates.history;

    const { data, error } = await supabase
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToApplication(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
