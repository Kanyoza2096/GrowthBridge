// src/lib/supabase/client.ts
// Browser-safe Supabase client. Uses anon key + RLS for all access.
// Never use service role in this file.
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
