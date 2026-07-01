-- ============================================================================
-- Multi-tenant customer-workspace scaffold + Air New Zealand × Dash pilot demo
-- ----------------------------------------------------------------------------
-- Ships the shared `tenant_customers` registry (first customer-workspace build
-- to land wins the table — this migration is fully idempotent so it co-exists
-- with the Happy Tails scaffold regardless of merge order) plus the two Air NZ
-- demo tables that back the hosted pilot workspace at /customers/air-nz/dash.
--
-- IMPORTANT — this is a CONCEPT/DEMO. Every row is mocked. Nothing here talks to
-- Air New Zealand, Koru, or Airpoints. No live Airpoints Dollars are minted; the
-- earn tallies are demonstration figures only. There is no real Air NZ
-- partnership — the workspace chrome is marked "concept · demo pending".
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1 · tenant_customers — shared registry of hosted customer demo workspaces
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_customers (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  display_name text not null,
  status       text not null default 'demo'
                 check (status in ('demo', 'pilot', 'live', 'archived')),
  -- Brand tokens the workspace chrome themes itself from. Kept as JSONB so a new
  -- tenant is a data row, not a code change.
  brand        jsonb not null default '{}'::jsonb,
  -- Free-form notes / pitch metadata (contact, envelope, etc).
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.tenant_customers is
  'Registry of hosted per-customer demo/pilot workspaces (e.g. Air NZ × Dash). Concept demos — brand tokens drive the workspace chrome.';

-- ---------------------------------------------------------------------------
-- 2 · tenant_air_nz_journeys — mocked passenger journeys for the demo
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_journeys (
  id            uuid primary key default gen_random_uuid(),
  tenant_slug   text not null default 'air-nz',
  persona       text not null,               -- demo persona, e.g. 'Kate — Koru Gold'
  route         text not null,               -- e.g. 'AKL → WLG'
  flight_no     text not null,               -- e.g. 'NZ0429'
  koru_tier     text not null default 'Gold',
  -- Total Airpoints Dollars earned across the journey (demo tally only).
  earned_apd    numeric(10,2) not null default 0,
  sponsor_count int not null default 0,
  journey_date  date not null default current_date,
  created_at    timestamptz not null default now()
);

comment on table public.tenant_air_nz_journeys is
  'Mocked Air NZ passenger journeys for the Dash pilot demo. Demo data only — no real Airpoints minted.';

create index if not exists tenant_air_nz_journeys_slug_idx
  on public.tenant_air_nz_journeys (tenant_slug);

-- ---------------------------------------------------------------------------
-- 3 · tenant_air_nz_wait_moments — each sponsored earn moment in a journey
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_wait_moments (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid references public.tenant_air_nz_journeys (id) on delete cascade,
  tenant_slug   text not null default 'air-nz',
  stage_key     text not null,               -- booking | identity | seat | gate | ife | baggage
  stage_label   text not null,               -- 'Gate wait', 'IFE unlock', ...
  sponsor       text not null,               -- placeholder sponsor name
  -- Effective CPM the sponsor pays for the moment (NZ$).
  cpm_nzd       numeric(10,2) not null default 45,
  -- Airpoints Dollars credited to the passenger for the moment (demo only).
  earned_apd    numeric(10,2) not null default 0,
  seq           int not null default 0,
  created_at    timestamptz not null default now()
);

comment on table public.tenant_air_nz_wait_moments is
  'Each sponsored wait-state earn moment in an Air NZ demo journey (cpm, sponsor placeholder, Airpoints Dollars earned). Demo data only.';

create index if not exists tenant_air_nz_wait_moments_journey_idx
  on public.tenant_air_nz_wait_moments (journey_id, seq);

-- ---------------------------------------------------------------------------
-- 4 · Row-level security — public read of the demo, admin-only writes
-- ---------------------------------------------------------------------------
alter table public.tenant_customers          enable row level security;
alter table public.tenant_air_nz_journeys    enable row level security;
alter table public.tenant_air_nz_wait_moments enable row level security;

do $$
begin
  -- tenant_customers: anyone can read demo/pilot/live rows.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_customers'
      and policyname = 'tenant_customers public read'
  ) then
    create policy "tenant_customers public read"
      on public.tenant_customers for select
      using (status <> 'archived');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_air_nz_journeys'
      and policyname = 'tenant_air_nz_journeys public read'
  ) then
    create policy "tenant_air_nz_journeys public read"
      on public.tenant_air_nz_journeys for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_air_nz_wait_moments'
      and policyname = 'tenant_air_nz_wait_moments public read'
  ) then
    create policy "tenant_air_nz_wait_moments public read"
      on public.tenant_air_nz_wait_moments for select using (true);
  end if;
end $$;

grant select on public.tenant_customers          to anon, authenticated;
grant select on public.tenant_air_nz_journeys    to anon, authenticated;
grant select on public.tenant_air_nz_wait_moments to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5 · Seed — the air-nz tenant + one demo journey (Kate — Koru Gold, AKL → WLG)
-- ---------------------------------------------------------------------------
insert into public.tenant_customers (slug, display_name, status, brand, meta)
values (
  'air-nz',
  'Air New Zealand',
  'demo',
  jsonb_build_object(
    'header',  '#111111',
    'accent',  '#00B0B9',
    'accentDeep', '#00838C',
    'bg',      '#FFFFFF',
    'ink',     '#111111',
    'warmGrey','#6B6E71',
    'silver',  '#EAEAEA',
    'success', '#2E7D5B',
    'fontBody','Inter Tight',
    'fontDisplay','Fraunces',
    'currency','APD',
    'logoMark','koru'
  ),
  jsonb_build_object(
    'concept', true,
    'partnership', false,
    'note', 'concept · demo pending — no live Air NZ partnership',
    'contact', 'Jeremy O''Brien — Chief Customer & Digital Officer',
    'pilotEnvelopeNzd', 180000
  )
)
on conflict (slug) do update
  set display_name = excluded.display_name,
      brand        = excluded.brand,
      meta         = excluded.meta,
      updated_at   = now();

-- Idempotent demo journey + its six sponsored wait moments. Rebuild cleanly on
-- every apply so the seed always reflects the current demo script.
do $$
declare
  v_journey uuid;
begin
  delete from public.tenant_air_nz_journeys
    where tenant_slug = 'air-nz' and flight_no = 'NZ0429';

  insert into public.tenant_air_nz_journeys
    (tenant_slug, persona, route, flight_no, koru_tier, earned_apd, sponsor_count, journey_date)
  values
    ('air-nz', 'Kate — Koru Gold', 'AKL → WLG', 'NZ0429', 'Gold', 4.20, 6, current_date)
  returning id into v_journey;

  insert into public.tenant_air_nz_wait_moments
    (journey_id, tenant_slug, stage_key, stage_label, sponsor, cpm_nzd, earned_apd, seq)
  values
    (v_journey, 'air-nz', 'booking',  'Booking · confirming availability', 'Sharesies',   38, 0.60, 1),
    (v_journey, 'air-nz', 'identity', 'Identity verify load',              'Kiwibank',    40, 0.40, 2),
    (v_journey, 'air-nz', 'seat',     'Seat check-in · 24hr window',       'Whittaker''s', 36, 0.80, 3),
    (v_journey, 'air-nz', 'gate',     'Gate wait',                         '2degrees',    45, 1.20, 4),
    (v_journey, 'air-nz', 'ife',      'In-flight IFE unlock',              'Spark',       62, 0.90, 5),
    (v_journey, 'air-nz', 'baggage',  'Baggage carousel',                  'NZ Post',     36, 0.30, 6);
end $$;
