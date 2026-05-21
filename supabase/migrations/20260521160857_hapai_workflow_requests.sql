create table if not exists public.hapai_workflow_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  organisation text,
  workflow text not null,
  context text,
  source_path text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_hapai_workflow_requests_created_at
  on public.hapai_workflow_requests (created_at desc);

alter table public.hapai_workflow_requests enable row level security;
