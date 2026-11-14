type DatabaseError = {
  code?: string;
  constraint?: string;
  message?: string;
};

/** Identifies the blog slug unique-index violation without masking other DB errors. */
export function isBlogSlugConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const databaseError = error as DatabaseError;
  return databaseError.code === '23505' && (
    databaseError.constraint === 'blog_posts_slug_key' ||
    databaseError.message?.includes('blog_posts_slug_key') === true
  );
}
