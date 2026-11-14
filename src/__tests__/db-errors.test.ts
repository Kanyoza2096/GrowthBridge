import { describe, expect, it } from 'vitest';
import { isBlogSlugConflict } from '@/lib/security/db-errors';

describe('isBlogSlugConflict', () => {
  it('recognizes the blog_posts slug unique constraint', () => {
    expect(isBlogSlugConflict({
      code: '23505',
      message: 'duplicate key value violates unique constraint "blog_posts_slug_key"',
    })).toBe(true);
  });

  it('recognizes a structured constraint field', () => {
    expect(isBlogSlugConflict({ code: '23505', constraint: 'blog_posts_slug_key' })).toBe(true);
  });

  it('does not convert unrelated database errors into slug conflicts', () => {
    expect(isBlogSlugConflict({ code: '23505', constraint: 'projects_slug_key' })).toBe(false);
    expect(isBlogSlugConflict({ code: 'PGRST205', message: 'table not found' })).toBe(false);
    expect(isBlogSlugConflict(null)).toBe(false);
  });
});
