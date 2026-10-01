-- Forward reconciliation: keep 20260716090000_family_inbox_tokens unchanged.
-- Existing previews may have recorded creative_agency_auaha at that version.
-- No migration-history edits. Existing rows and tenant customisations are preserved.

-- ============================================================
-- AUAHA Creative Kete — demo workspace support
-- Idempotent forward reconciliation. Adds the generation ledger the workspace
-- uses for the 20/hour rate limit, and a lightweight assets table so a
-- session's outputs can be persisted later. Full AUAHA pipeline tables
-- (projects, calendar, analytics) live in the canon AUAHA upgrade and are
-- intentionally out of scope for the demo.
-- Date: 2026-07-07
-- ============================================================

-- Generation ledger: one row per real generation, used for rate limiting.
CREATE TABLE IF NOT EXISTS public.auaha_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT NOT NULL,          -- per-user key (invite/session cookie or IP), never PII
  kind TEXT NOT NULL,              -- image | video | copy | podcast
  provider TEXT,
  model TEXT,
  cost_nzd NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_generations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_gen_ratekey_time
  ON public.auaha_generations(rate_key, created_at DESC);

-- Service-role only (the API routes use the service client; no client access).
DROP POLICY IF EXISTS "service_full_access" ON public.auaha_generations;
CREATE POLICY "service_full_access" ON public.auaha_generations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Optional session-asset store (data URLs are returned inline; this is for
-- durable persistence when a bucket/URL is wired later).
CREATE TABLE IF NOT EXISTS public.auaha_demo_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT,
  agent TEXT NOT NULL,
  kind TEXT NOT NULL,
  caption TEXT,
  asset_url TEXT,
  provider TEXT,
  model TEXT,
  cost_nzd NUMERIC(8,2),
  trust_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_demo_assets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_demo_assets_time
  ON public.auaha_demo_assets(created_at DESC);
DROP POLICY IF EXISTS "service_full_access" ON public.auaha_demo_assets;
CREATE POLICY "service_full_access" ON public.auaha_demo_assets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Register the tenant (mirror of lib/customers/tenants.ts) if the table exists.
-- Existing tenant rows are never overwritten. Fully guarded: any column/constraint mismatch is swallowed so this can never
-- red the migration — the code registry in tenants.ts is the source of truth.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='tenant_customers') THEN
    BEGIN
      INSERT INTO public.tenant_customers (slug, display_name, status)
      VALUES ('creative-agency', 'AUAHA Creative Kete', 'concept')
      ON CONFLICT (slug) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'auaha: tenant_customers seed skipped (%).', SQLERRM;
    END;
  END IF;
END $$;

-- Compatibility for previews that recorded creative at the collided version.
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

-- Explicit service-only ACLs; no default/public grants are relied upon.
REVOKE ALL ON TABLE public.auaha_generations, public.auaha_demo_assets, public.family_inbox_tokens FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.auaha_generations, public.auaha_demo_assets, public.family_inbox_tokens TO service_role;
