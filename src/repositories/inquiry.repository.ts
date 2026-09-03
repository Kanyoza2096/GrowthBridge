import { createAdminClient } from '@/lib/supabase/server';
import type { Inquiry, InquiryStatus } from '@/lib/types/inquiry';

const status = (value: string): InquiryStatus => value === 'new' ? 'new' : value === 'reviewing' ? 'contacted' : 'closed';

export class InquiryRepository {
  async getAll(): Promise<Inquiry[]> {
    const supabase = createAdminClient();
    const [apps, contacts, partnerships] = await Promise.all([
      supabase.from('applications').select('*').in('type', ['client', 'partnership']).order('submitted_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('partnership_requests').select('*').order('created_at', { ascending: false }),
    ]);
    for (const result of [apps, contacts, partnerships]) if (result.error) throw result.error;
    return [
      ...(apps.data || []).map((r: any): Inquiry => ({ id:r.id, source:'application', type:r.type, name:r.applicant_name, email:r.email, phone:r.phone||'', subject:r.subject, message:r.message, status:status(r.status), submittedAt:r.submitted_at, assignee:r.assignee || undefined, notes:Array.isArray(r.notes)?r.notes:[], history:Array.isArray(r.history)?r.history:[] })),
      ...(contacts.data || []).map((r: any): Inquiry => ({ id:r.id, source:'contact', type:r.type === 'partnership' ? 'partnership' : 'general', name:r.name, email:r.email, phone:r.phone||'', subject:r.subject, message:r.message, status:r.status === 'new' ? 'new' : r.status === 'replied' || r.status === 'archived' ? 'closed' : 'contacted', submittedAt:r.created_at, notes:[], history:[] })),
      ...(partnerships.data || []).map((r: any): Inquiry => ({ id:r.id, source:'partnership', type:'partnership', name:r.contact_person, email:r.email, phone:r.phone||'', subject:`Partnership: ${r.partnership_type}`, message:r.message, status:r.status === 'new' ? 'new' : r.status === 'approved' || r.status === 'declined' ? 'closed' : 'contacted', submittedAt:r.created_at, notes:[], history:[] })),
    ].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  async updateStatus(id: string, source: Inquiry['source'], next: InquiryStatus): Promise<void> {
    const supabase = createAdminClient();
    if (source === 'contact') {
      const dbStatus = next === 'new' ? 'new' : next === 'contacted' ? 'read' : 'archived';
      const { error } = await supabase.from('contact_submissions').update({ status: dbStatus }).eq('id', id);
      if (error) throw error; return;
    }
    if (source === 'partnership') {
      const dbStatus = next === 'new' ? 'new' : next === 'contacted' ? 'reviewing' : 'declined';
      const { error } = await supabase.from('partnership_requests').update({ status: dbStatus }).eq('id', id);
      if (error) throw error; return;
    }
    const dbStatus = next === 'new' ? 'submitted' : next === 'contacted' ? 'reviewing' : 'completed';
    const { error } = await supabase.from('applications').update({ status: dbStatus }).eq('id', id);
    if (error) throw error;
  }
}
export const inquiryRepository = new InquiryRepository();
