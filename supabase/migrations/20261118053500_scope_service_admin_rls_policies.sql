-- Keep public service reads independent of authenticated admin checks.
-- Admin policies call a SECURITY DEFINER helper that is intentionally executable
-- only by authenticated users. Restrict those policies to authenticated so
-- anonymous visitors evaluate only the published-services public SELECT policy.
--
-- Remove this legacy policy entirely: it granted every authenticated account
-- broad access, bypassing the role-specific service administration checks.
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.services;

DROP POLICY IF EXISTS "services admin read" ON public.services;
CREATE POLICY "services admin read"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (public.has_admin_permission('services', 'read'));

DROP POLICY IF EXISTS "services admin insert" ON public.services;
CREATE POLICY "services admin insert"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_permission('services', 'create'));

DROP POLICY IF EXISTS "services admin update" ON public.services;
CREATE POLICY "services admin update"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission('services', 'update'))
  WITH CHECK (public.has_admin_permission('services', 'update'));

DROP POLICY IF EXISTS "services admin delete" ON public.services;
CREATE POLICY "services admin delete"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (public.has_admin_permission('services', 'delete'));
