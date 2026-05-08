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

create table public.assembl_audit_log (
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

create index on public.assembl_audit_log(org_id, created_at desc);
create index on public.assembl_audit_log(agent_slug, created_at desc);

alter table public.assembl_audit_log enable row level security;

create policy "users see own org audit log"
on public.assembl_audit_log for select
using (org_id = (auth.jwt() ->> 'org_id')::uuid);

create policy "users insert own org audit log"
on public.assembl_audit_log for insert
to authenticated
with check (org_id = (auth.jwt() ->> 'org_id')::uuid);
