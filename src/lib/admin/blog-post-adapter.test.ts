import { describe, expect, it } from 'vitest';
import { toAdminBlogPost } from './blog-post-adapter';

describe('toAdminBlogPost', () => {
  it('flattens the public author object for the admin CMS', () => {
    const post = toAdminBlogPost({
      id: 'post-1',
      title: 'Integration test',
      author: { name: 'KDO Team', avatar: '/avatar.png', role: 'Contributor' },
      image: '/cover.png',
      status: 'published',
      tags: ['KDO', 12],
    });

    expect(post.author).toBe('KDO Team');
    expect(post.coverImage).toBe('/cover.png');
    expect(post.status).toBe('published');
    expect(post.tags).toEqual(['KDO']);
  });

  it('supports already-flat admin records and safe defaults', () => {
    const post = toAdminBlogPost({ author: 'Editor', status: 'unknown', tags: null });
    expect(post.author).toBe('Editor');
    expect(post.status).toBe('draft');
    expect(post.tags).toEqual([]);
  });
});
