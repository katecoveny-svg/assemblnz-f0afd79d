-- Kaupapa Board — internal automation request marketplace
-- Per John Kim playbook adapted for assembl, 2026-05-13
-- Path A: internal rollout. Week 1: schema + seed.
--
-- Three tables:
--   1. public.kaupapa             — the marketplace of "I want a thing that does X" requests
--   2. public.kaupapa_completions — measured outcomes (4 weeks after ship)
--   3. public.adoption_metrics    — per-user weekly rollup for the 5-tier dashboard
--
-- RLS posture: kaupapa rows readable by all authenticated assembl-team members,
-- writable only by the requester or the named builder. Service role bypasses.
-- adoption_metrics is per-user readable, service-role only writeable.

BEGIN;

-- ── kaupapa (the request board) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kaupapa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  requested_by text NOT NULL,                 -- user email
  beneficiary text,                            -- who benefits (you, a kete, a customer)
  estimated_hours_saved_per_week numeric,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'shipped', 'archived')),
  built_by text,                               -- agent name (SPARK, ECHO, Cowork) or person
  xp_value int DEFAULT 0,                      -- time_saved * 10 + complexity bonus
  shipped_at timestamptz,
  proof_url text,                              -- link to the thing that got built
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kaupapa_status_idx ON public.kaupapa (status);
CREATE INDEX IF NOT EXISTS kaupapa_requested_by_idx ON public.kaupapa (requested_by);
CREATE INDEX IF NOT EXISTS kaupapa_built_by_idx ON public.kaupapa (built_by) WHERE built_by IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.kaupapa_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kaupapa_updated_at_trg ON public.kaupapa;
CREATE TRIGGER kaupapa_updated_at_trg
  BEFORE UPDATE ON public.kaupapa
  FOR EACH ROW EXECUTE FUNCTION public.kaupapa_set_updated_at();

-- ── kaupapa_completions (measured outcomes 4 weeks post-ship) ────────
CREATE TABLE IF NOT EXISTS public.kaupapa_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kaupapa_id uuid NOT NULL REFERENCES public.kaupapa(id) ON DELETE CASCADE,
  completed_by text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  hours_saved_actual numeric,                  -- measured after 4 weeks of real use
  notes text
);

CREATE INDEX IF NOT EXISTS kaupapa_completions_kaupapa_idx ON public.kaupapa_completions (kaupapa_id);

-- ── adoption_metrics (per-user weekly rollup) ────────────────────────
CREATE TABLE IF NOT EXISTS public.adoption_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  week_starting date NOT NULL,                  -- Monday of the week
  sessions_count int DEFAULT 0,                 -- Claude/Cowork sessions
  quests_submitted int DEFAULT 0,
  quests_shipped int DEFAULT 0,
  skills_used int DEFAULT 0,
  total_xp int DEFAULT 0,
  UNIQUE (user_email, week_starting)
);

CREATE INDEX IF NOT EXISTS adoption_metrics_user_idx ON public.adoption_metrics (user_email);
CREATE INDEX IF NOT EXISTS adoption_metrics_week_idx ON public.adoption_metrics (week_starting);

-- ── Tier resolver (the John Kim 5-tier system, te reo) ───────────────
-- Tier 1 Akoranga    1-10 sessions/month
-- Tier 2 Kaimahi    11-30
-- Tier 3 Tohunga    31-75
-- Tier 4 Rangatira  76-150
-- Tier 5 Pou        151+
CREATE OR REPLACE FUNCTION public.kaupapa_tier_for_sessions(sessions int)
RETURNS text AS $$
BEGIN
  IF sessions IS NULL OR sessions < 1 THEN RETURN NULL;
  ELSIF sessions <= 10 THEN RETURN 'akoranga';
  ELSIF sessions <= 30 THEN RETURN 'kaimahi';
  ELSIF sessions <= 75 THEN RETURN 'tohunga';
  ELSIF sessions <= 150 THEN RETURN 'rangatira';
  ELSE RETURN 'pou';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── RLS policies ─────────────────────────────────────────────────────
