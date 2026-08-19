import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';

export const runtime = 'edge';

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

const isSecureCookie = process.env.NODE_ENV === 'production' || process.env.CF_PAGES === '1';

export async function GET() {
  const token = generateToken();
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  session.csrfToken = token;
  await session.save();
  const response = NextResponse.json({ success: true, data: { token } });
  response.cookies.set('gb_csrf_token', token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
