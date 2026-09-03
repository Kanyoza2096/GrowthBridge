-- Production hardening
-- This migration closes privilege-escalation and public-data exposure paths.

-- Add the activation state before any security helper references it.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- 1) Never trust signup metadata for authorization. Every new account starts
-- as the least-privileged role and must be promoted through a privileged flow.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'growthbridge_analyst'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2) Remove the broad "is_admin" policies. The application admin API uses a
-- server-only service-role client after performing explicit RBAC checks. The
-- anon/authenticated clients must not be able to bypass those checks by
-- talking directly to Postgres.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage people" ON public.people;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Admins can manage talent profiles" ON public.talent_profiles;
DROP POLICY IF EXISTS "Admins can view and manage applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
DROP POLICY IF EXISTS "Admins can manage media folders" ON public.media_folders;
DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update impact stats" ON public.impact_stats;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view partnership requests" ON public.partnership_requests;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

-- A user may read only their own profile. Profile updates are intentionally
-- disabled from the client; role changes must never be self-service.
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 3) Public data remains public only where the application actually needs it.
-- Private/admin-only tables have no anon/authenticated SELECT policies.

-- 4) Make the soft-delete helper service-role-only and restrict its table set.
CREATE OR REPLACE FUNCTION public.soft_delete_record(table_name text, record_id uuid)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
REVOKE ALL ON FUNCTION public.soft_delete_record(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_record(text, uuid) TO service_role;

-- 5) Purge only through the service role, with a DB-enforced safe minimum.
CREATE OR REPLACE FUNCTION public.purge_soft_deleted(
  retention_days INTEGER DEFAULT 180
)
RETURNS TABLE(table_name TEXT, rows_deleted BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Media currently has no deleted_at column, so it is intentionally excluded.
  -- Audit entry is schema-aligned and best-effort only because purge itself is
  -- the critical operation.
  INSERT INTO public.audit_logs (
    actor_id,
    actor_name,
    action,
    resource_type,
    resource_name,
    changes,
    created_at
  ) VALUES (
    NULL,
    'system',
    'purge_soft_deleted',
    'system',
    'soft-deleted records',
    jsonb_build_object('retention_days', retention_days, 'cutoff', cutoff),
    now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.purge_soft_deleted(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_soft_deleted(INTEGER) TO service_role;

-- 6) Storage: public read for published media assets, service-role writes.
-- The service role bypasses Storage RLS; these policies mainly document and
-- enforce the intended boundary for anon/authenticated callers.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public can view media bucket" ON storage.objects;
CREATE POLICY "Public can view media bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Only service role can write media bucket" ON storage.objects;
CREATE POLICY "Only service role can write media bucket" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 7) Granular RLS for authenticated admin users. This keeps direct Supabase
-- access consistent with the application RBAC model without exposing all data
-- to every role.
CREATE OR REPLACE FUNCTION public.has_admin_permission(p_resource TEXT, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
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

-- Services / projects / content
CREATE POLICY "Admin users can manage services by permission" ON public.services
  FOR ALL USING (public.has_admin_permission('services', 'update'))
  WITH CHECK (public.has_admin_permission('services', 'update'));
CREATE POLICY "Admin users can manage projects by permission" ON public.projects
  FOR ALL USING (public.has_admin_permission('projects', 'update'))
  WITH CHECK (public.has_admin_permission('projects', 'update'));
CREATE POLICY "Content managers can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.has_admin_permission('content', 'update'))
  WITH CHECK (public.has_admin_permission('content', 'update'));
CREATE POLICY "Content managers can manage testimonials" ON public.testimonials
  FOR ALL USING (public.has_admin_permission('content', 'update'))
  WITH CHECK (public.has_admin_permission('content', 'update'));
CREATE POLICY "Admin users can manage people by permission" ON public.people
  FOR ALL USING (public.has_admin_permission('people', 'update'))
  WITH CHECK (public.has_admin_permission('people', 'update'));
CREATE POLICY "Content managers can manage FAQs" ON public.faqs
  FOR ALL USING (public.has_admin_permission('content', 'update'))
  WITH CHECK (public.has_admin_permission('content', 'update'));
CREATE POLICY "Content managers can manage announcements" ON public.announcements
  FOR ALL USING (public.has_admin_permission('content', 'update'))
  WITH CHECK (public.has_admin_permission('content', 'update'));
CREATE POLICY "Admin users can manage partners by permission" ON public.partners
  FOR ALL USING (public.has_admin_permission('partners', 'update'))
  WITH CHECK (public.has_admin_permission('partners', 'update'));
CREATE POLICY "Recruiters can manage talent" ON public.talent_profiles
  FOR ALL USING (public.has_admin_permission('talent', 'update'))
  WITH CHECK (public.has_admin_permission('talent', 'update'));
CREATE POLICY "Recruiters can manage applications" ON public.applications
  FOR ALL USING (public.has_admin_permission('applications', 'update'))
  WITH CHECK (public.has_admin_permission('applications', 'update'));
CREATE POLICY "Admin users can manage media" ON public.media
  FOR ALL USING (public.has_admin_permission('media', 'update'))
  WITH CHECK (public.has_admin_permission('media', 'update'));
CREATE POLICY "Admin users can manage media folders" ON public.media_folders
  FOR ALL USING (public.has_admin_permission('media', 'update'))
  WITH CHECK (public.has_admin_permission('media', 'update'));

-- Settings and audit logs are intentionally narrower than generic CRUD.
CREATE POLICY "Admins can read settings" ON public.site_settings
  FOR SELECT USING (public.has_admin_permission('settings', 'read'));
CREATE POLICY "Admins can update settings" ON public.site_settings
  FOR UPDATE USING (public.has_admin_permission('settings', 'update'))
  WITH CHECK (public.has_admin_permission('settings', 'update'));
CREATE POLICY "Admins can read impact stats" ON public.impact_stats
  FOR SELECT USING (public.has_admin_permission('impact_stats', 'read'));
CREATE POLICY "Admins can update impact stats" ON public.impact_stats
  FOR UPDATE USING (public.has_admin_permission('impact_stats', 'update'))
  WITH CHECK (public.has_admin_permission('impact_stats', 'update'));
CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_admin_permission('audit', 'read'));

-- Replace broad FOR ALL policies with command-specific policies so a role that
-- has read-only access cannot write through direct Supabase calls.
DROP POLICY IF EXISTS "Admin users can manage services by permission" ON public.services;
DROP POLICY IF EXISTS "Admin users can manage projects by permission" ON public.projects;
DROP POLICY IF EXISTS "Content managers can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Content managers can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin users can manage people by permission" ON public.people;
DROP POLICY IF EXISTS "Content managers can manage FAQs" ON public.faqs;
DROP POLICY IF EXISTS "Content managers can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin users can manage partners by permission" ON public.partners;
DROP POLICY IF EXISTS "Recruiters can manage talent" ON public.talent_profiles;
DROP POLICY IF EXISTS "Recruiters can manage applications" ON public.applications;
DROP POLICY IF EXISTS "Admin users can manage media" ON public.media;
DROP POLICY IF EXISTS "Admin users can manage media folders" ON public.media_folders;

CREATE POLICY "services admin read" ON public.services FOR SELECT USING (public.has_admin_permission('services','read'));
CREATE POLICY "services admin insert" ON public.services FOR INSERT WITH CHECK (public.has_admin_permission('services','create'));
CREATE POLICY "services admin update" ON public.services FOR UPDATE USING (public.has_admin_permission('services','update')) WITH CHECK (public.has_admin_permission('services','update'));
CREATE POLICY "services admin delete" ON public.services FOR DELETE USING (public.has_admin_permission('services','delete'));

CREATE POLICY "projects admin read" ON public.projects FOR SELECT USING (public.has_admin_permission('projects','read'));
CREATE POLICY "projects admin insert" ON public.projects FOR INSERT WITH CHECK (public.has_admin_permission('projects','create'));
CREATE POLICY "projects admin update" ON public.projects FOR UPDATE USING (public.has_admin_permission('projects','update')) WITH CHECK (public.has_admin_permission('projects','update'));
CREATE POLICY "projects admin delete" ON public.projects FOR DELETE USING (public.has_admin_permission('projects','delete'));

CREATE POLICY "content blog read" ON public.blog_posts FOR SELECT USING (public.has_admin_permission('content','read'));
CREATE POLICY "content blog insert" ON public.blog_posts FOR INSERT WITH CHECK (public.has_admin_permission('content','create'));
CREATE POLICY "content blog update" ON public.blog_posts FOR UPDATE USING (public.has_admin_permission('content','update')) WITH CHECK (public.has_admin_permission('content','update'));
CREATE POLICY "content blog delete" ON public.blog_posts FOR DELETE USING (public.has_admin_permission('content','delete'));

CREATE POLICY "content testimonials read" ON public.testimonials FOR SELECT USING (public.has_admin_permission('content','read'));
CREATE POLICY "content testimonials insert" ON public.testimonials FOR INSERT WITH CHECK (public.has_admin_permission('content','create'));
CREATE POLICY "content testimonials update" ON public.testimonials FOR UPDATE USING (public.has_admin_permission('content','update')) WITH CHECK (public.has_admin_permission('content','update'));
CREATE POLICY "content testimonials delete" ON public.testimonials FOR DELETE USING (public.has_admin_permission('content','delete'));

CREATE POLICY "people admin read" ON public.people FOR SELECT USING (public.has_admin_permission('people','read'));
CREATE POLICY "people admin insert" ON public.people FOR INSERT WITH CHECK (public.has_admin_permission('people','create'));
CREATE POLICY "people admin update" ON public.people FOR UPDATE USING (public.has_admin_permission('people','update')) WITH CHECK (public.has_admin_permission('people','update'));
CREATE POLICY "people admin delete" ON public.people FOR DELETE USING (public.has_admin_permission('people','delete'));

CREATE POLICY "content FAQs read" ON public.faqs FOR SELECT USING (public.has_admin_permission('content','read'));
CREATE POLICY "content FAQs insert" ON public.faqs FOR INSERT WITH CHECK (public.has_admin_permission('content','create'));
CREATE POLICY "content FAQs update" ON public.faqs FOR UPDATE USING (public.has_admin_permission('content','update')) WITH CHECK (public.has_admin_permission('content','update'));
CREATE POLICY "content FAQs delete" ON public.faqs FOR DELETE USING (public.has_admin_permission('content','delete'));

CREATE POLICY "content announcements read" ON public.announcements FOR SELECT USING (public.has_admin_permission('content','read'));
CREATE POLICY "content announcements insert" ON public.announcements FOR INSERT WITH CHECK (public.has_admin_permission('content','create'));
CREATE POLICY "content announcements update" ON public.announcements FOR UPDATE USING (public.has_admin_permission('content','update')) WITH CHECK (public.has_admin_permission('content','update'));
CREATE POLICY "content announcements delete" ON public.announcements FOR DELETE USING (public.has_admin_permission('content','delete'));

CREATE POLICY "partners admin read" ON public.partners FOR SELECT USING (public.has_admin_permission('partners','read'));
CREATE POLICY "partners admin insert" ON public.partners FOR INSERT WITH CHECK (public.has_admin_permission('partners','create'));
CREATE POLICY "partners admin update" ON public.partners FOR UPDATE USING (public.has_admin_permission('partners','update')) WITH CHECK (public.has_admin_permission('partners','update'));
CREATE POLICY "partners admin delete" ON public.partners FOR DELETE USING (public.has_admin_permission('partners','delete'));

CREATE POLICY "talent admin read" ON public.talent_profiles FOR SELECT USING (public.has_admin_permission('talent','read'));
CREATE POLICY "talent admin insert" ON public.talent_profiles FOR INSERT WITH CHECK (public.has_admin_permission('talent','create'));
CREATE POLICY "talent admin update" ON public.talent_profiles FOR UPDATE USING (public.has_admin_permission('talent','update')) WITH CHECK (public.has_admin_permission('talent','update'));
CREATE POLICY "talent admin delete" ON public.talent_profiles FOR DELETE USING (public.has_admin_permission('talent','delete'));

CREATE POLICY "applications admin read" ON public.applications FOR SELECT USING (public.has_admin_permission('applications','read'));
CREATE POLICY "applications admin insert" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "applications admin update" ON public.applications FOR UPDATE USING (public.has_admin_permission('applications','update')) WITH CHECK (public.has_admin_permission('applications','update'));
CREATE POLICY "applications admin delete" ON public.applications FOR DELETE USING (public.has_admin_permission('applications','delete'));

CREATE POLICY "media admin read" ON public.media FOR SELECT USING (public.has_admin_permission('media','read'));
CREATE POLICY "media admin insert" ON public.media FOR INSERT WITH CHECK (public.has_admin_permission('media','create'));
CREATE POLICY "media admin update" ON public.media FOR UPDATE USING (public.has_admin_permission('media','update')) WITH CHECK (public.has_admin_permission('media','update'));
CREATE POLICY "media admin delete" ON public.media FOR DELETE USING (public.has_admin_permission('media','delete'));

CREATE POLICY "media folders admin read" ON public.media_folders FOR SELECT USING (public.has_admin_permission('media','read'));
CREATE POLICY "media folders admin insert" ON public.media_folders FOR INSERT WITH CHECK (public.has_admin_permission('media','create'));
CREATE POLICY "media folders admin update" ON public.media_folders FOR UPDATE USING (public.has_admin_permission('media','update')) WITH CHECK (public.has_admin_permission('media','update'));
CREATE POLICY "media folders admin delete" ON public.media_folders FOR DELETE USING (public.has_admin_permission('media','delete'));

-- 8) Explicit account activation prevents arbitrary Supabase signups from
-- becoming usable admin accounts. Existing provisioned profiles are retained.
UPDATE public.profiles
SET is_active = true
WHERE is_active = false;

CREATE INDEX IF NOT EXISTS profiles_active_idx ON public.profiles (id) WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'growthbridge_analyst',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- 9) Legacy helper is no longer used for authorization and must not be callable
-- by untrusted clients.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
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
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 10) Public people directory must not expose private contact fields. The base
-- table is admin-only; public clients receive a deliberately limited view.
DROP POLICY IF EXISTS "Active people are viewable by everyone" ON public.people;

DROP VIEW IF EXISTS public.public_people;

CREATE VIEW public.public_people
AS
SELECT
  id,
  slug,
  category,
  full_name,
  title,
  department,
  bio,
  short_bio,
  photo,
  location,
  joined_at,
  skills,
  certifications,
  social_links,
  projects,
  articles,
  display_order,
  featured,
  active,
  created_at,
  updated_at
FROM public.people
WHERE active = true AND deleted_at IS NULL;

GRANT SELECT ON public.public_people TO anon, authenticated;

-- Media metadata is administrative; the Storage object itself is public when
-- intentionally published. Do not expose uploader IDs or internal metadata.
DROP POLICY IF EXISTS "Media is viewable by everyone" ON public.media;
