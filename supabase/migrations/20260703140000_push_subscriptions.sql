-- ═══════════════════════════════════════════════════════════════════════════
-- Push subscriptions — Phase 4 of the v2 platform (pilot workspace PWAs)
-- ═══════════════════════════════════════════════════════════════════════════
-- Each installed pilot workspace (aironaut, happy-tails, …) can opt into web
-- push. A subscription row is one browser endpoint for one tenant workspace.
-- `tenant_slug` is a plain text slug: pilot tenant slugs today, and the
-- bundle-identity draft-reply notifier reuses the same table keyed by the
-- bundle slug — no FK on purpose so both namespaces fit.
--
-- Writes are service-role only (the /api/push/subscribe route); designated
-- admins can read via is_designated_admin() (v2 admin backbone,
-- 20260703100000). No client reads or writes, ever. Push payloads never
-- contain message content — just "a draft is waiting" pointers.
--
-- Idempotent and additive only — safe to re-run, no DROPs of tables/columns.
-- Apply to prod via the management-API pattern (do NOT db push from CI).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  -- pilot tenant slug ('aironaut', 'happy-tails') or bundle identity slug
  tenant_slug  text not null,
  -- the browser push endpoint URL — globally unique per subscription
  endpoint     text not null unique,
  -- client public key + auth secret from PushSubscription.getKey()
  p256dh       text not null,
  auth         text not null,
  -- optional free-text label for who enabled it ('Kate — iPhone', 'Dad')
  user_label   text,
  created_at   timestamptz not null default now()
);

comment on table public.push_subscriptions is
  'Web-push subscriptions for the installed pilot workspace PWAs. Service-role write, admin read. Payloads are pointers only ("new draft reply waiting"), never message content.';
comment on column public.push_subscriptions.tenant_slug is
  'Pilot tenant slug or bundle identity slug the subscription belongs to.';

create index if not exists push_subscriptions_tenant_idx
  on public.push_subscriptions (tenant_slug);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_admin_read on public.push_subscriptions;
create policy push_subscriptions_admin_read on public.push_subscriptions
  for select to authenticated
  using (public.is_designated_admin(auth.uid()));
-- Writes are service-role only (bypasses RLS); no insert/update/delete
-- policies means no client writes.
