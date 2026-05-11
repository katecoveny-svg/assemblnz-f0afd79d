-- Tōro Stripe integration — payment intents + customer mapping.
--
-- Spec: v0.3 commerce spec, Phase 1 (Stripe layer). Companion to
-- outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md (state machine,
-- approval inbox) and the Mana Receipts spec (audit_log_id FK).
--
-- Hard rules carried in by this migration:
--   #34 — No auto-charge. Every PaymentIntent is created with
--         capture_method='manual'. Capture only on explicit user click.
--   #35 — Webhook signature verification is mandatory in the route handler.
--   #36 — Every captured charge writes a row to assembl_audit_log AND a
--         Mana Receipt. toro_payment_intents.audit_log_id is the FK anchor.
--   #37 — Live keys only; the env var is the source of truth.
--
-- Idempotent.

create table if not exists public.toro_payment_intents (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null references public.tenants(id) on delete cascade,
  draft_id                    uuid references public.toro_drafts(id) on delete set null,
  stripe_payment_intent_id    text not null unique,
  stripe_customer_id          text not null,
  amount_cents                integer not null check (amount_cents > 0),
  currency                    text not null default 'nzd',
  status                      text not null check (status in (
                                'requires_payment_method','requires_confirmation','requires_action',
                                'processing','requires_capture','succeeded','canceled','failed'
                              )),
  description                 text,
  metadata                    jsonb not null default '{}'::jsonb,
  approved_by                 uuid references auth.users(id),
  approved_at                 timestamptz,
  captured_at                 timestamptz,
  audit_log_id                uuid,
  -- ^ FK to public.assembl_audit_log(id). The constraint is added in a
  --   guarded DO block below only if the audit log table is present, so
  --   this migration installs cleanly on environments where Day 7 hasn't
  --   landed yet.
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_toro_payment_intents_tenant
  on public.toro_payment_intents (tenant_id, created_at desc);
create index if not exists idx_toro_payment_intents_draft
  on public.toro_payment_intents (draft_id) where draft_id is not null;
create index if not exists idx_toro_payment_intents_status
  on public.toro_payment_intents (status, created_at desc);

create table if not exists public.toro_stripe_customers (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid not null unique references public.tenants(id) on delete cascade,
  stripe_customer_id          text not null unique,
  default_payment_method_id   text,
  default_payment_brand       text,
  default_payment_last4       text,
  subscription_id             text,
  subscription_status         text,
  subscription_current_period_end timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- updated_at touch triggers
create or replace function public.toro_payment_intents_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

drop trigger if exists toro_payment_intents_set_updated_at_trg on public.toro_payment_intents;
create trigger toro_payment_intents_set_updated_at_trg
  before update on public.toro_payment_intents
  for each row execute function public.toro_payment_intents_set_updated_at();

drop trigger if exists toro_stripe_customers_set_updated_at_trg on public.toro_stripe_customers;
create trigger toro_stripe_customers_set_updated_at_trg
  before update on public.toro_stripe_customers
  for each row execute function public.toro_payment_intents_set_updated_at();

-- Add audit_log FK conditionally (Day 7 may not have shipped on every env).
do $$
begin
  if to_regclass('public.assembl_audit_log') is not null
     and not exists (
       select 1 from information_schema.table_constraints
       where table_schema = 'public'
         and table_name = 'toro_payment_intents'
         and constraint_name = 'toro_payment_intents_audit_log_id_fkey'
     ) then
    alter table public.toro_payment_intents
      add constraint toro_payment_intents_audit_log_id_fkey
      foreign key (audit_log_id) references public.assembl_audit_log(id);
  end if;
end $$;

-- RLS — tenant-scoped reads via the existing is_tenant_member helper from
-- PR #79's tenants migration. All writes go through service_role (server-
-- side actions in this PR + the Stripe webhook route handler).
alter table public.toro_payment_intents enable row level security;
alter table public.toro_stripe_customers enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_payment_intents'
      and policyname='toro_payment_intents_select_member'
  ) then
    create policy toro_payment_intents_select_member on public.toro_payment_intents
      for select to authenticated using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_payment_intents'
      and policyname='toro_payment_intents_insert_service'
  ) then
    create policy toro_payment_intents_insert_service on public.toro_payment_intents
      for insert to service_role with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_payment_intents'
      and policyname='toro_payment_intents_update_service'
  ) then
    create policy toro_payment_intents_update_service on public.toro_payment_intents
      for update to service_role using (true) with check (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_stripe_customers'
      and policyname='toro_stripe_customers_select_member'
  ) then
    create policy toro_stripe_customers_select_member on public.toro_stripe_customers
      for select to authenticated using (public.is_tenant_member(tenant_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_stripe_customers'
      and policyname='toro_stripe_customers_insert_service'
  ) then
    create policy toro_stripe_customers_insert_service on public.toro_stripe_customers
      for insert to service_role with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='toro_stripe_customers'
      and policyname='toro_stripe_customers_update_service'
  ) then
    create policy toro_stripe_customers_update_service on public.toro_stripe_customers
      for update to service_role using (true) with check (true);
  end if;
end $$;

grant select on public.toro_payment_intents to authenticated;
grant select on public.toro_stripe_customers to authenticated;

comment on table public.toro_payment_intents is
  'Tōro Stripe payment intents (manual-capture). Created by lib/stripe/manual-capture.ts; captured only on explicit user approval via /app/toro/inbox. Per canon hard rule #34, no auto-charge.';
comment on table public.toro_stripe_customers is
  'One-to-one mapping between Tōro tenants and Stripe Customers. Subscription state is mirrored from Stripe webhooks (customer.subscription.*).';
