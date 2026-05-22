-- Live feed foundation: shared scaffold for every external feed assembl
-- ingests (NZ Gazette, GETS, Privacy Commissioner enforcement, AoG contract
-- notices, ...). The GETS poll function is the first consumer.
--
-- Three tables:
--   live_feed_sources  — registry of every feed we poll (one row per feed)
--   live_feed_entries  — the actual items ingested (deduped by source+external_id)
--   live_feed_log      — one row per poll attempt; success or failure
--
-- Idempotency: (source_slug, external_id) is unique. Re-ingesting an item
-- only updates content_hash + capability_score + signals, never inserts a
-- duplicate.

create table if not exists public.live_feed_sources (
  slug text primary key,
  name text not null,
  kind text not null check (kind in ('rss', 'json', 'html', 'mixed')),
  url text not null,
  description text,
  enabled boolean not null default true,
  poll_cron_hint text,
  last_polled_at timestamptz,
  last_success_at timestamptz,
  consecutive_failures integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.live_feed_sources is
  'Registry of external feeds assembl polls (one row per feed). The poll function for each feed name is `live-feed-<slug>-poll`.';

create table if not exists public.live_feed_entries (
  id uuid primary key default gen_random_uuid(),
  source_slug text not null references public.live_feed_sources(slug) on delete cascade,
  external_id text not null,
  title text not null,
  summary text,
  url text,
  published_at timestamptz,
  content_hash text,
  -- Per-kete relevance map, 0..100 scores: {"waihanga": 60, "manaaki": 0, ...}
  kete_relevance jsonb not null default '{}'::jsonb,
  -- Capability assessment (0..100) plus the signal breakdown that produced it.
  -- Shape: { score:int, signals:[{label,points,evidence?}], assessed_at:string,
  --          mana_receipt:ManaReceipt }
  capability_assessment jsonb,
  capability_score integer generated always as
    (coalesce((capability_assessment->>'score')::int, 0)) stored,
  -- Tender-specific structured fields. Shape varies per feed. For GETS:
  -- { rfx_id, ref_number, agency, tender_type, close_at, response_format, ... }
  tender_meta jsonb,
  status text not null default 'new'
    check (status in ('new', 'reviewing', 'go', 'no_go', 'drafted', 'submitted', 'archived')),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists live_feed_entries_source_external_uidx
  on public.live_feed_entries (source_slug, external_id);

create index if not exists live_feed_entries_published_idx
  on public.live_feed_entries (published_at desc);

create index if not exists live_feed_entries_score_idx
  on public.live_feed_entries (source_slug, capability_score desc, published_at desc);

create index if not exists live_feed_entries_status_idx
  on public.live_feed_entries (status, source_slug);

comment on table public.live_feed_entries is
  'Every item ingested from a live feed. Dedup key is (source_slug, external_id). capability_score is a generated column projected from capability_assessment->>score for cheap sorting/filtering.';

create table if not exists public.live_feed_log (
  id bigserial primary key,
  source_slug text not null references public.live_feed_sources(slug) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'ok', 'error', 'skipped_time_gate')),
  entries_fetched integer not null default 0,
  entries_inserted integer not null default 0,
  entries_updated integer not null default 0,
  entries_notified integer not null default 0,
  duration_ms integer,
  error jsonb,
  notes text
);

create index if not exists live_feed_log_source_started_idx
  on public.live_feed_log (source_slug, started_at desc);

comment on table public.live_feed_log is
  'One row per poll attempt. status=skipped_time_gate means the cron fired but the function declined to fetch (e.g. outside the daily window).';

-- updated_at trigger for sources + entries
create or replace function public.live_feed_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists live_feed_sources_touch on public.live_feed_sources;
create trigger live_feed_sources_touch
  before update on public.live_feed_sources
  for each row execute function public.live_feed_touch_updated_at();

drop trigger if exists live_feed_entries_touch on public.live_feed_entries;
create trigger live_feed_entries_touch
  before update on public.live_feed_entries
  for each row execute function public.live_feed_touch_updated_at();

-- RLS: service role writes from edge functions; authenticated reads gated by
-- the Next.js layer (the /internal/* pages are email-allowlisted server-side,
-- so we do not need per-row RLS for the v1 internal surface).
alter table public.live_feed_sources enable row level security;
alter table public.live_feed_entries enable row level security;
alter table public.live_feed_log enable row level security;

-- service_role bypasses RLS automatically; explicit policies cover the
-- authenticated client used by Next.js server components.
drop policy if exists live_feed_sources_read_auth on public.live_feed_sources;
create policy live_feed_sources_read_auth
  on public.live_feed_sources for select
  to authenticated using (true);

drop policy if exists live_feed_entries_read_auth on public.live_feed_entries;
create policy live_feed_entries_read_auth
  on public.live_feed_entries for select
  to authenticated using (true);

drop policy if exists live_feed_entries_update_auth on public.live_feed_entries;
create policy live_feed_entries_update_auth
  on public.live_feed_entries for update
  to authenticated using (true) with check (true);

drop policy if exists live_feed_log_read_auth on public.live_feed_log;
create policy live_feed_log_read_auth
  on public.live_feed_log for select
  to authenticated using (true);

-- Seed GETS source. Idempotent on slug.
insert into public.live_feed_sources (slug, name, kind, url, description, poll_cron_hint)
values (
  'gets',
  'NZ Government Electronic Tenders Service',
  'rss',
  'https://www.gets.govt.nz/ExternalRSSFeed.htm',
  'NZ government tender notices (RFP / RFT / RFI / NOI / ROI). Polled daily at 09:00 Pacific/Auckland by live-feed-gets-poll. Detail page pattern: /{ORG}/ExternalTenderDetails.htm?id={RFX_ID}.',
  'daily 09:00 Pacific/Auckland'
)
on conflict (slug) do update set
  name = excluded.name,
  kind = excluded.kind,
  url = excluded.url,
  description = excluded.description,
  poll_cron_hint = excluded.poll_cron_hint;
