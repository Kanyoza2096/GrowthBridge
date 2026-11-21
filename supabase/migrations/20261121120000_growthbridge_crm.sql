-- GrowthBridge CRM metadata for existing inquiry records.
-- Customer-facing submissions remain in their original source tables.
create table if not exists public.growthbridge_crm_leads (
  source text not null check (source in ('application', 'contact', 'partnership')),
  inquiry_id uuid not null,
  stage text not null default 'new'
    check (stage in ('new', 'qualified', 'proposal', 'won', 'lost')),
  follow_up_at timestamptz,
  converted_at timestamptz,
  conversion_value numeric(12,2) check (conversion_value is null or conversion_value >= 0),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (source, inquiry_id),
  check ((stage = 'won') = (converted_at is not null))
);

create index if not exists growthbridge_crm_follow_up_idx
  on public.growthbridge_crm_leads (follow_up_at)
  where follow_up_at is not null and stage not in ('won', 'lost');

create table if not exists public.growthbridge_crm_activities (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('application', 'contact', 'partnership')),
  inquiry_id uuid not null,
  activity_type text not null check (
    activity_type in ('note_added', 'follow_up_scheduled', 'follow_up_cleared',
                      'stage_changed', 'conversion_recorded', 'conversion_reverted')
  ),
  content text,
  metadata jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null default 'Admin',
  created_at timestamptz not null default now()
);

create index if not exists growthbridge_crm_activities_lead_idx
  on public.growthbridge_crm_activities (source, inquiry_id, created_at desc);

alter table public.growthbridge_crm_leads enable row level security;
alter table public.growthbridge_crm_activities enable row level security;

revoke all on table public.growthbridge_crm_leads from public, anon, authenticated;
revoke all on table public.growthbridge_crm_activities from public, anon, authenticated;
grant all on table public.growthbridge_crm_leads to service_role;
grant all on table public.growthbridge_crm_activities to service_role;
