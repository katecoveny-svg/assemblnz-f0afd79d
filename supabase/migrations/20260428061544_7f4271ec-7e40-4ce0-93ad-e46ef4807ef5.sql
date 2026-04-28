-- ─────────────────────────────────────────────────────────────
-- 1. rag.sources: add currency, canonical citation URL, publisher
-- ─────────────────────────────────────────────────────────────
alter table rag.sources
  add column if not exists currency_date date,
  add column if not exists canonical_url text,
  add column if not exists citation_format text,
  add column if not exists publisher text;

-- Backfill canonical_url from fetch_url for sources where it is null
update rag.sources
   set canonical_url = fetch_url
 where canonical_url is null;

-- Backfill publisher (all current seeds are legislation.govt.nz Acts)
update rag.sources
   set publisher = 'Parliamentary Counsel Office'
 where publisher is null
   and fetch_url like 'https://www.legislation.govt.nz/%';

-- Backfill citation_format with a sensible default per Act short_name
update rag.sources
   set citation_format = case
     when short_name = 'cca-2002'                  then 'Construction Contracts Act 2002 s {section}'
     when short_name = 'building-act-2004'         then 'Building Act 2004 s {section}'
     when short_name = 'hswa-2015'                 then 'Health and Safety at Work Act 2015 s {section}'
     when short_name = 'ssaa-2012'                 then 'Sale and Supply of Alcohol Act 2012 s {section}'
     when short_name = 'food-act-2014'             then 'Food Act 2014 s {section}'
     when short_name = 'era-2000'                  then 'Employment Relations Act 2000 s {section}'
     when short_name = 'holidays-act-2003'         then 'Holidays Act 2003 s {section}'
     when short_name = 'privacy-act-2020'          then 'Privacy Act 2020 s {section}'
     when short_name = 'fair-trading-act-1986'     then 'Fair Trading Act 1986 s {section}'
     when short_name = 'consumer-guarantees-act-1993' then 'Consumer Guarantees Act 1993 s {section}'
     when short_name = 'companies-act-1993'        then 'Companies Act 1993 s {section}'
     when short_name = 'motor-vehicle-sales-act-2003' then 'Motor Vehicle Sales Act 2003 s {section}'
     else short_name || ' s {section}'
   end
 where citation_format is null;

-- Make canonical_url required going forward (now that backfill is done)
alter table rag.sources
  alter column canonical_url set not null;

-- ─────────────────────────────────────────────────────────────
-- 2. rag.chunks: add per-chunk deep link + frozen currency_date
-- ─────────────────────────────────────────────────────────────
alter table rag.chunks
  add column if not exists section_url text,
  add column if not exists currency_date date;

-- Backfill section_url from the parent source's canonical_url where empty
-- (chunker will set the proper anchor next time it runs)
update rag.chunks c
   set section_url = s.canonical_url
  from rag.sources s
 where c.source_id = s.id
   and c.section_url is null;

-- Backfill currency_date from parent source where empty
update rag.chunks c
   set currency_date = s.currency_date
  from rag.sources s
 where c.source_id = s.id
   and c.currency_date is null
   and s.currency_date is not null;

-- ─────────────────────────────────────────────────────────────
-- 3. Update public.rag_retrieve to expose the new citation fields
-- ─────────────────────────────────────────────────────────────
drop function if exists public.rag_retrieve(vector, text[], integer, integer);

create or replace function public.rag_retrieve(
  query_embedding vector,
  query_kete text[],
  max_tier integer default 3,
  top_k integer default 8
)
returns table(
  chunk_id uuid,
  source_short_name text,
  structural_label text,
  content text,
  tier smallint,
  authority_weight numeric,
  kete text[],
  similarity double precision,
  section_url text,
  canonical_url text,
  citation_format text,
  publisher text,
  currency_date date
)
language sql
stable
security definer
set search_path = public, rag
as $$
  select
    c.id,
    c.source_short_name,
    c.structural_label,
    c.content,
    c.tier,
    c.authority_weight,
    c.kete,
    1 - (c.embedding <=> query_embedding) as similarity,
    c.section_url,
    s.canonical_url,
    s.citation_format,
    s.publisher,
    coalesce(c.currency_date, s.currency_date) as currency_date
  from rag.chunks c
  join rag.sources s on s.id = c.source_id
  where c.current = true
    and c.embedding is not null
    and c.tier <= max_tier
    and (query_kete is null or array_length(query_kete, 1) is null or c.kete && query_kete)
  order by
    (1 - (c.embedding <=> query_embedding)) * c.authority_weight desc
  limit greatest(least(top_k, 50), 1);
$$;

grant execute on function public.rag_retrieve(vector, text[], integer, integer) to anon, authenticated, service_role;