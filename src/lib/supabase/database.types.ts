export type Database = {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
};


// Explicit contracts for the KDO website integration migration. The app's
// existing Supabase client uses a permissive schema map for compatibility with
// the pinned @supabase/ssr 0.6 / @supabase-js 2.50 client typings.
export type KdoWebsiteEventOutboxRow = {
  id: string;
  integration_id: string;
  event_id: string;
  event_type: string;
  event_version: string;
  occurred_at: string;
  payload: Json;
  status: string;
  attempt_count: number;
  next_attempt_at: string;
  locked_until: string | null;
  last_error: string | null;
  created_at: string;
  delivered_at: string | null;
};

export type KdoContentIdempotencyRow = {
  id: string;
  idempotency_key: string;
  request_hash: string;
  response: Json;
  created_at: string;
};
