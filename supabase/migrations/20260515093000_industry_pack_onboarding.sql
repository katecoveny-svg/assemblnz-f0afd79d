-- Industry Pack onboarding funnel support.
-- Idempotent shape for checkout provisioning, tenant aliases, and draft inboxes.

alter type public.app_role add value if not exists 'operator';

create table if not exists public.tenant_email_aliases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  alias_email text not null,
  local_part text not null,
  domain text not null default 'assembl.email',
  purpose text not null default 'ops',
  status text not null default 'provisioned'
    check (status in ('pending', 'provisioned', 'verified', 'disabled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alias_email)
);

create index if not exists idx_tenant_email_aliases_tenant
  on public.tenant_email_aliases (tenant_id);

alter table public.tenant_email_aliases enable row level security;

do $$ begin
  create policy "Tenant members can read email aliases"
    on public.tenant_email_aliases for select to authenticated
    using (
      tenant_id in (
        select tenant_id from public.tenant_members
        where user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Service role manages email aliases"
    on public.tenant_email_aliases for all to service_role
    using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_tenant_email_aliases_updated_at
    before update on public.tenant_email_aliases
    for each row execute function public.update_updated_at_column();
exception when duplicate_object then null; end $$;

alter table public.toro_drafts
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null;

create index if not exists idx_toro_drafts_tenant_created
  on public.toro_drafts (tenant_id, created_at desc);
