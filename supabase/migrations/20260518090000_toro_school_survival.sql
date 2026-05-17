create table if not exists public.toro_school_survival_results (
  id uuid primary key default gen_random_uuid(),
  school_name text,
  source_type text not null check (source_type in ('paste', 'pdf', 'image')),
  item_count integer not null default 0,
  parsed_items jsonb not null default '[]'::jsonb,
  contact_email text,
  wants_friday_autopilot boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.toro_school_survival_results enable row level security;

drop policy if exists "insert school survival result" on public.toro_school_survival_results;
create policy "insert school survival result"
  on public.toro_school_survival_results
  for insert
  to anon
  with check (true);

drop policy if exists "update school survival lead fields" on public.toro_school_survival_results;
create policy "update school survival lead fields"
  on public.toro_school_survival_results
  for update
  to anon
  using (created_at > now() - interval '1 day')
  with check (created_at > now() - interval '1 day');

create index if not exists toro_school_survival_created_at_idx
  on public.toro_school_survival_results (created_at desc);
