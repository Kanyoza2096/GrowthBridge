import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function authorized(request: NextRequest): Promise<boolean> {
  const expected = process.env.KDO_WEBSITE_DISPATCH_SECRET || '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\\s+/i, '') || '';
  if (!expected || supplied.length !== expected.length) return false;
  const encoder = new TextEncoder();
  const [expectedHash, suppliedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
    crypto.subtle.digest('SHA-256', encoder.encode(supplied)),
  ]);
  const left = new Uint8Array(expectedHash);
  const right = new Uint8Array(suppliedHash);
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function POST(request: NextRequest) {
  if (!(await authorized(request))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const integrationId = process.env.KDO_WEBSITE_INTEGRATION_ID?.trim();
  const endpoint = process.env.KDO_WEBSITE_EVENTS_URL?.trim();
  const token = process.env.KDO_WEBSITE_INTEGRATION_TOKEN?.trim();
  if (!integrationId || !endpoint || !token) {
    return NextResponse.json({ ok: false, error: 'KDO Website Integration is not configured' }, { status: 503 });
  }
  if (!endpoint.startsWith('https://') || !endpoint.endsWith(`/${encodeURIComponent(integrationId)}/events`)) {
    return NextResponse.json({ ok: false, error: 'KDO events URL must be the HTTPS integration events endpoint' }, { status: 500 });
  }

  const admin = createAdminClient();
  const { data: rows, error } = await admin.rpc('claim_kdo_website_event_outbox', {
    p_limit: 5,
    p_lease_seconds: 90,
  });
  if (error) {
    console.error('[KDO outbox] claim failed', error.message);
    return NextResponse.json({ ok: false, error: 'Unable to claim queued events' }, { status: 500 });
  }

  let delivered = 0;
  let retried = 0;
  let failed = 0;
  for (const row of rows || []) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          integration_id: row.integration_id,
          event_id: row.event_id,
          event_type: row.event_type,
          event_version: row.event_version,
          occurred_at: row.occurred_at,
          payload: row.payload,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const { error: updateError } = await admin.from('kdo_website_event_outbox')
          .update({ status: 'delivered', delivered_at: new Date().toISOString(), locked_until: null, last_error: null })
          .eq('id', row.id).eq('status', 'processing');
        if (updateError) throw new Error(updateError.message);
        delivered++;
        continue;
      }
      const message = `KDO returned HTTP ${response.status}`;
      const permanent = response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
      const exhausted = row.attempt_count >= 10;
      const status = permanent || exhausted ? 'failed' : 'pending';
      const delaySeconds = Math.min(3600, 15 * (2 ** Math.min(row.attempt_count, 8)));
      const { error: updateError } = await admin.from('kdo_website_event_outbox').update({
        status, last_error: message, locked_until: null,
        next_attempt_at: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      }).eq('id', row.id).eq('status', 'processing');
      if (updateError) throw new Error(updateError.message);
      if (status === 'failed') failed++; else retried++;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown delivery error';
      const exhausted = row.attempt_count >= 10;
      const delaySeconds = Math.min(3600, 15 * (2 ** Math.min(row.attempt_count, 8)));
      const { error: updateError } = await admin.from('kdo_website_event_outbox').update({
        status: exhausted ? 'failed' : 'pending',
        last_error: message.slice(0, 1000),
        locked_until: null,
        next_attempt_at: new Date(Date.now() + delaySeconds * 1000).toISOString(),
      }).eq('id', row.id).eq('status', 'processing');
      if (updateError) console.error('[KDO outbox] failed to release event', row.id, updateError.message);
      if (exhausted) failed++; else retried++;
    }
  }

  return NextResponse.json({ ok: true, claimed: rows?.length || 0, delivered, retried, failed });
}
