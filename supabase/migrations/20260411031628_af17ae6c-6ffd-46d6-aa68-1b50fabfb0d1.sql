
-- ════════════════════════════════════════════════
-- KAHU: policy_rules table
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legislation_code TEXT NOT NULL,
  legislation_title TEXT NOT NULL,
  section TEXT,
  rule_text TEXT NOT NULL,
  applicable_kete TEXT[] DEFAULT '{}',
  applicable_action_types TEXT[] DEFAULT '{}',
  policy_type TEXT NOT NULL DEFAULT 'allowed',
  conditions JSONB,
  severity TEXT DEFAULT 'medium',
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(legislation_code, section, rule_text)
);

-- Validation trigger for policy_type
CREATE OR REPLACE FUNCTION public.validate_policy_type()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.policy_type NOT IN ('allowed', 'approval_required', 'forbidden') THEN
    RAISE EXCEPTION 'policy_type must be allowed, approval_required, or forbidden';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_policy_type
  BEFORE INSERT OR UPDATE ON public.policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_policy_type();

-- Validation trigger for severity
CREATE OR REPLACE FUNCTION public.validate_severity()
  RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'severity must be low, medium, high, or critical';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_severity
  BEFORE INSERT OR UPDATE ON public.policy_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_severity();

CREATE INDEX IF NOT EXISTS idx_policy_rules_kete ON public.policy_rules USING GIN (applicable_kete);
CREATE INDEX IF NOT EXISTS idx_policy_rules_actions ON public.policy_rules USING GIN (applicable_action_types);
CREATE INDEX IF NOT EXISTS idx_policy_rules_type ON public.policy_rules(policy_type);

-- RLS: service-role only (internal pipeline use)
ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on policy_rules"
  ON public.policy_rules
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read policy_rules"
  ON public.policy_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- ════════════════════════════════════════════════
-- IHO: routing_log table
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.routing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  user_input TEXT NOT NULL,
  detected_intent TEXT,
  selected_kete TEXT NOT NULL,
  selected_agent TEXT NOT NULL,
  selected_model TEXT NOT NULL,
  confidence_score FLOAT,
  routing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_routing_log_request ON public.routing_log(request_id);
CREATE INDEX IF NOT EXISTS idx_routing_log_kete ON public.routing_log(selected_kete);

-- RLS: service-role writes, authenticated reads
ALTER TABLE public.routing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on routing_log"
  ON public.routing_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read routing_log"
  ON public.routing_log
  FOR SELECT
  TO authenticated
  USING (true);
