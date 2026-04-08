-- ═══════════════════════════════════════════════════════════════
-- ARATAKI + PIKAU PILOT — Mahara tables and tenant-scoped RLS
-- 2026-04-08 · claude/arataki-pikau-pilot-build
-- ═══════════════════════════════════════════════════════════════

-- ─────────── ARATAKI ───────────
create table if not exists public.arataki_listings (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       text not null,
  vin             text not null,
  year            int  not null,
  make            text not null,
  model           text not null,
  price_nzd       numeric not null,
  odometer_km     int  not null,
  status          text not null,
  ta_warnings     jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now()
);
create index if not exists arataki_listings_tenant_idx on public.arataki_listings(tenant_id);

create table if not exists public.arataki_enquiries (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           text not null,
  customer_name_hash  text not null,
  vehicle_of_interest text,
  consent_marketing   boolean not null,
  ai_notice_included  boolean not null,
  status              text not null,
  created_at          timestamptz not null default now()
);
create index if not exists arataki_enquiries_tenant_idx on public.arataki_enquiries(tenant_id);

create table if not exists public.arataki_finance_disclosures (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           text not null,
  lender_name         text not null,
  principal_nzd       numeric not null,
  interest_rate_pct   numeric not null,
  term_months         int not null,
  monthly_payment_nzd numeric not null,
  total_interest_nzd  numeric not null,
  status              text not null,
  created_at          timestamptz not null default now()
);
create index if not exists arataki_finance_tenant_idx on public.arataki_finance_disclosures(tenant_id);

-- ─────────── PIKAU ───────────
create table if not exists public.pikau_customs_entries (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            text not null,
  importer_ird_hash    text not null,
  broker_code          text not null,
  hs_code              text not null,
  country_of_origin    text not null,
  customs_value_nzd    numeric not null,
  indicative_duty_nzd  numeric not null,
  indicative_gst_nzd   numeric not null,
  status               text not null,
  ta_warnings          jsonb default '[]'::jsonb,
  created_at           timestamptz not null default now()
);
create index if not exists pikau_customs_tenant_idx on public.pikau_customs_entries(tenant_id);

create table if not exists public.pikau_freight_quotes (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                text not null,
  origin                   text not null,
  destination              text not null,
  weight_kg                numeric not null,
  incoterm                 text not null,
  quotes                   jsonb not null,
  recommended_carrier      text not null,
  recommended_price_nzd    numeric not null,
  status                   text not null,
  created_at               timestamptz not null default now()
);
create index if not exists pikau_freight_tenant_idx on public.pikau_freight_quotes(tenant_id);

create table if not exists public.pikau_dg_declarations (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             text not null,
  un_number             text not null,
  proper_shipping_name  text not null,
  imdg_class            text not null,
  packing_group         text not null,
  net_quantity_kg       numeric not null,
  status                text not null,
  created_at            timestamptz not null default now()
);
create index if not exists pikau_dg_tenant_idx on public.pikau_dg_declarations(tenant_id);

-- ─────────── ROW LEVEL SECURITY ───────────
alter table public.arataki_listings            enable row level security;
alter table public.arataki_enquiries           enable row level security;
alter table public.arataki_finance_disclosures enable row level security;
alter table public.pikau_customs_entries       enable row level security;
alter table public.pikau_freight_quotes        enable row level security;
alter table public.pikau_dg_declarations       enable row level security;

-- Tenant-scoped read/write — relies on tenant_members table to map auth.uid() → tenant_id
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'arataki_listings',
      'arataki_enquiries',
      'arataki_finance_disclosures',
      'pikau_customs_entries',
      'pikau_freight_quotes',
      'pikau_dg_declarations'
    ])
  loop
    execute format($fmt$
      drop policy if exists %1$s_tenant_select on public.%1$s;
      create policy %1$s_tenant_select on public.%1$s
        for select using (
          tenant_id in (
            select tenant_id from public.tenant_members where user_id = auth.uid()
          )
        );
      drop policy if exists %1$s_tenant_insert on public.%1$s;
      create policy %1$s_tenant_insert on public.%1$s
        for insert with check (
          tenant_id in (
            select tenant_id from public.tenant_members where user_id = auth.uid()
          )
        );
    $fmt$, t);
  end loop;
end $$;
