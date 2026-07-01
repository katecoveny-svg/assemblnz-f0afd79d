-- Phase 1B — Knowledge Tier A ingest pipeline (BUNDLES V4 spec §8).
--
-- The accuracy floor for the V4 bundle architecture. Every agent reasons from a
-- source; every source has a tier; every output cites what it stood on. This
-- migration lays the Tier A ("official primary") knowledge layer that the whole
-- of V4 stands on (spec §8.1 / §10 Phase 0).
--
-- Relationship to the existing kb_* pipeline
-- ------------------------------------------
-- The live-data brain (kb_sources -> adapter-* -> kb_documents ->
-- kb_embed_queue -> embed-worker -> kb_doc_chunks -> match_kb_knowledge) stays
-- exactly as it is. That pipeline embeds at 768-dim (Gemini) and powers the
-- broad multi-tier news/live feed. This is a DISTINCT, additive layer:
--
--   * 1536-dim embeddings (spec-mandated) so it can NEVER collide with the
--     768-dim kb_doc_chunks column, and so the Tier A retrieval space is clean.
--   * A gold-plated source registry with tier, steward, cadence, dependent
--     agents and a content-hash diff-and-alert loop (spec §8.2 / §8.4).
--   * Its own daily cron + edge function (knowledge-ingest-tier-a).
--
-- It reuses shared infra where it exists: public.invoke_edge_function() for
-- cron dispatch, and the shared Gemini embed helper (called at dim=1536).
--
-- Fresh-apply safe: every statement is idempotent and guarded.

begin;

-- pgvector (already present in prod for kb_doc_chunks; guard for fresh apply).
create extension if not exists vector;

-- ── Source registry ───────────────────────────────────────────────────────
-- The source-of-truth list of Tier A sources. Tier decides how often a source
-- is refreshed, who can add it (steward), and how loudly an output flags when
-- it relied on it.
create table if not exists public.knowledge_sources (
  id                       uuid primary key default gen_random_uuid(),
  source_slug              text not null unique,
  source_name              text not null,
  tier                     text not null default 'A' check (tier in ('A', 'B', 'C')),
  url                      text,
  api_endpoint             text,
  -- How the ingest worker should pull it. 'api' JSON/XML, 'rss' feed, or
  -- 'scrape' (fetch HTML + strip to text, with attribution).
  source_type              text not null default 'scrape'
                             check (source_type in ('api', 'rss', 'scrape')),
  -- Refresh cadence (spec §8.2). The stale-source view fires when
  -- now() - last_fetched_at exceeds this.
  refresh_cadence_days     integer not null default 7 check (refresh_cadence_days > 0),
  -- Staleness watermark (spec §8.2 locked thresholds). Used by the Mana Receipt
  -- to downgrade trust when an output leans on an over-watermark source.
  staleness_threshold_days integer not null default 30 check (staleness_threshold_days > 0),
  -- The named human accountable for this source (spec §8.4).
  steward                  text not null default 'Kate Hudson',
  -- Agent slugs whose scenario packs cite this source. On a material change,
  -- each is marked for refresh (spec §8.2 diff trigger).
  dependent_agents         text[] not null default '{}',
  last_fetched_at          timestamptz,
  last_content_hash        text,
  last_status              text,   -- ok | unchanged | blocked | error
  last_error               text,
  -- Set when a source blocks scraping. We log + surface in the stale view and
  -- DO NOT retry (spec rule).
  blocked                  boolean not null default false,
  active                   boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table public.knowledge_sources is
  'Tier A/B/C knowledge source registry (BUNDLES V4 §8). Tier A is the gold-plated official-primary layer feeding the V4 bundles.';
comment on column public.knowledge_sources.dependent_agents is
  'Agent slugs whose scenario packs cite this source; marked for refresh on a material content change.';

create index if not exists idx_knowledge_sources_tier   on public.knowledge_sources(tier);
create index if not exists idx_knowledge_sources_active on public.knowledge_sources(active, tier);

-- ── Content chunks + vectors ──────────────────────────────────────────────
-- Every refresh writes chunks with a retrieval_date, a content hash, a
-- source_pointer (citation form, spec §8.3) and a 1536-dim embedding.
create table if not exists public.knowledge_chunks (
  id             uuid primary key default gen_random_uuid(),
  source_slug    text not null references public.knowledge_sources(source_slug) on delete cascade,
  chunk_id       text not null,
  chunk_index    integer not null default 0,
  content        text not null,
  embedding      vector(1536),
  tier           text not null default 'A',
  -- retrieval_date on every chunk (spec rule).
  retrieved_at   timestamptz not null default now(),
  -- Citation form (spec §8.3): URL/PCO/document pointer for evidence bundles.
  source_pointer text,
  hash           text,
  tokens         integer,
  created_at     timestamptz not null default now(),
  unique (source_slug, chunk_id)
);

comment on table public.knowledge_chunks is
  'Tier A embedded content chunks (1536-dim). Retrieval date + content hash + source_pointer stored on every chunk for citation enforcement (§8.3).';

create index if not exists idx_knowledge_chunks_source on public.knowledge_chunks(source_slug);
-- HNSW index for cosine similarity retrieval (matches kb_doc_chunks convention).
create index if not exists idx_knowledge_chunks_embedding
  on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);

