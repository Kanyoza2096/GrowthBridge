import { describe, expect, it } from 'vitest';
import { validateKdoContentInput } from '@/lib/kdo/website-content';

describe('KDO Website Connector content boundary', () => {
  const workspaceId = 'growthbridge-workspace';

  it('normalizes a publish request for the configured workspace', () => {
    const result = validateKdoContentInput({
      title: 'A New Launch',
      content: 'Public article content',
      status: 'publish',
      workspace_id: workspaceId,
      image_url: 'https://cdn.example.com/cover.png',
    }, workspaceId);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.slug).toBe('a-new-launch');
      expect(result.value.status).toBe('published');
      expect(result.value.imageUrl).toBe('https://cdn.example.com/cover.png');
    }
  });

  it('rejects a different workspace', () => {
    const result = validateKdoContentInput({
      title: 'Title', content: 'Content', workspace_id: 'other-workspace',
    }, workspaceId);
    expect(result).toEqual({ ok: false, error: 'Workspace is not authorized for this website integration' });
  });

  it('rejects non-HTTPS media URLs and unsupported status', () => {
    expect(validateKdoContentInput({
      title: 'Title', content: 'Content', workspace_id: workspaceId, image_url: 'http://example.com/a.png',
    }, workspaceId).ok).toBe(false);
    expect(validateKdoContentInput({
      title: 'Title', content: 'Content', workspace_id: workspaceId, status: 'scheduled',
    }, workspaceId).ok).toBe(false);
  });
});
