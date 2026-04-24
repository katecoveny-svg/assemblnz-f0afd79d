-- ============================================================
-- AGENT WIRING — CONSOLIDATION & END-TO-END FIX
-- ============================================================
-- 1. Consolidate duplicate agents that exist in two packs
-- 2. Migrate retired pack name 'hanga' → canonical 'waihanga'
-- 3. Normalise every model_preference to include provider prefix
-- 4. Backfill agent_status row for every active agent (online by default)
-- 5. Ensure single unique row per (lower(agent_name)) for routing
-- ============================================================

-- ---- 1. CONSOLIDATE DUPLICATES ------------------------------
-- Strategy: deactivate the legacy/duplicate copy, keep the row whose
-- pack matches the canonical kete name.

-- arai: keep pack='hanga' (will be renamed to waihanga below — Ārai is Construction Safety)
UPDATE public.agent_prompts SET is_active = false
  WHERE agent_name = 'arai' AND pack = 'safety';

-- kaupapa: keep pack='hanga' (Construction Strategy)
UPDATE public.agent_prompts SET is_active = false
  WHERE agent_name = 'kaupapa' AND pack = 'construction';

-- toro: keep pack='toro' (canonical kete slug)
UPDATE public.agent_prompts SET is_active = false
  WHERE agent_name = 'toro' AND pack = 'family';

-- waihanga: keep pack='waihanga' (industry kete), deactivate the 'hanga' copy
UPDATE public.agent_prompts SET is_active = false
  WHERE agent_name = 'waihanga' AND pack = 'hanga';

-- ---- 2. RENAME RETIRED PACK 'hanga' → 'waihanga' -----------
-- Per memory: HANGA → WAIHANGA migration. The construction kete pack ID is "waihanga".
-- We can't blanket-rename because waihanga rows already exist; only rename
-- rows that don't conflict.
UPDATE public.agent_prompts ap
   SET pack = 'waihanga'
 WHERE ap.pack = 'hanga'
   AND NOT EXISTS (
     SELECT 1 FROM public.agent_prompts ap2
     WHERE ap2.agent_name = ap.agent_name AND ap2.pack = 'waihanga'
   );

-- Any leftover (collision) hanga rows: deactivate them
UPDATE public.agent_prompts SET is_active = false WHERE pack = 'hanga';

-- ---- 3. NORMALISE MODEL PREFERENCES ------------------------
-- Add missing provider prefix so iho-router and model-router don't have to guess.
UPDATE public.agent_prompts
   SET model_preference = 'google/' || model_preference
 WHERE model_preference IS NOT NULL
   AND model_preference LIKE 'gemini-%'
   AND model_preference NOT LIKE '%/%';

UPDATE public.agent_prompts
   SET model_preference = 'anthropic/' || model_preference
 WHERE model_preference IS NOT NULL
   AND model_preference LIKE 'claude-%'
   AND model_preference NOT LIKE '%/%';

-- ---- 4. BACKFILL agent_status FOR EVERY ACTIVE AGENT --------
-- Every agent visible in the dashboard needs a status row.
INSERT INTO public.agent_status (agent_id, is_online, updated_at)
SELECT DISTINCT lower(ap.agent_name), true, now()
  FROM public.agent_prompts ap
 WHERE ap.is_active = true
ON CONFLICT (agent_id) DO UPDATE
  SET is_online = true,
      maintenance_message = NULL,
      updated_at = now();

-- ---- 5. UNIQUE-PER-AGENT-NAME GUARD (case-insensitive) -----
-- Critical for routing — we must never have two ACTIVE rows for the same
-- agent_name (regardless of pack). Project knowledge requires this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_prompts_active_name_lower
  ON public.agent_prompts (lower(agent_name))
  WHERE is_active = true;

-- ---- 6. updated_at TRIGGER on agent_prompts ----------------
DROP TRIGGER IF EXISTS trg_agent_prompts_updated_at ON public.agent_prompts;
CREATE TRIGGER trg_agent_prompts_updated_at
BEFORE UPDATE ON public.agent_prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_agent_status_updated_at ON public.agent_status;
CREATE TRIGGER trg_agent_status_updated_at
BEFORE UPDATE ON public.agent_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();