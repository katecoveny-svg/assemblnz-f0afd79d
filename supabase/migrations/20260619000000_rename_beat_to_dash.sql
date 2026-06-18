-- Brand rename: "Beat by assembl" → "Dash by assembl" (19 Jun 2026).
--
-- The ad-network schema shipped as beat_* in 20260617140000_beat_network.sql.
-- Kate locked the rename to "Dash by assembl", so this migration renames the
-- three tables (and their indexes, check constraints and RLS policy) to dash_*.
-- The application code (lib/dash, app/api/dash) now reads/writes the dash_* names.
--
-- Safe on both paths: a fresh apply runs the create migration first (beat_*),
-- then this rename; an already-migrated database renames the live tables in
-- place. No data is moved — ALTER ... RENAME is metadata-only. The Phase-0
-- network is pre-launch (no live serving yet), so there is nothing in flight.
--
-- NOTE (env): the salted-IP env var is renamed BEAT_IP_SALT → DASH_IP_SALT in
-- code. Set DASH_IP_SALT in Vercel/Supabase before the network goes live; until
-- then impressions simply carry no ip_hash (fail-soft, by design).

-- 1. Tables.
ALTER TABLE IF EXISTS public.beat_publishers  RENAME TO dash_publishers;
ALTER TABLE IF EXISTS public.beat_campaigns   RENAME TO dash_campaigns;
ALTER TABLE IF EXISTS public.beat_impressions RENAME TO dash_impressions;

-- 2. Indexes.
ALTER INDEX IF EXISTS public.beat_campaigns_status_idx          RENAME TO dash_campaigns_status_idx;
ALTER INDEX IF EXISTS public.beat_impressions_publisher_served_idx RENAME TO dash_impressions_publisher_served_idx;
ALTER INDEX IF EXISTS public.beat_impressions_campaign_idx      RENAME TO dash_impressions_campaign_idx;
ALTER INDEX IF EXISTS public.beat_impressions_served_at_idx     RENAME TO dash_impressions_served_at_idx;

-- 3. Check constraints (now attached to the renamed dash_campaigns table).
ALTER TABLE public.dash_campaigns RENAME CONSTRAINT beat_campaigns_status_chk TO dash_campaigns_status_chk;
ALTER TABLE public.dash_campaigns RENAME CONSTRAINT beat_campaigns_bid_chk    TO dash_campaigns_bid_chk;
ALTER TABLE public.dash_campaigns RENAME CONSTRAINT beat_campaigns_budget_chk TO dash_campaigns_budget_chk;

-- 4. RLS policy on the renamed dash_publishers table.
ALTER POLICY beat_publishers_read ON public.dash_publishers RENAME TO dash_publishers_read;
