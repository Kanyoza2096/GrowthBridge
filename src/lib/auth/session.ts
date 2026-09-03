// src/lib/auth/session.ts
// Deprecated: Migrated to Supabase SSR Auth cookies.
export interface SessionData {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  isLoggedIn?: boolean;
}
