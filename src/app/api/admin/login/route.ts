// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';
import type { AdminRole } from '@/lib/types/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
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
        { status: 401 }
      );
    }

    // Fetch user profile & role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const role = (profile?.role || 'growthbridge_analyst') as AdminRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

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

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
