
-- WAIHANGA end-to-end workflow tables
CREATE TABLE IF NOT EXISTS public.waihanga_workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  trigger_payload JSONB NOT NULL DEFAULT '{}',
  agent_chain JSONB NOT NULL DEFAULT '[]',
  result JSONB,
  evidence_pack_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.waihanga_workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own runs" ON public.waihanga_workflow_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own runs" ON public.waihanga_workflow_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.waihanga_retention_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.waihanga_workflow_runs(id) ON DELETE SET NULL,
  contract_ref TEXT NOT NULL,
  subcontractor_name TEXT NOT NULL,
  amount_nzd NUMERIC(14,2) NOT NULL,
  retention_pct NUMERIC(5,2) NOT NULL,
  retention_held_nzd NUMERIC(14,2) NOT NULL,
  trigger_event TEXT NOT NULL,
  trust_account_ref TEXT,
  last_movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'held',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waihanga_retention_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own retention" ON public.waihanga_retention_ledger FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.waihanga_payment_claims_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.waihanga_workflow_runs(id) ON DELETE SET NULL,
  contract_ref TEXT NOT NULL,
  principal_name TEXT NOT NULL,
  principal_email TEXT NOT NULL,
  claim_period TEXT NOT NULL,
  sum_claimed_nzd NUMERIC(14,2) NOT NULL,
  gst_nzd NUMERIC(14,2) NOT NULL,
  retention_deduction_nzd NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_due_nzd NUMERIC(14,2) NOT NULL,
  due_date DATE NOT NULL,
  cca_section_20_compliant BOOLEAN NOT NULL DEFAULT false,
  claim_document_md TEXT,
  schedule_deadline DATE,
  schedule_received BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waihanga_payment_claims_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own claims" ON public.waihanga_payment_claims_v2 FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.waihanga_safety_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.waihanga_workflow_runs(id) ON DELETE SET NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  toolbox_topic TEXT NOT NULL,
  attendees JSONB NOT NULL DEFAULT '[]',
  hazards JSONB NOT NULL DEFAULT '[]',
  incidents JSONB NOT NULL DEFAULT '[]',
  notifiable_event BOOLEAN NOT NULL DEFAULT false,
  worksafe_draft TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waihanga_safety_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own safety" ON public.waihanga_safety_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.waihanga_consent_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.waihanga_workflow_runs(id) ON DELETE SET NULL,
  council TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  project_ref TEXT NOT NULL,
  drawings_provided BOOLEAN NOT NULL DEFAULT false,
  ps1_drafted BOOLEAN NOT NULL DEFAULT false,
  greens JSONB NOT NULL DEFAULT '[]',
  ambers JSONB NOT NULL DEFAULT '[]',
  reds JSONB NOT NULL DEFAULT '[]',
  readiness_verdict TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waihanga_consent_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own consent" ON public.waihanga_consent_checks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS waihanga_runs_user_idx ON public.waihanga_workflow_runs(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS waihanga_retention_user_idx ON public.waihanga_retention_ledger(user_id, last_movement_date DESC);
