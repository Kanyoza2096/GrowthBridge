// src/lib/supabase/server.ts
// Server-only Supabase client. Reads session from cookies via @supabase/ssr.
// Use createAdminClient() for service-role operations (bypasses RLS).
// Use createServerClient() for user-scoped operations (enforces RLS).
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';
import { publicConfig } from '@/lib/config/public';

/**
 * User-scoped server client. Reads the authenticated user's session from
 * cookies. RLS policies are enforced. Use this for all regular data access.
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies cannot be
            // mutated there. Safe to ignore; middleware handles session refresh.
          }
        },
      },
    }
  );
}

/**
 * Service-role admin client. Bypasses RLS. Use ONLY for server-side
 * admin operations where elevated access is explicitly required.
 * Never expose this client or its credentials to the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set. Cannot create admin client.');
  }
  return createSupabaseAdminClient<Database>(
    publicConfig.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
