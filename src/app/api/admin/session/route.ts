// src/app/api/admin/session/route.ts
import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/supabase-auth';

export async function GET() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({
      success: true,
      data: { authenticated: false },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      authenticated: true,
      user,
    },
  });
}
