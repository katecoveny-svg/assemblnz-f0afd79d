-- Lula Inn × assembl — hospitality ops pilot (concept).
--
-- Two things:
--   1. public.tenant_customers — a lightweight registry of the hosted customer
--      PILOT workspaces served under /customers/<slug> (e.g. The Lula Inn, and
--      its parent group Star Group). This is deliberately separate from
--      public.tenants (which carries a created_by FK to auth.users + billing/
--      RLS and is awkward to seed without a real user). tenant_customers is a
--      pitch-surface registry, seeded here with no auth dependency.
--
--   2. The tenant_hospo_* data model — the full ops schema a hospitality group
--      needs (staff, rosters, timesheets, pay, menu, stock, orders, wastage,
--      food-safety, bookings, events, incentives, training, finance sync). These
--      are SCAFFOLD tables for a signed pilot. The concept workspace UI reads
--      from config-driven demo data (lib/customers/lula-inn/demo-data.ts), NOT
--      from these tables — nothing real is written here until a pilot is signed.
--
-- Honest by construction: no real staff, revenue, rosters or menu rows are
-- inserted. Only the two tenant registry rows (Lula Inn + Star Group) are
-- seeded, and they carry status = 'concept · pending'.
--
-- Safety: fully idempotent + self-healing. Every table is `create table if not
-- exists`; the seed upserts on the unique slug; RLS is enabled with NO public
-- policy, so the tables are locked to the service role (and future explicit
-- policies) — correct for scaffold tables that will hold real tenant data. No
-- dependency on role-helper functions, so it replays cleanly on a fresh DB.
--
-- Timestamp 20260701140000 — after 20260701130000_kai_helm_uber_direct.sql.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1 · Customer pilot registry
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.tenant_customers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  display_name text not null,
  kind text not null default 'venue',            -- 'venue' | 'group'
  parent_slug text,                              -- venue → its group's slug
  status text not null default 'concept · pending',
  industry text,
  region text,
  brand jsonb not null default '{}'::jsonb,       -- palette / wordmark tokens
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenant_customers enable row level security;

