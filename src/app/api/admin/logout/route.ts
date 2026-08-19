import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';

export const runtime = 'edge';

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.destroy();
  const response = NextResponse.json({ success: true });
  response.cookies.delete('gb_csrf_token');
  return response;
}
