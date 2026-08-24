// src/repositories/projects.repository.ts
import 'server-only';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { Project, ProjectCategory } from '@/lib/types/project';

function mapDbToProject(row: any): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category as ProjectCategory,
    description: row.description,
    shortDescription: row.short_description || row.description.slice(0, 150),
    image: row.image || '/images/project-placeholder.jpg',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    impact: row.impact || { metric: '', value: '', description: '' },
    testimonial: row.testimonial || undefined,
    serviceDivision: row.service_division || 'Growthbridge Digital',
    featured: Boolean(row.featured),
    completedAt: row.completed_at || row.created_at,
    url: row.url || undefined,
  };
}

export class ProjectsRepository {
  async getAll(): Promise<Project[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ProjectsRepository.getAll]', error);
      return [];
    }
    return (data || []).map(mapDbToProject);
  }

  async getBySlug(slug: string): Promise<Project | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToProject(data);
  }

  async getById(id: string): Promise<Project | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapDbToProject(data);
  }

  async create(project: Partial<Project>): Promise<Project> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        slug: project.slug!,
        title: project.title!,
        client: project.client || 'Internal',
        category: project.category || 'web-development',
        description: project.description || '',
        short_description: project.shortDescription,
        image: project.image,
        gallery: project.gallery || [],
        technologies: project.technologies || [],
        impact: project.impact,
        testimonial: project.testimonial,
        service_division: project.serviceDivision,
        featured: Boolean(project.featured),
        status: 'published',
        completed_at: project.completedAt,
        url: project.url,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToProject(data);
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.slug) payload.slug = updates.slug;
    if (updates.client) payload.client = updates.client;
    if (updates.category) payload.category = updates.category;
    if (updates.description) payload.description = updates.description;
    if (updates.shortDescription !== undefined) payload.short_description = updates.shortDescription;
    if (updates.image) payload.image = updates.image;
    if (updates.gallery) payload.gallery = updates.gallery;
    if (updates.technologies) payload.technologies = updates.technologies;
    if (updates.impact) payload.impact = updates.impact;
    if (updates.testimonial !== undefined) payload.testimonial = updates.testimonial;
    if (updates.serviceDivision) payload.service_division = updates.serviceDivision;
    if (updates.featured !== undefined) payload.featured = updates.featured;
    if (updates.completedAt) payload.completed_at = updates.completedAt;
    if (updates.url !== undefined) payload.url = updates.url;

    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToProject(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    return !error;
  }
}
