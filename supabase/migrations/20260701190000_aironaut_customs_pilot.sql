-- Aironaut × Pīkau — customs-brokerage operations pilot.
--
-- Multi-tenant customs workspace tables for the `aeronaut` tenant. Keyed by
-- tenant_slug (text) rather than an FK to public.tenants(id) on purpose: the
-- pilot seeds and renders without needing an auth.users row to own the tenant,
-- and the app's data layer falls back to in-code demo fixtures whenever these
-- tables are empty or unreadable. The DB is progressive enhancement.
--
-- Idempotent and self-healing: safe to replay on a fresh project or a partially
-- applied one. Nothing here lodges a customs entry — draft-only, always.
--
-- Timestamp 20260701190000: sits after the sibling customer-pilot migrations
-- (happy_tails, auckland_zoo, air_nz, everyday_rewards, lula_inn up to
-- 20260701180000) so the version prefix is unique and ordering is stable.

-- ---------------------------------------------------------------------------
-- 1. Membership helper (resolves tenant_slug -> membership)
-- ---------------------------------------------------------------------------

create or replace function public.is_customs_tenant_member(_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members tm
    join public.tenants t on t.id = tm.tenant_id
    where t.slug = _slug
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_customs_tenant_admin(_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members tm
    join public.tenants t on t.id = tm.tenant_id
    where t.slug = _slug
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.tenant_customs_importers (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  name text not null,
  client_code text,
  nzbn text,
  gst_registered boolean not null default false,
  contacts jsonb not null default '[]'::jsonb,
  credit_terms text,
  standing_preferences jsonb not null default '[]'::jsonb,
  common_hs_codes jsonb not null default '[]'::jsonb,
  entries_this_year integer not null default 0,
  since date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_entries (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  shipment_ref text not null,
  importer_id text,
  importer_name text not null,
  supplier_name text,
  origin_country text,
  goods text,
  status text not null default 'draft',
  -- Full drafted entry input; the app recomputes the readiness plan from this.
  input jsonb not null default '{}'::jsonb,
  -- Captured classification decisions (HS candidates + GRI reasoning).
  classifications jsonb not null default '[]'::jsonb,
  -- Duty rate resolved from confirmed classifications (0 while unclassified).
  effective_rate_percent numeric not null default 0,
  receipt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cached HS classifications for reuse across entries.
create table if not exists public.tenant_customs_hs_lookups (
  id uuid primary key default gen_random_uuid(),
  tenant_slug text not null default 'aeronaut',
  goods_description text not null,
  hs_code text not null,
  gri_applied text,
  duty_rate_percent numeric,
  suggestion boolean not null default true,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_staff (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  name text not null,
  role text not null default 'entry_clerk',
  broker_licence text,
  email text,
  wage_rate_nzd numeric,
  employment_type text,
  cpd_hours_ytd numeric not null default 0,
  cpd_hours_required numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_shifts (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  staff_id text not null,
  date_iso date not null,
  start_hhmm text,
  end_hhmm text,
  worked_hours numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_invoices (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  importer_id text,
  entry_id text,
  period_label text,
  issued_iso date,
  due_iso date,
  status text not null default 'draft',
  lines jsonb not null default '[]'::jsonb,
  brokerage_fee_nzd numeric not null default 0,
  disbursements_nzd numeric not null default 0,
  gst_nzd numeric not null default 0,
  total_nzd numeric not null default 0,
  xero_invoice_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_compliance_events (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  kind text not null,
  title text not null,
  due_iso date,
  status text not null default 'upcoming',
  owner text,
  citation jsonb,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_customs_comms (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  channel text not null default 'email',
  entry_id text,
  importer_id text,
  "to" text,
  subject text,
  body text,
  status text not null default 'draft',
  created_iso timestamptz not null default now()
);

create table if not exists public.tenant_customs_ops_events (
  id text primary key,
  tenant_slug text not null default 'aeronaut',
  kind text not null,
  title text not null,
  when_iso timestamptz not null,
  entry_id text,
  status text not null default 'pending',
  detail text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

create index if not exists tcust_entries_tenant_idx on public.tenant_customs_entries (tenant_slug, status);
create index if not exists tcust_importers_tenant_idx on public.tenant_customs_importers (tenant_slug);
create index if not exists tcust_invoices_tenant_idx on public.tenant_customs_invoices (tenant_slug, status);
create index if not exists tcust_compliance_tenant_idx on public.tenant_customs_compliance_events (tenant_slug, status);
create index if not exists tcust_ops_tenant_idx on public.tenant_customs_ops_events (tenant_slug, when_iso);
create index if not exists tcust_hs_tenant_idx on public.tenant_customs_hs_lookups (tenant_slug);

-- ---------------------------------------------------------------------------
-- 4. RLS — read/write scoped to tenant membership
-- A password-gate visitor who is not an authenticated tenant member sees no
-- rows and the app falls back to demo fixtures. Real client data is only
-- visible to authenticated members of the aeronaut tenant.
-- ---------------------------------------------------------------------------

do $$
declare
  tbl text;
  tables text[] := array[
    'tenant_customs_importers',
    'tenant_customs_entries',
    'tenant_customs_hs_lookups',
    'tenant_customs_staff',
    'tenant_customs_shifts',
    'tenant_customs_invoices',
    'tenant_customs_compliance_events',
    'tenant_customs_comms',
    'tenant_customs_ops_events'
  ];
begin
  foreach tbl in array tables loop
    execute format('alter table public.%I enable row level security;', tbl);

    -- read: members
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = tbl
        and policyname = tbl || '_select_members'
    ) then
      execute format(
        'create policy %I on public.%I for select to authenticated using (public.is_customs_tenant_member(tenant_slug));',
        tbl || '_select_members', tbl
      );
    end if;

    -- write: admins
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = tbl
        and policyname = tbl || '_write_admins'
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.is_customs_tenant_admin(tenant_slug)) with check (public.is_customs_tenant_admin(tenant_slug));',
        tbl || '_write_admins', tbl
      );
    end if;

    execute format('grant select, insert, update, delete on public.%I to authenticated;', tbl);
  end loop;
end $$;

grant execute on function public.is_customs_tenant_member(text) to authenticated;
grant execute on function public.is_customs_tenant_admin(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Seed the aeronaut tenant row (guarded)
-- Best-effort: needs an auth.users row to own the tenant. If none exists, or
-- anything else goes wrong, this no-ops cleanly — the pilot renders from
-- fixtures regardless. Real onboarding creates the tenant via the app so the
-- creator becomes owner through the existing bootstrap trigger.
-- ---------------------------------------------------------------------------

do $$
declare
  _owner uuid;
begin
  if not exists (select 1 from public.tenants where slug = 'aeronaut') then
    select id into _owner from auth.users order by created_at asc limit 1;
    if _owner is not null then
      insert into public.tenants (slug, name, created_by, plan)
      values ('aeronaut', 'Aironaut Customs Brokers', _owner, 'business');
    end if;
  end if;
exception when others then
  -- Non-fatal: fixtures drive the pilot. Leave a notice in the migration log.
  raise notice 'aeronaut tenant seed skipped: %', sqlerrm;
end $$;
