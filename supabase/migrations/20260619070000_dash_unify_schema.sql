-- Dash by assembl — unify the two dash_* schema generations onto ONE.
--
-- Background: dash_publishers / dash_campaigns / dash_impressions existed in two
-- incompatible shapes — the "beat" SERVING schema (text-id publishers, *_cents
-- bids, active/brand_safety_blocklist; used by app/api/dash/serve + lib/dash/
-- auction) and the "payout" schema (uuid ids, rev_share, revenue_nzd; live in
-- prod, used by the Stripe Connect payout code). This migration makes the uuid
-- payout tables ALSO carry the serving columns, so one schema serves both.
--
-- Crux decision: publishers keep a **uuid PK** (payout FK integrity) and gain a
-- unique **slug** (the SDK identifier, e.g. 'assembl-hapai'). The serve route
-- now looks up by slug; impressions reference the uuid.
--
-- Safe: all dash_* tables are empty in prod (pre-launch) and additive — no DROP,
-- no data move. The two beat migrations (20260617140000, 20260619000000) are
-- neutered to no-ops so a fresh apply produces these same uuid tables (and so
-- `supabase db push` stops failing on the old beat→dash rename).

BEGIN;

-- ── PUBLISHERS: add the serving columns ────────────────────────────────────
ALTER TABLE public.dash_publishers
  ADD COLUMN IF NOT EXISTS slug                   text,
  ADD COLUMN IF NOT EXISTS active                 boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS brand_safety_blocklist text[]  NOT NULL DEFAULT '{gambling,alcohol,weapons}';
-- slug is the SDK key; unique but nullable (a publisher is a lead before it has one).
CREATE UNIQUE INDEX IF NOT EXISTS dash_publishers_slug_key ON public.dash_publishers (slug) WHERE slug IS NOT NULL;

-- ── CAMPAIGNS: add the serving columns + reconcile status enum ──────────────
ALTER TABLE public.dash_campaigns
  ADD COLUMN IF NOT EXISTS ad_text                text,
  ADD COLUMN IF NOT EXISTS cta_url                text,
  ADD COLUMN IF NOT EXISTS bid_cpm_nzd_cents      integer,
  ADD COLUMN IF NOT EXISTS daily_budget_nzd_cents integer,
  ADD COLUMN IF NOT EXISTS spent_today            integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS spent_today_date       date,
  ADD COLUMN IF NOT EXISTS publisher_allowlist    text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS surface_targeting      text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz NOT NULL DEFAULT now();
-- advertiser_id is optional (house/own-line ads have none).
ALTER TABLE public.dash_campaigns ALTER COLUMN advertiser_id DROP NOT NULL;
-- Status: the serve route queries status='active'. Replace the payout-gen enum
-- ('draft','live','paused','ended') with the serving enum.
ALTER TABLE public.dash_campaigns DROP CONSTRAINT IF EXISTS dash_campaigns_status_check;
ALTER TABLE public.dash_campaigns
  ADD CONSTRAINT dash_campaigns_status_check CHECK (status IN ('draft','active','paused','archived'));

-- ── IMPRESSIONS: add the serving columns + make context jsonb ───────────────
ALTER TABLE public.dash_impressions
  ADD COLUMN IF NOT EXISTS surface           text,
  ADD COLUMN IF NOT EXISTS ip_hash           text,
  ADD COLUMN IF NOT EXISTS charged_nzd_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicked           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS clicked_at        timestamptz,
  ADD COLUMN IF NOT EXISTS dismissed         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dismissed_at      timestamptz,
  ADD COLUMN IF NOT EXISTS served_at         timestamptz NOT NULL DEFAULT now();
-- The serve route writes a coarse jsonb context; the payout-gen column was text.
ALTER TABLE public.dash_impressions
  ALTER COLUMN context TYPE jsonb USING (CASE WHEN context IS NULL OR context = '' THEN '{}'::jsonb ELSE context::jsonb END),
  ALTER COLUMN context SET DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS dash_impressions_publisher_served_idx ON public.dash_impressions (publisher_id, served_at DESC);

-- ── Restore the connect → publishers FK (PR #445 dropped it for fresh-apply ──
-- compat; now both sides are uuid, so it's safe). ──────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dash_connect_accounts_publisher_fk'
  ) THEN
    ALTER TABLE public.dash_connect_accounts
      ADD CONSTRAINT dash_connect_accounts_publisher_fk
      FOREIGN KEY (publisher_id) REFERENCES public.dash_publishers(id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;

-- Verification:
--   \d public.dash_publishers   -- has slug, active, brand_safety_blocklist + uuid id
--   \d public.dash_campaigns     -- has ad_text, bid_cpm_nzd_cents, spent_today, ...
--   \d public.dash_impressions   -- has served_at, charged_nzd_cents, context jsonb, revenue_nzd
--   SELECT conname FROM pg_constraint WHERE conrelid = 'public.dash_connect_accounts'::regclass;
