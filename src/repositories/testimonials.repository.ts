// src/repositories/testimonials.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Testimonial } from '@/lib/types/testimonial';

function mapDbToTestimonial(row: any): Testimonial {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author_name,
    role: row.author_role || '',
    organization: row.author_organization || '',
    avatar: row.author_avatar || undefined,
    rating: row.rating || 5,
    featured: Boolean(row.featured),
  };
}

export class TestimonialsRepository {
  async getAll(): Promise<Testimonial[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TestimonialsRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToTestimonial);
  }

  async create(testimonial: Partial<Testimonial>): Promise<Testimonial> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        quote: testimonial.quote!,
        author_name: testimonial.author || 'Anonymous',
        author_role: testimonial.role,
        author_organization: testimonial.organization,
        author_avatar: testimonial.avatar,
        rating: testimonial.rating || 5,
        featured: Boolean(testimonial.featured),
        status: 'approved',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToTestimonial(data);
  }

  async update(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.quote) payload.quote = updates.quote;
    if (updates.author) payload.author_name = updates.author;
    if (updates.role !== undefined) payload.author_role = updates.role;
    if (updates.organization !== undefined) payload.author_organization = updates.organization;
    if (updates.avatar !== undefined) payload.author_avatar = updates.avatar;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.featured !== undefined) payload.featured = updates.featured;

    const { data, error } = await supabase
      .from('testimonials')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToTestimonial(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    return !error;
  }
}
