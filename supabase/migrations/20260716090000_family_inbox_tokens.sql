-- ============================================================================
-- Family Inbox — stored OAuth refresh tokens (per hub, per provider)
-- ============================================================================
-- When Kate clicks "Connect Gmail" / "Connect Outlook" on /customers/family/ops
-- and authorises once, the callback route stores the resulting OAuth REFRESH
-- token here. family-inbox-sync then prefers this stored token over the env
-- fallback (FAMILY_INBOX_GMAIL_REFRESH_TOKEN / FAMILY_INBOX_MS_REFRESH_TOKEN),
-- so the demo can go live without a redeploy/secret-set.
--
-- We store ONLY the long-lived refresh token (plus the connected email, for
-- display/audit). Short-lived access tokens are minted per run from the refresh
-- token and are never persisted.
--
-- SECURITY: RLS is ENABLED with NO policies — the table is service-role only.
-- The connect/callback Next routes and the edge function all use the service
-- client (which bypasses RLS). No anon/auth client can ever read a token.
-- ============================================================================

create table if not exists public.family_inbox_tokens (
  hub           text not null,
  provider      text not null check (provider in ('gmail', 'outlook')),
  refresh_token text not null,
  email         text,
  connected_at  timestamptz not null default now(),
  primary key (hub, provider)
);

comment on table public.family_inbox_tokens is
  'Per-hub OAuth refresh tokens for the Family Inbox sync. Service-role only (RLS on, no policies). Stores only the refresh token; access tokens are minted per run.';
comment on column public.family_inbox_tokens.hub is
  'Family hub id (matches family_items.hub, default ''demo'').';
comment on column public.family_inbox_tokens.provider is
  'OAuth provider: ''gmail'' (Google) or ''outlook'' (Microsoft Graph).';
comment on column public.family_inbox_tokens.refresh_token is
  'Long-lived OAuth refresh token. Sensitive — never expose to any non-service client.';
comment on column public.family_inbox_tokens.email is
  'The mailbox the token authorises (for display/audit only).';

-- Service-role only. No policies = no access for anon/authenticated roles.
alter table public.family_inbox_tokens enable row level security;
