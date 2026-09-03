// src/repositories/partners.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Partner } from '@/lib/types/admin';

function mapDbToPartner(row: any): Partner {
  return {
    id: row.id,
    organizationName: row.organization_name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone || '',
    website: row.website || undefined,
    logo: row.logo || undefined,
    industry: row.industry || 'Technology',
    description: row.description || '',
    status: row.status,
    partnershipType: row.partnership_type,
    partnershipStartDate: row.partnership_start_date || undefined,
    partnershipEndDate: row.partnership_end_date || undefined,
    address: row.address || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PartnersRepository {
  async getAll(): Promise<Partner[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PartnersRepository.getAll]', error);
      throw error;
    }
    return (data || []).map(mapDbToPartner);
  }

  async create(partner: Partial<Partner>): Promise<Partner> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('partners')
      .insert({
        organization_name: partner.organizationName!,
        contact_person: partner.contactPerson || '',
        email: partner.email!,
        phone: partner.phone,
        website: partner.website,
        logo: partner.logo,
        industry: partner.industry || 'Technology',
        description: partner.description || '',
        status: partner.status || 'active',
        partnership_type: partner.partnershipType || 'collaborator',
        partnership_start_date: partner.partnershipStartDate,
        partnership_end_date: partner.partnershipEndDate,
        address: partner.address,
        notes: partner.notes,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToPartner(data);
  }

  async update(id: string, updates: Partial<Partner>): Promise<Partner> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.organizationName !== undefined) payload.organization_name = updates.organizationName;
    if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.logo !== undefined) payload.logo = updates.logo;
    if (updates.industry !== undefined) payload.industry = updates.industry;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.partnershipType !== undefined) payload.partnership_type = updates.partnershipType;
    if (updates.partnershipStartDate !== undefined) payload.partnership_start_date = updates.partnershipStartDate;
    if (updates.partnershipEndDate !== undefined) payload.partnership_end_date = updates.partnershipEndDate;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await supabase
      .from('partners')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToPartner(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
