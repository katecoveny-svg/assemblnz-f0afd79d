-- Everyday Rewards × assembl — hosted pilot workspace.
--
-- Backing data for the concept pilot surface at
-- /customers/everyday-rewards/dash. This is a PITCH surface shown to
-- Woolworths NZ / Everyday Rewards before any partnership exists — demonstration
-- data only. No secrets, no real customer data, no live points.
--
-- COORDINATION: the shared `public.tenant_customers` registry was first shipped
-- by the Air NZ pilot (20260701140000_tenant_air_nz_pilot.sql) with columns
-- (slug, display_name, status, brand jsonb, meta jsonb). This migration reuses
-- that exact shape — `create table if not exists` no-ops when it already exists,
-- and the seed uses their columns (brand tokens → brand, contact/pitch notes →
-- meta, status = 'demo'). It also adds two Everyday-Rewards-specific tables.
--
-- Pages read their content from lib/customers/everyday-rewards/config.ts (code is
-- the source of truth for the UI); these tables are a seeded, auditable mirror.
-- Self-healing throughout (create table / insert ... on conflict). RLS: public
-- read (marketing data), writes are service-role only.

begin;

-- 1 · Shared customer-workspace registry (mirrors the Air NZ definition so this
--     migration is safe to apply alone, and a no-op when the table exists).
create table if not exists public.tenant_customers (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  display_name text not null,
  status       text not null default 'demo'
                 check (status in ('demo', 'pilot', 'live', 'archived')),
  brand        jsonb not null default '{}'::jsonb,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2 · Everyday Rewards wait moments — the six real app waits that become
--     sponsored earn surfaces.
create table if not exists public.tenant_everyday_rewards_wait_moments (
  id            uuid primary key default gen_random_uuid(),
  tenant_slug   text not null default 'everyday-rewards',
  moment_key    text not null unique,
  ordinal       int  not null default 0,
  label         text not null,
  screen        text not null default '',
  today_state   text not null default '',
  wait_seconds  int  not null default 0,
  points_earned int  not null default 0,      -- demo tally only
  sponsor       text not null default '',
  earn_copy     text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists edr_wait_moments_tenant_idx
  on public.tenant_everyday_rewards_wait_moments (tenant_slug, ordinal);

-- 3 · Everyday Rewards demo earners (fake shoppers).
create table if not exists public.tenant_everyday_rewards_earners (
  id                    uuid primary key default gen_random_uuid(),
  tenant_slug           text not null default 'everyday-rewards',
  earner_key            text not null unique,
  display_name          text not null,
  suburb                text not null default '',
  balance_points        int  not null default 0,  -- demo balance only
  wait_points_this_week int  not null default 0,  -- demo attribution only
  created_at            timestamptz not null default now()
);

create index if not exists edr_earners_tenant_idx
  on public.tenant_everyday_rewards_earners (tenant_slug);

-- ── RLS: public read, service-role write ─────────────────────────────────
alter table public.tenant_customers                       enable row level security;
alter table public.tenant_everyday_rewards_wait_moments   enable row level security;
alter table public.tenant_everyday_rewards_earners        enable row level security;

-- tenant_customers may already have its public-read policy from the Air NZ
-- migration; create ours only if absent (its policy name differs).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_customers'
      and policyname = 'tenant_customers public read'
  ) then
    create policy "tenant_customers public read"
      on public.tenant_customers for select to anon, authenticated using (true);
  end if;
end $$;

drop policy if exists edr_wait_moments_public_read on public.tenant_everyday_rewards_wait_moments;
create policy edr_wait_moments_public_read on public.tenant_everyday_rewards_wait_moments
  for select to anon, authenticated using (true);

drop policy if exists edr_earners_public_read on public.tenant_everyday_rewards_earners;
create policy edr_earners_public_read on public.tenant_everyday_rewards_earners
  for select to anon, authenticated using (true);

grant select on public.tenant_customers                     to anon, authenticated;
grant select on public.tenant_everyday_rewards_wait_moments to anon, authenticated;
grant select on public.tenant_everyday_rewards_earners      to anon, authenticated;

-- ── Seed: the tenant row (their columns; status 'demo') ──────────────────
insert into public.tenant_customers (slug, display_name, status, brand, meta)
values (
  'everyday-rewards',
  'Everyday Rewards',
  'demo',
  jsonb_build_object(
    'orange', '#fd6400',
    'orangeDark', '#c65100',
    'orangeLight', '#ffe6d1',
    'charcoal', '#3a474e',
    'navy', '#22303c',
    'leaf', '#4caf50',
    'canary', '#FFD42A',
    'font', 'Roboto',
    'mark', 'r-leaf silhouette (concept placeholder)'
  ),
  jsonb_build_object(
    'parent_brand', 'Woolworths New Zealand',
    'contact_name', 'Sarah Chapman',
    'contact_role', 'Chief Digital & Marketing Officer, Woolworths NZ',
    'concept', true,
    'voucher_threshold', 2000,
    'voucher_value_nzd', 15
  )
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  status       = excluded.status,
  brand        = excluded.brand,
  meta         = excluded.meta,
  updated_at   = now();

-- ── Seed: wait moments (mirror of config.ts WAIT_MOMENTS) ────────────────
insert into public.tenant_everyday_rewards_wait_moments
  (moment_key, ordinal, label, screen, today_state, wait_seconds, points_earned, sponsor, earn_copy)
values
  ('offers-refresh', 1, 'Offers refresh', 'Home · member offers', 'Spinner while personalised offers load', 3, 8, 'Anchor', 'Points earned while your offers refreshed — brought to you by a partner.'),
  ('points-balance-sync', 2, 'Points balance sync', 'Wallet · balance', 'Balance pill shows a shimmer while syncing', 2, 6, 'Whittaker''s', 'A moment to sync your balance — and a few points on the house.'),
  ('checkout-scan', 3, 'Checkout scan companion', 'In-store · Scan&Go queue', 'Waiting for barcode / queue at self-checkout', 40, 12, 'Sanitarium', 'You waited 40s in the queue. We turned that into points.'),
  ('digital-card-load', 4, 'Digital card load', 'Wallet · digital card', 'Card barcode renders / brightness ramps', 2, 5, 'ASB', 'Your card, ready to scan — with points from a partner while it loaded.'),
  ('voucher-redemption', 5, 'Voucher redemption', 'Rewards · redeem', 'Processing voucher / travel conversion', 4, 10, 'Air New Zealand', 'While your voucher processed, a partner topped up your balance.'),
  ('order-status', 6, 'Order status', 'Delivery · ETA tracker', 'Waiting on delivery-window / driver ETA', 6, 9, 'Uber', 'Tracking your delivery? Here are points for the wait.')
on conflict (moment_key) do update set
  ordinal       = excluded.ordinal,
  label         = excluded.label,
  screen        = excluded.screen,
  today_state   = excluded.today_state,
  wait_seconds  = excluded.wait_seconds,
  points_earned = excluded.points_earned,
  sponsor       = excluded.sponsor,
  earn_copy     = excluded.earn_copy;

-- ── Seed: fake demo shoppers ─────────────────────────────────────────────
insert into public.tenant_everyday_rewards_earners
  (earner_key, display_name, suburb, balance_points, wait_points_this_week)
values
  ('demo-kate', 'Kate H.', 'Ponsonby, Auckland', 1660, 38),
  ('demo-mere', 'Mere T.', 'Porirua, Wellington', 1204, 22),
  ('demo-sione', 'Sione F.', 'Māngere, Auckland', 1985, 44),
  ('demo-ana', 'Ana R.', 'Riccarton, Christchurch', 742, 17),
  ('demo-james', 'James W.', 'Tauranga', 2130, 51)
on conflict (earner_key) do update set
  display_name          = excluded.display_name,
  suburb                = excluded.suburb,
  balance_points        = excluded.balance_points,
  wait_points_this_week = excluded.wait_points_this_week;

commit;
