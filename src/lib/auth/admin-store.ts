// src/lib/auth/admin-store.ts
import { publicConfig } from '@/lib/config/public';
import { ROLE_PERMISSIONS } from '@/lib/constants/rbac';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  department?: string;
  avatar?: string;
  createdAt?: string;
}

const KANYOZA_API = publicConfig.NEXT_PUBLIC_API_URL.replace(/\/$/, '');

export type AuthResult = 
  | { success: true; user: AdminUser }
  | { success: false; error: 'invalid_credentials' | 'service_unavailable' | 'config_error' };

export function getUserPermissions(role: string): Record<string, string[]> {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  if (!permissions) return { dashboard: ['read'] };
  return Object.fromEntries(permissions.map((permission) => [permission.resource, permission.actions]));
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const masterToken = process.env.MASTER_API_TOKEN;
    
    if (!masterToken) {
      console.error('[Auth] MASTER_API_TOKEN is not set');
      return { success: false, error: 'config_error' };
    }

    const res = await fetch(
      `${KANYOZA_API}/api/v1/growthbridge/admin/verify-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${masterToken}`,
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15000), // 15s timeout
      }
    );

    // Backend says invalid credentials
    if (res.status === 401 || res.status === 403) {
      return { success: false, error: 'invalid_credentials' };
    }

    // Backend is down or having issues
    if (res.status >= 500) {
      console.error(`[Auth] Backend returned ${res.status}`);
      return { success: false, error: 'service_unavailable' };
    }

    if (!res.ok) {
      console.error(`[Auth] Backend returned unexpected status: ${res.status}`);
      return { success: false, error: 'service_unavailable' };
    }

    const data = await res.json();
    
    // Accept both shapes: { valid, user } or { success, user }
    if (!data?.valid || !data?.user) {
      console.error('[Auth] Invalid response from backend:', JSON.stringify(data));
      return { success: false, error: 'service_unavailable' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name ?? data.user.fullName,
        department: data.user.department,
        avatar: data.user.avatar,
        createdAt: data.user.createdAt,
      },
    };
  } catch (error) {
    // Network error, timeout, DNS failure, etc.
    console.error('[Auth] Error verifying credentials:', error);
    return { success: false, error: 'service_unavailable' };
  }
}
