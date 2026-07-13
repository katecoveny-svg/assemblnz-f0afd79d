-- Booking requests for every Living Site tenant.
--
-- Public forms write through the tightly validated Next.js route using the
-- service-role client. RLS remains deny-all so no browser receives direct
-- table access. A booking begins as `requested`: a person must confirm it.

create table if not exists public.living_site_bookings (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  service_id text not null,
  service_label text not null,
  name text not null,
  email text not null,
  phone text,
  preferred_date date not null,
  preferred_time text not null,
  notes text,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'declined', 'completed', 'cancelled')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.living_site_bookings enable row level security;

create index if not exists living_site_bookings_tenant_date_idx
  on public.living_site_bookings (tenant, preferred_date asc, created_at desc);

drop trigger if exists living_site_bookings_updated_at on public.living_site_bookings;
create trigger living_site_bookings_updated_at
  before update on public.living_site_bookings
  for each row execute function public.update_updated_at_column();
