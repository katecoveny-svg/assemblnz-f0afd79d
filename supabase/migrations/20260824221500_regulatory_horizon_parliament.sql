-- Regulatory horizon: distinguish Parliamentary progress from authoritative enacted law.
--
-- Parliament Bills API = formal Bills and stages in the House.
-- Proposed Members' Bills = pre-introduction / ballot signals.
-- PCO = authoritative legislation/version source after publication in NZ Legislation.

begin;

-- Repurpose the old Parliament proxy source (select-committee advice) as the
-- real keyless Bills API now that we have a dedicated adapter.
update public.kb_sources
set
  name = 'NZ Parliament — Bills API',
  type = 'json_api',
  url = 'https://bills.parliament.nz/api/data/search',
  category = 'regulatory_horizon',
  agent_packs = array['cross','waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro']::text[],
  cadence_minutes = 120,
  active = true,
  last_checked_at = null,
  status = 'idle',
  consecutive_failures = 0,
  authority_tier = 1,
  authority_weight = 1.00,
  config = jsonb_build_object(
    'adapter', 'parliament',
    'bill_tab', 'All',
    'page_size', 50,
    'max_pages', 3,
    'topic_tags', array['regulatory-horizon','parliament','bills']::text[]
  ),
  updated_at = now()
where name in ('NZ Parliament — Bills RSS', 'NZ Parliament — Bills API');

-- If the historical Parliament source was absent, create it.
insert into public.kb_sources (
  name, type, url, category, agent_packs, cadence_minutes, active, status,
  consecutive_failures, authority_tier, authority_weight, config
)
select
  'NZ Parliament — Bills API',
  'json_api',
  'https://bills.parliament.nz/api/data/search',
  'regulatory_horizon',
  array['cross','waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro']::text[],
  120,
  true,
  'idle',
  0,
  1,
  1.00,
  jsonb_build_object(
    'adapter', 'parliament',
    'bill_tab', 'All',
    'page_size', 50,
    'max_pages', 3,
    'topic_tags', array['regulatory-horizon','parliament','bills']::text[]
  )
where not exists (
  select 1 from public.kb_sources where name = 'NZ Parliament — Bills API'
);

-- Official pre-introduction horizon. Firecrawl renders the Parliament page when
-- available; adapter-html records changes and the resulting page is embedded for
-- retrieval. This catches proposals before they exist as Bills in the JSON API.
update public.kb_sources
set
  type = 'html_scrape',
  url = 'https://bills.parliament.nz/proposed-members-bills',
  category = 'regulatory_signal',
  cadence_minutes = 120,
  active = true,
  last_checked_at = null,
  status = 'idle',
  consecutive_failures = 0,
  authority_tier = 1,
  authority_weight = 1.00,
  config = jsonb_build_object(
    'horizon_stage', 'SIGNAL',
    'source_kind', 'proposed_members_bills',
    'topic_tags', array['regulatory-horizon','signal','members-bills']::text[]
  ),
  updated_at = now()
where name = 'NZ Parliament — Proposed Members Bills';

insert into public.kb_sources (
  name, type, url, category, agent_packs, cadence_minutes, active, status,
  consecutive_failures, authority_tier, authority_weight, config
)
select
  'NZ Parliament — Proposed Members Bills',
  'html_scrape',
  'https://bills.parliament.nz/proposed-members-bills',
  'regulatory_signal',
  array['cross','waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro']::text[],
  120,
  true,
  'idle',
  0,
  1,
  1.00,
  jsonb_build_object(
    'horizon_stage', 'SIGNAL',
    'source_kind', 'proposed_members_bills',
    'topic_tags', array['regulatory-horizon','signal','members-bills']::text[]
  )
where not exists (
  select 1 from public.kb_sources where name = 'NZ Parliament — Proposed Members Bills'
);

-- Keep the DB dispatcher aligned with tick. Config-specific adapters win over
-- the generic json_api/html mappings.
create or replace function public.dispatch_due_kb_sources(batch_size integer default 5)
returns table(source_id uuid, adapter text, dispatched_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  src record;
  v_adapter text;
begin
  for src in
    select *
    from public.kb_sources
    where active = true
      and status != 'paused'
      and consecutive_failures < 5
      and (
        last_checked_at is null
        or last_checked_at < now() - make_interval(mins => cadence_minutes)
      )
      and url not like 'internal://%'
    order by authority_tier asc nulls last, last_checked_at asc nulls first
    limit batch_size
  loop
    v_adapter := case
      when coalesce(src.config->>'adapter', '') = 'pco' then 'adapter-pco'
      when coalesce(src.config->>'adapter', '') = 'parliament' then 'adapter-parliament'
      when src.type = 'rss' then 'adapter-rss'
      when src.type = 'json_api' then 'adapter-jsonapi'
      when src.type = 'html_scrape' then 'adapter-html'
      when src.type = 'html' then 'adapter-html'
      when src.type = 'csv' then 'adapter-jsonapi'
      when src.type = 'sdmx' then 'adapter-jsonapi'
      when src.type = 'arcgis' then 'adapter-jsonapi'
      else null
    end;

    if v_adapter is null then
      continue;
    end if;

    update public.kb_sources
    set status = 'running', last_checked_at = now()
    where id = src.id;

    perform public.invoke_edge_function(v_adapter, jsonb_build_object('source_id', src.id));

    source_id := src.id;
    adapter := v_adapter;
    dispatched_at := now();
    return next;
  end loop;
end;
$$;

comment on function public.dispatch_due_kb_sources(integer) is
  'Dispatches Knowledge Brain sources, including Parliament Bills API and PCO legislation adapters, so proposal/progress/enactment are tracked as distinct regulatory-horizon layers.';

commit;