-- IMPORTANT self-heal: tenant_customers may already have been created by an
-- EARLIER pilot migration with a DIFFERENT column set. Three shapes exist in
-- this repo, all via `create table if not exists`:
--   · Happy Tails (20260701140000): id, slug, name (NOT NULL), brand_config,
--     xero_tokens, status CHECK(demo|active|paused), timestamps.
--   · Air NZ / Everyday Rewards (…145000 / …150000): id, slug, display_name
--     (NOT NULL), status CHECK(demo|pilot|live|archived), brand, meta, ts.
-- Our `create table if not exists` above therefore no-ops whenever any of them
-- ran first, so the columns this seed writes might not exist. Add every one
-- defensively (each ADD is a no-op where it already exists) so the seed applies
-- cleanly no matter which pilot created the table.
alter table public.tenant_customers add column if not exists name text;
alter table public.tenant_customers add column if not exists display_name text;
alter table public.tenant_customers add column if not exists kind text;
alter table public.tenant_customers add column if not exists parent_slug text;
alter table public.tenant_customers add column if not exists industry text;
alter table public.tenant_customers add column if not exists region text;
alter table public.tenant_customers add column if not exists brand jsonb not null default '{}'::jsonb;
alter table public.tenant_customers add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Seed the two pilot tenants (idempotent upsert on slug). Star Group is the
-- parent operator; The Lula Inn is the pilot venue under it. We set BOTH `name`
-- and `display_name` so whichever the pre-existing table marked NOT NULL is
-- satisfied, and use status 'demo' — the only value permitted by every pilot's
-- status CHECK. The concept · pending framing lives in metadata.
insert into public.tenant_customers (slug, name, display_name, kind, parent_slug, status, industry, region, metadata)
values
  ('star-group', 'Star Group', 'Star Group', 'group', null, 'demo', 'Hospitality group',
   'North Island', '{"label":"concept · pending","venues":"50+","loyalty":"Star Social Rewards","regions":["Auckland","Waikato","Bay of Plenty","Wellington"]}'::jsonb),
  ('lula-inn', 'The Lula Inn', 'The Lula Inn', 'venue', 'star-group', 'demo', 'Restaurant · bar · events',
   'Viaduct Harbour, Auckland', '{"label":"concept · pending","address":"149 Quay Street, Princes Wharf, Auckland","cuisine":"Pacific-fusion","intro":"Family-adjacent warm intro via Kate’s aunty (FOH)."}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  display_name = excluded.display_name,
  kind = excluded.kind,
  parent_slug = excluded.parent_slug,
  industry = excluded.industry,
  region = excluded.region,
  metadata = excluded.metadata,
  updated_at = now();

-- ─────────────────────────────────────────────────────────────────────────
-- 2 · Ops data model — tenant_hospo_* (scaffold; RLS-locked; no data seeded)
--
-- Every row is scoped to a venue via tenant_slug (references
-- tenant_customers.slug). A group operator sees all venues under its
-- parent_slug. Kept as text FKs (not uuid) so a venue slug reads naturally and
-- the demo config maps 1:1 without an id lookup.
-- ─────────────────────────────────────────────────────────────────────────

-- Venues under a group (multi-venue rollup)
create table if not exists public.tenant_hospo_venues (
  id uuid primary key default gen_random_uuid(),
  group_slug text not null references public.tenant_customers(slug) on delete cascade,
  slug text unique not null,
  name text not null,
  region text,
  is_pilot boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2a · Staffing, rosters, timesheets, pay, leave
create table if not exists public.tenant_hospo_staff (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  name text not null,
  role text not null,                            -- Management|Chef|Kitchen|FOH|Bar|Cleaning
  title text,
  employment text,                               -- Full-time|Part-time|Casual
  base_rate numeric(8,2),
  manager_cert_held boolean not null default false,
  manager_cert_expires date,                     -- Sale & Supply of Alcohol Act 2012
  tenure_months integer,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_shifts (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  staff_id uuid references public.tenant_hospo_staff(id) on delete set null,
  shift_date date,
  starts_at time,
  ends_at time,
  status text not null default 'confirmed',       -- confirmed|open|cover-requested
  is_public_holiday boolean not null default false, -- Holidays Act 2003 penalty rates
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_timesheets (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  staff_id uuid references public.tenant_hospo_staff(id) on delete cascade,
  work_date date,
  clock_in time,
  clock_out time,
  hours numeric(5,2),
  status text not null default 'pending',          -- pending|approved
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_pay_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  period_start date,
  period_end date,
  status text not null default 'draft',            -- draft|approved|filed
  lines jsonb not null default '[]'::jsonb,         -- {staff_id,hours,gross,paye,kiwisaver,net}
  xero_run_id text,                                -- Xero Payroll / MYOB (scaffold)
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_leave (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  staff_id uuid references public.tenant_hospo_staff(id) on delete cascade,
  leave_type text not null,                        -- annual|sick|bereavement|parental
  balance_days numeric(5,2),
  pending_note text,
  created_at timestamptz not null default now()
);

-- 2b · Menu, stock, orders, wastage
create table if not exists public.tenant_hospo_menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  name text not null,
  category text,
  price numeric(8,2),
  cost_per_serve numeric(8,2),
  allergens text[] not null default '{}',          -- Food Act 2014 · FSC 1.2.3
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_stock (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  item text not null,
  location text,                                   -- Fridge|Freezer|Dry store|Bar
  on_hand numeric(10,2),
  par numeric(10,2),
  unit text,
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  supplier text not null,
  category text,
  lines integer,
  total numeric(10,2),
  status text not null default 'draft',            -- draft|sent|delivered
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_wastage (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  item text not null,
  qty text,
  reason text,
  cost numeric(10,2),
  logged_at timestamptz not null default now()
);

-- 2c · Food safety (Food Act 2014)
create table if not exists public.tenant_hospo_fridge_temps (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  unit text not null,
  temp_c numeric(5,2),
  target_max_c numeric(5,2),                       -- ≤4°C chilled / ≤−18°C frozen / ≥82°C rinse
  status text,                                     -- green|amber|red
  logged_by text,
  logged_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_safety_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  task text not null,
  cadence text,
  last_done timestamptz,
  done_by text,
  status text,                                     -- green|amber|red
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  domain text not null default 'food',             -- food|alcohol
  incident_type text,
  detail text,
  severity text,                                   -- green|amber|red
  status text not null default 'open',             -- open|closed|mpi-draft
  handled_by text,
  occurred_at timestamptz not null default now()
);

-- 2d · Bookings + events
create table if not exists public.tenant_hospo_bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  booking_time timestamptz,
  guest_name text,
  covers integer,
  area text,
  is_vip boolean not null default false,
  note text,
  status text not null default 'confirmed',        -- confirmed|seated|no-show-risk
  source text,                                     -- sevenrooms|opentable|resy (scaffold)
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_events (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  name text not null,
  event_type text,                                 -- wedding|corporate|private|ticketed
  event_date date,
  covers integer,
  space text,
  deposit_amount numeric(10,2),
  deposit_paid boolean not null default false,
  status text not null default 'enquiry',
  run_sheet jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2e · Staff loyalty + incentives + training
create table if not exists public.tenant_hospo_incentives (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  kind text not null,                              -- milestone|incentive|recognition
  title text,
  detail text,
  staff_id uuid references public.tenant_hospo_staff(id) on delete set null,
  metric text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_training (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  staff_id uuid references public.tenant_hospo_staff(id) on delete cascade,
  cert text not null,                              -- Manager's Certificate (LCQ), FCP, induction
  status text,                                     -- current|expiring|expired
  expires date,
  created_at timestamptz not null default now()
);

-- 2f · Alcohol licence + compliance (Sale and Supply of Alcohol Act 2012)
create table if not exists public.tenant_hospo_duty_managers (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  staff_id uuid references public.tenant_hospo_staff(id) on delete set null,
  shift_label text,
  cert_expires date,
  present boolean not null default false,          -- s.214 certificated manager present
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_hospo_licences (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  item text not null,                              -- on-licence, endorsement, DLC report
  renews_on date,
  status text,                                     -- green|amber|red
  created_at timestamptz not null default now()
);

-- 2g · Finance sync (Xero / MYOB scaffold)
create table if not exists public.tenant_hospo_xero_sync (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  provider text not null default 'xero',           -- xero|myob
  connected boolean not null default false,        -- false until Kate provides creds
  last_synced_at timestamptz,
  daily_revenue jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2h · Mana Receipts — tamper-evident audit trail for compliance-critical
-- actions (Food Act 2014, Sale & Supply of Alcohol Act 2012, Holidays Act 2003).
create table if not exists public.tenant_hospo_mana_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null references public.tenant_customers(slug) on delete cascade,
  action text not null,
  actor text,
  statute text,                                    -- statutory basis label
  payload jsonb not null default '{}'::jsonb,
  sha256 text,
  prev_sha256 text,                                -- hash chain
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3 · Lock every scaffold table with RLS (enabled, no public policy → service
--     role only). Safe to re-run: enabling RLS twice is a no-op.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'tenant_hospo_venues','tenant_hospo_staff','tenant_hospo_shifts',
    'tenant_hospo_timesheets','tenant_hospo_pay_runs','tenant_hospo_leave',
    'tenant_hospo_menu_items','tenant_hospo_stock','tenant_hospo_orders',
    'tenant_hospo_wastage','tenant_hospo_fridge_temps','tenant_hospo_safety_checks',
    'tenant_hospo_incidents','tenant_hospo_bookings','tenant_hospo_events',
    'tenant_hospo_incentives','tenant_hospo_training','tenant_hospo_duty_managers',
    'tenant_hospo_licences','tenant_hospo_xero_sync','tenant_hospo_mana_receipts'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Seed the multi-venue rollup rows (Star Group venues) — these are venue
-- descriptors only (names/regions), not operational data. Idempotent on slug.
insert into public.tenant_hospo_venues (group_slug, slug, name, region, is_pilot)
values
  ('star-group', 'lula-inn', 'The Lula Inn', 'Viaduct, Auckland', true),
  ('star-group', 'sweat-shop', 'Sweat Shop Brew Kitchen', 'Victoria St, Auckland', false),
  ('star-group', 'moretons', 'Moretons', 'St Heliers, Auckland', false),
  ('star-group', 'the-elbow-room', 'The Elbow Room', 'Ponsonby, Auckland', false)
on conflict (slug) do nothing;

COMMIT;
