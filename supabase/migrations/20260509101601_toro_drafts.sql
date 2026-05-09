-- Tōro drafts: pending Chatwoot replies awaiting human approval.
-- Spec: outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md (§5).
-- Plugin Canon hard rule #1: no agent reply ships without an explicit human click.
--
-- This migration is intentionally single-tenant for the Hudson household pilot.
-- The tenants/tenant_members migration (PR #79 + follow-up) has not landed
-- yet; once it does, a follow-up PR will:
--   1. Uncomment the tenant_id FK below
--   2. Backfill tenant_id for existing rows to the Hudson tenant
--   3. ALTER COLUMN tenant_id SET NOT NULL
--   4. Replace the permissive RLS policies with tenant-scoped ones using
--      public.is_tenant_member(tenant_id)
--   5. Add the FK on audit_log_id once Day 7 lands assembl_audit_log
-- Idempotent: safe to re-run.

create table if not exists public.toro_drafts (
  id                       uuid primary key default gen_random_uuid(),
  -- tenant_id uuid references public.tenants(id),
  -- ^ COMMENTED OUT until multi-tenant migration applies; uncomment + add
  --   NOT NULL in follow-up PR. RLS hardened at the same time.
  chatwoot_account_id      integer not null,
  chatwoot_inbox_id        integer not null,
  chatwoot_conversation_id integer not null,
  chatwoot_message_id      integer,
  contact_name             text,
  contact_identifier       text,
  incoming_body            text,
  draft_body               text not null,
  confidence               numeric(3,2),
  status                   text not null default 'pending_approval'
                            check (status in ('pending_approval','approved','rejected','edited_then_approved','sent','failed')),
  created_by_agent         text not null default 'toro',
  reviewer_user_id         uuid references auth.users(id),
  reviewed_at              timestamptz,
  sent_at                  timestamptz,
  send_error               text,
  audit_log_id             uuid,
  -- ^ FK to public.assembl_audit_log(id) added in follow-up after Day 7 lands.
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_toro_drafts_status_created
  on public.toro_drafts (status, created_at desc);

create index if not exists idx_toro_drafts_conversation
  on public.toro_drafts (chatwoot_conversation_id);

-- updated_at touch trigger
create or replace function public.toro_drafts_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists toro_drafts_set_updated_at_trg on public.toro_drafts;
create trigger toro_drafts_set_updated_at_trg
  before update on public.toro_drafts
  for each row execute function public.toro_drafts_set_updated_at();

alter table public.toro_drafts enable row level security;

-- Permissive policies for the single-tenant pilot. Hardened to tenant-scoped
-- in the follow-up PR after the multi-tenant migration applies.
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_drafts'
      and policyname = 'authed users see all drafts (single-tenant pilot)'
  ) then
    create policy "authed users see all drafts (single-tenant pilot)"
      on public.toro_drafts
      for select
      using (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_drafts'
      and policyname = 'authed users insert drafts (single-tenant pilot)'
  ) then
    create policy "authed users insert drafts (single-tenant pilot)"
      on public.toro_drafts
      for insert
      with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'toro_drafts'
      and policyname = 'authed users update drafts (single-tenant pilot)'
  ) then
    create policy "authed users update drafts (single-tenant pilot)"
      on public.toro_drafts
      for update
      using (auth.role() = 'authenticated');
  end if;
end $$;

grant select, insert, update on public.toro_drafts to authenticated;
