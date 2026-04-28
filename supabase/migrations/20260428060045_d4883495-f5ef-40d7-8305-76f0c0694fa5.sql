-- ═══════════════════════════════════════════════════════════════
-- RAG (Retrieval-Augmented Generation) corpus for NZ regulation
-- Pattern 6 from architectural playbook — Weeks 1–5 v1
-- ═══════════════════════════════════════════════════════════════

create schema if not exists rag;

-- pgvector is already enabled at the public schema level; no need to recreate.
-- We'll reference public.vector type explicitly.

-- ─── Source registry ─────────────────────────────────────────────
create table rag.sources (
  id uuid primary key default gen_random_uuid(),
  short_name text not null unique,
  full_title text not null,
  source_type text not null,              -- 'act' | 'regulation' | 'guidance' | 'sector_body'
  tier smallint not null,                 -- 1..4
  authority_weight numeric(3,2) not null, -- 0..1
  kete text[] not null default '{}',      -- ['waihanga'], ['manaaki','toro'] for cross-kete
  fetch_url text not null,
  fetch_method text not null default 'html_scrape',  -- 'html_scrape' | 'pco_api' (future)
  fetch_format text not null default 'html',
  update_cadence text not null default 'weekly',     -- 'daily'|'weekly'|'monthly'
  last_fetched_at timestamptz,
  last_changed_at timestamptz,
  current_etag text,
  current_content_hash text,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rag_sources_tier_valid check (tier between 1 and 4),
  constraint rag_sources_authority_range check (authority_weight between 0 and 1),
  constraint rag_sources_cadence_valid check (update_cadence in ('daily','weekly','monthly'))
);

create index idx_rag_sources_kete on rag.sources using gin (kete);
create index idx_rag_sources_tier on rag.sources (tier) where active;
create index idx_rag_sources_cadence on rag.sources (update_cadence) where active;
create index idx_rag_sources_active on rag.sources (active, last_fetched_at);

create trigger rag_sources_updated_at
  before update on rag.sources
  for each row execute function public.update_updated_at_column();

-- ─── Rechunk queue ───────────────────────────────────────────────
create table rag.rechunk_queue (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references rag.sources(id) on delete cascade,
  raw_content text not null,
  fetched_at timestamptz not null default now(),
  status text not null default 'pending',  -- 'pending'|'processing'|'done'|'error'
  picked_at timestamptz,
  finished_at timestamptz,
  error text,
  chunks_produced integer,
  constraint rag_rechunk_status_valid
    check (status in ('pending','processing','done','error'))
);

create index idx_rag_rechunk_status on rag.rechunk_queue (status, fetched_at)
  where status in ('pending','processing');

-- ─── Chunks ──────────────────────────────────────────────────────
create table rag.chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references rag.sources(id) on delete cascade,
  source_short_name text not null,
  structural_path text not null,           -- 'Section 18A' | 'Part 3.1'
  structural_label text not null,          -- 'Section 18A: Retention money held on trust'
  content text not null,
  content_tokens integer,
  tier smallint not null,
  authority_weight numeric(3,2) not null,
  kete text[] not null default '{}',
  embedding public.vector(768),            -- Gemini gemini-embedding-001 @ 768 dims
  embedded_at timestamptz,
  current boolean not null default true,
  superseded_by uuid references rag.chunks(id),
  created_at timestamptz not null default now(),
  notes text,
  constraint rag_chunks_tier_valid check (tier between 1 and 4)
);

create index idx_rag_chunks_source on rag.chunks (source_id) where current;
create index idx_rag_chunks_kete on rag.chunks using gin (kete) where current;
create index idx_rag_chunks_tier on rag.chunks (tier) where current;
create index idx_rag_chunks_pending_embed on rag.chunks (created_at)
  where current and embedding is null;

-- ANN index for vector search (ivfflat, cosine). Built on `current` rows.
-- lists=100 is a reasonable starter; revisit when corpus > 50k chunks.
create index idx_rag_chunks_embedding
  on rag.chunks using ivfflat (embedding public.vector_cosine_ops)
  with (lists = 100);

-- ─── Change events (audit + eval re-trigger) ─────────────────────
create table rag.change_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references rag.sources(id) on delete cascade,
  detected_at timestamptz not null default now(),
  diff_summary text,
  affected_chunk_ids uuid[] default '{}',
  affected_eval_scenarios text[] default '{}',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  status text not null default 'pending',
  notes text,
  constraint rag_change_events_status_valid
    check (status in ('pending','reviewed','eval_re_run','closed'))
);

create index idx_rag_change_events_status on rag.change_events (status, detected_at desc);
create index idx_rag_change_events_source on rag.change_events (source_id, detected_at desc);

-- ─── Retriever RPC (lives in public so the SDK can call it) ──────
create or replace function public.rag_retrieve(
  query_embedding public.vector,
  query_kete text[],
  max_tier integer default 3,
  top_k integer default 8
)
returns table (
  chunk_id uuid,
  source_short_name text,
  structural_label text,
  content text,
  tier smallint,
  authority_weight numeric,
  kete text[],
  similarity float
)
language sql stable security definer set search_path = public, rag as $$
  select
    c.id,
    c.source_short_name,
    c.structural_label,
    c.content,
    c.tier,
    c.authority_weight,
    c.kete,
    1 - (c.embedding <=> query_embedding) as similarity
  from rag.chunks c
  where c.current = true
    and c.embedding is not null
    and c.tier <= max_tier
    and (query_kete is null or array_length(query_kete, 1) is null or c.kete && query_kete)
  order by
    -- Authority-weighted similarity: T1 sources beat T3 ties
    (1 - (c.embedding <=> query_embedding)) * c.authority_weight desc
  limit greatest(least(top_k, 50), 1);
$$;

-- ─── Admin status helper ─────────────────────────────────────────
create or replace function public.rag_status_summary()
returns table (
  total_sources bigint,
  active_sources bigint,
  total_chunks bigint,
  embedded_chunks bigint,
  pending_rechunks bigint,
  pending_change_events bigint,
  oldest_fetch timestamptz,
  newest_fetch timestamptz
)
language sql stable security definer set search_path = public, rag as $$
  select
    (select count(*) from rag.sources),
    (select count(*) from rag.sources where active),
    (select count(*) from rag.chunks where current),
    (select count(*) from rag.chunks where current and embedding is not null),
    (select count(*) from rag.rechunk_queue where status in ('pending','processing')),
    (select count(*) from rag.change_events where status = 'pending'),
    (select min(last_fetched_at) from rag.sources where active and last_fetched_at is not null),
    (select max(last_fetched_at) from rag.sources where active and last_fetched_at is not null)
  where public.has_role(auth.uid(), 'admin');
$$;

-- ─── RLS ─────────────────────────────────────────────────────────
alter table rag.sources enable row level security;
alter table rag.rechunk_queue enable row level security;
alter table rag.chunks enable row level security;
alter table rag.change_events enable row level security;

-- Admins manage everything; service-role (edge functions) bypasses RLS.
create policy "Admins manage rag.sources"
  on rag.sources for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage rag.rechunk_queue"
  on rag.rechunk_queue for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage rag.chunks"
  on rag.chunks for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage rag.change_events"
  on rag.change_events for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Grant schema usage
grant usage on schema rag to authenticated, service_role;
grant select on all tables in schema rag to authenticated;
grant all on all tables in schema rag to service_role;
alter default privileges in schema rag grant all on tables to service_role;