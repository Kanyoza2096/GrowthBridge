// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';
import type { AdminRole } from '@/lib/types/admin';
import { checkLoginRateLimit } from '@/lib/security/rate-limit';
import { getTrustedClientIp, readJsonBody } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  try {
    const ip = getTrustedClientIp(request);
    let body: { email?: unknown; password?: unknown };
    try {
      body = await readJsonBody<{ email?: unknown; password?: unknown }>(request, 32 * 1024);
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === 'REQUEST_BODY_TOO_LARGE';
      return NextResponse.json(
        { success: false, error: tooLarge ? 'Request body is too large.' : 'Invalid request.' },
        { status: tooLarge ? 413 : 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password || password.length > 256) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const accountLimit = await checkLoginRateLimit(`account:${email}:${ip}`);
    if (accountLimit.limited) {
      const reset = accountLimit.reset;
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))), 'Cache-Control': 'no-store' } },
      );
    }

    const supabase = await createServerClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Fetch user profile & role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id,email,full_name,avatar_url,role,department,created_at,is_active')
      .eq('id', authData.user.id)
      .single();

    if (!profile?.is_active || !profile?.role || !ROLE_PERMISSIONS[profile.role as AdminRole]) {
      await supabase.auth.signOut();
      return NextResponse.json({ success: false, error: 'This account is not provisioned for admin access.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    const role = profile.role as AdminRole;
    const permissions = ROLE_PERMISSIONS[role];

    const user = {
      id: authData.user.id,
      email: authData.user.email,
      name: profile?.full_name || authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
      role,
      department: profile?.department || '',
      avatar: profile?.avatar_url || '',
      permissions,
      createdAt: profile?.created_at || authData.user.created_at,
    };

    return NextResponse.json(
      { success: true, data: { user } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
