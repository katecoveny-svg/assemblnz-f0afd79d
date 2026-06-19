-- Dash by assembl — core schema (Tier 1/2/3 + payouts). Additive only.
--
-- DRIFT REPAIR (2026-06-19): this migration was applied DIRECTLY to production
-- (Supabase version 20260619034901, name "dash_schema") out of band and was
-- never committed to the repo. This file commits it so repo == prod.
--
-- RECONCILED (2026-06-19): this is the single source of truth for the dash_*
-- tables. The earlier "beat" serving migrations (20260617140000_beat_network,
-- 20260619000000_rename_beat_to_dash) are neutered to no-ops, and the SERVING
-- columns (slug, active, brand_safety_blocklist, *_cents bids, served_at, …) are
-- added onto these uuid tables by 20260619045657_dash_unify_schema. So one uuid
-- schema serves both ad-serving and payouts.
--
-- The dash_connect_accounts.publisher_id FK is intentionally omitted HERE (it was
-- dropped from the prod-applied version); 20260619045657 restores it once the
-- unified publishers table is guaranteed uuid on both prod and a fresh apply.

CREATE TABLE IF NOT EXISTS public.dash_waitlist (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  persona      text NOT NULL CHECK (persona IN ('publisher','advertiser','earner')),
  email        text NOT NULL,
  name         text,
  company      text,
  surface      text,
  source_url   text,
  ip           text,
  notified     boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS dash_waitlist_created_at_idx ON public.dash_waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS dash_waitlist_persona_idx   ON public.dash_waitlist (persona);
CREATE INDEX IF NOT EXISTS dash_waitlist_email_idx     ON public.dash_waitlist (email);
ALTER TABLE public.dash_waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dash_waitlist_insert_anon ON public.dash_waitlist;
CREATE POLICY dash_waitlist_insert_anon ON public.dash_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.dash_charities (
  slug        text PRIMARY KEY,
  name        text NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  is_default  boolean NOT NULL DEFAULT false
);
ALTER TABLE public.dash_charities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dash_charities_read_all ON public.dash_charities;
CREATE POLICY dash_charities_read_all ON public.dash_charities
  FOR SELECT TO anon, authenticated USING (active);
INSERT INTO public.dash_charities (slug, name, is_default) VALUES
  ('spca',             'SPCA NZ',          true),
  ('trees-that-count', 'Trees That Count', false),
  ('foodbank',         'Foodbank NZ',      false)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.dash_publishers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  company             text NOT NULL,
  website             text,
  contact_name        text,
  contact_email       text,
  status              text NOT NULL DEFAULT 'lead'
                        CHECK (status IN ('lead','onboarding','active','paused','churned')),
  is_anchor           boolean NOT NULL DEFAULT false,
  rev_share           numeric(4,3) NOT NULL DEFAULT 0.550,
  owner_user_id       uuid,
  notes               text
);
CREATE INDEX IF NOT EXISTS dash_publishers_status_idx ON public.dash_publishers (status);
ALTER TABLE public.dash_publishers ENABLE ROW LEVEL SECURITY;

-- NOTE: publisher_id is a plain uuid here (no FK) — see the drift note above.
CREATE TABLE IF NOT EXISTS public.dash_connect_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  party_type          text NOT NULL CHECK (party_type IN ('publisher','earner')),
  publisher_id        uuid,
  user_id             uuid,
  stripe_account_id   text NOT NULL UNIQUE,
  country             text NOT NULL DEFAULT 'NZ',
  charges_enabled     boolean NOT NULL DEFAULT false,
  payouts_enabled     boolean NOT NULL DEFAULT false,
  details_submitted   boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS dash_connect_publisher_idx ON public.dash_connect_accounts (publisher_id);
ALTER TABLE public.dash_connect_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_payout_ledger (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  party_type    text NOT NULL CHECK (party_type IN ('publisher','earner','charity')),
  party_id      text NOT NULL,
  direction     text NOT NULL CHECK (direction IN ('credit','debit')),
  amount_nzd    numeric(12,2) NOT NULL CHECK (amount_nzd >= 0),
  reason        text NOT NULL,
  impression_id uuid,
  payout_id     uuid
);
CREATE INDEX IF NOT EXISTS dash_ledger_party_idx ON public.dash_payout_ledger (party_type, party_id, created_at DESC);
ALTER TABLE public.dash_payout_ledger ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_payouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  party_type          text NOT NULL CHECK (party_type IN ('publisher','earner','charity')),
  party_id            text NOT NULL,
  amount_nzd          numeric(12,2) NOT NULL CHECK (amount_nzd > 0),
  method              text NOT NULL CHECK (method IN ('stripe_connect','donation')),
  destination         text,
  threshold_nzd       numeric(12,2) NOT NULL DEFAULT 20.00,
  stripe_transfer_id  text,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','paid','failed')),
  failure_reason      text
);
CREATE INDEX IF NOT EXISTS dash_payouts_party_idx ON public.dash_payouts (party_type, party_id, created_at DESC);
ALTER TABLE public.dash_payouts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_consents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  user_id            uuid,
  consent_version    text NOT NULL,
  destination_choice text NOT NULL CHECK (destination_choice IN ('keep','donate')),
  charity_slug       text REFERENCES public.dash_charities(slug),
  ip_hash            text
);
CREATE INDEX IF NOT EXISTS dash_consents_user_idx ON public.dash_consents (user_id, created_at DESC);
ALTER TABLE public.dash_consents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_advertisers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         timestamptz NOT NULL DEFAULT now(),
  company            text NOT NULL,
  contact_name       text,
  contact_email      text,
  category           text,
  status             text NOT NULL DEFAULT 'lead'
                       CHECK (status IN ('lead','active','paused')),
  monthly_budget_nzd numeric(12,2)
);
ALTER TABLE public.dash_advertisers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  advertiser_id   uuid NOT NULL REFERENCES public.dash_advertisers(id) ON DELETE CASCADE,
  name            text NOT NULL,
  category        text,
  bid_cpm_nzd     numeric(8,2) NOT NULL DEFAULT 45.00,
  daily_budget_nzd numeric(12,2),
  status          text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','live','paused','ended')),
  starts_at       timestamptz,
  ends_at         timestamptz
);
CREATE INDEX IF NOT EXISTS dash_campaigns_status_idx ON public.dash_campaigns (status);
ALTER TABLE public.dash_campaigns ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_creatives (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  campaign_id  uuid NOT NULL REFERENCES public.dash_campaigns(id) ON DELETE CASCADE,
  line         text NOT NULL,
  approved     boolean NOT NULL DEFAULT false
);
ALTER TABLE public.dash_creatives ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.dash_impressions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  publisher_id  uuid REFERENCES public.dash_publishers(id) ON DELETE SET NULL,
  campaign_id   uuid REFERENCES public.dash_campaigns(id) ON DELETE SET NULL,
  context       text,
  duration_ms   integer,
  cpm_nzd       numeric(8,2),
  revenue_nzd   numeric(12,4),
  served_line   text
);
CREATE INDEX IF NOT EXISTS dash_impressions_publisher_idx ON public.dash_impressions (publisher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS dash_impressions_campaign_idx  ON public.dash_impressions (campaign_id, created_at DESC);
ALTER TABLE public.dash_impressions ENABLE ROW LEVEL SECURITY;
