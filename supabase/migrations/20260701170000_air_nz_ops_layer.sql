-- ============================================================================
-- Air New Zealand × Dash — back-of-house PARTNER OPERATIONS layer
-- ----------------------------------------------------------------------------
-- Adds the tables the Air NZ partnerships/finance/compliance team would use to
-- RUN a Dash partnership: sponsors (with tiering), campaigns, and per-touchpoint
-- compliance checks. Sits alongside the passenger-facing demo tables from
-- 20260701145000_tenant_air_nz_pilot.sql.
--
-- CONCEPT / DEMO ONLY. All rows are mocked. No live Air NZ / Koru / Airpoints
-- calls, no real Airpoints minted, and NO passenger PII — analytics are computed
-- from aggregate cohorts in application code, never from individual records.
-- Every surface is marked "concept · demo pending".
--
-- Version 20260701170000 chosen to sit AFTER the existing 20260701140000 /
-- 145000 Air NZ migrations and avoid the duplicate-version collisions already on
-- main (see the build blocker doc). This migration adds no duplicate prefix.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1 · Sponsor tiers (reference)
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_sponsor_tiers (
  tier          text primary key check (tier in ('platinum','gold','silver')),
  cpm_floor     numeric(10,2) not null,
  attribution   text not null,
  wait_states   text not null
);

-- ---------------------------------------------------------------------------
-- 2 · Sponsors — brands buying wait-state moments
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_sponsors (
  id               text primary key,
  tenant_slug      text not null default 'air-nz',
  name             text not null,
  category         text not null,
  tier             text not null references public.tenant_air_nz_sponsor_tiers (tier),
  status           text not null default 'onboarding'
                     check (status in ('live','onboarding','paused','review')),
  monthly_budget   numeric(12,2) not null default 0,
  spent_this_month numeric(12,2) not null default 0,
  creative_assets  int not null default 0,
  creative_approved int not null default 0,
  window_start     date,
  window_end       date,
  targeting        text,
  account_manager  text,
  created_at       timestamptz not null default now()
);

create index if not exists tenant_air_nz_sponsors_slug_idx
  on public.tenant_air_nz_sponsors (tenant_slug);

-- ---------------------------------------------------------------------------
-- 3 · Campaigns — sponsor × wait moment × route/day/segment
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_campaigns (
  id            text primary key,
  tenant_slug   text not null default 'air-nz',
  sponsor_id    text not null references public.tenant_air_nz_sponsors (id) on delete cascade,
  wait_state    text not null,
  wait_label    text not null,
  route         text not null,
  segment       text not null,
  days          text not null,
  cpm_nzd       numeric(10,2) not null default 45,
  daily_cap     int not null default 0,
  status        text not null default 'draft'
                  check (status in ('scheduled','running','ended','draft')),
  created_at    timestamptz not null default now()
);

create index if not exists tenant_air_nz_campaigns_sponsor_idx
  on public.tenant_air_nz_campaigns (sponsor_id);

-- ---------------------------------------------------------------------------
-- 4 · Compliance checks — Privacy Act 2020 (IPP 3A) + Fair Trading Act
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_air_nz_compliance (
  id             uuid primary key default gen_random_uuid(),
  tenant_slug    text not null default 'air-nz',
  touchpoint     text not null,
  sponsor        text not null,
  ipp3a_notice   text not null default 'pending' check (ipp3a_notice in ('shown','pending')),
  fair_trading   text not null default 'review' check (fair_trading in ('pass','flag','review')),
  note           text,
  checked_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5 · RLS — public read of the demo, admin-only writes
-- ---------------------------------------------------------------------------
alter table public.tenant_air_nz_sponsor_tiers enable row level security;
alter table public.tenant_air_nz_sponsors      enable row level security;
alter table public.tenant_air_nz_campaigns     enable row level security;
alter table public.tenant_air_nz_compliance    enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'tenant_air_nz_sponsor_tiers',
    'tenant_air_nz_sponsors',
    'tenant_air_nz_campaigns',
    'tenant_air_nz_compliance'
  ]
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = t || ' public read'
    ) then
      execute format(
        'create policy %I on public.%I for select using (true)',
        t || ' public read', t
      );
    end if;
  end loop;
end $$;

