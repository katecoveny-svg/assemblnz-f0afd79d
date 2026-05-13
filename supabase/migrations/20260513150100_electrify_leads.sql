-- Electrify NZ — SME switch-to-electric calculator: leads + results table
-- Per docs/runbooks/electrify-calculator/HANDOVER.md (Kate Hudson, 2026-05-13)
--
-- Captures form submissions, computed results, and consent state for follow-up.
-- Email is collected at PDF download step (not at form submit) — see UX flow in handover §1.

BEGIN;

CREATE TABLE IF NOT EXISTS public.electrify_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  email text,                                   -- captured at PDF step, may be null at submit
  business_type text NOT NULL CHECK (business_type IN (
    'hospitality','construction','freight','retail',
    'automotive_fleet','creative','ece','professional_other'
  )),
  region text NOT NULL,
  monthly_fuel_spend_nzd numeric NOT NULL,
  fuel_types text[] NOT NULL,
  vehicle_count int NOT NULL DEFAULT 0,
  vehicle_type text,
  premises_type text NOT NULL CHECK (premises_type IN (
    'own_freehold','lease_long_term','lease_short_term'
  )),
  rooftop_solar_suitable text NOT NULL CHECK (rooftop_solar_suitable IN ('yes','no','unsure')),
  monthly_electricity_spend_nzd numeric NOT NULL,
  consent_marketing boolean DEFAULT false,
  consent_research boolean DEFAULT false,

  -- Computed result (snapshot at submit; assumptions version recorded)
  annual_savings_current_nzd numeric,
  annual_savings_cheap_finance_nzd numeric,
  payback_years numeric,
  ten_year_savings_nzd numeric,
  co2e_avoided_tonnes numeric,
  upfront_capex_estimate_nzd numeric,
  recommended_sequence jsonb,                   -- SwitchStep[]
  solar_recommendation jsonb,                   -- SolarRec | null
  result_confidence text CHECK (result_confidence IN ('high','medium','low')),
  assumptions_version text NOT NULL,            -- e.g. '2026-05-13-v1'

  -- Funnel tracking
  pdf_downloaded boolean DEFAULT false,
  pdf_downloaded_at timestamptz,
  cta_clicked text                              -- which kete CTA they clicked, if any
);

CREATE INDEX IF NOT EXISTS electrify_leads_business_type_idx ON public.electrify_leads (business_type);
CREATE INDEX IF NOT EXISTS electrify_leads_email_idx ON public.electrify_leads (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS electrify_leads_created_at_idx ON public.electrify_leads (created_at DESC);

-- RLS: open INSERT for anon (form submission), service-role-only SELECT for the leads dashboard
ALTER TABLE public.electrify_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS electrify_leads_insert_anon ON public.electrify_leads;
CREATE POLICY electrify_leads_insert_anon ON public.electrify_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS electrify_leads_update_own_session ON public.electrify_leads;
CREATE POLICY electrify_leads_update_own_session ON public.electrify_leads
  FOR UPDATE TO anon, authenticated USING (
    -- Allow updating only within 60 minutes of creation (the PDF-download step)
    created_at > now() - interval '60 minutes'
  );

-- No SELECT policy = no public read. Service role / admin dashboard accesses directly.

COMMIT;

-- Verification:
-- SELECT count(*) FROM electrify_leads;
-- INSERT INTO electrify_leads (business_type, region, monthly_fuel_spend_nzd, fuel_types, premises_type, rooftop_solar_suitable, monthly_electricity_spend_nzd, assumptions_version) VALUES ('hospitality', 'Auckland', 800, ARRAY['lpg'], 'lease_long_term', 'unsure', 600, '2026-05-13-v1');
