-- Durable, lease-fenced cleanup for Supabase Storage objects after media deletion.
CREATE TABLE IF NOT EXISTS public.media_storage_cleanup_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL,
  bucket_id TEXT NOT NULL CHECK (bucket_id = 'media'),
  object_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'failed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_until TIMESTAMPTZ,
  lease_token UUID,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS media_storage_cleanup_pending_idx
  ON public.media_storage_cleanup_outbox (next_attempt_at, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS media_storage_cleanup_expired_idx
  ON public.media_storage_cleanup_outbox (locked_until)
  WHERE status = 'processing';

ALTER TABLE public.media_storage_cleanup_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.media_storage_cleanup_outbox FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.media_storage_cleanup_outbox TO service_role;

CREATE OR REPLACE FUNCTION public.delete_media_with_storage_cleanup(
  p_media_id UUID,
  p_object_path TEXT DEFAULT NULL
)
RETURNS TABLE(job_id UUID, bucket_id TEXT, object_path TEXT, lease_token UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_lease_token UUID;
  v_job_id UUID;
BEGIN
  PERFORM 1
  FROM public.media AS m
  WHERE m.id = p_media_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'MEDIA_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF p_object_path IS NOT NULL THEN
    IF p_object_path !~ '^uploads/[A-Za-z0-9._-]+$' THEN
      RAISE EXCEPTION 'INVALID_MEDIA_OBJECT_PATH' USING ERRCODE = '22023';
    END IF;

    v_lease_token := gen_random_uuid();
    INSERT INTO public.media_storage_cleanup_outbox (
      media_id, bucket_id, object_path, status, attempt_count,
      locked_until, lease_token
    )
    VALUES (
      p_media_id, 'media', p_object_path, 'processing', 1,
      now() + interval '2 minutes', v_lease_token
    )
    RETURNING id INTO v_job_id;
  END IF;

  DELETE FROM public.media WHERE id = p_media_id;

  IF v_job_id IS NOT NULL THEN
    RETURN QUERY SELECT v_job_id, 'media'::TEXT, p_object_path, v_lease_token;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_media_storage_cleanup_jobs(
  p_limit INTEGER DEFAULT 10,
  p_lease_seconds INTEGER DEFAULT 120
)
RETURNS SETOF public.media_storage_cleanup_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT q.id
    FROM public.media_storage_cleanup_outbox AS q
    WHERE (q.status = 'pending' AND q.next_attempt_at <= now())
       OR (q.status = 'processing' AND q.locked_until < now())
    ORDER BY q.next_attempt_at, q.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50)
  )
  UPDATE public.media_storage_cleanup_outbox AS q
     SET status = 'processing',
         attempt_count = q.attempt_count + 1,
         locked_until = now() + make_interval(secs => LEAST(GREATEST(COALESCE(p_lease_seconds, 120), 15), 600)),
         lease_token = gen_random_uuid()
    FROM candidates
   WHERE q.id = candidates.id
  RETURNING q.*;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_media_storage_cleanup_job(
  p_job_id UUID,
  p_lease_token UUID,
  p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated UUID;
BEGIN
  UPDATE public.media_storage_cleanup_outbox AS q
     SET status = CASE
           WHEN p_error IS NULL THEN 'delivered'
           WHEN q.attempt_count >= 10 THEN 'failed'
           ELSE 'pending'
         END,
         delivered_at = CASE WHEN p_error IS NULL THEN now() ELSE NULL END,
         last_error = CASE WHEN p_error IS NULL THEN NULL ELSE left(p_error, 1000) END,
         next_attempt_at = CASE
           WHEN p_error IS NULL THEN q.next_attempt_at
           ELSE now() + make_interval(secs => LEAST(3600, 15 * power(2, LEAST(q.attempt_count, 8))::INTEGER))
         END,
         locked_until = NULL,
         lease_token = NULL
   WHERE q.id = p_job_id
     AND q.status = 'processing'
     AND q.lease_token = p_lease_token
  RETURNING q.id INTO v_updated;

  RETURN v_updated IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_media_with_storage_cleanup(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_media_storage_cleanup_jobs(INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finish_media_storage_cleanup_job(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_media_with_storage_cleanup(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_media_storage_cleanup_jobs(INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_media_storage_cleanup_job(UUID, UUID, TEXT) TO service_role;
