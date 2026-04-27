-- PIKAU evaluation harness: scenarios catalogue + run history

CREATE TABLE IF NOT EXISTS public.pikau_eval_scenarios (
  scenario_id TEXT PRIMARY KEY,
  workflow INTEGER NOT NULL,
  type TEXT NOT NULL,
  weight TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  must_flag JSONB NOT NULL DEFAULT '[]'::jsonb,
  must_cite JSONB NOT NULL DEFAULT '[]'::jsonb,
  hard_fails JSONB NOT NULL DEFAULT '[]'::jsonb,
  pass_criteria TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.validate_pikau_eval_scenario()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.type NOT IN ('A','B','C') THEN
    RAISE EXCEPTION 'type must be A, B, or C';
  END IF;
  IF NEW.weight NOT IN ('high','medium','low') THEN
    RAISE EXCEPTION 'weight must be high, medium, or low';
  END IF;
  IF NEW.workflow < 1 OR NEW.workflow > 9 THEN
    RAISE EXCEPTION 'workflow must be between 1 and 9';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_pikau_eval_scenario_trg ON public.pikau_eval_scenarios;
CREATE TRIGGER validate_pikau_eval_scenario_trg
BEFORE INSERT OR UPDATE ON public.pikau_eval_scenarios
FOR EACH ROW EXECUTE FUNCTION public.validate_pikau_eval_scenario();

DROP TRIGGER IF EXISTS pikau_eval_scenarios_updated_at ON public.pikau_eval_scenarios;
CREATE TRIGGER pikau_eval_scenarios_updated_at
BEFORE UPDATE ON public.pikau_eval_scenarios
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.pikau_eval_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read scenarios"
ON public.pikau_eval_scenarios FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins write scenarios"
ON public.pikau_eval_scenarios FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));


CREATE TABLE IF NOT EXISTS public.pikau_eval_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id TEXT NOT NULL REFERENCES public.pikau_eval_scenarios(scenario_id) ON DELETE CASCADE,
  run_batch UUID,
  model_used TEXT,
  pikau_response TEXT,
  judge_model TEXT,
  judge_verdict TEXT NOT NULL,
  must_flag_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
  must_flag_misses JSONB NOT NULL DEFAULT '[]'::jsonb,
  must_cite_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
  must_cite_misses JSONB NOT NULL DEFAULT '[]'::jsonb,
  hard_fails_triggered JSONB NOT NULL DEFAULT '[]'::jsonb,
  judge_notes TEXT,
  pass BOOLEAN NOT NULL,
  latency_ms INTEGER,
  error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pikau_eval_runs_scenario_idx ON public.pikau_eval_runs(scenario_id, created_at DESC);
CREATE INDEX IF NOT EXISTS pikau_eval_runs_batch_idx ON public.pikau_eval_runs(run_batch, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_pikau_eval_run()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.judge_verdict NOT IN ('pass','fail','error') THEN
    RAISE EXCEPTION 'judge_verdict must be pass, fail, or error';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_pikau_eval_run_trg ON public.pikau_eval_runs;
CREATE TRIGGER validate_pikau_eval_run_trg
BEFORE INSERT OR UPDATE ON public.pikau_eval_runs
FOR EACH ROW EXECUTE FUNCTION public.validate_pikau_eval_run();

ALTER TABLE public.pikau_eval_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read runs"
ON public.pikau_eval_runs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service writes runs"
ON public.pikau_eval_runs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));