// src/app/api/admin/csrf-token/route.ts
import { NextResponse } from 'next/server';

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  const token = generateToken();
  const response = NextResponse.json({ success: true, data: { token } });
  response.cookies.set('gb_csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return response;
}
