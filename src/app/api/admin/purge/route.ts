// src/app/api/admin/purge/route.ts
// Manual soft-delete purge — restricted to growthbridge_super_admin.
import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'growthbridge_super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden — super admin only' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = z.object({ retentionDays: z.number().int().min(30).max(3650).default(180) }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'retentionDays must be an integer between 30 and 3650.' }, { status: 400 });
    }
    const retentionDays = parsed.data.retentionDays;

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('purge_soft_deleted', {
      retention_days: retentionDays,
    });

    if (error) {
      console.error('[purge]', error);
      return NextResponse.json(
        { success: false, error: 'Purge failed. Ensure the production hardening migrations are applied.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { retentionDays, results: data },
    });
  } catch (err) {
    console.error('[purge]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
