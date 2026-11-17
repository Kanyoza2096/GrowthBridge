import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function authorized(request: NextRequest): Promise<boolean> {
  const expected = process.env.MEDIA_STORAGE_CLEANUP_SECRET || '';
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

  const admin = createAdminClient();
  const { data: jobs, error: claimError } = await admin.rpc('claim_media_storage_cleanup_jobs', {
    p_limit: 10,
    p_lease_seconds: 120,
  });

  if (claimError) {
    console.error('[Media cleanup] claim failed', claimError.message);
    return NextResponse.json({ ok: false, error: 'Unable to claim cleanup jobs' }, { status: 500 });
  }

  let delivered = 0;
  let retried = 0;
  let failed = 0;

  for (const job of jobs || []) {
    if (!job.lease_token) {
      console.error('[Media cleanup] claimed job has no lease token', job.id);
      retried++;
      continue;
    }

    let storageError: string | null = null;
    try {
      const { error } = await admin.storage.from(job.bucket_id).remove([job.object_path]);
      if (error) storageError = error.message;
    } catch (error) {
      storageError = error instanceof Error ? error.message : 'Unknown Storage deletion error';
    }

    const { data: finalized, error: finalizeError } = await admin.rpc(
      'finish_media_storage_cleanup_job',
      {
        p_job_id: job.id,
        p_lease_token: job.lease_token,
        p_error: storageError,
      }
    );

    if (finalizeError || !finalized) {
      console.error('[Media cleanup] unable to finalize job', job.id, finalizeError?.message);
      retried++;
      continue;
    }

    if (!storageError) {
      delivered++;
    } else if (job.attempt_count >= 10) {
      failed++;
    } else {
      retried++;
    }
  }

  return NextResponse.json(
    { ok: failed === 0, claimed: jobs?.length || 0, delivered, retried, failed },
    { status: failed > 0 ? 502 : 200 }
  );
}
