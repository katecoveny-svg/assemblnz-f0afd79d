-- The homepage phone can now hand the conversation to any live agent in the
-- marketplace registry, so the transcript records which one was speaking.
-- 'home-guide' is the house guide that answers about assembl itself.
-- Fresh preview databases lack the original out-of-band base table. Recreate
-- only that missing prerequisite, matching the inspected production columns,
-- constraints and indexes. Existing tables and their grants remain untouched.
-- This belongs before the ALTER, not in a later migration that cannot be reached.
do $$
begin
  if to_regclass('public.home_agent_log') is null then
    create table public.home_agent_log (
      id bigserial primary key,
      session_id text not null,
      ip_hash text,
      role text not null check (role in ('user', 'assistant')),
      message text not null,
      model text,
      created_at timestamptz not null default now()
    );
    alter table public.home_agent_log enable row level security;
    revoke all on public.home_agent_log from public, anon, authenticated;
    revoke all on sequence public.home_agent_log_id_seq from public, anon, authenticated;
    grant select, insert, update, delete on public.home_agent_log to service_role;
    grant usage, select on sequence public.home_agent_log_id_seq to service_role;
    create index home_agent_log_session_idx on public.home_agent_log (session_id, created_at desc);
    create index home_agent_log_ip_idx on public.home_agent_log (ip_hash, created_at desc);
  end if;
end $$;

alter table public.home_agent_log
  add column if not exists agent_slug text not null default 'home-guide';

comment on column public.home_agent_log.agent_slug is
  'Which agent produced or received this turn: a lib/marketplace/agents.ts slug, or ''home-guide'' for the house guide.';

create index if not exists home_agent_log_agent_slug_idx
  on public.home_agent_log (agent_slug, created_at desc);