-- ── Steward alerts ────────────────────────────────────────────────────────
-- Diff-and-alert + blocked/stale signals surface here. Kate (or a delegated
-- steward) reviews via /admin later (spec §8.4).
create table if not exists public.knowledge_alerts (
  id               uuid primary key default gen_random_uuid(),
  source_slug      text,
  alert_type       text not null
                     check (alert_type in ('content_changed', 'source_blocked', 'fetch_error', 'stale', 'new_source')),
  severity         text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  message          text not null,
  dependent_agents text[] not null default '{}',
  detail           jsonb not null default '{}'::jsonb,
  resolved         boolean not null default false,
  resolved_at      timestamptz,
  resolved_by      text,
  created_at       timestamptz not null default now()
);

comment on table public.knowledge_alerts is
  'Steward alert feed for the Tier A pipeline: content changes, blocked scrapes, fetch errors, staleness. Reviewed via /admin.';

create index if not exists idx_knowledge_alerts_open
  on public.knowledge_alerts(resolved, created_at desc);

-- ── Dependent-agent refresh flags ─────────────────────────────────────────
-- When a Tier A source materially changes, every dependent agent gets a flag
-- so its scenario pack can be re-run (spec §8.2). Kate reviews / clears these.
create table if not exists public.agent_kb_refresh_flags (
  id                  uuid primary key default gen_random_uuid(),
  agent_slug          text not null,
  source_slug         text not null,
  reason              text,
  content_hash_before text,
  content_hash_after  text,
  flagged_at          timestamptz not null default now(),
  resolved            boolean not null default false,
  resolved_at         timestamptz,
  unique (agent_slug, source_slug, content_hash_after)
);

comment on table public.agent_kb_refresh_flags is
  'Marks a dependent agent for scenario-pack refresh after a cited Tier A source changed (§8.2 diff trigger).';

create index if not exists idx_agent_kb_refresh_open
  on public.agent_kb_refresh_flags(resolved, flagged_at desc);

-- ── Stale-source view ─────────────────────────────────────────────────────
-- Any active source overdue for a refresh (now() - last_fetched_at beyond its
-- cadence), never fetched, or currently blocked. Feeds the steward dashboard.
create or replace view public.stale_knowledge_sources as
select
  s.source_slug,
  s.source_name,
  s.tier,
  s.url,
  s.steward,
  s.dependent_agents,
  s.refresh_cadence_days,
  s.staleness_threshold_days,
  s.last_fetched_at,
  s.last_status,
  s.last_error,
  s.blocked,
  case
    when s.last_fetched_at is null then null
    else round(extract(epoch from (now() - s.last_fetched_at)) / 86400.0, 2)
  end as days_since_fetch
from public.knowledge_sources s
where s.active = true
  and (
    s.last_fetched_at is null
    or now() - s.last_fetched_at > make_interval(days => s.refresh_cadence_days)
    or s.blocked = true
  );

comment on view public.stale_knowledge_sources is
  'Active knowledge sources overdue for refresh (now() - last_fetched_at > refresh_cadence_days), never fetched, or blocked.';

