// src/repositories/people.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Person, PersonCategory, PeopleQueryParams } from '@/lib/types/person';

function mapDbToPerson(row: any): Person {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as PersonCategory,
    fullName: row.full_name,
    title: row.title,
    department: row.department || '',
    bio: row.bio || '',
    shortBio: row.short_bio || (row.bio ? row.bio.slice(0, 150) : ''),
    photo: row.photo || '/images/team-placeholder.jpg',
    email: row.email || undefined,
    phone: row.phone || undefined,
    location: row.location || undefined,
    joinedAt: row.joined_at || undefined,
    skills: Array.isArray(row.skills) ? row.skills : [],
    certifications: Array.isArray(row.certifications) ? row.certifications : [],
    socialLinks: row.social_links || {},
    projects: Array.isArray(row.projects) ? row.projects : [],
    articles: Array.isArray(row.articles) ? row.articles : [],
    displayOrder: row.display_order ?? 999,
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PeopleRepository {
  async getAll(params: PeopleQueryParams = {}): Promise<Person[]> {
    const supabase = await createServerClient();
    let query = supabase.from('people').select('*').is('deleted_at', null);

    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.onlyActive !== false) {
      query = query.eq('active', true);
    }
    if (params.onlyFeatured) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

    if (error) {
      console.error('[PeopleRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToPerson);
  }

  async getBySlug(slug: string): Promise<Person | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToPerson(data);
  }

  async getById(id: string): Promise<Person | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToPerson(data);
  }

  async create(person: Partial<Person>): Promise<Person> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('people')
      .insert({
        slug: person.slug!,
        category: person.category || 'team',
        full_name: person.fullName!,
        title: person.title || '',
        department: person.department,
        bio: person.bio || '',
        short_bio: person.shortBio,
        photo: person.photo,
        email: person.email,
        phone: person.phone,
        location: person.location,
        joined_at: person.joinedAt,
        skills: person.skills || [],
        certifications: person.certifications || [],
        social_links: person.socialLinks || {},
        projects: person.projects || [],
        articles: person.articles || [],
        display_order: person.displayOrder ?? 999,
        featured: Boolean(person.featured),
        active: person.active ?? true,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToPerson(data);
  }

  async update(id: string, updates: Partial<Person>): Promise<Person> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.slug) payload.slug = updates.slug;
    if (updates.category) payload.category = updates.category;
    if (updates.title) payload.title = updates.title;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.shortBio !== undefined) payload.short_bio = updates.shortBio;
    if (updates.photo !== undefined) payload.photo = updates.photo;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.joinedAt !== undefined) payload.joined_at = updates.joinedAt;
    if (updates.skills) payload.skills = updates.skills;
    if (updates.certifications) payload.certifications = updates.certifications;
    if (updates.socialLinks) payload.social_links = updates.socialLinks;
    if (updates.projects) payload.projects = updates.projects;
    if (updates.articles) payload.articles = updates.articles;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.featured !== undefined) payload.featured = updates.featured;
    if (updates.active !== undefined) payload.active = updates.active;

    const { data, error } = await supabase
      .from('people')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToPerson(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('people')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    return !error;
  }
}
