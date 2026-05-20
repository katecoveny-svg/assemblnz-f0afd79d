-- Arataki service-to-sales foundation: CSV-first service appointments and sales context.

create table if not exists public.arataki_service_appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  vehicle_year integer,
  vehicle_make text,
  vehicle_model text,
  vehicle_plate text,
  km_current integer,
  appointment_at timestamptz not null,
  reason text,
  status text not null default 'scheduled',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.arataki_sales_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  last_conversation_at timestamptz,
  vehicle_purchased_year integer,
  vehicle_purchased_make text,
  vehicle_purchased_model text,
  finance_provider text,
  finance_term_months integer,
  finance_end_at timestamptz,
  warranty_end_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_appts_tenant_date
  on public.arataki_service_appointments (tenant_id, appointment_at);

create index if not exists idx_sales_conv_tenant_email
  on public.arataki_sales_conversations (tenant_id, customer_email);

create index if not exists idx_sales_conv_tenant_phone
  on public.arataki_sales_conversations (tenant_id, customer_phone);

alter table public.arataki_service_appointments enable row level security;
alter table public.arataki_sales_conversations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'arataki_service_appointments'
      and policyname = 'arataki_service_appointments_tenant_member_all'
  ) then
    create policy "arataki_service_appointments_tenant_member_all"
      on public.arataki_service_appointments
      for all
      to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'arataki_sales_conversations'
      and policyname = 'arataki_sales_conversations_tenant_member_all'
  ) then
    create policy "arataki_sales_conversations_tenant_member_all"
      on public.arataki_sales_conversations
      for all
      to authenticated
      using (public.is_tenant_member(tenant_id))
      with check (public.is_tenant_member(tenant_id));
  end if;
end $$;
