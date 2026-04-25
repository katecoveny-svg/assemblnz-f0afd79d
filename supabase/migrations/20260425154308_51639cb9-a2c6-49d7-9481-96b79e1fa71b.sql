-- Ambient agent loop: per-stage thought trace + reflection runs
-- ============================================================

-- 1. agent_thoughts: per-request thought rows (one per pipeline stage OR ambient insight)
create table if not exists public.agent_thoughts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid null,
  user_id uuid null,
  agent_id text not null,
  toolset_slug text null,
  -- Where the thought came from
  source text not null default 'chat',         -- 'chat' | 'reflection' | 'nudge'
  stage text null,                              -- 'kahu_pre' | 'ta_inflight' | 'mana_post' | 'iho' | 'mahara' | 'reflection' | 'nudge'
  -- Conversation linkage
  conversation_id uuid null,
  message_id uuid null,
  -- Content
  thought text not null,
  reasoning text null,
  metadata jsonb not null default '{}'::jsonb,
  -- Optional severity for nudges/reflections
  severity text null,                           -- 'info' | 'warn' | 'action_required'
  -- Outcome of the stage (success/blocked/etc)
  outcome text null,
  duration_ms integer null,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_thoughts_org_created
  on public.agent_thoughts(org_id, created_at desc);
create index if not exists idx_agent_thoughts_user_created
  on public.agent_thoughts(user_id, created_at desc);
create index if not exists idx_agent_thoughts_agent_source
  on public.agent_thoughts(agent_id, source, created_at desc);

-- Validation trigger (no CHECK constraints with mutable lists)
create or replace function public.validate_agent_thought()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.source not in ('chat','reflection','nudge') then
    raise exception 'source must be chat, reflection, or nudge';
  end if;
  if new.stage is not null and new.stage not in ('kahu_pre','ta_inflight','mana_post','iho','mahara','reflection','nudge') then
    raise exception 'invalid stage value: %', new.stage;
  end if;
  if new.severity is not null and new.severity not in ('info','warn','action_required') then
    raise exception 'severity must be info, warn, or action_required';
  end if;
  return new;
end;
$$;

drop trigger if exists agent_thoughts_validate on public.agent_thoughts;
create trigger agent_thoughts_validate
before insert or update on public.agent_thoughts
for each row execute function public.validate_agent_thought();

alter table public.agent_thoughts enable row level security;

-- Users can read their own thoughts
create policy "users read own agent_thoughts"
on public.agent_thoughts for select
to authenticated
using (auth.uid() = user_id);

-- Service role inserts (edge functions only) — no insert policy for authenticated,
-- meaning normal users cannot write. Service role bypasses RLS.

-- ============================================================
-- 2. agent_thought_runs: each invocation of the ambient-agent-loop
-- ============================================================
create table if not exists public.agent_thought_runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid null,
  triggered_by text not null default 'cron',    -- 'cron' | 'manual' | 'webhook'
  status text not null default 'running',       -- 'running' | 'completed' | 'failed'
  thoughts_generated integer not null default 0,
  nudges_generated integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  duration_ms integer null,
  started_at timestamptz not null default now(),
  finished_at timestamptz null
);

create index if not exists idx_agent_thought_runs_started
  on public.agent_thought_runs(started_at desc);

create or replace function public.validate_agent_thought_run()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if new.triggered_by not in ('cron','manual','webhook') then
    raise exception 'triggered_by must be cron, manual, or webhook';
  end if;
  if new.status not in ('running','completed','failed') then
    raise exception 'status must be running, completed, or failed';
  end if;
  return new;
end;
$$;

drop trigger if exists agent_thought_runs_validate on public.agent_thought_runs;
create trigger agent_thought_runs_validate
before insert or update on public.agent_thought_runs
for each row execute function public.validate_agent_thought_run();

alter table public.agent_thought_runs enable row level security;

-- Only admins can view runs; service role writes
create policy "admins read agent_thought_runs"
on public.agent_thought_runs for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));
