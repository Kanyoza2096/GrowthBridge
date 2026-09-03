-- Durable, per-admin notifications for operational events.
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application', 'contact', 'partnership', 'system', 'content')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update own notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can delete own notifications" ON public.admin_notifications;
CREATE POLICY "Admins can read own notifications"
  ON public.admin_notifications FOR SELECT
  USING (recipient_id = auth.uid() AND public.has_admin_permission('notifications','read'));
CREATE POLICY "Admins can update own notifications"
  ON public.admin_notifications FOR UPDATE
  USING (recipient_id = auth.uid() AND public.has_admin_permission('notifications','update'))
  WITH CHECK (recipient_id = auth.uid() AND public.has_admin_permission('notifications','update'));
CREATE POLICY "Admins can delete own notifications"
  ON public.admin_notifications FOR DELETE
  USING (recipient_id = auth.uid() AND public.has_admin_permission('notifications','delete'));

REVOKE ALL ON TABLE public.admin_notifications FROM anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.admin_notifications TO authenticated;
GRANT ALL ON TABLE public.admin_notifications TO service_role;

CREATE INDEX IF NOT EXISTS admin_notifications_recipient_created_idx
  ON public.admin_notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON public.admin_notifications (recipient_id, read, created_at DESC);
