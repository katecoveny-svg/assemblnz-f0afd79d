-- Assembl Bills — live-data foundations.
--
-- Two tables that turn Assembl Bills from sample-only into a real ingestion +
-- live-pricing product:
--   1. assembl_bills_ingested        — real bills parsed by Claude Vision
--      (/api/bills/parse). One row per uploaded/emailed bill.
--   2. assembl_bills_provider_prices — the NZ provider price book, refreshed
--      weekly by the refresh-provider-prices Edge Function (WebFetch + Claude
--      extract). Every row carries its source_url + source_last_verified_at +
--      trust_tier so the UI can show "Source: … · last verified …" per price.
--
-- Self-healing (IF NOT EXISTS + guarded columns/policies). RLS ON, service-role
-- writes only — no anon/authenticated write surface. Consistent with
-- ACTION_DISPATCH_ENABLED staying OFF: these tables hold READ data + parsed
-- records; nothing here is dispatched.

BEGIN;

-- ── 1 · Ingested bills (real Claude Vision output) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.assembl_bills_ingested (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- who/where it came from (demo: a session id; real: a user id)
  session_id     text,
  source         text NOT NULL DEFAULT 'upload' CHECK (source IN ('upload','email','photo')),
  -- extracted fields
  provider       text,
  category       text,
  account_number text,
  bill_date      date,
  due_date       date,
  total_amount   numeric,
  gst_amount     numeric,
  line_items     jsonb NOT NULL DEFAULT '[]'::jsonb,
  currency       text NOT NULL DEFAULT 'NZD',
  -- provenance
  model          text,               -- e.g. claude-* used for extraction
  confidence     text,               -- high | medium | low (model self-report)
  raw_extraction jsonb,              -- full model JSON, audit trail
  file_name      text
);

CREATE INDEX IF NOT EXISTS assembl_bills_ingested_session_idx
  ON public.assembl_bills_ingested (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS assembl_bills_ingested_provider_idx
  ON public.assembl_bills_ingested (provider);

ALTER TABLE public.assembl_bills_ingested ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS assembl_bills_ingested_anon ON public.assembl_bills_ingested;

-- ── 2 · Provider price book (live-scraped) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assembl_bills_provider_prices (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category               text NOT NULL CHECK (category IN
                           ('electricity','broadband','insurance','streaming',
                            'subscription','council_rates','fuel','gas','mobile')),
  provider               text NOT NULL,
  plan_name              text NOT NULL,
  monthly_cost_nzd       numeric,
  usage_variable_rate_nzd numeric,   -- electricity per kWh
  daily_charge_nzd       numeric,     -- electricity daily fixed
  contract_length_months int,
  key_features           jsonb NOT NULL DEFAULT '[]'::jsonb,
  eligibility_notes      text,
  source_url             text NOT NULL,
  source_last_verified_at timestamptz NOT NULL DEFAULT now(),
  trust_tier             text NOT NULL DEFAULT 'A' CHECK (trust_tier IN ('A','B','C')),
  status                 text NOT NULL DEFAULT 'active' CHECK (status IN ('active','discontinued','unverified')),
  raw_scrape             jsonb,       -- audit trail of the scrape
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, plan_name)
);

CREATE INDEX IF NOT EXISTS assembl_bills_provider_prices_cat_idx
  ON public.assembl_bills_provider_prices (category, status);

ALTER TABLE public.assembl_bills_provider_prices ENABLE ROW LEVEL SECURITY;

-- Public READ of active price rows (the price book is not secret; it's the
-- product's trust surface). Writes stay service-role only.
DROP POLICY IF EXISTS assembl_bills_provider_prices_read ON public.assembl_bills_provider_prices;
CREATE POLICY assembl_bills_provider_prices_read
  ON public.assembl_bills_provider_prices
  FOR SELECT TO anon, authenticated
  USING (true);

COMMIT;

-- Verify:
--   SELECT category, count(*) FROM public.assembl_bills_provider_prices GROUP BY 1;
--   SELECT provider, total_amount FROM public.assembl_bills_ingested ORDER BY created_at DESC LIMIT 5;
