-- Reconcile the live business_pulse_briefs schema with what PR #210's
-- runBusinessPulse expects:
--
--   - Add `markdown` text column (the rendered brief body).
--   - Add `source_status` jsonb column (per-connector status map).
--   - Create the `business_pulse_pilot_health` table that the run
--     function reads pilot-customer rows from (assembl-internal only).
--
-- The pulse table itself keeps tenant_id (it is already live on this
-- column name) — the PR #210 TypeScript is being edited in the same
-- commit to match the existing column rather than renaming the column.
-- One source of truth, less risk than a live-table rename.

alter table public.business_pulse_briefs
  add column if not exists markdown text not null default '';

alter table public.business_pulse_briefs
  add column if not exists source_status jsonb not null default '{}'::jsonb;

comment on column public.business_pulse_briefs.markdown is
  'Rendered markdown body of the brief (the file content that lands in Drive at drive_path).';
comment on column public.business_pulse_briefs.source_status is
  'Per-connector status map for the brief — { xero, stripe, calendar, gmail, hubspot, supabase }.';

create table if not exists public.business_pulse_pilot_health (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  last_active_at timestamptz,
  errors_last_7d integer not null default 0,
  billing_status text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

-- An earlier migration (20260516111500) created public.business_pulse_pilot_health
-- with org_id (not tenant_id), so the `create table if not exists` above no-ops
-- on a fresh replay and the tenant_id index/policy below would reference a
-- missing column. Add tenant_id idempotently and backfill from org_id. No-op
-- where tenant_id already exists.
alter table public.business_pulse_pilot_health add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;
update public.business_pulse_pilot_health set tenant_id = org_id where tenant_id is null and org_id is not null;

create index if not exists business_pulse_pilot_health_tenant_idx
  on public.business_pulse_pilot_health(tenant_id, updated_at desc);

alter table public.business_pulse_pilot_health enable row level security;

drop policy if exists "business_pulse_pilot_health_tenant_select" on public.business_pulse_pilot_health;
create policy "business_pulse_pilot_health_tenant_select"
  on public.business_pulse_pilot_health
  for select to authenticated
  using (public.is_tenant_member(tenant_id));

drop policy if exists "business_pulse_pilot_health_service_manage" on public.business_pulse_pilot_health;
create policy "business_pulse_pilot_health_service_manage"
  on public.business_pulse_pilot_health
  for all to service_role
  using (true)
  with check (true);

comment on table public.business_pulse_pilot_health is
  'Pilot-customer health rows surfaced inside the Business Pulse brief for assembl-internal tenants. Never exposed to a customer-facing brief.';

-- The Vercel cron in vercel.json now drives /api/business-pulse/scheduled
-- hourly, gated to local Monday 07:00 NZT inside the route. Drop the
-- redundant pg_cron job. Leave the morning-briefing pg_cron in place —
-- it still relies on the invoke_edge_function helper.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('business-pulse-hourly')
      where exists (select 1 from cron.job where jobname = 'business-pulse-hourly');
    raise notice 'business-pulse-hourly pg_cron unscheduled — Vercel cron now drives /api/business-pulse/scheduled';
  end if;
exception when others then
  raise notice 'business-pulse-hourly unschedule skip: %', sqlerrm;
end;
$$;
