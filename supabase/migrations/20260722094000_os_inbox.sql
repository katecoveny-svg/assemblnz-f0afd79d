-- Per-tenant inbox ingestion (Agentic OS Phase 4,
-- docs/AGENTIC-OS-ARCHITECTURE.md §D Phase 4).
--
-- Generalises the proven family-inbox pattern: per-tenant OAuth refresh
-- tokens, a dedupe ledger so no email is processed twice, and a run log
-- the Connections surface can report honestly. The sync function runs in
-- DRY MODE (reads nothing, writes a run row) until a tenant connects an
-- inbox — safe to ship ahead of any OAuth connection.
--
-- RLS deny-all on all three; service-role/edge access only.

create table if not exists public.os_inbox_tokens (
  tenant text not null,
  provider text not null,
  refresh_token text not null,
  email text,
  connected_at timestamptz not null default now(),
  primary key (tenant, provider)
);

do $$ begin
  alter table public.os_inbox_tokens
    add constraint os_inbox_tokens_provider_check
    check (provider in ('gmail', 'outlook'));
exception
  when duplicate_object then null;
end $$;

alter table public.os_inbox_tokens enable row level security;

create table if not exists public.os_inbox_seen (
  message_id text primary key,
  tenant text not null,
  provider text not null,
  subject text,
  seen_at timestamptz not null default now()
);

alter table public.os_inbox_seen enable row level security;

create index if not exists os_inbox_seen_tenant_idx
  on public.os_inbox_seen (tenant, seen_at desc);

create table if not exists public.os_inbox_runs (
  id uuid primary key default gen_random_uuid(),
  tenant text,
  provider text,
  dry_run boolean not null default true,
  scanned integer not null default 0,
  created_tasks integer not null default 0,
  error text,
  ran_at timestamptz not null default now()
);

alter table public.os_inbox_runs enable row level security;

create index if not exists os_inbox_runs_ran_idx
  on public.os_inbox_runs (ran_at desc);

-- 15-minute sync via the canonical vault-backed cron→edge helper.
-- Silent no-op until the edge function and vault secrets exist.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (
       select 1 from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'invoke_edge_function'
     ) then
    if not exists (select 1 from cron.job where jobname = 'os-inbox-sync-15min') then
      perform cron.schedule(
        'os-inbox-sync-15min',
        '*/15 * * * *',
        $cron$select public.invoke_edge_function('os-inbox-sync', '{}'::jsonb)$cron$
      );
    end if;
  end if;
exception
  when others then null; -- fail-soft: never block a migration on cron setup
end $$;
