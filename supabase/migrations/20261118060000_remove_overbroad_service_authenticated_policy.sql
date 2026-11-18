-- Remove the legacy broad policy that allowed every authenticated account
-- to manage services, bypassing the role-specific services admin policies.
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.services;
