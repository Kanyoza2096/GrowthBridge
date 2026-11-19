-- Keep anonymous FAQ reads independent of privileged admin functions.
-- The published-only public SELECT policy remains available to anon and authenticated.
-- All management policies are restricted to authenticated users.

DROP POLICY IF EXISTS "Allow authenticated full access" ON public.faqs;
DROP POLICY IF EXISTS "Admins can manage FAQs" ON public.faqs;
DROP POLICY IF EXISTS "content FAQs read" ON public.faqs;
DROP POLICY IF EXISTS "content FAQs insert" ON public.faqs;
DROP POLICY IF EXISTS "content FAQs update" ON public.faqs;
DROP POLICY IF EXISTS "content FAQs delete" ON public.faqs;

CREATE POLICY "faqs admin read"
  ON public.faqs
  FOR SELECT
  TO authenticated
  USING (public.has_admin_permission('content', 'read'));

CREATE POLICY "faqs admin insert"
  ON public.faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_permission('content', 'create'));

CREATE POLICY "faqs admin update"
  ON public.faqs
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission('content', 'update'))
  WITH CHECK (public.has_admin_permission('content', 'update'));

CREATE POLICY "faqs admin delete"
  ON public.faqs
  FOR DELETE
  TO authenticated
  USING (public.has_admin_permission('content', 'delete'));
