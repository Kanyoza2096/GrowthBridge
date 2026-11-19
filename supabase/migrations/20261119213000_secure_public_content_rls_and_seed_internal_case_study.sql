-- Restrict administrative content policies to authenticated users.
-- Preserve existing public-only SELECT policies for published projects,
-- active partners and approved testimonials.

-- Projects
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.projects;
DROP POLICY IF EXISTS "projects admin read" ON public.projects;
DROP POLICY IF EXISTS "projects admin insert" ON public.projects;
DROP POLICY IF EXISTS "projects admin update" ON public.projects;
DROP POLICY IF EXISTS "projects admin delete" ON public.projects;
CREATE POLICY "projects admin read" ON public.projects FOR SELECT TO authenticated USING (public.has_admin_permission('projects','read'));
CREATE POLICY "projects admin insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission('projects','create'));
CREATE POLICY "projects admin update" ON public.projects FOR UPDATE TO authenticated USING (public.has_admin_permission('projects','update')) WITH CHECK (public.has_admin_permission('projects','update'));
CREATE POLICY "projects admin delete" ON public.projects FOR DELETE TO authenticated USING (public.has_admin_permission('projects','delete'));

-- People
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.people;
DROP POLICY IF EXISTS "people admin read" ON public.people;
DROP POLICY IF EXISTS "people admin insert" ON public.people;
DROP POLICY IF EXISTS "people admin update" ON public.people;
DROP POLICY IF EXISTS "people admin delete" ON public.people;
CREATE POLICY "people admin read" ON public.people FOR SELECT TO authenticated USING (public.has_admin_permission('people','read'));
CREATE POLICY "people admin insert" ON public.people FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission('people','create'));
CREATE POLICY "people admin update" ON public.people FOR UPDATE TO authenticated USING (public.has_admin_permission('people','update')) WITH CHECK (public.has_admin_permission('people','update'));
CREATE POLICY "people admin delete" ON public.people FOR DELETE TO authenticated USING (public.has_admin_permission('people','delete'));

-- Testimonials
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.testimonials;
DROP POLICY IF EXISTS "content testimonials read" ON public.testimonials;
DROP POLICY IF EXISTS "content testimonials insert" ON public.testimonials;
DROP POLICY IF EXISTS "content testimonials update" ON public.testimonials;
DROP POLICY IF EXISTS "content testimonials delete" ON public.testimonials;
CREATE POLICY "content testimonials read" ON public.testimonials FOR SELECT TO authenticated USING (public.has_admin_permission('content','read'));
CREATE POLICY "content testimonials insert" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission('content','create'));
CREATE POLICY "content testimonials update" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_admin_permission('content','update')) WITH CHECK (public.has_admin_permission('content','update'));
CREATE POLICY "content testimonials delete" ON public.testimonials FOR DELETE TO authenticated USING (public.has_admin_permission('content','delete'));

-- Partners
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.partners;
DROP POLICY IF EXISTS "partners admin read" ON public.partners;
DROP POLICY IF EXISTS "partners admin insert" ON public.partners;
DROP POLICY IF EXISTS "partners admin update" ON public.partners;
DROP POLICY IF EXISTS "partners admin delete" ON public.partners;
CREATE POLICY "partners admin read" ON public.partners FOR SELECT TO authenticated USING (public.has_admin_permission('partners','read'));
CREATE POLICY "partners admin insert" ON public.partners FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission('partners','create'));
CREATE POLICY "partners admin update" ON public.partners FOR UPDATE TO authenticated USING (public.has_admin_permission('partners','update')) WITH CHECK (public.has_admin_permission('partners','update'));
CREATE POLICY "partners admin delete" ON public.partners FOR DELETE TO authenticated USING (public.has_admin_permission('partners','delete'));

-- Internal case study only: keep it in draft until an administrator reviews it.
INSERT INTO public.projects
(slug,title,client,category,description,short_description,gallery,technologies,impact,testimonial,service_division,featured,status)
VALUES
(
 'growthbridge-digital-platform-modernization',
 'GrowthBridge Digital Platform Modernization',
 'Growthbridge Virtual Organization (Internal Initiative)',
 'web-development',
 'An internal modernization initiative for the Growthbridge Virtual Organization website and operating platform. The verified implementation includes a responsive public website, a Supabase-backed content system, administrator workflows for managing published content, public service and FAQ content, accessibility-conscious motion and reduced-motion support, and search-engine foundations including a dynamic sitemap, robots rules and web-app manifest. This is an internal platform case study, not an external client engagement.',
 'Modernizing Growthbridge’s own digital platform, content operations and public web experience.',
 '[]'::jsonb,
 '["Next.js","TypeScript","Supabase","PostgreSQL","Render"]'::jsonb,
 NULL,
 NULL,
 'Web Design & Development',
 false,
 'draft'
)
ON CONFLICT (slug) DO NOTHING;
