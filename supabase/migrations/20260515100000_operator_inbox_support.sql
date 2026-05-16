-- Operator inbox support for Industry Pack tenants.
-- Keeps the existing Tōro draft table but makes it tenant-addressable for
-- business/operator inboxes.

alter table public.toro_drafts
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null;

create index if not exists idx_toro_drafts_tenant_status_created
  on public.toro_drafts (tenant_id, status, created_at desc);

create index if not exists idx_toro_drafts_source_metadata
  on public.toro_drafts using gin (source_metadata);

alter table public.tenant_intake
  add column if not exists timezone text not null default 'Pacific/Auckland';

create table if not exists public.morning_briefing_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  briefing_date date not null,
  timezone text not null default 'Pacific/Auckland',
  draft_count integer not null default 0,
  status text not null default 'completed'
    check (status in ('completed', 'skipped', 'failed')),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, briefing_date)
);

alter table public.morning_briefing_runs enable row level security;

do $$ begin
  create policy "Tenant members can read briefing runs"
    on public.morning_briefing_runs for select to authenticated
    using (
      tenant_id in (
        select tenant_id from public.tenant_members
        where user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Service role manages briefing runs"
    on public.morning_briefing_runs for all to service_role
    using (true) with check (true);
exception when duplicate_object then null; end $$;
