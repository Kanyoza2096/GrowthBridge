-- Lock down GrowthBridge Director state tables.
-- These tables are currently empty and are not accessed by the GrowthBridge
-- application. KDO backend access is expected to use the Supabase service role.
-- No client-facing policies are created intentionally: API access is denied by
-- default while service_role retains its privileged access.

ALTER TABLE public.director_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_approvals ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.director_tasks,
  public.director_observations,
  public.director_decisions,
  public.director_learnings,
  public.director_approvals
FROM anon, authenticated;

GRANT ALL PRIVILEGES ON TABLE
  public.director_tasks,
  public.director_observations,
  public.director_decisions,
  public.director_learnings,
  public.director_approvals
TO service_role;
