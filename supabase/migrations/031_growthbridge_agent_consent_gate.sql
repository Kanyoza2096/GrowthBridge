-- Only enqueue AI consultation transcripts that the visitor explicitly
-- agreed to share using the "Connect me with the team" consent checkbox.
create or replace function public.enqueue_growthbridge_contact_agent_job()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.subject <> 'GrowthBridge AI consultation request' then
    return new;
  end if;

  insert into public.growthbridge_agent_jobs (event_type, contact_submission_id)
  values ('contact.submitted', new.id)
  on conflict (event_type, contact_submission_id) do nothing;
  return new;
end;
$$;
