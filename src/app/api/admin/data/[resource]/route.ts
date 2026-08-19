import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';
import type { AdminRole } from '@/lib/types/admin';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    resource: string;
  }>;
};

const ALLOWED_RESOURCES = [
  'services',
  'projects',
  'blog',
  'team',
  'testimonials',
  'partners',
  'faqs',
  'announcements',
  'applications',
  'inquiries',
  'media',
  'settings',
  'dashboard',
  'analytics',
  'audit-logs',
  'media-folders',
];

const ADMIN_ROLES: AdminRole[] = [
  'growthbridge_super_admin',
  'growthbridge_admin',
];

const MOD_ROLES: AdminRole[] = [
  ...ADMIN_ROLES,
  'growthbridge_content_manager',
  'growthbridge_project_manager',
  'growthbridge_recruiter',
  'growthbridge_analyst',
];

function hasDataAccess(role: string | undefined, resource: string): boolean {
  if (!role) return false;
  if (ADMIN_ROLES.includes(role as AdminRole)) return true;

  if (role === 'growthbridge_content_manager') {
    return ['blog', 'testimonials', 'faqs', 'announcements', 'media', 'services', 'projects', 'settings', 'dashboard', 'analytics'].includes(resource);
  }
  if (role === 'growthbridge_project_manager') {
    return ['projects', 'media', 'services', 'partners', 'settings', 'dashboard', 'analytics'].includes(resource);
  }
  if (role === 'growthbridge_recruiter') {
    return ['team', 'applications', 'inquiries', 'media', 'dashboard', 'analytics'].includes(resource);
  }
  if (role === 'growthbridge_analyst') {
    return ['dashboard', 'analytics'].includes(resource);
  }
  return MOD_ROLES.includes(role as AdminRole);
}

async function authenticateAdmin(resource: string) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  
  if (!session?.user || !session?.isLoggedIn) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  if (!hasDataAccess(session.user.role, resource)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      )
    };
  }

  return { session };
}

async function proxyToBackend(
  resource: string,
  method: string,
  body?: unknown,
  searchParams?: URLSearchParams,
  id?: string,
) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const masterToken = process.env.MASTER_API_TOKEN;

  if (!apiBase || !masterToken) {
    throw new Error('Backend configuration missing');
  }

  const adminBasePath = process.env.NEXT_PUBLIC_ADMIN_API_BASE_PATH || '/api/v1/growthbridge/admin';
  const suffix = id ? `/${encodeURIComponent(id)}` : '';
  const url = new URL(`${apiBase}${adminBasePath}/${resource}${suffix}`);
  
  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (key !== 'id') url.searchParams.set(key, value);
    });
  }

  const headers: HeadersInit = {
    'Authorization': `Bearer ${masterToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(`Backend auth failed`);
    }
    if (response.status === 400 || response.status === 422) {
      const detail = await response.json().catch(() => ({}));
      throw Object.assign(new Error('Validation error'), { details: detail, status: 400 });
    }
    throw new Error(`Backend request failed`);
  }

  return response.json();
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { resource } = await context.params;
    
    const auth = await authenticateAdmin(resource);
    if ('error' in auth) return auth.error;

    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const data = await proxyToBackend(resource, 'GET', undefined, searchParams);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if ((error as any)?.status === 400) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: (error as any).details },
        { status: 400 }
      );
    }
    console.error(`[API] Error fetching collection:`, error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data from backend' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { resource } = await context.params;
    
    const auth = await authenticateAdmin(resource);
    if ('error' in auth) return auth.error;

    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => {
      throw Object.assign(new Error('Invalid JSON body'), { status: 400 });
    });
    const data = await proxyToBackend(resource, 'POST', body);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if ((error as any)?.status === 400) {
      return NextResponse.json(
        { success: false, error: (error as Error).message || 'Invalid request', details: (error as any).details },
        { status: 400 }
      );
    }
    console.error(`[API] Error creating record:`, error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to create record' },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { resource } = await context.params;
    
    const auth = await authenticateAdmin(resource);
    if ('error' in auth) return auth.error;

    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => {
      throw Object.assign(new Error('Invalid JSON body'), { status: 400 });
    });
    const data = await proxyToBackend(resource, 'PUT', body);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if ((error as any)?.status === 400) {
      return NextResponse.json(
        { success: false, error: (error as Error).message || 'Invalid request', details: (error as any).details },
        { status: 400 }
      );
    }
    console.error(`[API] Error updating collection:`, error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to update records' },
      { status: 502 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { resource } = await context.params;
    
    const auth = await authenticateAdmin(resource);
    if ('error' in auth) return auth.error;

    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resource' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter. Use /api/admin/data/{resource}/{id} for single-record DELETE.' },
        { status: 400 }
      );
    }

    const data = await proxyToBackend(resource, 'DELETE', undefined, searchParams, id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[API] Error deleting from collection:`, error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { success: false, error: 'Failed to delete records' },
      { status: 502 }
    );
  }
}
