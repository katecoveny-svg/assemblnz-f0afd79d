CREATE TABLE public.agent_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kete text NOT NULL CHECK (kete IN ('MANAAKI','WAIHANGA','AUAHA','ARATAKI','PIKAU')),
  agent_slug text NOT NULL,
  prompt text NOT NULL,
  response text,
  verdict_kahu text DEFAULT 'pending',
  verdict_iho text DEFAULT 'pending',
  verdict_ta text DEFAULT 'pending',
  verdict_mahara text DEFAULT 'pending',
  verdict_mana text DEFAULT 'pending',
  overall_verdict text DEFAULT 'pending',
  audit_entry jsonb DEFAULT '{}'::jsonb,
  run_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read test results"
  ON public.agent_test_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert test results"
  ON public.agent_test_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX idx_agent_test_results_kete ON public.agent_test_results (kete);
CREATE INDEX idx_agent_test_results_created ON public.agent_test_results (created_at DESC);