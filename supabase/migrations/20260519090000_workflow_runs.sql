create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_slug text not null,
  tenant_id uuid references public.tenants(id),
  installer_origin text,
  inputs jsonb,
  output_tokens int,
  input_tokens int,
  created_at timestamptz default now(),
  ip_hash text
);

create index if not exists workflow_runs_workflow_slug_created_at_idx
  on public.workflow_runs (workflow_slug, created_at desc);

create index if not exists workflow_runs_tenant_id_created_at_idx
  on public.workflow_runs (tenant_id, created_at desc);
