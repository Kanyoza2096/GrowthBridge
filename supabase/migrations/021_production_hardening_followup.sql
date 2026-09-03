-- Follow-up hardening: tighten Data API grants, public submissions, functions,
-- and make the public directory explicitly safe.

-- Supabase grants and RLS are separate controls. Sensitive tables are server-only
-- because public form/admin APIs use the server-side service-role client.
REVOKE ALL ON TABLE public.profiles,
  public.talent_profiles,
  public.applications,
  public.media,
  public.media_folders,
  public.site_settings,
  public.contact_submissions,
  public.partnership_requests,
  public.audit_logs
FROM anon, authenticated;

-- Public content is read-only through the Data API. Writes are performed by the
-- trusted server-side admin client after application-level authorization.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.services,
  public.projects,
  public.blog_posts,
  public.people,
  public.testimonials,
  public.faqs,
  public.announcements,
  public.partners,
  public.impact_stats
FROM anon, authenticated;

-- No direct Data API inserts into applications. Public applications are written
-- by /api/apply through the service-role client after validation/rate limiting.
DROP POLICY IF EXISTS "applications admin insert" ON public.applications;

-- The previous migration accidentally retained an unrestricted insert policy.
-- Replace it with the actual RBAC permission check.
CREATE POLICY "applications admin insert" ON public.applications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_permission('applications', 'create'));

-- The application service is the only public submission path for these private
-- tables. Keep direct anonymous/authenticated Data API access disabled.
DROP POLICY IF EXISTS "Anyone can submit application" ON public.applications;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit partnership request" ON public.partnership_requests;

-- Prevent privilege escalation through role changes even if another policy is
-- accidentally added later: only the service role can modify authorization data.
REVOKE UPDATE (role, is_active) ON public.profiles FROM anon, authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;

-- SECURITY DEFINER helpers must be callable only by trusted roles and use an
-- empty search_path so unqualified attacker-controlled objects cannot be used.
CREATE OR REPLACE FUNCTION public.has_admin_permission(p_resource TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_active = true
      AND (
        (p_resource = 'services' AND (
          role IN ('growthbridge_super_admin','growthbridge_admin') OR
          (role IN ('growthbridge_content_manager','growthbridge_project_manager') AND p_action = 'read')
        )) OR
        (p_resource = 'projects' AND (
          role IN ('growthbridge_super_admin','growthbridge_admin','growthbridge_project_manager') OR
          (role = 'growthbridge_content_manager' AND p_action = 'read')
        )) OR
        (p_resource = 'content' AND role IN ('growthbridge_super_admin','growthbridge_admin','growthbridge_content_manager')) OR
        (p_resource = 'media' AND role IN ('growthbridge_super_admin','growthbridge_admin','growthbridge_content_manager','growthbridge_project_manager')) OR
        (p_resource = 'talent' AND role IN ('growthbridge_super_admin','growthbridge_admin','growthbridge_recruiter')) OR
        (p_resource = 'applications' AND role IN ('growthbridge_super_admin','growthbridge_admin','growthbridge_recruiter')) OR
        (p_resource = 'partners' AND (
          role IN ('growthbridge_super_admin','growthbridge_admin') OR
          (role = 'growthbridge_project_manager' AND p_action = 'read')
        )) OR
        (p_resource = 'people' AND role IN ('growthbridge_super_admin','growthbridge_admin')) OR
        (p_resource = 'settings' AND role IN ('growthbridge_super_admin','growthbridge_admin') AND p_action IN ('read','update')) OR
        (p_resource = 'audit' AND role IN ('growthbridge_super_admin','growthbridge_admin') AND p_action = 'read') OR
        (p_resource = 'impact_stats' AND role IN ('growthbridge_super_admin','growthbridge_admin') AND p_action IN ('read','update'))
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_admin_permission(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_admin_permission(TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.soft_delete_record(table_name text, record_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF table_name NOT IN ('services', 'projects', 'blog_posts', 'people') THEN
    RAISE EXCEPTION 'Table is not eligible for soft deletion';
  END IF;

  EXECUTE format(
    'UPDATE public.%I SET deleted_at = now() WHERE id = $1',
    table_name
  ) USING record_id;
END;
$$;
REVOKE ALL ON FUNCTION public.soft_delete_record(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_record(text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.purge_soft_deleted(retention_days INTEGER DEFAULT 180)
RETURNS TABLE(table_name TEXT, rows_deleted BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cutoff TIMESTAMPTZ;
  r_count BIGINT;
BEGIN
  IF retention_days IS NULL OR retention_days < 30 OR retention_days > 3650 THEN
    RAISE EXCEPTION 'retention_days must be between 30 and 3650';
  END IF;

  cutoff := now() - make_interval(days => retention_days);

  DELETE FROM public.services WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'services'; rows_deleted := r_count; RETURN NEXT;

  DELETE FROM public.projects WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'projects'; rows_deleted := r_count; RETURN NEXT;

  DELETE FROM public.blog_posts WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'blog_posts'; rows_deleted := r_count; RETURN NEXT;

  DELETE FROM public.people WHERE deleted_at IS NOT NULL AND deleted_at < cutoff;
  GET DIAGNOSTICS r_count = ROW_COUNT;
  table_name := 'people'; rows_deleted := r_count; RETURN NEXT;

  INSERT INTO public.audit_logs (
    actor_id, actor_name, action, resource_type, resource_name, changes, created_at
  ) VALUES (
    NULL, 'system', 'purge_soft_deleted', 'system', 'soft-deleted records',
    jsonb_build_object('retention_days', retention_days, 'cutoff', cutoff), now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.purge_soft_deleted(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_soft_deleted(INTEGER) TO service_role;

-- Public directory: explicit schema qualification and deliberately limited
-- columns. The view is the only public path to people data.
REVOKE ALL ON public.public_people FROM anon, authenticated;
GRANT SELECT ON public.public_people TO anon, authenticated;

-- Functions created by this project should not become public by default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
