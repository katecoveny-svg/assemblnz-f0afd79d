-- Track proposed Member's Bills before introduction, then current Bills after
-- introduction. Parliament's Bills RSS items are intentionally title-only, so
-- these rows opt into the adapter's title fallback and lifecycle tracking.

begin;

update public.kb_sources
set
  name = 'NZ Parliament — Select committee advice',
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'source_kind', 'select_committee_advice',
    'reason', 'Public select committee advice page retained as a separate legislative movement source.'
  ),
  updated_at = now()
where name = 'NZ Parliament — Bills RSS'
  and url = 'https://www.parliament.nz/en/pb/sc/advice/';

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
  'rss',
  seed.url,
  'legislation',
  array['cross','waihanga','manaaki','pikau','arataki','auaha','ako','matauranga','hoko','toro']::text[],
  60,
  true,
  'idle',
  0,
  1,
  1.00,
  jsonb_build_object(
    'allow_title_only', true,
    'max_items', 250,
    'track_removed', true,
    'lifecycle_stage', seed.lifecycle_stage,
    'source_kind', 'parliament_bill_set',
    'source_page', seed.source_page
  )
from (
  values
    (
      'NZ Parliament — Proposed Members'' Bills',
      'https://bills.parliament.nz/rss?set=ProposedMembersBill',
      'proposed',
      'https://www.parliament.nz/en/pb/bills-and-laws/proposed-members-bills/'
    ),
    (
      'NZ Parliament — Current Bills',
      'https://bills.parliament.nz/rss?set=Bills',
      'introduced',
      'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/'
    )
) as seed(name, url, lifecycle_stage, source_page)
where not exists (
  select 1 from public.kb_sources existing where existing.url = seed.url
);

update public.kb_sources source
set
  type = 'rss',
  category = 'legislation',
  cadence_minutes = 60,
  active = true,
  status = 'idle',
  consecutive_failures = 0,
  authority_tier = 1,
  authority_weight = 1.00,
  config = coalesce(source.config, '{}'::jsonb) || jsonb_build_object(
    'allow_title_only', true,
    'max_items', 250,
    'track_removed', true,
    'lifecycle_stage', case
      when source.url like '%ProposedMembersBill%' then 'proposed'
      else 'introduced'
    end,
    'source_kind', 'parliament_bill_set',
    'source_page', case
      when source.url like '%ProposedMembersBill%'
        then 'https://www.parliament.nz/en/pb/bills-and-laws/proposed-members-bills/'
      else 'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/'
    end
  ),
  updated_at = now()
where source.url in (
  'https://bills.parliament.nz/rss?set=ProposedMembersBill',
  'https://bills.parliament.nz/rss?set=Bills'
);

commit;
