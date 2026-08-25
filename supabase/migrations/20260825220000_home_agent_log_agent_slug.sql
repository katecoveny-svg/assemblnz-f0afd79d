-- The homepage phone can now hand the conversation to any live agent in the
-- marketplace registry, so the transcript records which one was speaking.
-- 'home-guide' is the house guide that answers about assembl itself.
alter table public.home_agent_log
  add column if not exists agent_slug text not null default 'home-guide';

comment on column public.home_agent_log.agent_slug is
  'Which agent produced or received this turn: a lib/marketplace/agents.ts slug, or ''home-guide'' for the house guide.';

create index if not exists home_agent_log_agent_slug_idx
  on public.home_agent_log (agent_slug, created_at desc);
