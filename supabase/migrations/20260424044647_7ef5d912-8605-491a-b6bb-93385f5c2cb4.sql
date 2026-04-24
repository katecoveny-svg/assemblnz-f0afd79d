-- Migration runs audit table
CREATE TABLE IF NOT EXISTS public.migration_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_name TEXT NOT NULL,
  description TEXT,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operator_email TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'completed',
  total_rows_changed INTEGER NOT NULL DEFAULT 0,
  total_rows_skipped INTEGER NOT NULL DEFAULT 0,
  packs_updated TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  packs_skipped TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  per_pack_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Status validation
CREATE OR REPLACE FUNCTION public.validate_migration_run_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('running', 'completed', 'failed', 'partial') THEN
    RAISE EXCEPTION 'status must be running, completed, failed, or partial';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_migration_run_status_trigger ON public.migration_runs;
CREATE TRIGGER validate_migration_run_status_trigger
BEFORE INSERT OR UPDATE ON public.migration_runs
FOR EACH ROW EXECUTE FUNCTION public.validate_migration_run_status();

-- Index
CREATE INDEX IF NOT EXISTS idx_migration_runs_started_at
  ON public.migration_runs (started_at DESC);

-- RLS
ALTER TABLE public.migration_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view migration runs"
  ON public.migration_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert migration runs"
  ON public.migration_runs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update migration runs"
  ON public.migration_runs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));