-- Public shared agents (viral builder /a, phase 1, 2026-07-17).
--
-- Community agents are anonymous-friendly: a visitor builds one on /a with
-- no account, so rows can't live in pilot_agents (owner_id is NOT NULL and
-- RLS is owner-only — the signed-in Pilot flow stays untouched). They get
-- their own table instead, RLS deny-all: every read and write goes through
-- the service client in server code (lib/agents/community.ts), which only
-- ever serves rows where shared = true.
--
-- created_by_hash is a salted SHA-256 of the creator's IP — abuse tracing
-- only, never displayed. report_count backs the mailto report loop.

create table if not exists public.community_agents (
  id uuid primary key default gen_random_uuid(),
  share_slug text not null,
  name text not null,
  description text not null default '',
  icon text not null default 'spark',
  accent text not null default '#3f7373',
  spec jsonb not null default '{}'::jsonb,
  pack jsonb not null default '{}'::jsonb,
  system_prompt text not null default '',
  created_by_hash text,
  created_at timestamptz not null default now(),
  shared boolean not null default true,
  report_count int not null default 0
);

create unique index if not exists community_agents_share_slug_key
  on public.community_agents (share_slug);

-- Deny-all RLS: no policies on purpose. Service-role access only.
alter table public.community_agents enable row level security;

comment on table public.community_agents is
  'Public agent-builder rows (/a). RLS deny-all — service client only; public pages serve shared = true rows.';
