-- Run only against a disposable Supabase test database after migration 030.
DO $$
DECLARE
  v_media_id UUID;
  v_job RECORD;
  v_claim RECORD;
  v_stale_finalized BOOLEAN;
  v_current_finalized BOOLEAN;
BEGIN
  INSERT INTO public.media (name, file_name, url, mime_type, size_bytes)
  VALUES (
    'cleanup-regression',
    'cleanup-regression.png',
    'https://example.supabase.co/storage/v1/object/public/media/uploads/cleanup-regression.png',
    'image/png',
    1
  )
  RETURNING id INTO v_media_id;

  SELECT * INTO v_job
  FROM public.delete_media_with_storage_cleanup(v_media_id, 'uploads/cleanup-regression.png');

  IF v_job.job_id IS NULL OR v_job.lease_token IS NULL THEN
    RAISE EXCEPTION 'Expected a leased cleanup job';
  END IF;

  IF EXISTS (SELECT 1 FROM public.media WHERE id = v_media_id) THEN
    RAISE EXCEPTION 'Media metadata was not deleted transactionally';
  END IF;

  UPDATE public.media_storage_cleanup_outbox
     SET locked_until = now() - interval '1 second'
   WHERE id = v_job.job_id;

  SELECT * INTO v_claim
  FROM public.claim_media_storage_cleanup_jobs(100, 60)
  WHERE id = v_job.job_id;

  IF v_claim.id IS NULL OR v_claim.lease_token = v_job.lease_token THEN
    RAISE EXCEPTION 'Expired cleanup lease was not rotated';
  END IF;

  SELECT public.finish_media_storage_cleanup_job(v_job.job_id, v_job.lease_token, NULL)
    INTO v_stale_finalized;
  IF v_stale_finalized THEN
    RAISE EXCEPTION 'Stale worker finalized a newer cleanup lease';
  END IF;

  SELECT public.finish_media_storage_cleanup_job(v_job.job_id, v_claim.lease_token, NULL)
    INTO v_current_finalized;
  IF NOT v_current_finalized THEN
    RAISE EXCEPTION 'Current cleanup lease could not be finalized';
  END IF;

  DELETE FROM public.media_storage_cleanup_outbox WHERE id = v_job.job_id;
END;
$$;
