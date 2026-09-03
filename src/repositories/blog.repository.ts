// src/repositories/blog.repository.ts
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import type { BlogPost, BlogCategory } from '@/lib/types/blog';

function mapDbToBlogPost(row: any): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || row.content.slice(0, 160),
    content: row.content,
    author: {
      name: row.author_name || 'GrowthBridge Team',
      avatar: '/images/team-placeholder.jpg',
      role: 'Contributor',
    },
    category: (row.category || 'technology') as BlogCategory,
    tags: Array.isArray(row.tags) ? row.tags : [],
    image: row.cover_image || '/images/blog-placeholder.jpg',
    publishedAt: row.published_at || row.created_at,
    readTime: row.read_time || 5,
    featured: Boolean(row.featured),
    status: row.status || 'published',
    scheduledAt: row.scheduled_at || undefined,
  };
}

export class BlogRepository {
  async getAll(includeUnpublished = false): Promise<BlogPost[]> {
    const supabase = await createServerClient();
    let query = supabase.from('blog_posts').select('*').is('deleted_at', null);
    if (!includeUnpublished) query = query.eq('status', 'published');
    const { data, error } = await query
      .order('published_at', { ascending: false });

    if (error) {
      console.error('[BlogRepository.getAll]', error);
      throw error;
    }
    return (data || []).map(mapDbToBlogPost);
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapDbToBlogPost(data);
  }

  async getStatusById(id: string): Promise<string | null> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('status')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data?.status || null;
  }

  async create(post: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        slug: post.slug!,
        title: post.title!,
        excerpt: post.excerpt,
        content: post.content || '',
        author_name: post.author?.name || 'GrowthBridge Team',
        cover_image: post.image,
        tags: post.tags || [],
        category: post.category || 'technology',
        status: 'published',
        published_at: post.publishedAt || new Date().toISOString(),
        read_time: post.readTime || 5,
        featured: Boolean(post.featured),
      } as any)
      .select()
      .single();

    if (error) throw error;
    return mapDbToBlogPost(data);
  }

  async update(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = createAdminClient();
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.author?.name !== undefined) payload.author_name = updates.author.name;
    if (updates.image !== undefined) payload.cover_image = updates.image;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.readTime !== undefined) payload.read_time = updates.readTime;
    if (updates.featured !== undefined) payload.featured = updates.featured;

    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbToBlogPost(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('blog_posts')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
