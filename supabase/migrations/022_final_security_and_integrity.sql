-- Final security/integrity pass.
-- Supabase recommends empty search_path + fully qualified names for SECURITY DEFINER
-- functions, and explicit grants because RLS does not control function execution.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'growthbridge_analyst'::public.user_role,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger functions must not be remotely callable.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
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
      AND role IN (
        'growthbridge_super_admin',
        'growthbridge_admin',
        'growthbridge_content_manager',
        'growthbridge_project_manager',
        'growthbridge_recruiter',
        'growthbridge_analyst'
      )
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Remove obsolete direct Data API access to authorization-bearing profile columns.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
REVOKE INSERT, DELETE ON public.profiles FROM anon, authenticated;
REVOKE SELECT ON public.profiles FROM anon;

-- The public media bucket is intentionally public. Do not permit document uploads
-- into it because a public object URL would expose potentially private documents.
-- Images only are accepted by the application media service.

-- No direct client execution of privileged maintenance functions.
DROP POLICY IF EXISTS "applications admin insert" ON public.applications;
REVOKE ALL ON FUNCTION public.soft_delete_record(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.purge_soft_deleted(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.soft_delete_record(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.purge_soft_deleted(integer) TO service_role;

-- Prevent future public execution grants for functions created by the project owner.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

-- Public bucket object URLs remain readable, but anonymous/authenticated callers
-- must not be able to enumerate the bucket through the Storage Data API.
DROP POLICY IF EXISTS "Public can view media bucket" ON storage.objects;
REVOKE SELECT ON storage.objects FROM anon, authenticated;
