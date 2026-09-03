-- GrowthBridge database security regression checklist.
-- Execute this against a test Supabase project after migrations 001..023.
-- These assertions are intentionally written as inspection queries so they
-- can be integrated with a pgTAP/psql CI harness without changing production data.
--
-- Expected results (high level):
-- 1. Sensitive tables: no grants to anon/authenticated (or only SELECT where explicitly intended).
-- 2. profiles: no INSERT/UPDATE/DELETE for anon; authenticated SELECT only via RLS.
-- 3. Privileged functions: no PUBLIC/anon/authenticated EXECUTE.
-- 4. public_people view exists and does not expose email/phone columns.
-- 5. site_settings general.api.apiKeys is empty array.
-- 6. RLS is enabled on all domain tables.

-- 1. Sensitive tables must have no direct client privileges (or only the minimal intended ones).
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'talent_profiles','applications','site_settings','media','media_folders',
    'contact_submissions','partnership_requests','audit_logs','admin_notifications'
  )
  AND grantee IN ('anon','authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 2. Profiles: authenticated may read only through RLS; mutation grants must be absent for anon.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('anon','authenticated')
ORDER BY grantee, privilege_type;

-- 3. No public execute grants should remain for privileged functions.
SELECT routine_name, grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE specific_schema = 'public'
  AND routine_name IN (
    'soft_delete_record','purge_soft_deleted','is_admin','handle_new_user',
    'has_admin_permission'
  )
  AND grantee IN ('PUBLIC','anon')
ORDER BY routine_name, grantee;

-- 4. General settings must not retain API key material.
SELECT key, value->'api'->'apiKeys' AS api_keys
FROM public.site_settings
WHERE key = 'general';

-- 5. public_people view must exist and must NOT expose email or phone.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'public_people'
  AND column_name IN ('email', 'phone');
-- Expect: zero rows.

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'public_people'
ORDER BY ordinal_position;
-- Expect: id, slug, category, full_name, title, department, bio, short_bio, photo,
--         location, joined_at, skills, certifications, social_links, projects,
--         articles, display_order, featured, active, created_at, updated_at
--         (no email, no phone).

-- 6. RLS must be enabled on core domain tables.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'profiles','services','projects','blog_posts','people','testimonials',
    'talent_profiles','applications','faqs','announcements','partners',
    'media','media_folders','site_settings','impact_stats','admin_notifications',
    'contact_submissions','partnership_requests','audit_logs','admin_notifications'
  )
ORDER BY c.relname;
-- Expect: rls_enabled = true for every row.

-- 7. Public content tables should not allow direct INSERT/UPDATE/DELETE from anon/authenticated.
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN (
    'services','projects','blog_posts','people','testimonials',
    'faqs','announcements','partners','impact_stats'
  )
  AND grantee IN ('anon','authenticated')
  AND privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE')
ORDER BY table_name, grantee, privilege_type;
-- Expect: zero rows (writes go through server routes + service role).
