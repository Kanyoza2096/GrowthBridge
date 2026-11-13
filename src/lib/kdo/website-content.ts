export type KdoContentInput = {
  title?: unknown;
  content?: unknown;
  slug?: unknown;
  status?: unknown;
  image_url?: unknown;
  workspace_id?: unknown;
};

export type ValidKdoContent = {
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'published';
  imageUrl: string | null;
  workspaceId: string;
};

export function slugifyKdoTitle(title: string): string {
  return title.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function validateKdoContentInput(
  input: KdoContentInput,
  expectedWorkspaceId: string
): { ok: true; value: ValidKdoContent } | { ok: false; error: string } {
  if (!expectedWorkspaceId || input.workspace_id !== expectedWorkspaceId) {
    return { ok: false, error: 'Workspace is not authorized for this website integration' };
  }
  if (typeof input.title !== 'string' || input.title.trim().length < 1 || input.title.trim().length > 180) {
    return { ok: false, error: 'Title must contain 1 to 180 characters' };
  }
  if (typeof input.content !== 'string' || input.content.trim().length < 1 || input.content.length > 50000) {
    return { ok: false, error: 'Content must contain 1 to 50000 characters' };
  }
  const title = input.title.trim();
  const content = input.content.trim();
  const slug = typeof input.slug === 'string' && input.slug.trim()
    ? slugifyKdoTitle(input.slug.trim())
    : slugifyKdoTitle(title);
  if (!slug) return { ok: false, error: 'A valid slug could not be generated' };

  const requestedStatus = input.status === undefined ? 'publish' : input.status;
  if (requestedStatus !== 'publish' && requestedStatus !== 'draft') {
    return { ok: false, error: 'Only publish and draft statuses are supported' };
  }

  let imageUrl: string | null = null;
  if (input.image_url !== undefined && input.image_url !== null && input.image_url !== '') {
    if (typeof input.image_url !== 'string') return { ok: false, error: 'Image URL must be HTTPS' };
    try {
      const parsed = new URL(input.image_url);
      if (parsed.protocol !== 'https:') return { ok: false, error: 'Image URL must be HTTPS' };
      imageUrl = parsed.toString();
    } catch {
      return { ok: false, error: 'Image URL must be HTTPS' };
    }
  }

  return {
    ok: true,
    value: {
      title,
      content,
      slug,
      status: requestedStatus === 'publish' ? 'published' : 'draft',
      imageUrl,
      workspaceId: expectedWorkspaceId,
    },
  };
}
