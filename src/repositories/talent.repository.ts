// src/repositories/talent.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { TalentProfile } from '@/lib/types/admin';

function mapDbToTalent(row: any): TalentProfile {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone || '',
    bio: row.bio || '',
    avatar: row.avatar || undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    experience: row.experience || 0,
    experienceLevel: row.experience_level || 'mid',
    portfolio: row.portfolio || undefined,
    resume: row.resume_url || undefined,
    availability: row.availability || 'available',
    verificationStatus: row.verification_status || 'unverified',
    categories: Array.isArray(row.categories) ? row.categories : [],
    appliedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TalentRepository {
  async getAll(): Promise<TalentProfile[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TalentRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToTalent);
  }

  async getById(id: string): Promise<TalentProfile | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapDbToTalent(data);
  }

  async create(talent: Partial<TalentProfile>): Promise<TalentProfile> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('talent_profiles')
      .insert({
        full_name: talent.name!,
        email: talent.email!,
        phone: talent.phone,
        bio: talent.bio,
        avatar: talent.avatar,
        skills: talent.skills || [],
        experience: talent.experience || 0,
        experience_level: talent.experienceLevel || 'mid',
        portfolio: talent.portfolio,
        resume_url: talent.resume,
        availability: talent.availability || 'available',
        verification_status: talent.verificationStatus || 'unverified',
        categories: talent.categories || [],
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToTalent(data);
  }

  async update(id: string, updates: Partial<TalentProfile>): Promise<TalentProfile> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.name) payload.full_name = updates.name;
    if (updates.email) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.skills) payload.skills = updates.skills;
    if (updates.experience !== undefined) payload.experience = updates.experience;
    if (updates.experienceLevel) payload.experience_level = updates.experienceLevel;
    if (updates.portfolio !== undefined) payload.portfolio = updates.portfolio;
    if (updates.resume !== undefined) payload.resume_url = updates.resume;
    if (updates.availability) payload.availability = updates.availability;
    if (updates.verificationStatus) payload.verification_status = updates.verificationStatus;
    if (updates.categories) payload.categories = updates.categories;

    const { data, error } = await supabase
      .from('talent_profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToTalent(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('talent_profiles').delete().eq('id', id);
    return !error;
  }
}
