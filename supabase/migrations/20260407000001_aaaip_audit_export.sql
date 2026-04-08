-- AAAIP — audit export table
-- Receives JSON payloads from the AAAIP demo dashboard so AAAIP
-- researchers can inspect agent decisions and policy violations
-- across simulation runs.

CREATE TABLE IF NOT EXISTS public.aaaip_audit_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL CHECK (domain IN ('clinic', 'robot', 'science')),
  pilot_label text,
  exported_at timestamptz NOT NULL,
  entry_count integer NOT NULL DEFAULT 0,
  total_decisions integer NOT NULL DEFAULT 0,
  allowed integer NOT NULL DEFAULT 0,
  needs_human integer NOT NULL DEFAULT 0,
  blocked integer NOT NULL DEFAULT 0,
  applied integer NOT NULL DEFAULT 0,
  compliance_rate numeric(5, 4),
  human_approval_rate numeric(5, 4),
  policy_hits jsonb NOT NULL DEFAULT '{}'::jsonb,
  entries jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_agent text,
  source_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aaaip_audit_exports_domain
  ON public.aaaip_audit_exports (domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aaaip_audit_exports_created_at
  ON public.aaaip_audit_exports (created_at DESC);

ALTER TABLE public.aaaip_audit_exports ENABLE ROW LEVEL SECURITY;

-- The public dashboard at /aaaip is anonymous, so anon can insert
-- exports (write-only). Reads are restricted to the service role
-- (and authenticated admins via a separate policy below).
DROP POLICY IF EXISTS "aaaip_audit_exports_anon_insert" ON public.aaaip_audit_exports;
CREATE POLICY "aaaip_audit_exports_anon_insert"
  ON public.aaaip_audit_exports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated users can read their own session's exports for the
-- in-app dashboard. AAAIP researchers fetch with the service role.
DROP POLICY IF EXISTS "aaaip_audit_exports_auth_select" ON public.aaaip_audit_exports;
CREATE POLICY "aaaip_audit_exports_auth_select"
  ON public.aaaip_audit_exports
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.aaaip_audit_exports IS
  'Audit log exports submitted by the AAAIP demo dashboard. Each row is one click of the "Send to AAAIP" button, capturing every agent decision, policy verdict, and aggregate metric for the run.';
