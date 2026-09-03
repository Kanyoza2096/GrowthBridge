// src/app/api/admin/debug/route.ts
// Intentionally disabled in production to avoid leaking configuration surface.
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';
import { createServerClient } from '@/lib/supabase/server';
import type { AdminRole } from '@/lib/types/admin';

const ADMIN_ROLES: AdminRole[] = ['growthbridge_super_admin', 'growthbridge_admin'];

export async function GET() {
  // Never expose debug information in production.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const user = await getServerUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!ADMIN_ROLES.includes(user.role as AdminRole)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  const supabaseUrlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKeySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleKeySet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const autonomousPlatformUrl = process.env.AUTONOMOUS_PLATFORM_URL;
  const autonomousEnabled = process.env.NEXT_PUBLIC_AUTONOMOUS_PLATFORM_ENABLED === 'true';
  const upstashConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );

  let dbStatus = 'healthy';
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.from('site_settings').select('id').limit(1);
    if (error) dbStatus = 'unhealthy';
  } catch {
    dbStatus = 'unhealthy';
  }

  return NextResponse.json({
    success: true,
    data: {
      config: {
        supabaseUrlSet,
        supabaseAnonKeySet,
        serviceRoleKeySet,
        autonomousPlatformUrlSet: Boolean(autonomousPlatformUrl),
        autonomousPlatformEnabled: autonomousEnabled,
        upstashRateLimitConfigured: upstashConfigured,
        runtime: process.env.NODE_ENV,
      },
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      databaseTest: {
        status: dbStatus,
      },
    },
  });
}
