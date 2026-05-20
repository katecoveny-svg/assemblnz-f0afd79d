-- Refresh stale Knowledge Brain sources and harden the DB dispatcher.
--
-- These are source-registry updates only. The adapters continue to own
-- document writes, change detection, and embedding queue inserts.

begin;

update public.kb_sources
set
  url = 'https://www.privacy.org.nz/tuhono-connect/statements-media-releases/rss/',
  type = 'rss',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now()
where name = 'Privacy Commissioner — News';

update public.kb_sources
set
  url = 'https://www.worksafe.govt.nz/about-us/news-and-media/rss/',
  type = 'rss',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now()
where name = 'WorkSafe NZ — News & alerts';

update public.kb_sources
set
  url = 'https://www.taxtechnical.ird.govt.nz/tib',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'IRD no longer exposes the previous TIB RSS path; scrape the canonical TIB listing page.'
  )
where name = 'IRD — Tax Information Bulletin';

update public.kb_sources
set
  url = 'https://gazette.govt.nz/find-a-notice',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'Anonymous Gazette RSS access requires a Gazette API key; scrape the public notice search page until that key exists.'
  )
where name = 'NZ Gazette — Latest notices';

update public.kb_sources
set
  url = 'https://www.parliament.nz/en/pb/sc/advice/',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'The previous Bills RSS endpoint returns HTML; scrape current select committee advice as a legislative movement proxy.'
  )
where name = 'NZ Parliament — Bills RSS';

update public.kb_sources
set
  url = 'https://www.metservice.com/warnings/home',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'The previous regional warning RSS endpoint now 404s; scrape the current warnings page.'
  )
where name = 'MetService — Severe weather';

update public.kb_sources
set
  url = 'https://www.linz.govt.nz/news',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'The previous LINZ RSS path is unavailable; scrape the public news page.'
  )
where name = 'LINZ — News';

update public.kb_sources
set
  url = 'https://www.aviation.govt.nz/about-us/news/',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'The previous aviation RSS path is blocked/obsolete; scrape the public news page.'
  )
where name = 'Aviation NZ — News';

update public.kb_sources
set
  url = 'https://www.nzherald.co.nz/business/',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'The previous NZ Herald business RSS path 404s; scrape the public business landing page.'
  )
where name = 'NZ Herald — Business';

update public.kb_sources
set
  status = 'idle',
  updated_at = now()
where status = 'running'
  and last_checked_at < now() - interval '15 minutes';

-- Keep this helper in migration history: it exists in production from the
-- live-data wake-up run and is safer than relying on fire-and-forget edge
-- invocation from cron. Include html_scrape in the adapter mapping.
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
    order by last_checked_at asc nulls first
    limit batch_size
  loop
    v_adapter := case src.type
      when 'rss' then 'adapter-rss'
      when 'json_api' then 'adapter-jsonapi'
      when 'html_scrape' then 'adapter-html'
      when 'html' then 'adapter-html'
      when 'csv' then 'adapter-jsonapi'
      when 'sdmx' then 'adapter-jsonapi'
      when 'arcgis' then 'adapter-jsonapi'
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
  'Dispatches due Knowledge Brain sources to adapter edge functions. Adapter functions own run telemetry, source success/error status, and document writes.';

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('kb-adapter-dispatcher')
      where exists (select 1 from cron.job where jobname = 'kb-adapter-dispatcher');

    perform cron.schedule(
      'kb-adapter-dispatcher',
      '*/10 * * * *',
      $cmd$ select public.dispatch_due_kb_sources(5); $cmd$
    );
  end if;
exception when others then
  raise notice 'kb-adapter-dispatcher refresh skipped: %', sqlerrm;
end;
$$;

commit;
