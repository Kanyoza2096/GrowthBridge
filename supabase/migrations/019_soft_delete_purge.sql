-- Soft-delete purge utilities
-- Hard-deletes rows whose deleted_at is older than the retention window.
-- Default retention: 180 days. Call from a scheduled job (Supabase cron,
-- Render cron, or external worker). Always writes an audit log entry first
-- when the audit_logs table is available.

CREATE OR REPLACE FUNCTION purge_soft_deleted(
  retention_days INTEGER DEFAULT 180
)
RETURNS TABLE(table_name TEXT, rows_deleted BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff TIMESTAMPTZ := now() - (retention_days || ' days')::INTERVAL;
  r_count BIGINT;
BEGIN
  -- services
  DELETE FROM services WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'services'; rows_deleted := r_count; RETURN NEXT;

  -- projects
  DELETE FROM projects WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'projects'; rows_deleted := r_count; RETURN NEXT;

  -- blog_posts
  DELETE FROM blog_posts WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'blog_posts'; rows_deleted := r_count; RETURN NEXT;

  -- people
  DELETE FROM people WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'people'; rows_deleted := r_count; RETURN NEXT;

  -- media (if soft-deleted)
  BEGIN
    DELETE FROM media WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
    GET DIAGNOSTICS r_count = ROW_COUNT;
    table_name := 'media'; rows_deleted := r_count; RETURN NEXT;
  EXCEPTION WHEN undefined_column THEN
    -- media may not have deleted_at in older schemas
    NULL;
  END;

  -- Log summary into audit_logs when available
  BEGIN
    INSERT INTO audit_logs (action, resource, details, created_at)
    VALUES (
      'purge_soft_deleted',
      'system',
      jsonb_build_object('retention_days', retention_days, 'cutoff', cutoff),
      now()
    );
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;
END;
$$;

COMMENT ON FUNCTION purge_soft_deleted(INTEGER) IS
  'Hard-delete soft-deleted rows older than retention_days (default 180). Run via scheduled job.';

-- Optional: grant execute to service role only (RLS / privileges)
-- REVOKE ALL ON FUNCTION purge_soft_deleted(INTEGER) FROM PUBLIC;
-- GRANT EXECUTE ON FUNCTION purge_soft_deleted(INTEGER) TO service_role;
