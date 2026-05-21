-- Clean up live Knowledge Brain sources after the PCO adapter came online.
--
-- PCO now supplies authoritative legislation via the API. A few older RSS
-- rows are duplicates, blocked by WAF/Incapsula, or better represented as
-- HTML scrape sources. Keep them in the registry for provenance, but stop
-- the dispatcher from repeatedly waking dead endpoints.

begin;

update public.kb_sources
set
  url = 'https://www.ncsc.govt.nz/about/news-and-events/feed/',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'CERT NZ feed redirects to NCSC; use the canonical NCSC feed.'
  )
where name = 'CERT NZ — Advisories';

update public.kb_sources
set
  url = 'https://www.gets.govt.nz/ExternalIndex.htm',
  type = 'html_scrape',
  status = 'idle',
  consecutive_failures = 0,
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'reason', 'GETS RSS endpoint returns HTML; scrape the public tender index until a stable machine feed exists.'
  )
where name = 'GETS — Government tenders';

update public.kb_sources
set
  active = false,
  status = 'paused',
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'paused_reason', 'Duplicate of Beehive — Government releases; /rss.xml is the working feed.'
  )
where name = 'Beehive — All releases';

update public.kb_sources
set
  active = false,
  status = 'paused',
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'paused_reason', 'Superseded by PCO API source rows for specific Acts.'
  )
where name = 'Legislation NZ — Acts';

update public.kb_sources
set
  active = false,
  status = 'paused',
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'paused_reason', 'Scoop RSS endpoints return CloudFront WAF challenge to server-side adapter.'
  )
where name in ('Scoop — Business', 'Scoop — Parliament', 'Scoop — Regional');

update public.kb_sources
set
  active = false,
  status = 'paused',
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'paused_reason', 'Source redirects to NZ Herald and no stable RSS endpoint is available.'
  )
where name = 'Gisborne Herald';

update public.kb_sources
set
  active = false,
  status = 'paused',
  updated_at = now(),
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'paused_reason', 'Public page is protected by Incapsula and returns a challenge page to the adapter.'
  )
where name = 'Aviation NZ — News';

update public.kb_sources
set
  status = 'idle',
  updated_at = now()
where active = true
  and status = 'running'
  and last_checked_at < now() - interval '15 minutes';

commit;
