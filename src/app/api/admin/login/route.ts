// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/auth/session';
import { verifyAdminCredentials, getUserPermissions } from '@/lib/auth/admin-store';

export const runtime = 'edge';

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

    const result = await verifyAdminCredentials(email, password);

    if (!result.success) {
      if (result.error === 'invalid_credentials') {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
      
      if (result.error === 'config_error') {
        console.error('[Login] Server configuration error');
        return NextResponse.json(
          { success: false, error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      // service_unavailable
      return NextResponse.json(
        { success: false, error: 'Authentication service unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    const user = result.user;

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };
    session.isLoggedIn = true;
    const csrfBytes = new Uint8Array(32);
    crypto.getRandomValues(csrfBytes);
    const csrfTokenHex = Array.from(csrfBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    session.csrfToken = csrfTokenHex;
    await session.save();

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          ...session.user,
          permissions: Object.entries(getUserPermissions(user.role)).map(([resource, actions]) => ({ resource, actions })),
        },
      },
    });
    
    response.cookies.set('gb_csrf_token', session.csrfToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: serverConfig.ADMIN_SESSION_MAX_AGE,
    });
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
