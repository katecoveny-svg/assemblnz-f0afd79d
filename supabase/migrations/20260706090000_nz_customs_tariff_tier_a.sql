-- ═══════════════════════════════════════════════════════════════
-- nz-customs-tariff — live Tier A knowledge source for the Aironaut pilot.
--
-- The NZ Working Tariff Document has no machine-readable feed (PDF sections
-- only), so this source is fed by a DEDICATED ingester edge function
-- (ingest-nz-customs-tariff) that combines the WCO HS 2022 baseline
-- (UN Comtrade H6 reference, keyless JSON) with a daily scrape of the WTD
-- index page on customs.govt.nz (per-section effective dates + PDF pointers).
--
-- source_type = 'custom' marks sources owned by a dedicated ingester; the
-- generic knowledge-ingest-tier-a sweep skips them (it filters to
-- api/rss/scrape) so the two never fight over the same chunk set.
--
-- Idempotent + self-healing: safe on fresh apply and on re-apply, and safe
-- to run directly via the Management API ahead of the ledger (the file then
-- reconciles on the next db push).
-- ═══════════════════════════════════════════════════════════════
begin;

-- 1. Allow 'custom' in knowledge_sources.source_type ------------------------
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'knowledge_sources'
      and constraint_name = 'knowledge_sources_source_type_check'
  ) then
    alter table public.knowledge_sources
      drop constraint knowledge_sources_source_type_check;
  end if;

  alter table public.knowledge_sources
    add constraint knowledge_sources_source_type_check
    check (source_type in ('api', 'rss', 'scrape', 'custom'));
exception when undefined_table then
  raise notice 'knowledge_sources missing — run 20260701090000_knowledge_tier_a_pipeline first';
end;
$$;

-- 2. Seed the source ---------------------------------------------------------
-- Daily cadence, 3-day staleness threshold: a tariff answer older than three
-- days of failed syncs must degrade to TRUST SCORE: UNAVAILABLE, per the
-- family-pilot never-fabricate rule.
insert into public.knowledge_sources
  (source_slug, source_name, tier, url, api_endpoint, source_type,
   refresh_cadence_days, staleness_threshold_days, steward, dependent_agents)
values
  ('nz-customs-tariff',
   'NZ Customs Working Tariff (HS 2022 baseline + WTD effective dates)',
   'A',
   'https://www.customs.govt.nz/business/tariffs/working-tariff-document/',
   'https://comtradeapi.un.org/files/v1/app/reference/H6.json',
   'custom',
   1, 3, 'Kate Hudson',
   array['pikau', 'gateway', 'pilot-aironaut'])
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

-- 3. Daily cron: 17:30 UTC == 05:30 NZST -------------------------------------
-- Runs before the generic tier-A sweep (18:00 UTC) so the tariff set is fresh
-- when the 06:00 NZT pipeline (and the workday) starts. NZDT (Oct–Apr) shifts
-- it to 06:30 local — still ahead of the day.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('ingest-nz-customs-tariff-daily')
      where exists (select 1 from cron.job where jobname = 'ingest-nz-customs-tariff-daily');

    perform cron.schedule(
      'ingest-nz-customs-tariff-daily',
      '30 17 * * *',
      $cmd$ select public.invoke_edge_function('ingest-nz-customs-tariff', '{"scheduled":true}'::jsonb); $cmd$
    );

    raise notice 'ingest-nz-customs-tariff daily cron registered (17:30 UTC ~= 05:30 NZT)';
  else
    raise notice 'pg_cron not enabled — schedule ingest-nz-customs-tariff via the Supabase dashboard';
  end if;
exception when others then
  raise notice 'ingest-nz-customs-tariff cron registration skipped: %', sqlerrm;
end;
$$;

commit;