-- ── Diff-and-alert helper ─────────────────────────────────────────────────
-- Called by the ingest worker when a source hash changes: raises a steward
-- alert and flags every dependent agent for scenario-pack refresh. Kept in the
-- DB so the marking is atomic and reusable from any caller.
create or replace function public.flag_knowledge_source_change(
  p_source_slug text,
  p_old_hash    text,
  p_new_hash    text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source public.knowledge_sources%rowtype;
  v_agent  text;
  v_count  integer := 0;
begin
  select * into v_source from public.knowledge_sources where source_slug = p_source_slug;
  if not found then
    return 0;
  end if;

  insert into public.knowledge_alerts(source_slug, alert_type, severity, message, dependent_agents, detail)
  values (
    p_source_slug,
    'content_changed',
    'warning',
    format(
      'Tier %s source "%s" changed since last fetch — %s dependent agent(s) marked for refresh.',
      v_source.tier,
      v_source.source_name,
      coalesce(array_length(v_source.dependent_agents, 1), 0)
    ),
    v_source.dependent_agents,
    jsonb_build_object('old_hash', p_old_hash, 'new_hash', p_new_hash)
  );

  foreach v_agent in array coalesce(v_source.dependent_agents, '{}'::text[])
  loop
    insert into public.agent_kb_refresh_flags(agent_slug, source_slug, reason, content_hash_before, content_hash_after)
    values (v_agent, p_source_slug, 'cited Tier A source content changed', p_old_hash, p_new_hash)
    on conflict (agent_slug, source_slug, content_hash_after) do nothing;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

comment on function public.flag_knowledge_source_change(text, text, text) is
  'Raises a content_changed alert and flags every dependent agent for refresh. Returns the number of agents flagged.';

-- ── Tier A retrieval RPC ──────────────────────────────────────────────────
-- Cosine similarity over the 1536-dim Tier A space, optionally filtered by the
-- agent that is asking (so an agent only ever retrieves sources it depends on).
create or replace function public.match_knowledge_tier_a(
  query_embedding vector(1536),
  agent_slug      text default null,
  top_k           integer default 8
) returns table (
  source_slug    text,
  source_name    text,
  content        text,
  source_pointer text,
  tier           text,
  retrieved_at   timestamptz,
  similarity     float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.source_slug,
    s.source_name,
    c.content,
    c.source_pointer,
    c.tier,
    c.retrieved_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks c
  join public.knowledge_sources s on s.source_slug = c.source_slug
  where c.embedding is not null
    and s.active = true
    and (agent_slug is null or agent_slug = any(s.dependent_agents))
  order by c.embedding <=> query_embedding
  limit top_k;
$$;

comment on function public.match_knowledge_tier_a(vector(1536), text, integer) is
  'Top Tier A chunks for a 1536-dim query embedding, optionally scoped to sources a given agent depends on.';

-- ── RLS ───────────────────────────────────────────────────────────────────
-- Internal pipeline tables. No anon/authenticated policies: only the service
-- role (which bypasses RLS) reads/writes, via the edge function and /admin
-- server actions. Retrieval RPCs above are security definer.
alter table public.knowledge_sources        enable row level security;
alter table public.knowledge_chunks         enable row level security;
alter table public.knowledge_alerts         enable row level security;
alter table public.agent_kb_refresh_flags   enable row level security;

-- ── Seed: Tier A sources (day 1) ──────────────────────────────────────────
-- Public official-primary sources only (spec rule: never store proprietary
-- content). Cadence + staleness thresholds per spec §8.2. Stewards default to
-- Kate Hudson until a delegated domain expert is named.
insert into public.knowledge_sources
  (source_slug, source_name, tier, url, api_endpoint, source_type,
   refresh_cadence_days, staleness_threshold_days, steward, dependent_agents)
values
  ('pco-legislation', 'PCO Legislation (legislation.govt.nz)', 'A',
   'https://www.legislation.govt.nz/', null, 'scrape',
   1, 30, 'Kate Hudson',
   array['contract-reader','arbiter','charter','holidays-act','building-consent']),

  ('bpac-nz', 'BPAC NZ (bpac.org.nz)', 'A',
   'https://bpac.org.nz/', null, 'scrape',
   7, 90, 'Kate Hudson (delegate: registered GP)',
   array['scribe','practice-manager','care-captain']),

  ('nz-formulary', 'NZ Formulary (nzf.org.nz)', 'A',
   'https://nzf.org.nz/', null, 'scrape',
   7, 90, 'Kate Hudson (delegate: registered GP)',
   array['scribe','practice-manager']),

  ('pharmac-schedule', 'Pharmac Pharmaceutical Schedule', 'A',
   'https://pharmac.govt.nz/pharmaceutical-schedule/', null, 'scrape',
   30, 14, 'Kate Hudson (delegate: registered GP)',
   array['scribe','practice-manager']),

  ('acc-schedule', 'ACC schedules & operational policy', 'A',
   'https://www.acc.co.nz/for-providers/treatment-recovery/', null, 'scrape',
   7, 7, 'Kate Hudson',
   array['practice-manager','contract-reader']),

  ('hdc-code-of-rights', 'HDC Code of Health & Disability Consumers'' Rights', 'A',
   'https://www.hdc.org.nz/your-rights/the-code-and-your-rights/', null, 'scrape',
   90, 90, 'Kate Hudson',
   array['practice-manager','workplace-wellbeing','scribe']),

  ('moh-clinical-guidelines', 'MoH clinical guidelines (health.govt.nz)', 'A',
   'https://www.health.govt.nz/publications', null, 'scrape',
   90, 90, 'Kate Hudson (delegate: registered GP)',
   array['scribe','practice-manager']),

  ('te-aho-o-te-kahu', 'Te Aho o Te Kahu — Cancer Control Agency', 'A',
   'https://teaho.govt.nz/reports', null, 'scrape',
   90, 90, 'Kate Hudson',
   array['scribe','practice-manager']),

  ('building-code-as', 'Building Code Acceptable Solutions (building.govt.nz)', 'A',
   'https://www.building.govt.nz/building-code-compliance/', null, 'scrape',
   90, 90, 'Kate Hudson',
   array['building-consent','site-safety','quality-defects','healthy-homes']),

  ('mbie-wages-holidays', 'MBIE wage rates + Holidays Act (employment.govt.nz)', 'A',
   'https://www.employment.govt.nz/hours-and-wages/', null, 'scrape',
   90, 30, 'Kate Hudson',
   array['holidays-act','ledger','contract-reader']),

  ('ird-tax-rates', 'IRD tax rates & Tax Information Bulletins', 'A',
   'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals', null, 'scrape',
   30, 30, 'Kate Hudson',
   array['ledger','rates-reader'])

on conflict (source_slug) do update
set source_name              = excluded.source_name,
    tier                     = excluded.tier,
    url                      = excluded.url,
    api_endpoint             = excluded.api_endpoint,
    source_type              = excluded.source_type,
    refresh_cadence_days     = excluded.refresh_cadence_days,
    staleness_threshold_days = excluded.staleness_threshold_days,
    steward                  = excluded.steward,
    dependent_agents         = excluded.dependent_agents,
    active                   = true,
    updated_at               = now();

-- ── Daily cron (06:00 NZT) ────────────────────────────────────────────────
-- 06:00 NZST == 18:00 UTC. pg_cron runs in UTC. During NZDT (Oct–Apr) this
-- fires at 07:00 local; acceptable for a daily official-source pull.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('knowledge-ingest-tier-a-daily')
      where exists (select 1 from cron.job where jobname = 'knowledge-ingest-tier-a-daily');

    perform cron.schedule(
      'knowledge-ingest-tier-a-daily',
      '0 18 * * *',
      $cmd$ select public.invoke_edge_function('knowledge-ingest-tier-a', '{"scheduled":true}'::jsonb); $cmd$
    );

    raise notice 'knowledge-ingest-tier-a daily cron registered (18:00 UTC ~= 06:00 NZT)';
  else
    raise notice 'pg_cron not enabled — schedule knowledge-ingest-tier-a via the Supabase dashboard';
  end if;
exception when others then
  raise notice 'knowledge-ingest-tier-a cron registration skipped: %', sqlerrm;
end;
$$;

commit;
