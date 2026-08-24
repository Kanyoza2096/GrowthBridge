// src/repositories/blog.repository.ts
import 'server-only';
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
  };
}

export class BlogRepository {
  async getAll(): Promise<BlogPost[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('[BlogRepository.getAll]', error);
      return [];
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
      .single();

    if (error || !data) return null;
    return mapDbToBlogPost(data);
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
    if (updates.title) payload.title = updates.title;
    if (updates.slug) payload.slug = updates.slug;
    if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt;
    if (updates.content) payload.content = updates.content;
    if (updates.author?.name) payload.author_name = updates.author.name;
    if (updates.image !== undefined) payload.cover_image = updates.image;
    if (updates.tags) payload.tags = updates.tags;
    if (updates.category) payload.category = updates.category;
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

    return !error;
  }
}
