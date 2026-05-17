create table if not exists public.insurance_gap_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  result_url text,
  wants_pdf boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.insurance_gap_leads enable row level security;

drop policy if exists "insert insurance gap leads" on public.insurance_gap_leads;
create policy "insert insurance gap leads"
  on public.insurance_gap_leads
  for insert
  to anon
  with check (true);

create index if not exists insurance_gap_leads_created_at_idx
  on public.insurance_gap_leads (created_at desc);
