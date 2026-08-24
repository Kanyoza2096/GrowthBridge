// src/repositories/services.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Service } from '@/lib/types/service';

function mapDbToService(row: any): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    division: row.division,
    tagline: row.tagline || '',
    description: row.description,
    icon: row.icon || 'Code',
    color: row.color || 'blue',
    features: Array.isArray(row.features) ? row.features : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    process: Array.isArray(row.process) ? row.process : [],
    image: row.image || undefined,
    order: row.display_order ?? 0,
  };
}

export class ServicesRepository {
  async getAll(): Promise<Service[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[ServicesRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToService);
  }

  async getBySlug(slug: string): Promise<Service | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToService(data);
  }

  async getById(id: string): Promise<Service | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToService(data);
  }

  async create(service: Partial<Service>): Promise<Service> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('services')
      .insert({
        slug: service.slug!,
        title: service.title!,
        division: service.division || 'digital',
        tagline: service.tagline,
        description: service.description || '',
        icon: service.icon,
        color: service.color,
        features: service.features || [],
        benefits: service.benefits || [],
        process: service.process || [],
        image: service.image,
        display_order: service.order ?? 0,
        status: 'published',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToService(data);
  }

  async update(id: string, updates: Partial<Service>): Promise<Service> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.slug) payload.slug = updates.slug;
    if (updates.division) payload.division = updates.division;
    if (updates.tagline !== undefined) payload.tagline = updates.tagline;
    if (updates.description) payload.description = updates.description;
    if (updates.icon) payload.icon = updates.icon;
    if (updates.color) payload.color = updates.color;
    if (updates.features) payload.features = updates.features;
    if (updates.benefits) payload.benefits = updates.benefits;
    if (updates.process) payload.process = updates.process;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.order !== undefined) payload.display_order = updates.order;

    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToService(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('services')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    return !error;
  }
}
