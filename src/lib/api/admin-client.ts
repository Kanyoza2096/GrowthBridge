'use client';

let csrfToken = '';

async function getCsrfToken(force = false): Promise<string> {
  if (csrfToken && !force) return csrfToken;
  
  try {
    const response = await fetch('/api/admin/csrf-token', { 
      credentials: 'include', 
      cache: 'no-store' 
    });
    
    const body = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new Error(body?.error || 'Unable to establish a secure admin session.');
    }
    
    // FIX: Accept both shapes: { data: { token } } or { token }
    const token = body?.data?.token ?? body?.token;
    
    if (typeof token !== 'string' || !token) {
      console.error('[AdminClient] Invalid CSRF token response:', body);
      throw new Error('Unable to establish a secure admin session.');
    }
    
    csrfToken = token;
    return csrfToken;
  } catch (error) {
    console.error('[AdminClient] Failed to fetch CSRF token:', error);
    throw error;
  }
}

export function clearAdminCsrfToken() { 
  csrfToken = ''; 
}

export async function adminFetch<T = unknown>(
  path: string, 
  options: RequestInit = {}, 
  retry = true
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  
  // Only set Content-Type for JSON bodies, not FormData
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  headers.set('Accept', 'application/json');

  // Add CSRF token for mutations
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await getCsrfToken();
    headers.set('X-CSRF-Token', token);
  }

  const response = await fetch(path, { 
    ...options, 
    method, 
    headers, 
    credentials: 'include', 
    cache: 'no-store' 
  });
  
  const body = await response.json().catch(() => ({}));

  // Retry once on 403 (CSRF token may have been rotated)
  if (response.status === 403 && retry && !['GET', 'HEAD'].includes(method)) {
    clearAdminCsrfToken();
    return adminFetch<T>(path, options, false);
  }
  
  // Handle 401 (session expired)
  if (response.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(body?.error || body?.message || `Admin API request failed (${response.status}).`);
  }
  
  // Accept both shapes: { data: ... } or direct value
  return (body?.data ?? body) as T;
}
