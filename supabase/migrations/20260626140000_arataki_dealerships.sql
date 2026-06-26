-- Arataki (Automotive) vertical — first-class dealership identity over the
-- existing tenant layer.
--
-- The arataki_* operational tables (listings, enquiries, finance_disclosures,
-- sales_conversations, service_appointments) and loan_cars are already
-- tenant-scoped with RLS via public.is_tenant_member(tenant_id). A "dealership"
-- is a tenant, but a tenant alone cannot carry the regulated identity a Motor
-- Vehicle Sales Act 2003 trader needs (MVSR registration, NZBN) or model the
-- multiple physical rooftops one dealer group operates.
--
-- This migration is additive and self-healing: a dealership group keeps its
-- tenant; we hang a dealership record (1:1 with the tenant) and a rooftops
-- table (1:many) beside it, then scope the operational tables to a rooftop
-- with a nullable dealership_rooftop_id so existing rows are untouched.

-- 1. Dealership identity — one per tenant -----------------------------------
create table if not exists public.dealerships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  -- Trading name as it appears on the Consumer Information Notice (CIN).
  trading_name text not null,
  -- Motor Vehicle Sales Act 2003 trader registration (MVSR). Nullable while a
  -- group onboards; the agent flags any sale attempted without it.
  mvsr_trader_number text,
  -- New Zealand Business Number.
  nzbn text,
  -- Free-text physical address of the head office / principal place of business.
  head_office text,
  created_at timestamptz not null default now(),
  unique (tenant_id)
);

create index if not exists dealerships_tenant_idx on public.dealerships(tenant_id);

-- 2. Rooftops — the "multi" in multi-dealership -----------------------------
create table if not exists public.dealership_rooftops (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  -- Physical address of this rooftop.
  location text,
  -- Per-rooftop MVSR number where a group registers each site separately.
  mvsr_trader_number text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists dealership_rooftops_dealership_idx
  on public.dealership_rooftops(dealership_id);
create index if not exists dealership_rooftops_tenant_idx
  on public.dealership_rooftops(tenant_id);

-- 3. Scope operational tables to a rooftop (nullable, additive) --------------
-- A dealer group with one rooftop never has to set these; multi-rooftop groups
-- can filter a service lane or sales pipeline to a single site.
alter table public.arataki_listings
  add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id);
alter table public.arataki_enquiries
  add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id);
alter table public.arataki_finance_disclosures
  add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id);

-- service_appointments / sales_conversations only exist once the service-match
-- foundation migration has run; guard so a fresh apply in either order is safe.
do $$
begin
  if to_regclass('public.arataki_service_appointments') is not null then
    execute 'alter table public.arataki_service_appointments
      add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id)';
  end if;
  if to_regclass('public.arataki_sales_conversations') is not null then
    execute 'alter table public.arataki_sales_conversations
      add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id)';
  end if;
  if to_regclass('public.loan_cars') is not null then
    execute 'alter table public.loan_cars
      add column if not exists dealership_rooftop_id uuid references public.dealership_rooftops(id)';
  end if;
end $$;

-- 4. RLS — same tenant-membership gate as the rest of the vertical -----------
alter table public.dealerships enable row level security;
alter table public.dealership_rooftops enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'dealerships'
      and policyname = 'dealerships_tenant_rw'
  ) then
    execute $sql$
      create policy dealerships_tenant_rw on public.dealerships
        for all
        using (public.is_tenant_member(tenant_id))
        with check (public.is_tenant_member(tenant_id))
    $sql$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'dealership_rooftops'
      and policyname = 'dealership_rooftops_tenant_rw'
  ) then
    execute $sql$
      create policy dealership_rooftops_tenant_rw on public.dealership_rooftops
        for all
        using (public.is_tenant_member(tenant_id))
        with check (public.is_tenant_member(tenant_id))
    $sql$;
  end if;
end $$;

-- 5. Backfill — give every tenant that already trades vehicles a dealership --
-- record + a primary rooftop, so the existing operator UI has an identity to
-- hang off without manual data entry. Idempotent: skips tenants already mapped.
do $$
declare
  t record;
  d_id uuid;
begin
  if to_regclass('public.arataki_listings') is null then
    return;
  end if;
  for t in
    select distinct l.tenant_id, coalesce(tn.name, 'Dealership') as tenant_name
    from public.arataki_listings l
    join public.tenants tn on tn.id = l.tenant_id
    where not exists (
      select 1 from public.dealerships d where d.tenant_id = l.tenant_id
    )
  loop
    insert into public.dealerships (tenant_id, trading_name)
    values (t.tenant_id, t.tenant_name)
    returning id into d_id;

    insert into public.dealership_rooftops (dealership_id, tenant_id, name, is_primary)
    values (d_id, t.tenant_id, t.tenant_name, true);
  end loop;
end $$;

grant select, insert, update, delete on public.dealerships to authenticated;
grant select, insert, update, delete on public.dealership_rooftops to authenticated;
