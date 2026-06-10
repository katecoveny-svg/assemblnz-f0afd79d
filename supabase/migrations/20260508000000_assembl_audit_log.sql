-- assembl_audit_log — every tool call by every agent / sub-agent is recorded here.
-- Plugin Architecture Canon (locked 2026-05-08) §7 mechanism 5: audit log on every tool call.
-- Retention: 7 years (Customs Act 2018 s.405 + Tax Administration Act).
-- RLS: scoped on org_id from the auth.jwt() claim.
--
-- This migration is committed but NOT auto-applied. Apply via Supabase migration
-- workflow when canon Day 7 is unblocked for production.

-- Idempotent: this table is also defined by the duplicate 20260508120000
-- migration, so a clean replay (e.g. Supabase preview branches) must not fail
-- with "relation already exists".
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

create index if not exists assembl_audit_log_org_id_created_at_idx
  on public.assembl_audit_log(org_id, created_at desc);
create index if not exists assembl_audit_log_agent_slug_created_at_idx
  on public.assembl_audit_log(agent_slug, created_at desc);

alter table public.assembl_audit_log enable row level security;

drop policy if exists "users see own org audit log" on public.assembl_audit_log;
create policy "users see own org audit log"
  on public.assembl_audit_log
  for select
  using (org_id = (auth.jwt() ->> 'org_id')::uuid);

drop policy if exists "users insert own org audit log" on public.assembl_audit_log;
create policy "users insert own org audit log"
  on public.assembl_audit_log
  for insert
  to authenticated
  with check (org_id = (auth.jwt() ->> 'org_id')::uuid);