ALTER TABLE public.kaupapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kaupapa_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adoption_metrics ENABLE ROW LEVEL SECURITY;

-- kaupapa: all team members can read; only requester or builder can update
DROP POLICY IF EXISTS kaupapa_read_team ON public.kaupapa;
CREATE POLICY kaupapa_read_team ON public.kaupapa
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kaupapa_insert_own ON public.kaupapa;
CREATE POLICY kaupapa_insert_own ON public.kaupapa
  FOR INSERT TO authenticated WITH CHECK (auth.email() = requested_by);

DROP POLICY IF EXISTS kaupapa_update_own_or_builder ON public.kaupapa;
CREATE POLICY kaupapa_update_own_or_builder ON public.kaupapa
  FOR UPDATE TO authenticated USING (
    auth.email() = requested_by OR auth.email() = built_by
  );

-- kaupapa_completions: readable by team, insert only by completer
DROP POLICY IF EXISTS kaupapa_completions_read_team ON public.kaupapa_completions;
CREATE POLICY kaupapa_completions_read_team ON public.kaupapa_completions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS kaupapa_completions_insert_own ON public.kaupapa_completions;
CREATE POLICY kaupapa_completions_insert_own ON public.kaupapa_completions
  FOR INSERT TO authenticated WITH CHECK (auth.email() = completed_by);

-- adoption_metrics: read your own row only; service role writes
DROP POLICY IF EXISTS adoption_metrics_read_own ON public.adoption_metrics;
CREATE POLICY adoption_metrics_read_own ON public.adoption_metrics
  FOR SELECT TO authenticated USING (auth.email() = user_email);

-- ── Seed: 5 starter kaupapa from today's session ─────────────────────
INSERT INTO public.kaupapa (title, description, requested_by, beneficiary, estimated_hours_saved_per_week, risk_level, status, built_by, xp_value, shipped_at, proof_url)
VALUES
  (
    'Apply audit_log Fix 1 (held-back migrations)',
    'Apply 20260508000000_assembl_audit_log.sql + hardening migration to wurwcrgxjjwqdaxqceey. Pure DDL, ~15min, unblocks Sacred Heart pilot path.',
    'kate@assembl.co.nz', 'all kete agents', 0, 'medium', 'open', NULL, 50, NULL, NULL
  ),
  (
    'Wire chat/index.ts to fire-and-forget /functions/v1/ta call',
    'After LLM response in chat/index.ts, add non-blocking fetch to ta with requestId/userId/kete/payload. Feature-flag ENABLE_AUDIT_PIPELINE. Populates pipeline_audit_logs.',
    'kate@assembl.co.nz', 'all kete agents', 1, 'high', 'open', NULL, 150, NULL, NULL
  ),
  (
    'Cleanup lockfile drift (npm vs pnpm)',
    'Both package-lock.json and pnpm-lock.yaml exist. Pick one. Cowork.',
    'kate@assembl.co.nz', 'developer experience', 0, 'low', 'open', NULL, 20, NULL, NULL
  ),
  (
    'Tōro page architecture-led restoration',
    'Current /kete/toro is commercial 3-plugin framing. Locked Q3 decision was architecture-led "family AI team" 9-specialist version per Reo PR #135. Restore or formally decide commercial framing replaces canon.',
    'kate@assembl.co.nz', 'site visitors / brand canon', 0, 'low', 'open', NULL, 30, NULL, NULL
  ),
  (
    'Subbie-compliance-scanner edge function deploy',
    'Only audit-named edge function missing from prods 163. Locate source in repo and deploy.',
    'kate@assembl.co.nz', 'waihanga kete', 0, 'low', 'open', NULL, 20, NULL, NULL
  );

COMMIT;

-- Verification:
-- SELECT title, status, risk_level, xp_value FROM kaupapa ORDER BY created_at;
-- SELECT count(*) FROM kaupapa;  -- expect 5
