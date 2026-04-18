
CREATE TABLE IF NOT EXISTS public.architecture_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  project_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  result_summary TEXT,
  risk_rating TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.architecture_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own arch" ON public.architecture_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.engineering_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  project_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  result_summary TEXT,
  metric_value NUMERIC,
  metric_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.engineering_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own eng" ON public.engineering_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.customs_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  shipment_ref TEXT,
  hs_code TEXT,
  origin_country TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  landed_cost_nzd NUMERIC(14,2),
  duty_savings_nzd NUMERIC(14,2),
  result_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customs_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own customs" ON public.customs_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.logistics_workflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID,
  workflow_type TEXT NOT NULL,
  vehicle_ref TEXT,
  driver_ref TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  result_summary TEXT,
  risk_rating TEXT,
  exposure_nzd NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.logistics_workflow_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logistics" ON public.logistics_workflow_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS arch_user_idx ON public.architecture_workflow_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS eng_user_idx ON public.engineering_workflow_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS customs_user_idx ON public.customs_workflow_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS logistics_user_idx ON public.logistics_workflow_records(user_id, created_at DESC);