grant select on public.tenant_air_nz_sponsor_tiers to anon, authenticated;
grant select on public.tenant_air_nz_sponsors      to anon, authenticated;
grant select on public.tenant_air_nz_campaigns     to anon, authenticated;
grant select on public.tenant_air_nz_compliance    to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6 · Seed — tiers, sponsors, campaigns (idempotent upserts)
-- ---------------------------------------------------------------------------
insert into public.tenant_air_nz_sponsor_tiers (tier, cpm_floor, attribution, wait_states) values
  ('platinum', 62, 'First-look + category exclusivity', 'All wait states incl. premium IFE'),
  ('gold',     45, 'Priority fill after platinum',      'Gate · booking · check-in · baggage'),
  ('silver',   36, 'Remnant / unsold fill',             'Booking · check-in · baggage')
on conflict (tier) do update
  set cpm_floor = excluded.cpm_floor,
      attribution = excluded.attribution,
      wait_states = excluded.wait_states;

insert into public.tenant_air_nz_sponsors
  (id, name, category, tier, status, monthly_budget, spent_this_month, creative_assets, creative_approved, window_start, window_end, targeting, account_manager) values
  ('bnz',        'BNZ',         'Banking',   'platinum', 'live',       48000, 31200, 8, 8, '2026-07-01', '2026-09-30', 'Domestic gate · Koru Gold/Silver · AKL·WLG·CHC', 'Priya N.'),
  ('asb',        'ASB',         'Banking',   'gold',     'live',       32000, 24800, 6, 5, '2026-07-01', '2026-08-31', 'Booking + check-in · all tiers · main trunk',    'Priya N.'),
  ('foodstuffs', 'Foodstuffs',  'Grocery',   'gold',     'live',       28000, 19100, 5, 5, '2026-07-01', '2026-12-31', 'Baggage carousel · regional arrivals',           'Marcus T.'),
  ('sharesies',  'Sharesies',   'Investing', 'silver',   'live',       12000,  7400, 4, 4, '2026-07-01', '2026-09-30', 'Booking spinner · under-40 segment (aggregate)', 'Marcus T.'),
  ('2degrees',   '2degrees',    'Telco',     'gold',     'onboarding', 22000,     0, 3, 1, '2026-07-15', '2026-10-15', 'Gate wait · trans-Tasman',                       'Priya N.'),
  ('whittakers', 'Whittaker''s','Grocery',   'silver',   'review',      9000,     0, 2, 0, '2026-08-01', '2026-10-31', 'Seat check-in · family segment (aggregate)',     'Marcus T.')
on conflict (id) do update set
  name = excluded.name, category = excluded.category, tier = excluded.tier, status = excluded.status,
  monthly_budget = excluded.monthly_budget, spent_this_month = excluded.spent_this_month,
  creative_assets = excluded.creative_assets, creative_approved = excluded.creative_approved,
  window_start = excluded.window_start, window_end = excluded.window_end,
  targeting = excluded.targeting, account_manager = excluded.account_manager;

insert into public.tenant_air_nz_campaigns
  (id, sponsor_id, wait_state, wait_label, route, segment, days, cpm_nzd, daily_cap, status) values
  ('c1', 'bnz',        'gate',    'Gate wait',        'AKL ⇄ WLG',        'Koru Gold/Silver',       'Mon–Fri', 64, 22000, 'running'),
  ('c2', 'bnz',        'ife',     'IFE unlock',       'AKL ⇄ CHC',        'All · international fleet','Daily',   68, 14000, 'running'),
  ('c3', 'asb',        'booking', 'Booking flow',     'Main trunk',       'All tiers',              'Daily',   40, 30000, 'running'),
  ('c4', 'asb',        'seat',    'Seat check-in',    'AKL ⇄ WLG',        'All tiers',              'Thu–Sun', 38, 18000, 'running'),
  ('c5', 'foodstuffs', 'baggage', 'Baggage carousel', 'Regional arrivals','All',                    'Daily',   36, 16000, 'running'),
  ('c6', 'sharesies',  'booking', 'Booking flow',     'All domestic',     'Under-40 (aggregate)',   'Mon–Fri', 38, 12000, 'running'),
  ('c7', '2degrees',   'gate',    'Gate wait',        'Trans-Tasman',     'All',                    'Fri–Mon', 45, 20000, 'scheduled'),
  ('c8', 'whittakers', 'seat',    'Seat check-in',    'AKL ⇄ ZQN',        'Family (aggregate)',     'Sat–Sun', 36,  8000, 'draft')
on conflict (id) do update set
  sponsor_id = excluded.sponsor_id, wait_state = excluded.wait_state, wait_label = excluded.wait_label,
  route = excluded.route, segment = excluded.segment, days = excluded.days,
  cpm_nzd = excluded.cpm_nzd, daily_cap = excluded.daily_cap, status = excluded.status;
