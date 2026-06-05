-- assembl_audit_log — canon §7.5 (Day 7)
--
-- Append-only audit ledger for every tool call made by an assembl agent or
-- sub-agent. RLS scoped to org_id (sourced from auth.jwt() ->> 'org_id').
-- 7-year retention applies (Customs and Excise Act 2018 s.405; Tax
-- Administration Act 1994 record-keeping). This migration creates the table
-- only — retention is enforced operationally, not in this schema.
--
-- Not auto-applied. Apply manually via the standard Supabase migration flow
-- once reviewed.
--
-- NOTE: this table is also defined by the earlier 20260508000000 migration
-- (an identical duplicate). Made fully idempotent so a clean migration replay
-- (e.g. Supabase preview branches) does not fail with "relation already
-- exists". Where the table already exists this is a no-op; the resulting
-- schema is unchanged.

create table if not exists public.assembl_audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  user_id uuid not null,
  agent_slug text not null,
  subagent_slug text,
  session_id uuid not null,
  tool_name text,
  tool_input jsonb,
  tool_output jsonb,
  human_review_status text,
  reviewer_user_id uuid,
  decision text,
  created_at timestamptz not null default now()
);

-- Index names match Postgres' auto-generated names from the earlier migration,
-- so IF NOT EXISTS skips them cleanly on replay instead of creating duplicates.
create index if not exists assembl_audit_log_org_id_created_at_idx
  on public.assembl_audit_log(org_id, created_at desc);
create index if not exists assembl_audit_log_agent_slug_created_at_idx
  on public.assembl_audit_log(agent_slug, created_at desc);

alter table public.assembl_audit_log enable row level security;

drop policy if exists "users see own org audit log" on public.assembl_audit_log;
create policy "users see own org audit log"
on public.assembl_audit_log for select
using (org_id = (auth.jwt() ->> 'org_id')::uuid);

drop policy if exists "users insert own org audit log" on public.assembl_audit_log;
create policy "users insert own org audit log"
on public.assembl_audit_log for insert
to authenticated
with check (org_id = (auth.jwt() ->> 'org_id')::uuid);
