// src/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Logout error:', err);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('gb_csrf_token');
  return response;
}
