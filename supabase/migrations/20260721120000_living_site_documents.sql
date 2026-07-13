-- Durable commercial drafts for every Living Site tenant.
--
-- The owner studio writes through a validated server route. RLS remains
-- deny-all: browser clients never receive direct table access. A saved record
-- begins as `draft`; saving does not send it, approve it or enter it in books.

create table if not exists public.living_site_documents (
  id uuid primary key default gen_random_uuid(),
  tenant text not null,
  kind text not null check (kind in ('proposal', 'invoice')),
  document_number text not null,
  client_name text not null,
  client_email text not null,
  service_id text not null,
  description text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price_nzd numeric(14,2) not null check (unit_price_nzd >= 0),
  subtotal_nzd numeric(14,2) not null check (subtotal_nzd >= 0),
  gst_nzd numeric(14,2) not null check (gst_nzd >= 0),
  total_nzd numeric(14,2) not null check (total_nzd >= 0),
  notes text,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'paid', 'void')),
  source text not null default 'owner-studio',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant, document_number)
);

alter table public.living_site_documents enable row level security;

create index if not exists living_site_documents_tenant_created_idx
  on public.living_site_documents (tenant, created_at desc);

drop trigger if exists living_site_documents_updated_at on public.living_site_documents;
create trigger living_site_documents_updated_at
  before update on public.living_site_documents
  for each row execute function public.update_updated_at_column();
