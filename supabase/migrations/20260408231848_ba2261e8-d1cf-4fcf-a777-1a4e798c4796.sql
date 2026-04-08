
CREATE TABLE public.aaaip_audit_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL CHECK (domain IN ('clinic','robot','science','community')),
  pilot_label text,
  exported_at timestamptz NOT NULL,
  entry_count int NOT NULL DEFAULT 0,
  total_decisions int NOT NULL DEFAULT 0,
  allowed int NOT NULL DEFAULT 0,
  needs_human int NOT NULL DEFAULT 0,
  blocked int NOT NULL DEFAULT 0,
  applied int NOT NULL DEFAULT 0,
  compliance_rate numeric,
  human_approval_rate numeric,
  policy_hits jsonb NOT NULL DEFAULT '{}'::jsonb,
  entries jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_agent text,
  source_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aaaip_audit_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon inserts for AAAIP dashboard"
  ON public.aaaip_audit_exports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow service_role inserts"
  ON public.aaaip_audit_exports
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read exports"
  ON public.aaaip_audit_exports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_aaaip_audit_exports_domain ON public.aaaip_audit_exports (domain);
CREATE INDEX idx_aaaip_audit_exports_exported_at ON public.aaaip_audit_exports (exported_at);
