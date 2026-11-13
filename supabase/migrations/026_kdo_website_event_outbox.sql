-- Durable delivery queue for GrowthBridge -> KDO Website Integration events.
CREATE TABLE IF NOT EXISTS public.kdo_website_event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'project.created','project.updated','project.deleted',
    'service.created','service.updated','blog.created','blog.published',
    'application.created','application.updated','contact.submitted',
    'partnership.requested','talent.profile.created','testimonial.created','settings.updated'
  )),
  event_version TEXT NOT NULL DEFAULT '1.0',
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','delivered','failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  UNIQUE (integration_id, event_id)
);

ALTER TABLE public.kdo_website_event_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.kdo_website_event_outbox FROM anon, authenticated;
GRANT ALL ON TABLE public.kdo_website_event_outbox TO service_role;
CREATE INDEX IF NOT EXISTS kdo_website_outbox_pending_idx
  ON public.kdo_website_event_outbox (next_attempt_at, created_at)
  WHERE status IN ('pending','processing');

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
         locked_until = now() + make_interval(secs => LEAST(GREATEST(COALESCE(p_lease_seconds, 60), 10), 600))
    FROM candidates
   WHERE q.id = candidates.id
  RETURNING q.*;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_kdo_website_event_outbox(INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_kdo_website_event_outbox(INTEGER, INTEGER) TO service_role;
