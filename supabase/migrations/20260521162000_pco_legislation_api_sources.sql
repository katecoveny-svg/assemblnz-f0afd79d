-- PCO New Zealand Legislation API v0 sources.
--
-- The PCO API key is stored as an Edge Function secret named PCO_API_KEY.
-- We keep kb_sources.type = 'json_api' for compatibility with the existing
-- check constraint, and route these rows to adapter-pco via config.adapter.

begin;

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
  'Dispatches due Knowledge Brain sources to adapter edge functions, including PCO legislation rows marked config.adapter=pco.';

delete from public.kb_sources
where name in (
  'PCO — Privacy Act 2020',
  'PCO — Fair Trading Act 1986',
  'PCO — Consumer Guarantees Act 1993',
  'PCO — Credit Contracts and Consumer Finance Act 2003',
  'PCO — Health and Safety at Work Act 2015',
  'PCO — Building Act 2004',
  'PCO — Food Act 2014',
  'PCO — Customs and Excise Act 2018',
  'PCO — Construction Contracts Act 2002'
);

with pack_map as (
  select
    array[
      'cross',
      'waihanga',
      'manaaki',
      'pikau',
      'arataki',
      'auaha',
      'ako',
      'matauranga',
      'hoko',
      'toro'
    ]::text[] as all_packs
),
seed(name, search_term, target_title, packs, tags) as (
  values
    ('PCO — Privacy Act 2020', 'Privacy Act 2020', 'Privacy Act 2020',
      array['cross','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro']::text[],
      array['legislation','privacy','pco']::text[]),
    ('PCO — Fair Trading Act 1986', 'Fair Trading Act 1986', 'Fair Trading Act 1986',
      array['cross','manaaki','pikau','arataki','auaha','hoko','toro']::text[],
      array['legislation','fair-trading','consumer','pco']::text[]),
    ('PCO — Consumer Guarantees Act 1993', 'Consumer Guarantees Act 1993', 'Consumer Guarantees Act 1993',
      array['cross','manaaki','arataki','hoko','toro']::text[],
      array['legislation','consumer','cga','pco']::text[]),
    ('PCO — Credit Contracts and Consumer Finance Act 2003', 'Credit Contracts and Consumer Finance Act 2003', 'Credit Contracts and Consumer Finance Act 2003',
      array['cross','arataki','hoko','toro']::text[],
      array['legislation','finance','cccfa','pco']::text[]),
    ('PCO — Health and Safety at Work Act 2015', 'Health and Safety at Work Act 2015', 'Health and Safety at Work Act 2015',
      (select all_packs from pack_map),
      array['legislation','health-and-safety','hswa','pco']::text[]),
    ('PCO — Building Act 2004', 'Building Act 2004', 'Building Act 2004',
      array['cross','waihanga','arataki','matauranga']::text[],
      array['legislation','building','waihanga','pco']::text[]),
    ('PCO — Food Act 2014', 'Food Act 2014', 'Food Act 2014',
      array['cross','manaaki','hoko']::text[],
      array['legislation','food-safety','manaaki','pco']::text[]),
    ('PCO — Customs and Excise Act 2018', 'Customs and Excise Act 2018', 'Customs and Excise Act 2018',
      array['cross','pikau','hoko']::text[],
      array['legislation','customs','pikau','pco']::text[]),
    ('PCO — Construction Contracts Act 2002', 'Construction Contracts Act 2002', 'Construction Contracts Act 2002',
      array['cross','waihanga','arataki','hoko']::text[],
      array['legislation','construction-contracts','waihanga','pco']::text[])
)
insert into public.kb_sources (
  name,
  type,
  url,
  category,
  agent_packs,
  cadence_minutes,
  active,
  status,
  consecutive_failures,
  authority_tier,
  authority_weight,
  config
)
select
  seed.name,
  'json_api',
  'https://api.legislation.govt.nz/v0/works/',
  'legislation',
  seed.packs,
  1440,
  true,
  'idle',
  0,
  1,
  1.00,
  jsonb_build_object(
    'adapter', 'pco',
    'search_term', seed.search_term,
    'search_field', 'title',
    'target_title', seed.target_title,
    'legislation_status', 'in_force',
    'max_works', 1,
    'fetch_xml', true,
    'topic_tags', seed.tags
  )
from seed
;

commit;
