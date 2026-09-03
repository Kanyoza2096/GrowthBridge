-- Final privilege cleanup / defense-in-depth.
-- RLS remains the primary authorization layer, while explicit table grants
-- prevent accidental future policies from exposing sensitive tables through
-- the Supabase Data API.

-- Sensitive/admin tables: no direct client Data API access.
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

REVOKE ALL ON TABLE public.talent_profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.applications FROM anon, authenticated;
REVOKE ALL ON TABLE public.site_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.media FROM anon, authenticated;
REVOKE ALL ON TABLE public.media_folders FROM anon, authenticated;
REVOKE ALL ON TABLE public.contact_submissions FROM anon, authenticated;
REVOKE ALL ON TABLE public.partnership_requests FROM anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;

-- Public content is readable, but never directly mutable by browser clients.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.services, public.projects, public.blog_posts, public.people,
              public.testimonials, public.faqs, public.announcements,
              public.partners, public.impact_stats
  FROM anon, authenticated;

-- Public form writes are intentionally performed by trusted server routes.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON TABLE public.contact_submissions, public.partnership_requests, public.applications
  FROM anon, authenticated;

-- Remove any API-key material accidentally persisted in the general settings
-- JSON. API credentials must live in server-side secret storage.
UPDATE public.site_settings
SET value = jsonb_set(
  value,
  '{api,apiKeys}',
  '[]'::jsonb,
  true
)
WHERE key = 'general'
  AND jsonb_typeof(value->'api'->'apiKeys') IS NOT NULL;
