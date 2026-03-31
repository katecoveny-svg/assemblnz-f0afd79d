
-- Enums for Hanga construction module
CREATE TYPE public.control_hierarchy AS ENUM ('elimination','substitution','isolation','engineering','administrative','ppe');
CREATE TYPE public.incident_type AS ENUM ('near_miss','first_aid','medical_treatment','serious_harm','notifiable_event');
CREATE TYPE public.consent_type AS ENUM ('building','resource','subdivision','land_use');
CREATE TYPE public.consent_status AS ENUM ('preparing','lodged','rfi','approved','expired');
CREATE TYPE public.ncr_severity AS ENUM ('minor','major','critical');
CREATE TYPE public.punch_priority AS ENUM ('P1','P2','P3');
CREATE TYPE public.payment_claim_status AS ENUM ('draft','submitted','approved','disputed','paid');
CREATE TYPE public.variation_status AS ENUM ('proposed','approved','rejected','implemented');

-- 1. hanga_projects
CREATE TABLE public.hanga_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  client_name TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.hanga_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_projects_user ON public.hanga_projects(user_id);
CREATE INDEX idx_hanga_projects_status ON public.hanga_projects(status);

-- 2. hanga_risk_register
CREATE TABLE public.hanga_risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hazard_category TEXT,
  description TEXT NOT NULL,
  likelihood INT CHECK (likelihood BETWEEN 1 AND 5),
  consequence INT CHECK (consequence BETWEEN 1 AND 5),
  risk_score INT GENERATED ALWAYS AS (likelihood * consequence) STORED,
  control_hierarchy public.control_hierarchy,
  control_measures TEXT,
  responsible_person TEXT,
  review_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_risk_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own risks" ON public.hanga_risk_register FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_risk_project ON public.hanga_risk_register(project_id);
CREATE INDEX idx_hanga_risk_status ON public.hanga_risk_register(status);

-- 3. hanga_incidents
CREATE TABLE public.hanga_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  incident_type public.incident_type NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  immediate_actions TEXT,
  investigation_status TEXT NOT NULL DEFAULT 'open',
  worksafe_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own incidents" ON public.hanga_incidents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_incidents_project ON public.hanga_incidents(project_id);
CREATE INDEX idx_hanga_incidents_type ON public.hanga_incidents(incident_type);

-- 4. hanga_worker_competency
CREATE TABLE public.hanga_worker_competency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  worker_name TEXT NOT NULL,
  role TEXT,
  lbp_number TEXT,
  lbp_class TEXT,
  site_safe_card BOOLEAN NOT NULL DEFAULT false,
  first_aid_cert BOOLEAN NOT NULL DEFAULT false,
  induction_completed BOOLEAN NOT NULL DEFAULT false,
  induction_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_worker_competency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workers" ON public.hanga_worker_competency FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_workers_project ON public.hanga_worker_competency(project_id);

-- 5. hanga_consents
CREATE TABLE public.hanga_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  consent_type public.consent_type NOT NULL,
  reference_number TEXT,
  status public.consent_status NOT NULL DEFAULT 'preparing',
  lodged_date DATE,
  decision_date DATE,
  conditions TEXT[],
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consents" ON public.hanga_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_consents_project ON public.hanga_consents(project_id);
CREATE INDEX idx_hanga_consents_status ON public.hanga_consents(status);

-- 6. hanga_quality_ncr
CREATE TABLE public.hanga_quality_ncr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ncr_number TEXT,
  description TEXT NOT NULL,
  severity public.ncr_severity NOT NULL DEFAULT 'minor',
  raised_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_to TEXT,
  corrective_action TEXT,
  close_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_quality_ncr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own NCRs" ON public.hanga_quality_ncr FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_ncr_project ON public.hanga_quality_ncr(project_id);
CREATE INDEX idx_hanga_ncr_status ON public.hanga_quality_ncr(status);

-- 7. hanga_punch_list
CREATE TABLE public.hanga_punch_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_description TEXT NOT NULL,
  priority public.punch_priority NOT NULL DEFAULT 'P2',
  location TEXT,
  assigned_to TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_punch_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own punch items" ON public.hanga_punch_list FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_punch_project ON public.hanga_punch_list(project_id);
CREATE INDEX idx_hanga_punch_status ON public.hanga_punch_list(status);

-- 8. hanga_payment_claims
CREATE TABLE public.hanga_payment_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claim_number TEXT,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  retention_held NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(14,2) GENERATED ALWAYS AS (amount - retention_held) STORED,
  cca_form_1 BOOLEAN NOT NULL DEFAULT false,
  response_due_date DATE,
  status public.payment_claim_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_payment_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own claims" ON public.hanga_payment_claims FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_claims_project ON public.hanga_payment_claims(project_id);
CREATE INDEX idx_hanga_claims_status ON public.hanga_payment_claims(status);

-- 9. hanga_variations
CREATE TABLE public.hanga_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.hanga_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  variation_number TEXT,
  description TEXT NOT NULL,
  requested_by TEXT,
  cost_impact NUMERIC(14,2),
  time_impact_days INT,
  status public.variation_status NOT NULL DEFAULT 'proposed',
  approval_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hanga_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own variations" ON public.hanga_variations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hanga_variations_project ON public.hanga_variations(project_id);
CREATE INDEX idx_hanga_variations_status ON public.hanga_variations(status);
