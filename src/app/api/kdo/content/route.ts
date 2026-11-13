import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateKdoContentInput } from '@/lib/kdo/website-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bearerMatches(request: NextRequest, expected: string): boolean {
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const token = process.env.KDO_WEBSITE_CONNECTOR_TOKEN || '';
  const workspaceId = process.env.KDO_WEBSITE_CONNECTOR_WORKSPACE_ID || '';
  if (!token || !workspaceId) {
    return NextResponse.json({ success: false, error: 'KDO Website Connector is not configured' }, { status: 503 });
  }
  if (!bearerMatches(request, token)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > 1_000_000) {
    return NextResponse.json({ success: false, error: 'Request body is too large' }, { status: 413 });
  }
  const raw = await request.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ success: false, error: 'A JSON object is required' }, { status: 400 });
  }

  const validated = validateKdoContentInput(raw, workspaceId);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const idempotencyKey = request.headers.get('idempotency-key') || raw.idempotency_key;
  if (typeof idempotencyKey !== 'string' || idempotencyKey.trim().length < 8 || idempotencyKey.trim().length > 200) {
    return NextResponse.json({ success: false, error: 'A valid Idempotency-Key header is required' }, { status: 400 });
  }

  const value = validated.value;
  const canonical = JSON.stringify({
    workspaceId: value.workspaceId,
    title: value.title,
    content: value.content,
    slug: value.slug,
    status: value.status,
    imageUrl: value.imageUrl,
  });
  const requestHash = createHash('sha256').update(canonical).digest('hex');

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('publish_kdo_blog_content', {
    p_idempotency_key: idempotencyKey.trim(),
    p_workspace_id: value.workspaceId,
    p_request_sha256: requestHash,
    p_title: value.title,
    p_slug: value.slug,
    p_content: value.content,
    p_excerpt: value.content.slice(0, 240),
    p_cover_image: value.imageUrl,
    p_status: value.status,
  });

  if (error) {
    const conflict = error.code === '23505' || error.code === '22023';
    console.error('[KDO Website Connector] publish failed', error.message);
    return NextResponse.json(
      { success: false, error: conflict ? 'Publication conflicts with an existing request or slug' : 'Unable to publish content' },
      { status: conflict ? 409 : 500 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
