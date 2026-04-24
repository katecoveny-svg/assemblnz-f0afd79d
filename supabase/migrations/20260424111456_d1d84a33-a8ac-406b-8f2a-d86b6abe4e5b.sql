
-- Daily evidence sweep snapshots — written by the evidence-sweep edge function each morning
CREATE TABLE IF NOT EXISTS public.evidence_sweep_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kete TEXT NOT NULL,
  swept_for DATE NOT NULL,
  green_count INTEGER NOT NULL DEFAULT 0,
  amber_count INTEGER NOT NULL DEFAULT 0,
  red_count INTEGER NOT NULL DEFAULT 0,
  total_packs INTEGER NOT NULL DEFAULT 0,
  pending_gates INTEGER NOT NULL DEFAULT 0,
  approved_gates INTEGER NOT NULL DEFAULT 0,
  high_risk_records INTEGER NOT NULL DEFAULT 0,
  readiness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evidence_sweep_kete_day
  ON public.evidence_sweep_snapshots(kete, swept_for);

CREATE INDEX IF NOT EXISTS idx_evidence_sweep_recent
  ON public.evidence_sweep_snapshots(kete, swept_for DESC);

ALTER TABLE public.evidence_sweep_snapshots ENABLE ROW LEVEL SECURITY;

-- Authenticated users (dashboards) can read snapshots
CREATE POLICY "Authenticated can view evidence sweep snapshots"
  ON public.evidence_sweep_snapshots
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role writes snapshots from the edge function (no INSERT/UPDATE policy needed for service role)
