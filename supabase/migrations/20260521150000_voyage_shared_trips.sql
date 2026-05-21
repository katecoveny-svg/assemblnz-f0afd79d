create table if not exists public.voyage_shared_trips (
  id uuid primary key default gen_random_uuid(),
  share_slug text not null unique,
  title text not null default 'Kate + Adrian · Italia 2026',
  travellers text[] not null default array['Kate', 'Adrian'],
  payload jsonb not null default '{}'::jsonb,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_voyage_shared_trips_slug
  on public.voyage_shared_trips (share_slug);

alter table public.voyage_shared_trips enable row level security;

create or replace function public.set_voyage_shared_trips_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_voyage_shared_trips_updated_at on public.voyage_shared_trips;
create trigger trg_voyage_shared_trips_updated_at
before update on public.voyage_shared_trips
for each row
execute function public.set_voyage_shared_trips_updated_at();
