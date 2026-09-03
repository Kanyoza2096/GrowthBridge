-- Dashboard aggregation indexes.
-- These support bounded date-range counts without scanning full lead tables.
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_type_submitted_at ON public.applications(type, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_created_at ON public.partnership_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_status_created_at ON public.partnership_requests(status, created_at DESC);
