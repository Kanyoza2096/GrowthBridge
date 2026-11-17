-- Run after migrations 026 and 029 in a disposable/test database.
-- Proves that a worker holding an expired lease cannot finalize a row after
-- another worker has reclaimed it with a new fencing token.
DO $$
DECLARE
  v_id UUID := gen_random_uuid();
  v_event_id TEXT := 'lease-fencing-' || gen_random_uuid()::text;
  v_first_token UUID;
  v_second_token UUID;
  v_rows INTEGER;
BEGIN
  INSERT INTO public.kdo_website_event_outbox (
    id, integration_id, event_id, event_type, occurred_at, payload
  ) VALUES (
    v_id, 'lease-fencing-test', v_event_id, 'project.updated', now(), '{}'::jsonb
  );

  SELECT lease_token INTO v_first_token
  FROM public.claim_kdo_website_event_outbox(1, 60)
  WHERE id = v_id;
  IF v_first_token IS NULL THEN
    RAISE EXCEPTION 'first claim did not assign a lease token';
  END IF;

  UPDATE public.kdo_website_event_outbox
  SET locked_until = now() - interval '1 second'
  WHERE id = v_id;

  SELECT lease_token INTO v_second_token
  FROM public.claim_kdo_website_event_outbox(1, 60)
  WHERE id = v_id;
  IF v_second_token IS NULL OR v_second_token = v_first_token THEN
    RAISE EXCEPTION 'reclaim did not rotate the lease token';
  END IF;

  UPDATE public.kdo_website_event_outbox
  SET status = 'delivered', lease_token = NULL, locked_until = NULL
  WHERE id = v_id AND status = 'processing' AND lease_token = v_first_token;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows <> 0 THEN
    RAISE EXCEPTION 'stale worker unexpectedly finalized a reclaimed event';
  END IF;

  DELETE FROM public.kdo_website_event_outbox WHERE id = v_id;
END;
$$;
