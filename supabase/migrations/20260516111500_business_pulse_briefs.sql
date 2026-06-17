begin;

create table if not exists public.business_pulse_briefs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.tenants(id) on delete cascade,
  brief_date date not null,
  drive_path text,
  slack_message_ts text,
  markdown text not null default '',
  three_things jsonb not null,
  cash_position jsonb,
  pipeline_movement jsonb,
  weekly_commitments jsonb,
  pilot_health jsonb,
  source_status jsonb not null default '{}'::jsonb,
  tikanga_check_passed boolean default true,
  privacy_check_passed boolean default true,
  created_at timestamptz default now(),
  unique (org_id, brief_date)
);

-- An earlier migration (20260516080000) created public.business_pulse_briefs
-- with tenant_id (not org_id), so the `create table if not exists` above no-ops
-- on a fresh replay and the org_id index/policy below would reference a missing
-- column. Add org_id idempotently and backfill from tenant_id. No-op where
-- org_id already exists.
alter table public.business_pulse_briefs add column if not exists org_id uuid references public.tenants(id) on delete cascade;
update public.business_pulse_briefs set org_id = tenant_id where org_id is null and tenant_id is not null;

create index if not exists idx_business_pulse_org_date
  on public.business_pulse_briefs (org_id, brief_date desc);

alter table public.business_pulse_briefs enable row level security;

drop policy if exists "Tenant members can view business pulse briefs" on public.business_pulse_briefs;
create policy "Tenant members can view business pulse briefs"
  on public.business_pulse_briefs
  for select
  to authenticated
  using (
    org_id in (
      select tenant_id
      from public.tenant_members
      where user_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Service role manages business pulse briefs" on public.business_pulse_briefs;
create policy "Service role manages business pulse briefs"
  on public.business_pulse_briefs
  for all
  to service_role
  using (true)
  with check (true);

create table if not exists public.business_pulse_pilot_health (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  last_active_at timestamptz,
  errors_last_7d integer not null default 0,
  billing_status text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (org_id, name)
);

create index if not exists idx_business_pulse_health_org
  on public.business_pulse_pilot_health (org_id, updated_at desc);

alter table public.business_pulse_pilot_health enable row level security;

drop policy if exists "Tenant members can view business pulse health" on public.business_pulse_pilot_health;
create policy "Tenant members can view business pulse health"
  on public.business_pulse_pilot_health
  for select
  to authenticated
  using (
    org_id in (
      select tenant_id
      from public.tenant_members
      where user_id = auth.uid()
    )
    or public.has_role(auth.uid(), 'admin')
  );

drop policy if exists "Service role manages business pulse health" on public.business_pulse_pilot_health;
create policy "Service role manages business pulse health"
  on public.business_pulse_pilot_health
  for all
  to service_role
  using (true)
  with check (true);

commit;
