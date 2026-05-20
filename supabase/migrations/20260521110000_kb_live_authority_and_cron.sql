-- Knowledge Brain live authority + cron wiring.
--
-- Keeps the existing kb_* pipeline as the source of truth:
--   kb_sources -> adapter-* -> kb_documents -> kb_embed_queue
--   -> embed-worker -> kb_doc_chunks -> match_kb_knowledge.
--
-- This migration adds the missing source authority hierarchy from the
-- RAG design canon and schedules the existing tick/embed-worker edge
-- functions through public.invoke_edge_function().
--
-- Prerequisite for unattended cron:
--   vault secret name 'supabase_url'
--   vault secret name 'service_role_key'
-- If either is absent, public.invoke_edge_function() returns null and
-- the cron becomes a quiet no-op until the secrets are added.

alter table public.kb_sources
  add column if not exists authority_tier smallint not null default 4
    check (authority_tier between 1 and 4),
  add column if not exists authority_weight numeric(3,2) not null default 0.40
    check (authority_weight >= 0 and authority_weight <= 1);

comment on column public.kb_sources.authority_tier is
  'RAG source hierarchy. 1=primary law/official instruments, 2=regulator/gov guidance, 3=trusted industry/news, 4=internal curated or commentary.';

comment on column public.kb_sources.authority_weight is
  'Authority multiplier used by match_kb_knowledge ranking. Similarity still matters, but primary/regulator sources outrank commentary when relevance is close.';

update public.kb_sources
set
  authority_tier = case
    when lower(category) in ('legislation', 'primary_law') then 1
    when lower(category) in (
      'gov_news',
      'governance',
      'hazard',
      'transport',
      'finance',
      'regulator',
      'health',
      'education',
      'employment'
    ) then 2
    when lower(category) in ('news', 'media', 'regional') then 3
    else 4
  end,
  authority_weight = case
    when lower(category) in ('legislation', 'primary_law') then 1.00
    when lower(category) in (
      'gov_news',
      'governance',
      'hazard',
      'transport',
      'finance',
      'regulator',
      'health',
      'education',
      'employment'
    ) then 0.85
    when lower(category) in ('news', 'media', 'regional') then 0.65
    else 0.40
  end;

create index if not exists idx_kb_sources_authority
  on public.kb_sources(authority_tier, authority_weight desc);

drop function if exists public.match_kb_knowledge(vector(768), text, int);

create or replace function public.match_kb_knowledge(
  query_embedding vector(768),
  agent_pack text default null,
  top_k int default 8
) returns table (
  document_id uuid,
  title text,
  url text,
  snippet text,
  source_name text,
  published_at timestamptz,
  similarity float,
  authority_tier smallint,
  authority_weight numeric,
  weighted_score float
) language sql stable security definer set search_path = public as $$
  select
    d.id,
    d.title,
    d.url,
    c.content,
    s.name,
    d.published_at,
    1 - (c.embedding <=> query_embedding) as similarity,
    s.authority_tier,
    s.authority_weight,
    (1 - (c.embedding <=> query_embedding)) * s.authority_weight as weighted_score
  from public.kb_doc_chunks c
  join public.kb_documents d on d.id = c.document_id
  join public.kb_sources s on s.id = d.source_id
  where d.superseded_by is null
    and c.embedding is not null
    and (agent_pack is null or agent_pack = any(s.agent_packs))
  order by
    ((1 - (c.embedding <=> query_embedding)) * s.authority_weight) desc,
    c.embedding <=> query_embedding,
    d.published_at desc nulls last
  limit top_k;
$$;

comment on function public.match_kb_knowledge(vector(768), text, int) is
  'Returns top knowledge chunks for a Gemini 768-dim query embedding, optionally filtered by kete/agent pack. Ranking combines vector similarity with kb_sources authority_weight.';

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('kb-tick-every-10min')
      where exists (select 1 from cron.job where jobname = 'kb-tick-every-10min');
    perform cron.unschedule('kb-embed-worker-every-5min')
      where exists (select 1 from cron.job where jobname = 'kb-embed-worker-every-5min');

    perform cron.schedule(
      'kb-tick-every-10min',
      '*/10 * * * *',
      $cmd$ select public.invoke_edge_function('tick', '{"scheduled":true}'::jsonb); $cmd$
    );

    perform cron.schedule(
      'kb-embed-worker-every-5min',
      '*/5 * * * *',
      $cmd$ select public.invoke_edge_function('embed-worker', '{"scheduled":true}'::jsonb); $cmd$
    );

    raise notice 'Knowledge Brain tick/embed-worker crons registered';
  else
    raise notice 'pg_cron not enabled - schedule tick and embed-worker through Supabase dashboard';
  end if;
exception when others then
  raise notice 'Knowledge Brain cron registration skipped: %', sqlerrm;
end;
