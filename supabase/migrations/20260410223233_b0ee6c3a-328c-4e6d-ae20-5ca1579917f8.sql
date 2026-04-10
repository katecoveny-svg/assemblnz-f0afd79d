
-- Tenant consent table (immutable audit trail)
CREATE TABLE public.tenant_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  contact_email text NOT NULL,
  consent_version text NOT NULL,
  consent_timestamp timestamptz NOT NULL,
  ip_hash text,
  intake_id uuid
);

ALTER TABLE public.tenant_consent ENABLE ROW LEVEL SECURITY;

-- Public insert (no auth required for onboarding)
CREATE POLICY "Anyone can create consent records"
  ON public.tenant_consent FOR INSERT
  WITH CHECK (true);

-- No update/delete — immutable
CREATE POLICY "Consent records are read by service role only"
  ON public.tenant_consent FOR SELECT
  USING (false);

-- Tenant intake table
CREATE TABLE public.tenant_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Form fields
  website_url text NOT NULL,
  business_name text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  team_size text NOT NULL,
  kete_requested text NOT NULL,
  pain_points text[] NOT NULL,
  priority_workflow text,
  consent_version text NOT NULL,
  consent_timestamp timestamptz NOT NULL,

  -- Scrape results (jsonb for flexibility)
  scrape_website jsonb,
  scrape_nzbn jsonb,
  scrape_google jsonb,
  scrape_linkedin jsonb,
  scrape_companies_office jsonb,

  -- Exception handling
  exception_path text,
  exception_reason text,

  -- Pipeline output
  personalised_plan jsonb,
  plan_html_url text,
  pipeline_status text NOT NULL DEFAULT 'pending',

  -- Tenant link
  tenant_id uuid REFERENCES public.tenants(id)
);

ALTER TABLE public.tenant_intake ENABLE ROW LEVEL SECURITY;

-- Public insert for onboarding (no auth required)
CREATE POLICY "Anyone can create intake records"
  ON public.tenant_intake FOR INSERT
  WITH CHECK (true);

-- Public read by ID (for polling status)
CREATE POLICY "Anyone can read their own intake by id"
  ON public.tenant_intake FOR SELECT
  USING (true);

-- No public update/delete
CREATE POLICY "Service role can update intake"
  ON public.tenant_intake FOR UPDATE
  USING (false);

-- Add foreign key from consent to intake
ALTER TABLE public.tenant_consent
  ADD CONSTRAINT tenant_consent_intake_id_fkey
  FOREIGN KEY (intake_id) REFERENCES public.tenant_intake(id);

-- Index for pipeline polling
CREATE INDEX idx_tenant_intake_pipeline_status ON public.tenant_intake(pipeline_status);
CREATE INDEX idx_tenant_intake_website_url ON public.tenant_intake(website_url);
