-- ============================================================================
-- Ambient agent thoughts — schema for the headless thinking loop.
-- ----------------------------------------------------------------------------
-- A user can register one or more "standing prompts" against an agent
-- (e.g. "every morning, summarise the latest MPI food safety updates that
-- affect a Wellington cafe"). The /ambient-agent-loop edge function runs
-- on a pg_cron schedule, picks thoughts that are due, and writes the model
-- output to agent_thought_runs. The UI surfaces the latest run per thought.
-- ----------------------------------------------------------------------------
-- Tables:
--   agent_thoughts        — definitions (one row per standing prompt)
--   agent_thought_runs    — outputs (one row per execution)
-- RPC:
--   pick_due_thoughts(_limit int)
--                         — service-role helper that locks + returns thoughts
--                           whose last_run_at + cadence has elapsed
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── agent_thoughts ──────────────────────────────────────────────────────────
create table if not exists public.agent_thoughts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  agent_id        text not null check (agent_id ~ '^[a-z0-9_-]+$' and length(agent_id) between 1 and 64),
  title           text not null check (length(title) between 1 and 200),
  prompt          text not null check (length(prompt) between 1 and 4000),
  cadence_minutes integer not null default 60 check (cadence_minutes between 5 and 10080),
  enabled         boolean not null default true,
  last_run_at     timestamptz,
  next_due_at     timestamptz generated always as (
    coalesce(last_run_at, created_at) + (cadence_minutes || ' minutes')::interval
  ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists agent_thoughts_user_idx on public.agent_thoughts(user_id);
create index if not exists agent_thoughts_due_idx on public.agent_thoughts(next_due_at) where enabled;

alter table public.agent_thoughts enable row level security;

drop policy if exists "agent_thoughts_owner_select" on public.agent_thoughts;
create policy "agent_thoughts_owner_select"
  on public.agent_thoughts for select using (auth.uid() = user_id);

drop policy if exists "agent_thoughts_owner_modify" on public.agent_thoughts;
create policy "agent_thoughts_owner_modify"
  on public.agent_thoughts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.tg_agent_thoughts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists agent_thoughts_set_updated_at on public.agent_thoughts;
create trigger agent_thoughts_set_updated_at
  before update on public.agent_thoughts
  for each row execute function public.tg_agent_thoughts_set_updated_at();

-- ── agent_thought_runs ──────────────────────────────────────────────────────
create table if not exists public.agent_thought_runs (
  id           uuid primary key default gen_random_uuid(),
  thought_id   uuid not null references public.agent_thoughts(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  agent_id     text not null,
  output       text,
  kb_hits      integer not null default 0,
  memory_hits  integer not null default 0,
  duration_ms  integer,
  status       text not null default 'success' check (status in ('success', 'error', 'denied')),
  error_message text,
  created_at   timestamptz not null default now()
);

create index if not exists agent_thought_runs_thought_idx
  on public.agent_thought_runs(thought_id, created_at desc);
create index if not exists agent_thought_runs_user_idx
  on public.agent_thought_runs(user_id, created_at desc);

alter table public.agent_thought_runs enable row level security;

drop policy if exists "agent_thought_runs_owner_select" on public.agent_thought_runs;
create policy "agent_thought_runs_owner_select"
  on public.agent_thought_runs for select using (auth.uid() = user_id);

-- ── pick_due_thoughts RPC ──────────────────────────────────────────────────
-- Service-role only; locks rows with FOR UPDATE SKIP LOCKED so concurrent
-- ticks don't double-process. Sets last_run_at = now() so the row stops
-- looking due immediately (success/failure of the actual LLM call gets
-- recorded in agent_thought_runs).
create or replace function public.pick_due_thoughts(_limit integer default 5)
returns table (
  id uuid,
  user_id uuid,
  agent_id text,
  prompt text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    with picked as (
      select t.id
      from public.agent_thoughts t
      where t.enabled
        and t.next_due_at <= now()
      order by t.next_due_at
      limit greatest(_limit, 1)
      for update skip locked
    )
    update public.agent_thoughts t
       set last_run_at = now(),
           updated_at = now()
      from picked
     where t.id = picked.id
   returning t.id, t.user_id, t.agent_id, t.prompt;
end;
$$;

revoke all on function public.pick_due_thoughts(integer) from public, anon, authenticated;
grant execute on function public.pick_due_thoughts(integer) to service_role;

-- ── pg_cron schedule ───────────────────────────────────────────────────────
-- Runs once a minute. The function is a no-op if no thoughts are due.
-- Wrapped in DO block so the migration is idempotent across environments
-- where pg_cron may or may not be enabled.
do $$
declare
  v_url  text := current_setting('app.settings.supabase_url', true);
  v_key  text := current_setting('app.settings.service_role_key', true);
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('ambient-agent-loop')
      where exists (select 1 from cron.job where jobname = 'ambient-agent-loop');
    perform cron.schedule(
      'ambient-agent-loop',
      '* * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.settings.supabase_url', true) || '/functions/v1/ambient-agent-loop',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
          ),
          body := '{}'::jsonb
        );
      $cmd$
    );
    raise notice 'ambient-agent-loop cron scheduled (every minute)';
  else
    raise notice 'pg_cron not enabled — schedule /ambient-agent-loop manually via the dashboard';
  end if;
exception when others then
  raise notice 'ambient-agent-loop cron skip: %', sqlerrm;
end;
$$;

-- ============================================================================
-- POST-DEPLOY (manual, requires service-role / dashboard):
--   1. Set the two GUCs the cron job reads:
--        alter database postgres set "app.settings.supabase_url" =
--          'https://ssaxxdkxzrvkdjsanhei.supabase.co';
--        alter database postgres set "app.settings.service_role_key" =
--          '<service_role_jwt>';
--      (skip if you scheduled via the dashboard with literal values instead)
--   2. supabase functions deploy ambient-agent-loop
--   3. supabase functions deploy mcp-chat   (KB + memory injection)
-- ============================================================================
