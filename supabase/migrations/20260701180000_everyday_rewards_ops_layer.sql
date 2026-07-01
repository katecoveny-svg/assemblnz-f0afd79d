-- ============================================================================
-- Everyday Rewards × Dash — back-of-house PARTNER OPERATIONS layer
-- ----------------------------------------------------------------------------
-- Adds the tables the Everyday Rewards / Woolworths NZ loyalty, finance and
-- compliance team would use to RUN a Dash wait-moment partnership: sponsors
-- (with tiering), earn-scheduling campaigns, sponsor-funded points batches, and
-- per-touchpoint compliance checks. Sits alongside the shopper-facing demo
-- tables from 20260701150000_everyday_rewards_pilot.sql.
--
-- CONCEPT / DEMO ONLY. All rows are mocked. No live Everyday Rewards / points
-- calls, no real points minted, and NO shopper PII — analytics are computed from
-- aggregate cohorts in application code, never from individual records. Every
-- surface is marked "concept · pending".
--
-- Timestamp 20260701180000 sits after the Air NZ ops layer (170000) and the
-- Everyday Rewards pilot (150000). Self-healing throughout (create table if not
-- exists / on conflict). RLS: public read of the demo, writes service-role only.
-- ============================================================================

begin;

-- 1 · Sponsor tiers (reference)
create table if not exists public.tenant_everyday_rewards_sponsor_tiers (
  tier         text primary key check (tier in ('platinum','gold','silver')),
  cpm_floor    numeric(10,2) not null,
  attribution  text not null,
  wait_moments text not null,
  exclusivity  text not null default ''
);

-- 2 · Sponsors — brands buying wait-moment attribution (ASB precedent)
create table if not exists public.tenant_everyday_rewards_sponsors (
  id                text primary key,
  tenant_slug       text not null default 'everyday-rewards',
  name              text not null,
  category          text not null,
  tier              text not null references public.tenant_everyday_rewards_sponsor_tiers (tier),
  status            text not null default 'onboarding'
                      check (status in ('live','onboarding','paused','review')),
  monthly_budget    numeric(12,2) not null default 0,
  spent_this_month  numeric(12,2) not null default 0,
  creative_assets   int not null default 0,
  creative_approved int not null default 0,
  window_start      date,
  window_end        date,
  targeting         text,
  account_manager   text,
  created_at        timestamptz not null default now()
);
create index if not exists edr_sponsors_slug_idx
  on public.tenant_everyday_rewards_sponsors (tenant_slug);

-- 3 · Campaigns — sponsor × wait moment × shopper cluster
create table if not exists public.tenant_everyday_rewards_campaigns (
  id           text primary key,
  tenant_slug  text not null default 'everyday-rewards',
  sponsor_id   text not null references public.tenant_everyday_rewards_sponsors (id) on delete cascade,
  wait_moment  text not null,
  cluster      text not null,
  days         text not null,
  cpm_nzd      numeric(10,2) not null default 18,
  daily_cap    int not null default 0,
  status       text not null default 'draft'
                 check (status in ('scheduled','running','ended','draft')),
  created_at   timestamptz not null default now()
);
create index if not exists edr_campaigns_sponsor_idx
  on public.tenant_everyday_rewards_campaigns (sponsor_id);

-- 4 · Sponsor-funded points batches — treasury reconciliation ledger
create table if not exists public.tenant_everyday_rewards_points_batches (
  id            text primary key,
  tenant_slug   text not null default 'everyday-rewards',
  batch_date    text not null,
  sponsor       text not null,
  wait_moment   text not null,
  moments       int not null default 0,
  points_minted bigint not null default 0,   -- demo tally only
  funded_nzd    numeric(12,2) not null default 0,
  status        text not null default 'pending' check (status in ('reconciled','pending')),
  created_at    timestamptz not null default now()
);

-- 5 · Compliance checks — Fair Trading Act + ASA + Privacy Act 2020 (IPP 3A)
create table if not exists public.tenant_everyday_rewards_compliance (
  id           uuid primary key default gen_random_uuid(),
  tenant_slug  text not null default 'everyday-rewards',
  touchpoint   text not null,
  sponsor      text not null,
  ipp3a_notice text not null default 'pending' check (ipp3a_notice in ('shown','pending')),
  fair_trading text not null default 'review' check (fair_trading in ('pass','flag','review')),
  asa          text not null default 'review' check (asa in ('pass','flag','review')),
  note         text,
  checked_at   timestamptz not null default now()
);

-- 6 · RLS — public read of the demo, service-role writes
alter table public.tenant_everyday_rewards_sponsor_tiers  enable row level security;
alter table public.tenant_everyday_rewards_sponsors       enable row level security;
alter table public.tenant_everyday_rewards_campaigns      enable row level security;
alter table public.tenant_everyday_rewards_points_batches enable row level security;
alter table public.tenant_everyday_rewards_compliance     enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'tenant_everyday_rewards_sponsor_tiers',
    'tenant_everyday_rewards_sponsors',
    'tenant_everyday_rewards_campaigns',
    'tenant_everyday_rewards_points_batches',
    'tenant_everyday_rewards_compliance'
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

