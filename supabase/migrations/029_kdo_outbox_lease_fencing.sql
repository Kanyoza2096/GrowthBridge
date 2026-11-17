-- Fence stale KDO outbox workers so an expired lease cannot be finalized
-- by a dispatcher that no longer owns the claimed row.
ALTER TABLE public.kdo_website_event_outbox
  ADD COLUMN IF NOT EXISTS lease_token UUID;

CREATE OR REPLACE FUNCTION public.claim_kdo_website_event_outbox(
  p_limit INTEGER DEFAULT 20,
  p_lease_seconds INTEGER DEFAULT 60
)
RETURNS SETOF public.kdo_website_event_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT id
    FROM public.kdo_website_event_outbox
    WHERE (status = 'pending' AND next_attempt_at <= now())
       OR (status = 'processing' AND locked_until < now())
    ORDER BY next_attempt_at, created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100)
  )
  UPDATE public.kdo_website_event_outbox AS q
     SET status = 'processing',
         attempt_count = q.attempt_count + 1,
         locked_until = now() + make_interval(secs => LEAST(GREATEST(COALESCE(p_lease_seconds, 60), 10), 600)),
         lease_token = gen_random_uuid()
    FROM candidates
   WHERE q.id = candidates.id
  RETURNING q.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_kdo_website_event_outbox(INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_kdo_website_event_outbox(INTEGER, INTEGER) TO service_role;
