
-- ============================================================
-- Māori Data Sovereignty Control Plane — Core Tables
-- ============================================================

-- 1. Māori Data Registry
CREATE TABLE public.maori_data_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_name TEXT NOT NULL,
  dataset_description TEXT,
  is_maori_data BOOLEAN NOT NULL DEFAULT false,
  provenance JSONB DEFAULT '{}',
  iwi_hapu_relevance TEXT[] DEFAULT '{}',
  tapu_noa_classification TEXT NOT NULL DEFAULT 'unclassified',
  permitted_purposes TEXT[] DEFAULT '{}',
  locality_restriction TEXT NOT NULL DEFAULT 'nz_only',
  kaitiaki_contact JSONB DEFAULT '{}',
  governance_status TEXT NOT NULL DEFAULT 'pending',
  approval_expiry TIMESTAMPTZ,
  source_table TEXT,
  source_kete TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maori_data_registry ENABLE ROW LEVEL SECURITY;

-- Validation trigger for tapu_noa_classification
CREATE OR REPLACE FUNCTION public.validate_tapu_noa()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.tapu_noa_classification NOT IN ('tapu', 'noa', 'unclassified') THEN
    RAISE EXCEPTION 'tapu_noa_classification must be tapu, noa, or unclassified';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_tapu_noa
BEFORE INSERT OR UPDATE ON public.maori_data_registry
FOR EACH ROW EXECUTE FUNCTION public.validate_tapu_noa();

-- Validation trigger for locality_restriction
CREATE OR REPLACE FUNCTION public.validate_locality()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.locality_restriction NOT IN ('nz_only', 'au_nz', 'any') THEN
    RAISE EXCEPTION 'locality_restriction must be nz_only, au_nz, or any';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_locality
BEFORE INSERT OR UPDATE ON public.maori_data_registry
FOR EACH ROW EXECUTE FUNCTION public.validate_locality();

-- Validation trigger for governance_status
CREATE OR REPLACE FUNCTION public.validate_governance_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.governance_status NOT IN ('pending', 'approved', 'declined', 'expired') THEN
    RAISE EXCEPTION 'governance_status must be pending, approved, declined, or expired';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_governance_status
BEFORE INSERT OR UPDATE ON public.maori_data_registry
FOR EACH ROW EXECUTE FUNCTION public.validate_governance_status();

CREATE TRIGGER update_maori_data_registry_updated_at
BEFORE UPDATE ON public.maori_data_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: All authenticated can read; admins can write
CREATE POLICY "Authenticated users can view registry"
ON public.maori_data_registry FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage registry"
ON public.maori_data_registry FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Sovereignty Audit Log
CREATE TABLE public.sovereignty_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  dataset_id UUID REFERENCES public.maori_data_registry(id) ON DELETE SET NULL,
  agent_code TEXT,
  kete TEXT,
  purpose_declared TEXT,
  decision TEXT NOT NULL DEFAULT 'allow',
  obligations JSONB DEFAULT '[]',
  provenance_chain JSONB DEFAULT '[]',
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sovereignty_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert audit entries"
ON public.sovereignty_audit_log FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view audit entries"
ON public.sovereignty_audit_log FOR SELECT TO authenticated
USING (true);

CREATE INDEX idx_sovereignty_audit_dataset ON public.sovereignty_audit_log(dataset_id);
CREATE INDEX idx_sovereignty_audit_kete ON public.sovereignty_audit_log(kete);
CREATE INDEX idx_sovereignty_audit_created ON public.sovereignty_audit_log(created_at DESC);

-- 3. Governance Gates
CREATE TABLE public.governance_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  gate_type TEXT NOT NULL DEFAULT 'maori_governance',
  dataset_id UUID REFERENCES public.maori_data_registry(id) ON DELETE SET NULL,
  kete TEXT,
  purpose TEXT NOT NULL,
  benefit_hypothesis TEXT,
  harm_hypothesis TEXT,
  simulator_results JSONB DEFAULT '{}',
  governance_pack JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  conditions TEXT,
  kaitiaki_decision_by TEXT,
  requested_by UUID,
  decided_at TIMESTAMPTZ,
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_gates ENABLE ROW LEVEL SECURITY;

-- Validation trigger for gate_type
CREATE OR REPLACE FUNCTION public.validate_gate_type()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.gate_type NOT IN ('maori_governance', 'standard_privacy') THEN
    RAISE EXCEPTION 'gate_type must be maori_governance or standard_privacy';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_gate_type
BEFORE INSERT OR UPDATE ON public.governance_gates
FOR EACH ROW EXECUTE FUNCTION public.validate_gate_type();

-- Validation trigger for gate status
CREATE OR REPLACE FUNCTION public.validate_gate_status()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'approved_with_conditions', 'declined') THEN
    RAISE EXCEPTION 'status must be pending, approved, approved_with_conditions, or declined';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_gate_status
BEFORE INSERT OR UPDATE ON public.governance_gates
FOR EACH ROW EXECUTE FUNCTION public.validate_gate_status();

CREATE TRIGGER update_governance_gates_updated_at
BEFORE UPDATE ON public.governance_gates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: Authenticated can create requests; all authenticated can read; admins decide
CREATE POLICY "Authenticated can create gate requests"
ON public.governance_gates FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view gates"
ON public.governance_gates FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can update gates"
ON public.governance_gates FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