grant select on public.tenant_everyday_rewards_sponsor_tiers  to anon, authenticated;
grant select on public.tenant_everyday_rewards_sponsors       to anon, authenticated;
grant select on public.tenant_everyday_rewards_campaigns      to anon, authenticated;
grant select on public.tenant_everyday_rewards_points_batches to anon, authenticated;
grant select on public.tenant_everyday_rewards_compliance     to anon, authenticated;

-- 7 · Seed (idempotent upserts — mirror of ops-data.ts)
insert into public.tenant_everyday_rewards_sponsor_tiers (tier, cpm_floor, attribution, wait_moments, exclusivity) values
  ('platinum', 24, 'First-look + category exclusivity', 'All six wait moments incl. checkout-scan', 'Full category lock for the window'),
  ('gold',     18, 'Priority fill after platinum',      'Offers · balance · card · order-status',  'Sub-category lock'),
  ('silver',   12, 'Remnant / unsold fill',             'Offers refresh · balance sync',           'None — shared category')
on conflict (tier) do update
  set cpm_floor = excluded.cpm_floor, attribution = excluded.attribution,
      wait_moments = excluded.wait_moments, exclusivity = excluded.exclusivity;

insert into public.tenant_everyday_rewards_sponsors
  (id, name, category, tier, status, monthly_budget, spent_this_month, creative_assets, creative_approved, window_start, window_end, targeting, account_manager) values
  ('asb',        'ASB',             'Banking',       'platinum', 'live',       46000, 29800, 8, 8, '2026-07-01', '2026-09-30', 'Digital-card load · all clusters · national',       'Priya N.'),
  ('anchor',     'Anchor',          'Dairy',         'gold',     'live',       30000, 21400, 6, 6, '2026-07-01', '2026-10-31', 'Offers refresh · family shoppers (aggregate)',      'Marcus T.'),
  ('whittakers', 'Whittaker''s',    'Confectionery', 'gold',     'live',       24000, 16200, 5, 5, '2026-07-01', '2026-12-31', 'Balance sync · all clusters',                       'Marcus T.'),
  ('sanitarium', 'Sanitarium',      'Breakfast',     'silver',   'live',       12000,  7300, 4, 4, '2026-07-01', '2026-09-30', 'Checkout-scan queue · family cluster (aggregate)',  'Marcus T.'),
  ('airnz',      'Air New Zealand', 'Travel',        'gold',     'onboarding', 26000,     0, 3, 1, '2026-07-15', '2026-10-15', 'Voucher-redemption · travel-reward converters',     'Priya N.'),
  ('uber',       'Uber',            'Delivery',      'silver',   'review',      9000,     0, 2, 0, '2026-08-01', '2026-10-31', 'Order-status tracker · online-shop cluster',        'Marcus T.')
on conflict (id) do update set
  name = excluded.name, category = excluded.category, tier = excluded.tier, status = excluded.status,
  monthly_budget = excluded.monthly_budget, spent_this_month = excluded.spent_this_month,
  creative_assets = excluded.creative_assets, creative_approved = excluded.creative_approved,
  window_start = excluded.window_start, window_end = excluded.window_end,
  targeting = excluded.targeting, account_manager = excluded.account_manager;

insert into public.tenant_everyday_rewards_campaigns
  (id, sponsor_id, wait_moment, cluster, days, cpm_nzd, daily_cap, status) values
  ('c1', 'asb',        'Digital card load',        'All clusters',              'Daily',   24, 90000, 'running'),
  ('c2', 'asb',        'Points balance sync',      'All clusters',              'Daily',   22, 70000, 'running'),
  ('c3', 'anchor',     'Offers refresh',           'Family shoppers',           'Mon–Sun', 19, 120000,'running'),
  ('c4', 'whittakers', 'Points balance sync',      'All clusters',              'Thu–Sun', 18, 60000, 'running'),
  ('c5', 'sanitarium', 'Checkout scan companion',  'Family shoppers',           'Daily',   16, 50000, 'running'),
  ('c6', 'airnz',      'Voucher redemption',       'Travel-reward converters',  'Fri–Mon', 22, 30000, 'scheduled'),
  ('c7', 'uber',       'Order status',             'Online-shop cluster',       'Sat–Sun', 14, 25000, 'draft')
on conflict (id) do update set
  sponsor_id = excluded.sponsor_id, wait_moment = excluded.wait_moment, cluster = excluded.cluster,
  days = excluded.days, cpm_nzd = excluded.cpm_nzd, daily_cap = excluded.daily_cap, status = excluded.status;

insert into public.tenant_everyday_rewards_points_batches
  (id, batch_date, sponsor, wait_moment, moments, points_minted, funded_nzd, status) values
  ('b-0714-asb', '14 Jul', 'ASB',          'Digital card load', 88400,  442000, 3315, 'reconciled'),
  ('b-0714-anc', '14 Jul', 'Anchor',       'Offers refresh',    116200, 464800, 3486, 'reconciled'),
  ('b-0714-whi', '14 Jul', 'Whittaker''s', 'Balance sync',      54100,  216400, 1623, 'reconciled'),
  ('b-0714-san', '14 Jul', 'Sanitarium',   'Checkout scan',     41800,  250800, 1881, 'pending')
on conflict (id) do update set
  batch_date = excluded.batch_date, sponsor = excluded.sponsor, wait_moment = excluded.wait_moment,
  moments = excluded.moments, points_minted = excluded.points_minted,
  funded_nzd = excluded.funded_nzd, status = excluded.status;

commit;
