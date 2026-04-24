-- Per-policy structured log for compliance pre-checks.
-- One row per evaluated policy, recorded after every governed agent turn so
-- supervisors and auditors can review block/warn/pass decisions per agent.
CREATE TABLE IF NOT EXISTS public.policy_check_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  kete TEXT NOT NULL,
  user_id UUID,
  request_id UUID NOT NULL DEFAULT gen_random_uuid(),
  action_kind TEXT,
  zone TEXT,
  policy_id TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  severity TEXT NOT NULL,
  outcome TEXT NOT NULL,
  message TEXT,
  overall_verdict TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_check_log_agent_id ON public.policy_check_log (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_check_log_kete ON public.policy_check_log (kete, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_check_log_user_id ON public.policy_check_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_check_log_outcome ON public.policy_check_log (outcome, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_check_log_request_id ON public.policy_check_log (request_id);

-- Validate enum-like fields with a trigger (CHECK constraints stay immutable).
CREATE OR REPLACE FUNCTION public.validate_policy_check_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.severity NOT IN ('block', 'warn') THEN
    RAISE EXCEPTION 'severity must be block or warn';
  END IF;
  IF NEW.outcome NOT IN ('pass', 'block', 'warn') THEN
    RAISE EXCEPTION 'outcome must be pass, block, or warn';
  END IF;
  IF NEW.overall_verdict NOT IN ('allow', 'block', 'needs_human') THEN
    RAISE EXCEPTION 'overall_verdict must be allow, block, or needs_human';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_policy_check_log_trigger ON public.policy_check_log;
CREATE TRIGGER validate_policy_check_log_trigger
  BEFORE INSERT OR UPDATE ON public.policy_check_log
  FOR EACH ROW EXECUTE FUNCTION public.validate_policy_check_log();

-- RLS: writes are system-managed (edge functions use service role); users see their own rows; admins see everything.
ALTER TABLE public.policy_check_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own policy checks"
  ON public.policy_check_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all policy checks"
  ON public.policy_check_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));