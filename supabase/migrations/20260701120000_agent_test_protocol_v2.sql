-- ============================================================================
-- Phase 1C — Testing protocol V2 (restore + generalise)
--
-- Restores the lost V1 test-result schema (agent_test_results, originally
-- migration 20260408234521) and migrates it forward to the V2 five-axis rubric
-- described in BUNDLES-V4-SPEC-2026-06-29.pdf §7:
--   * scenario_id                — links a result to a scenario pack entry
--   * rubric_factuality/_nz_accuracy/_tone/_hard_rules/_route + tikanga_gate
--   * bundle                     — generalises the construction-only `kete`
--   * manual-override fields      — reviewer + reason + timestamp (admin only)
--
-- Fully idempotent + fresh-apply safe: the table may or may not already exist
-- on prod (it was dropped by the v3 migrations), so every step guards itself.
-- Nothing here drops data.
-- ============================================================================

-- 1. Base table (V1 shape) — create only if it was lost.
CREATE TABLE IF NOT EXISTS public.agent_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kete text,
  agent_slug text NOT NULL DEFAULT 'unknown',
  prompt text,
  response text,
  verdict_kahu text DEFAULT 'pending',
  verdict_iho text DEFAULT 'pending',
  verdict_ta text DEFAULT 'pending',
  verdict_mahara text DEFAULT 'pending',
  verdict_mana text DEFAULT 'pending',
  overall_verdict text DEFAULT 'pending',
  audit_entry jsonb DEFAULT '{}'::jsonb,
  run_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Migrate forward — add the V2 columns (each guarded).
ALTER TABLE public.agent_test_results
  ADD COLUMN IF NOT EXISTS bundle text,
  ADD COLUMN IF NOT EXISTS scenario_id text,
  ADD COLUMN IF NOT EXISTS chosen_route text,
  ADD COLUMN IF NOT EXISTS rubric_factuality smallint,
  ADD COLUMN IF NOT EXISTS rubric_nz_accuracy smallint,
  ADD COLUMN IF NOT EXISTS rubric_tone smallint,
  ADD COLUMN IF NOT EXISTS rubric_hard_rules boolean,
  ADD COLUMN IF NOT EXISTS rubric_route boolean,
  ADD COLUMN IF NOT EXISTS tikanga_gate boolean,
  ADD COLUMN IF NOT EXISTS passed boolean,
  ADD COLUMN IF NOT EXISTS override_by uuid,
  ADD COLUMN IF NOT EXISTS override_reason text,
  ADD COLUMN IF NOT EXISTS overridden_at timestamptz;

-- The V1 table declared `kete NOT NULL CHECK (kete IN (...construction ketes))`.
-- V2 is bundle-first, so relax both so non-construction bundles can be stored.
ALTER TABLE public.agent_test_results ALTER COLUMN kete DROP NOT NULL;
DO $$
DECLARE con text;
BEGIN
  SELECT conname INTO con
  FROM pg_constraint
  WHERE conrelid = 'public.agent_test_results'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%kete%';
  IF con IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.agent_test_results DROP CONSTRAINT %I', con);
  END IF;
END $$;

-- Backfill bundle from kete for any legacy rows.
UPDATE public.agent_test_results
SET bundle = lower(kete)
WHERE bundle IS NULL AND kete IS NOT NULL;

ALTER TABLE public.agent_test_results ENABLE ROW LEVEL SECURITY;

-- Recreate policies idempotently.
DROP POLICY IF EXISTS "Authenticated users can read test results" ON public.agent_test_results;
CREATE POLICY "Authenticated users can read test results"
  ON public.agent_test_results FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Service role can insert test results" ON public.agent_test_results;
CREATE POLICY "Service role can insert test results"
  ON public.agent_test_results FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update test results" ON public.agent_test_results;
CREATE POLICY "Service role can update test results"
  ON public.agent_test_results FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_agent_test_results_bundle ON public.agent_test_results (bundle);
CREATE INDEX IF NOT EXISTS idx_agent_test_results_scenario ON public.agent_test_results (scenario_id);
CREATE INDEX IF NOT EXISTS idx_agent_test_results_created ON public.agent_test_results (created_at DESC);

-- 3. Scenario registry — the on-disk packs (tests/agents/*.json) are the source
--    of truth; this table is the seeded mirror the runner + admin UI read.
--    Seeded by scripts/seed-agent-scenarios.ts (upsert on scenario_id).
CREATE TABLE IF NOT EXISTS public.agent_test_scenarios (
  scenario_id text PRIMARY KEY,
  bundle text NOT NULL,
  kind text NOT NULL,
  input text NOT NULL,
  expected_route text NOT NULL,
  seed integer NOT NULL DEFAULT 0,
  definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  version text NOT NULL DEFAULT '2.0.0',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_test_scenarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read scenarios" ON public.agent_test_scenarios;
CREATE POLICY "Authenticated users can read scenarios"
  ON public.agent_test_scenarios FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role can write scenarios" ON public.agent_test_scenarios;
CREATE POLICY "Service role can write scenarios"
  ON public.agent_test_scenarios FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_agent_test_scenarios_bundle ON public.agent_test_scenarios (bundle);

COMMENT ON TABLE public.agent_test_results IS
  'Phase 1C testing protocol V2 — five-axis rubric results per scenario run. Manual overrides require admin + a logged rationale (override_by/override_reason/overridden_at); an override never bypasses tikanga_gate.';
COMMENT ON TABLE public.agent_test_scenarios IS
  'Seeded mirror of tests/agents/*.json (source of truth on disk). Synced by scripts/seed-agent-scenarios.ts.';
