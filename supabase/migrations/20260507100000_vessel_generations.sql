-- ════════════════════════════════════════════════════════════════════
-- vessel_generations + vessel_generate_logs (additive, idempotent)
-- ════════════════════════════════════════════════════════════════════
-- Backs the live `vessel-generate` Edge Function (deployed on main as
-- of 2026-05-07). The function itself is a stateless image-gen proxy
-- (Fal.ai / OpenAI), authed by VESSEL_STUDIO_SHARED_SECRET — it does
-- not write to the database. These tables let the in-app vessel /
-- image studio persist generations against the signed-in user, and
-- give us a place to record provider spend.
--
-- Tables:
--   public.vessel_generations    — owner-scoped (auth.uid() = user_id)
--   public.vessel_generate_logs  — service_role insert + service_role read
--
-- Owner-policy style follows the existing pattern (helm_sms_*,
-- agent_sms_*, daily_messages, profiles): quoted descriptive policy
-- names, four discrete policies per CRUD verb, DROP IF EXISTS guards
-- so re-runs are safe.
-- ════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────
-- Table: vessel_generations
-- One row per successful generation persisted from the in-app studio.
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vessel_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  studio TEXT NOT NULL CHECK (studio IN ('vessel', 'image')),
  preset_key TEXT NOT NULL,
  preset_label TEXT NOT NULL,
  prompt_full TEXT NOT NULL,
  prompt_to_provider TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  variants INTEGER NOT NULL DEFAULT 1 CHECK (variants BETWEEN 1 AND 4),
  model TEXT NOT NULL CHECK (model IN ('flux', 'openai')),
  reference_image_url TEXT,
  anchor_strength NUMERIC(3,2) CHECK (
    anchor_strength IS NULL
    OR (anchor_strength >= 0 AND anchor_strength <= 1)
  ),
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  size_exports JSONB NOT NULL DEFAULT '[]'::jsonb,
  cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vessel_generations_user_id_idx
  ON public.vessel_generations (user_id);

CREATE INDEX IF NOT EXISTS vessel_generations_generated_at_idx
  ON public.vessel_generations (generated_at DESC);

CREATE INDEX IF NOT EXISTS vessel_generations_studio_idx
  ON public.vessel_generations (studio);

ALTER TABLE public.vessel_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own generations" ON public.vessel_generations;
CREATE POLICY "Users can view their own generations"
  ON public.vessel_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own generations" ON public.vessel_generations;
CREATE POLICY "Users can insert their own generations"
  ON public.vessel_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own generations" ON public.vessel_generations;
CREATE POLICY "Users can update their own generations"
  ON public.vessel_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own generations" ON public.vessel_generations;
CREATE POLICY "Users can delete their own generations"
  ON public.vessel_generations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────
-- Table: vessel_generate_logs
-- Provider call log for spend tracking. Edge Function writes via
-- service key once logging is wired up (function does not log today).
-- user_id is nullable so we can still log even if the calling client
-- couldn't be resolved to an auth user (server-to-server use).
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vessel_generate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  variants INTEGER NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL,
  status_code INTEGER NOT NULL,
  error_message TEXT,
  called_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vessel_generate_logs_called_at_idx
  ON public.vessel_generate_logs (called_at DESC);

CREATE INDEX IF NOT EXISTS vessel_generate_logs_user_id_idx
  ON public.vessel_generate_logs (user_id);

ALTER TABLE public.vessel_generate_logs ENABLE ROW LEVEL SECURITY;

-- Service-role-only insert (Edge Function will write via service key).
DROP POLICY IF EXISTS "Service role can insert logs" ON public.vessel_generate_logs;
CREATE POLICY "Service role can insert logs"
  ON public.vessel_generate_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service-role read (no clean global "admin" signal in this schema —
-- profiles has no role column, user_roles enum is free/starter/pro/
-- business, and tenant_members.role='admin' is tenant-scoped not
-- global). Reads are scoped to service_role for now; refine to a real
-- admin policy when an admin signal is introduced.
DROP POLICY IF EXISTS "Service role can read logs" ON public.vessel_generate_logs;
CREATE POLICY "Service role can read logs"
  ON public.vessel_generate_logs FOR SELECT
  TO service_role
  USING (true);

-- ════════════════════════════════════════════════════════════════════
-- End of migration. Apply via Kate's usual Supabase flow once
-- approved — do NOT push from CI / agent context.
-- ════════════════════════════════════════════════════════════════════
