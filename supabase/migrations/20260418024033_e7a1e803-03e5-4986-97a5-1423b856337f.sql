
CREATE TABLE IF NOT EXISTS public.manaaki_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  venue_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  result_summary TEXT,
  risk_rating TEXT,
  metric_value NUMERIC,
  metric_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.manaaki_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own manaaki" ON public.manaaki_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS manaaki_user_idx ON public.manaaki_workflow_records(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.arataki_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  vehicle_ref TEXT,
  vin TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  result_summary TEXT,
  risk_rating TEXT,
  exposure_nzd NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.arataki_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own arataki" ON public.arataki_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS arataki_user_idx ON public.arataki_workflow_records(user_id, created_at DESC);
