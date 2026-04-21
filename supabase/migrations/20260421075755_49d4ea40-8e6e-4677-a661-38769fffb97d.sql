
-- Add annotation columns to kb_sources
ALTER TABLE public.kb_sources
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER,
  ADD COLUMN IF NOT EXISTS provenance TEXT,
  ADD COLUMN IF NOT EXISTS last_successful_fetch TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Helpful default provenance strings derived from URL host (best-effort one-time backfill)
UPDATE public.kb_sources
SET provenance = COALESCE(
  provenance,
  'Published by ' || COALESCE(NULLIF(split_part(split_part(url,'//',2),'/',1), ''), 'source') ||
  ' · ingested via ' || type
)
WHERE provenance IS NULL;

-- Trigger to roll up reliability + last successful fetch on each new run
CREATE OR REPLACE FUNCTION public.kb_update_source_reliability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_ok INTEGER;
BEGIN
  -- Only act when a run finishes
  IF NEW.finished_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Last successful fetch
  IF NEW.status = 'ok' THEN
    UPDATE public.kb_sources
    SET last_successful_fetch = NEW.finished_at
    WHERE id = NEW.source_id;
  END IF;

  -- Rolling reliability over the last 20 runs
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'ok')
  INTO v_total, v_ok
  FROM (
    SELECT status FROM public.kb_source_runs
    WHERE source_id = NEW.source_id AND finished_at IS NOT NULL
    ORDER BY started_at DESC LIMIT 20
  ) recent;

  IF v_total > 0 THEN
    UPDATE public.kb_sources
    SET reliability_score = ROUND((v_ok::numeric / v_total::numeric) * 100)
    WHERE id = NEW.source_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_kb_source_runs_reliability ON public.kb_source_runs;
CREATE TRIGGER trg_kb_source_runs_reliability
AFTER INSERT OR UPDATE OF finished_at, status ON public.kb_source_runs
FOR EACH ROW EXECUTE FUNCTION public.kb_update_source_reliability();

-- Backfill reliability + last_successful_fetch from existing runs
WITH agg AS (
  SELECT
    source_id,
    ROUND((COUNT(*) FILTER (WHERE status = 'ok')::numeric /
           NULLIF(COUNT(*),0)::numeric) * 100) AS score,
    MAX(finished_at) FILTER (WHERE status = 'ok') AS last_ok
  FROM (
    SELECT source_id, status, finished_at,
           ROW_NUMBER() OVER (PARTITION BY source_id ORDER BY started_at DESC) AS rn
    FROM public.kb_source_runs
    WHERE finished_at IS NOT NULL
  ) r
  WHERE rn <= 20
  GROUP BY source_id
)
UPDATE public.kb_sources s
SET reliability_score = COALESCE(s.reliability_score, agg.score::INTEGER),
    last_successful_fetch = COALESCE(s.last_successful_fetch, agg.last_ok)
FROM agg
WHERE s.id = agg.source_id;
