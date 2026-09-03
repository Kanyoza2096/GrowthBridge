// src/services/blog.service.ts
import { BlogRepository } from '@/repositories/blog.repository';
import { eventPublisher } from '@/events/publisher';
import type { BlogPost } from '@/lib/types/blog';

export class BlogService {
  private repo = new BlogRepository();

  async getBlogPosts(): Promise<BlogPost[]> {
    return this.repo.getAll();
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    return this.repo.getBySlug(slug);
  }

  async createBlogPost(data: Partial<BlogPost>, actorId?: string): Promise<BlogPost> {
    const post = await this.repo.create(data);
    await eventPublisher.publish('blog.created', post, { actorId });
    if (post.publishedAt) {
      await eventPublisher.publish('blog.published', post, { actorId });
    }
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>, actorId?: string): Promise<BlogPost> {
    const previousStatus = await this.repo.getStatusById(id);
    const updated = await this.repo.update(id, updates);
    const currentStatus = await this.repo.getStatusById(id);
    const wasPublished = previousStatus === 'published';
    const isPublished = currentStatus === 'published';

    if (!wasPublished && isPublished) {
      await eventPublisher.publish('blog.published', updated, { actorId });
    }
    return updated;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export const blogService = new BlogService();
