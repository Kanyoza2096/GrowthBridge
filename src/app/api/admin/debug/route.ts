import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';
import type { AdminRole } from '@/lib/types/admin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const ADMIN_ROLES: AdminRole[] = ['growthbridge_super_admin', 'growthbridge_admin'];

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session?.isLoggedIn || !session?.user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!ADMIN_ROLES.includes(session.user.role as AdminRole)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const masterToken = process.env.MASTER_API_TOKEN;
  const adminSecretSet = Boolean(process.env.ADMIN_SESSION_SECRET);
  const pepperSet = Boolean(process.env.ADMIN_HASH_PEPPER);

  let backendTest = {
    status: 'not-tested' as string,
    latencyMs: null as number | null,
    error: null as string | null,
  };

  if (apiUrl && masterToken) {
    const started = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${apiUrl}/api/v1/growthbridge/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${masterToken}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      backendTest.status = String(response.status);
      backendTest.latencyMs = Math.round(performance.now() - started);
    } catch (error) {
      backendTest.status = 'error';
      backendTest.latencyMs = Math.round(performance.now() - started);
      backendTest.error = error instanceof Error 
        ? (error.name === 'AbortError' ? 'Timeout after 5s' : 'Network error')
        : 'Unknown error';
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      config: {
        apiUrlSet: Boolean(apiUrl),
        masterTokenSet: Boolean(masterToken),
        adminSessionSecretSet: adminSecretSet,
        adminHashPepperSet: pepperSet,
        runtime: process.env.NODE_ENV,
        cfPages: process.env.CF_PAGES === '1',
      },
      user: {
        role: session.user.role,
        email: session.user.email,
      },
      backendTest,
    },
  });
}
