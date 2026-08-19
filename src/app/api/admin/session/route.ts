import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';
import { getUserPermissions } from '@/lib/auth/admin-store';

export const runtime = 'edge';

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json({ success: true, data: { authenticated: false } });
  }
  return NextResponse.json({
    success: true,
    data: {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name || session.user.email.split('@')[0],
        department: session.user.department || '',
        avatar: session.user.avatar || '',
        permissions: Object.entries(getUserPermissions(session.user.role)).map(([resource, actions]) => ({ resource, actions })),
        createdAt: session.user.createdAt || new Date().toISOString(),
      },
    },
  });
}
