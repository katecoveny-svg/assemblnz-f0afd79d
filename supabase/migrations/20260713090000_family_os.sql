-- Family OS — the family-agent demo hub.
--
-- One flexible object table for the whole "family operating system": events,
-- tasks, pickups, shopping, approvals, memory (constraints/preferences) and
-- people. The agent PROPOSES items (status='proposed') from a parsed
-- newsletter; a named adult approves them (status='approved') before anything
-- becomes a real handoff. Matches the household-agent rule: it drafts and
-- suggests, the human approves, the app executes.
--
-- RLS enabled with NO policies: service-role only (the parse endpoint + the
-- approve/dismiss server actions are the only writers), same posture as
-- demo_invites. `hub` scopes a household so one demo tenant can hold several.

create table if not exists public.family_items (
  id uuid primary key default gen_random_uuid(),
  hub text not null default 'demo',
  kind text not null check (kind in ('event','task','pickup','shopping','approval','memory','person','digest')),
  title text not null,
  detail jsonb not null default '{}'::jsonb,
  -- proposed → approved (or dismissed); 'done' when actioned; memory/person
  -- rows sit at 'approved' once confirmed.
  status text not null default 'proposed'
    check (status in ('proposed','approved','dismissed','done')),
  person text,
  location text,
  when_at timestamptz,
  when_label text,
  -- which newsletter / input this came from (so a re-parse can be grouped).
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_items_hub_kind_idx on public.family_items (hub, kind, status);
create index if not exists family_items_hub_when_idx on public.family_items (hub, when_at);

alter table public.family_items enable row level security;
