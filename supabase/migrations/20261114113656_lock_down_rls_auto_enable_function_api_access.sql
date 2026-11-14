-- Keep the RLS auto-enable event trigger operational while removing its
-- SECURITY DEFINER function from the Supabase client RPC privilege surface.
-- The event trigger is owned by postgres and continues to execute as its
-- owner; no application/API role needs direct EXECUTE permission.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
FROM PUBLIC, anon, authenticated, service_role;
