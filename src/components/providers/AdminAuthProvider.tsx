'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AdminUser } from '@/lib/types/admin';
import {
  hasPermission,
  canAccessRoute,
  ROLE_LABELS,
} from '@/lib/constants/rbac';

export { hasPermission, canAccessRoute, ROLE_LABELS };

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (resource: string, action: 'read' | 'create' | 'update' | 'delete') => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);



// ---------------------------------------------------------------------------
// CSRF token cache
// ---------------------------------------------------------------------------
let cachedCsrfToken: string = '';

async function fetchCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const res = await fetch('/api/admin/csrf-token', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return '';

    const data = await res.json();
    // Accept both shapes: { data: { token } } or { token }
    cachedCsrfToken = data?.data?.token || data?.token || '';
    return cachedCsrfToken;
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (
      options.method &&
      options.method !== 'GET' &&
      options.method !== 'HEAD' &&
      options.method !== 'OPTIONS'
    ) {
      const token = await fetchCsrfToken();
      if (token) {
        headers['X-CSRF-Token'] = token;
      }
    }

    const res = await fetch(path, {
      ...options,
      credentials: 'include',
      headers,
      cache: 'no-store',
    });

    const json = await res.json().catch(() => ({}));

    // Explicit success check
    const isSuccess = res.ok && json?.success !== false && (json?.data !== undefined || json?.success === true);

    return { ...json, success: isSuccess };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function checkSession() {
      try {
        const res = await apiFetch<{
          authenticated: boolean;
          user?: AdminUser;
          expired?: boolean;
        }>('/api/admin/session', { method: 'GET' });

        if (cancelledRef.current) return;

        if (res.success && res.data?.authenticated && res.data.user) {
          setUser(res.data.user);
        }
      } catch {
        // Session check failed — user remains unauthenticated
      } finally {
        if (!cancelledRef.current) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await apiFetch<{ user: AdminUser }>('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (res.success && res.data?.user) {
          setUser(res.data.user);
          cachedCsrfToken = '';
          return { success: true };
        }

        // Use specific error message from server
        return { 
          success: false, 
          error: res.error || res.message || 'Login failed. Please check your credentials.' 
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Login failed';
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    cachedCsrfToken = '';
    try {
      await apiFetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Logout is best-effort on the client side
    }
  }, []);


  const hasPerm = useCallback(
    (resource: string, action: 'read' | 'create' | 'update' | 'delete') => {
      if (!user) return false;
      return hasPermission(user.permissions, resource, action);
    },
    [user]
  );

  const canRoute = useCallback(
    (route: string) => {
      if (!user) return false;
      return canAccessRoute(route, user.permissions);
    },
    [user]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        hasPermission: hasPerm,
        canAccessRoute: canRoute,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
