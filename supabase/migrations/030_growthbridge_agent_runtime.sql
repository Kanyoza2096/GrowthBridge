-- Durable, private queue for consented GrowthBridge AI consultation enquiries.
create table if not exists public.growthbridge_agent_jobs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null default 'contact.submitted',
  contact_submission_id uuid not null references public.contact_submissions(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 8 check (max_attempts between 1 and 20),
  available_at timestamptz not null default now(),
  locked_until timestamptz,
  lease_token uuid,
  result jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (event_type, contact_submission_id)
);

create index if not exists growthbridge_agent_jobs_pending_idx
  on public.growthbridge_agent_jobs (available_at, created_at)
  where status = 'pending';
create index if not exists growthbridge_agent_jobs_expired_lease_idx
  on public.growthbridge_agent_jobs (locked_until)
  where status = 'processing';

alter table public.growthbridge_agent_jobs enable row level security;
revoke all on public.growthbridge_agent_jobs from anon, authenticated;
grant all on public.growthbridge_agent_jobs to service_role;

create or replace function public.enqueue_growthbridge_contact_agent_job()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  insert into public.growthbridge_agent_jobs (event_type, contact_submission_id)
  values ('contact.submitted', new.id)
  on conflict (event_type, contact_submission_id) do nothing;
  return new;
end;
$$;

drop trigger if exists growthbridge_contact_agent_enqueue on public.contact_submissions;
create trigger growthbridge_contact_agent_enqueue
after insert on public.contact_submissions
for each row execute function public.enqueue_growthbridge_contact_agent_job();

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
