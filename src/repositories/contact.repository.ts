// src/repositories/contact.repository.ts
import { createAdminClient } from '@/lib/supabase/server';
import type { ContactFormData, PartnershipData, ApiResponse } from '@/lib/types/common';

export class ContactRepository {
  async submitContact(data: ContactFormData): Promise<ApiResponse> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('contact_submissions').insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      type: data.type || 'general',
      status: 'new',
    } as any);

    if (error) {
      console.error('[ContactRepository.submitContact]', error);
      return { success: false, error: 'Failed to submit contact message.' };
    }
    return { success: true, message: 'Message sent successfully.' };
  }

  async submitPartnership(data: PartnershipData): Promise<ApiResponse> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('partnership_requests').insert({
      organization_name: data.organizationName,
      contact_person: data.contactPerson,
      email: data.email,
      phone: data.phone,
      partnership_type: data.partnershipType,
      message: data.message,
      status: 'new',
    } as any);

    if (error) {
      console.error('[ContactRepository.submitPartnership]', error);
      return { success: false, error: 'Failed to submit partnership request.' };
    }
    return { success: true, message: 'Partnership request submitted successfully.' };
  }
}
