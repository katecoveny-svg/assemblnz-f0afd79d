-- ============================================================================
-- Migration: kaihanga_iho_multichannel_push_subscriptions
-- Date:      2026-05-02
-- Author:    Kaihanga (Assembl master builder agent)
-- Purpose:   Add push_subscriptions table to support PWA push notifications
--            in the multi-channel Iho router (tnz-inbound edge function).
--
-- Context:   Companion to the tnz-inbound multi-channel refactor. This
--            table is queried by sendPushNotification() inside
--            supabase/functions/tnz-inbound/index.ts whenever an outbound
--            reply needs to be delivered. When ENABLE_NEW_SENDERS is not
--            "true", this table is unused (the router proxies straight to
--            sendViaTnz). Safe to deploy ahead of the flag flip.
--
-- Idempotent: re-running this migration is safe.
-- ============================================================================

create table if not exists public.push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null,
  tenant_id   uuid        not null,
  subscription jsonb      not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.push_subscriptions is
  'PWA push subscriptions per (user, tenant). Each row stores one Web Push '
  'subscription object (endpoint + keys). One user may have many rows '
  '(one per device). Used by tnz-inbound for the multi-channel sender '
  'priority chain (push → channel → TNZ fallback). Activated when '
  'ENABLE_NEW_SENDERS=true on the tnz-inbound edge function.';

comment on column public.push_subscriptions.subscription is
  'Raw PushSubscription JSON from the browser: { endpoint, expirationTime, '
  'keys: { p256dh, auth } }.';

-- ----------------------------------------------------------------------------
-- Indexes (idempotent)
-- ----------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_push_subscriptions_user_tenant'
  ) then
    create index idx_push_subscriptions_user_tenant
      on public.push_subscriptions (user_id, tenant_id);
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_push_subscriptions_tenant'
  ) then
    create index idx_push_subscriptions_tenant
      on public.push_subscriptions (tenant_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------

create or replace function public.set_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_push_subscriptions_updated_at
  on public.push_subscriptions;

create trigger trg_push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row
  execute function public.set_push_subscriptions_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
--
-- Service role (used by the tnz-inbound edge function via
-- SUPABASE_SERVICE_ROLE_KEY) bypasses RLS automatically. The policies
-- below only matter for direct end-user / anon access, e.g. when the PWA
-- frontend writes a new subscription on behalf of a logged-in user.
-- ----------------------------------------------------------------------------

alter table public.push_subscriptions enable row level security;

drop policy if exists "service_role full access"
  on public.push_subscriptions;
create policy "service_role full access"
  on public.push_subscriptions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "users manage own subscriptions"
  on public.push_subscriptions;
create policy "users manage own subscriptions"
  on public.push_subscriptions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
