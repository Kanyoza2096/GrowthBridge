-- Ensure durable admin notifications exist and align database RBAC with the app's
-- notifications permissions. Safe to run on databases where migration 024 was
-- not recorded/applied; all DDL is additive or policy replacement.

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application', 'contact', 'partnership', 'system', 'content')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_admin_permission(p_resource text, p_action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
        (p_resource = 'impact_stats' AND role IN ('growthbridge_super_admin','growthbridge_admin') AND p_action IN ('read','update')) OR
        (p_resource = 'notifications' AND (
          role IN ('growthbridge_super_admin','growthbridge_admin') OR
          (role IN ('growthbridge_content_manager','growthbridge_project_manager','growthbridge_recruiter') AND p_action IN ('read','update'))
        ))
      )
  );
$function$;

DROP POLICY IF EXISTS "Admins can read own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can delete own notifications" ON public.admin_notifications;

CREATE POLICY "Admins can read own notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()) AND public.has_admin_permission('notifications','read'));

CREATE POLICY "Admins can update own notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()) AND public.has_admin_permission('notifications','update'))
  WITH CHECK (recipient_id = (SELECT auth.uid()) AND public.has_admin_permission('notifications','update'));

CREATE POLICY "Admins can delete own notifications"
  ON public.admin_notifications FOR DELETE
  TO authenticated
  USING (recipient_id = (SELECT auth.uid()) AND public.has_admin_permission('notifications','delete'));

REVOKE ALL ON TABLE public.admin_notifications FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.admin_notifications TO authenticated;
GRANT ALL ON TABLE public.admin_notifications TO service_role;

CREATE INDEX IF NOT EXISTS admin_notifications_recipient_created_idx
  ON public.admin_notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON public.admin_notifications (recipient_id, read, created_at DESC);
