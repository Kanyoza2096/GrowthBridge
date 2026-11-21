-- Mark jobs that exhausted all attempts while a worker was lost, then
-- continue claiming only retryable pending/expired jobs.
create or replace function public.claim_growthbridge_agent_jobs(
  p_limit integer default 5,
  p_lease_seconds integer default 90
)
returns table (
  id uuid,
  contact_submission_id uuid,
  attempt_count integer,
  lease_token uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.growthbridge_agent_jobs as j
  set status = 'failed',
      last_error = coalesce(j.last_error, 'Worker lease expired after the maximum number of attempts.'),
      locked_until = null,
      lease_token = null,
      updated_at = now()
  where j.status = 'processing'
    and j.locked_until < now()
    and j.attempt_count >= j.max_attempts;

  return query
  with candidates as (
    select j.id
    from public.growthbridge_agent_jobs as j
    where (
      (j.status = 'pending' and j.available_at <= now())
      or (j.status = 'processing' and j.locked_until < now())
    )
    and j.attempt_count < j.max_attempts
    order by j.available_at asc, j.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 5), 20))
  ),
  claimed as (
    update public.growthbridge_agent_jobs as j
    set status = 'processing',
        attempt_count = j.attempt_count + 1,
        lease_token = gen_random_uuid(),
        locked_until = now() + make_interval(secs => greatest(15, least(coalesce(p_lease_seconds, 90), 600))),
        updated_at = now()
    from candidates
    where j.id = candidates.id
    returning j.id, j.contact_submission_id, j.attempt_count, j.lease_token
  )
  select claimed.id, claimed.contact_submission_id, claimed.attempt_count, claimed.lease_token
  from claimed;
end;
$$;

revoke all on function public.claim_growthbridge_agent_jobs(integer, integer) from public, anon, authenticated;
grant execute on function public.claim_growthbridge_agent_jobs(integer, integer) to service_role;
