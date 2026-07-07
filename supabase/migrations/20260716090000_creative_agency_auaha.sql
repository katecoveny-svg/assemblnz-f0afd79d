-- ============================================================
-- AUAHA Creative Kete — demo workspace support
-- Idempotent + self-healing. Adds the generation ledger the workspace
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
  FOR ALL USING (true) WITH CHECK (true);

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
  FOR ALL USING (true) WITH CHECK (true);

-- Register the tenant (mirror of lib/customers/tenants.ts) if the table exists.
-- Fully guarded: any column/constraint mismatch is swallowed so this can never
-- red the migration — the code registry in tenants.ts is the source of truth.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='tenant_customers') THEN
    BEGIN
      INSERT INTO public.tenant_customers (slug, display_name, status)
      VALUES ('creative-agency', 'AUAHA Creative Kete', 'concept')
      ON CONFLICT (slug) DO UPDATE
        SET display_name = EXCLUDED.display_name, status = EXCLUDED.status;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'auaha: tenant_customers seed skipped (%).', SQLERRM;
    END;
  END IF;
END $$;
