-- Beat by assembl — Phase 0 schema (the NZ in-product ad network).
--
-- Three tables back the ad network we dogfood on assembl's own HAPAI tools
-- before pitching any external publisher:
--   beat_publishers   — who can serve ads (HAPAI is the first publisher)
--   beat_campaigns    — advertiser demand: bids, budgets, targeting, status
--   beat_impressions  — one row per served ad, the auditable evidence record
--
-- TRUST CONTRACT (the whole pitch — see project_assembl_beat_network_locked):
--   • The SDK collects ONLY { publisherId, surface, context }. No prompts, no
--     content, no code, no documents. `context` is a coarse, caller-supplied
--     bag (e.g. { tool: 'manaaki' }) — never user data.
--   • We NEVER store a raw IP. beat_impressions.ip_hash is a salted one-way
--     hash (salt = env BEAT_IP_SALT), used for fraud detection / hourly caps
--     only and irreversible.
--
-- RLS posture:
--   • anon/authenticated may READ beat_publishers (the SDK needs rev-share /
--     blocklist config and the landing page lists live publishers). They may
--     NOT read beat_campaigns or beat_impressions at all.
--   • All writes (campaign management, impression logging, click/dismiss
--     updates) go through the edge functions using the SERVICE ROLE key, which
--     bypasses RLS. So there are deliberately no anon INSERT/UPDATE policies.

BEGIN;

-- ---------------------------------------------------------------------------
-- beat_publishers — supply side. id is the publisherId the SDK passes us.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beat_publishers (
  id                     text PRIMARY KEY,                         -- e.g. 'assembl-hapai', 'xero-app'
  display_name           text NOT NULL,
  rev_share_bps          integer NOT NULL DEFAULT 5500,            -- basis points; 5500 = 55% publisher share
  brand_safety_blocklist text[]  NOT NULL DEFAULT '{gambling,alcohol,weapons}',
  active                 boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- beat_campaigns — demand side. Advertiser bids, budgets and targeting.
-- bid_cpm_nzd_cents is the advertiser's MAX bid (cost per 1000 impressions),
-- in NZ cents. The second-price auction charges winner = second-highest + 1c
-- per CPM, capped at the winner's own max.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beat_campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_email      text NOT NULL,
  name                  text NOT NULL,
  ad_text               text NOT NULL,                             -- the single quiet line shown in the wait state
  cta_url               text NOT NULL,
  bid_cpm_nzd_cents     integer NOT NULL,                          -- advertiser max bid, NZ cents per 1000 impressions
  daily_budget_nzd_cents integer NOT NULL,
  spent_today           integer NOT NULL DEFAULT 0,                -- NZ cents spent in the current NZ day
  spent_today_date      date,                                     -- the NZ date spent_today belongs to (reset on rollover)
  publisher_allowlist   text[] NOT NULL DEFAULT '{}',             -- empty = all publishers
  surface_targeting     text[] NOT NULL DEFAULT '{}',             -- empty = all surfaces
  category              text,                                     -- for publisher brand-safety blocklist matching
  status                text NOT NULL DEFAULT 'draft',            -- 'draft' | 'active' | 'paused' | 'archived'
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT beat_campaigns_status_chk
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  CONSTRAINT beat_campaigns_bid_chk CHECK (bid_cpm_nzd_cents >= 0),
  CONSTRAINT beat_campaigns_budget_chk CHECK (daily_budget_nzd_cents >= 0)
);

CREATE INDEX IF NOT EXISTS beat_campaigns_status_idx ON public.beat_campaigns (status);

-- ---------------------------------------------------------------------------
-- beat_impressions — the auditable evidence record. One row per serve attempt:
--   campaign_id NOT NULL → an ad was served (a filled impression)
--   campaign_id NULL     → the auction was empty (a logged no-fill, so the admin
--                          dashboard can compute an honest fill rate)
-- ip_hash is a SALTED one-way hash. Raw IP is never stored.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.beat_impressions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id       uuid REFERENCES public.beat_campaigns(id) ON DELETE SET NULL,
  publisher_id      text REFERENCES public.beat_publishers(id) ON DELETE SET NULL,
  surface           text NOT NULL,
  context           jsonb NOT NULL DEFAULT '{}'::jsonb,           -- coarse, caller-supplied — never user content
  served_at         timestamptz NOT NULL DEFAULT now(),
  ip_hash           text,                                        -- salted SHA-256, irreversible; null if no IP seen
  clicked           boolean NOT NULL DEFAULT false,
  clicked_at        timestamptz,
  dismissed         boolean NOT NULL DEFAULT false,
  dismissed_at      timestamptz,
  charged_nzd_cents integer NOT NULL DEFAULT 0                    -- second-price clearing price for THIS impression, NZ cents
);

CREATE INDEX IF NOT EXISTS beat_impressions_publisher_served_idx
  ON public.beat_impressions (publisher_id, served_at DESC);
CREATE INDEX IF NOT EXISTS beat_impressions_campaign_idx
  ON public.beat_impressions (campaign_id);
-- Backs the per-publisher hourly cap (count rows since now() - 1 hour).
CREATE INDEX IF NOT EXISTS beat_impressions_served_at_idx
  ON public.beat_impressions (served_at DESC);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.beat_publishers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beat_impressions ENABLE ROW LEVEL SECURITY;

-- anon/authenticated may READ active publishers only. No write policy: writes
-- are service-role (which bypasses RLS) from the edge functions.
DROP POLICY IF EXISTS beat_publishers_read ON public.beat_publishers;
CREATE POLICY beat_publishers_read ON public.beat_publishers
  FOR SELECT TO anon, authenticated USING (active);

-- beat_campaigns and beat_impressions get NO anon/authenticated policies on
-- purpose: with RLS enabled and no permissive policy, the anon key can read
-- nothing. The service role bypasses RLS entirely for edge-function writes and
-- the admin dashboard reads.

-- ---------------------------------------------------------------------------
-- Seed: assembl is its own first publisher. HAPAI tools serve under this id.
-- Phase 0 anchor incentive: 60% publisher share (rev_share_bps = 6000).
-- ---------------------------------------------------------------------------
INSERT INTO public.beat_publishers (id, display_name, rev_share_bps, active)
VALUES ('assembl-hapai', 'assembl HAPAI tools', 6000, true)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verification / dogfood test campaign (run manually in the SQL editor — not
-- part of the migration so it never seeds demand into a fresh environment):
--
--   INSERT INTO public.beat_campaigns
--     (advertiser_email, name, ad_text, cta_url, bid_cpm_nzd_cents,
--      daily_budget_nzd_cents, status)
--   VALUES
--     ('test@assembl.co.nz', 'Dogfood — Air NZ', 'Air New Zealand Business — fly the main centres for less.',
--      'https://www.airnewzealand.co.nz/', 4500, 50000, 'active');
--
--   -- then load /c/manaaki and watch the spinner line render the ad.
--   SELECT served_at, surface, charged_nzd_cents, clicked, dismissed
--     FROM public.beat_impressions ORDER BY served_at DESC LIMIT 10;
