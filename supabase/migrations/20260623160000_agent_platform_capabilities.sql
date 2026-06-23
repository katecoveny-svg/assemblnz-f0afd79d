-- Agent platform capabilities — tools, memory, consent, handoffs, ambient mode,
-- and the model/skill free-fallback ladder.
--
-- Builds on the marketplace foundation (20260623120000) + catalogue columns
-- (20260623140050). Adds the cross-cutting capability tables every agent uses,
-- and three catalogue columns for the per-agent tool/skill/fallback config.
--
-- SELF-HEALING by design. The canonical project carries tables from parallel
-- builds, so `CREATE TABLE IF NOT EXISTS` can silently no-op against a
-- pre-existing table with a narrower shape (cf. the public.leads collision).
-- Every table is therefore created IF NOT EXISTS *and then* each column is
-- ensured with ADD COLUMN IF NOT EXISTS, so indexes/policies never reference a
-- missing column whether the table is fresh or pre-existing.
--
-- Reference convention: the original per-user tables (agent_installs,
-- agent_chat_sessions, agent_chat_messages) key agents by stable text
-- `agent_slug`. These NEW tables key by `agent_id uuid` → public.agents(id),
-- per the locked spec — safe now that the catalogue is seeded with stable ids.
--
-- RLS is enforced from day one: every per-user row is owner-scoped
-- (user_id = auth.uid()); the two telemetry tables are owner-readable and
-- written only by the service role.

BEGIN;

-- ── Catalogue: per-agent capability config ───────────────────────────────
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fallback_models jsonb NOT NULL DEFAULT '[]'::jsonb;

-- tools + skills are marketable capabilities → public-readable. fallback_models
-- is infra → stays server-only (NOT granted), like system_prompt (140050).
GRANT SELECT (tools, skills) ON public.agents TO anon, authenticated;

-- ── Per-agent memory (per-user × per-agent, opt-in cross-agent share) ─────
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  scope text NOT NULL DEFAULT 'personal',
  created_at timestamptz NOT NULL DEFAULT now(),
  redacted_at timestamptz
);
ALTER TABLE public.agent_memory
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS value jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS redacted_at timestamptz;
-- 'personal' = visible only to this agent; 'shared' = readable by the user's
-- other agents when they opt in (enforced in app code, still owner-scoped).
ALTER TABLE public.agent_memory DROP CONSTRAINT IF EXISTS agent_memory_scope_check;
ALTER TABLE public.agent_memory
  ADD CONSTRAINT agent_memory_scope_check CHECK (scope IN ('personal', 'shared'));
DROP INDEX IF EXISTS agent_memory_user_agent_key_uniq;
CREATE UNIQUE INDEX IF NOT EXISTS agent_memory_user_agent_key_uniq
  ON public.agent_memory (user_id, agent_id, key);
CREATE INDEX IF NOT EXISTS agent_memory_user_agent_idx
  ON public.agent_memory (user_id, agent_id);

-- ── Tool consents (IPP 3A acknowledgement per tool) ──────────────────────
CREATE TABLE IF NOT EXISTS public.agent_tool_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  ipp3a_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_tool_consents
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS tool_id text,
  ADD COLUMN IF NOT EXISTS ipp3a_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS agent_tool_consents_uniq
  ON public.agent_tool_consents (user_id, agent_id, tool_id);
CREATE INDEX IF NOT EXISTS agent_tool_consents_user_idx
  ON public.agent_tool_consents (user_id, agent_id);

-- ── Multi-agent handoffs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- user_id added beyond the bare spec so handoffs are owner-scoped under RLS.
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  from_agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  to_agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_handoffs
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS from_agent_id uuid,
  ADD COLUMN IF NOT EXISTS to_agent_id uuid,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.agent_handoffs DROP CONSTRAINT IF EXISTS agent_handoffs_status_check;
ALTER TABLE public.agent_handoffs
  ADD CONSTRAINT agent_handoffs_status_check
  CHECK (status IN ('pending', 'accepted', 'completed', 'rejected', 'failed'));
CREATE INDEX IF NOT EXISTS agent_handoffs_user_idx ON public.agent_handoffs (user_id);
CREATE INDEX IF NOT EXISTS agent_handoffs_status_idx
  ON public.agent_handoffs (user_id, status);

-- ── Ambient (proactive) subscriptions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ambient_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents (id) ON DELETE CASCADE,
  channel text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ambient_subscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS channel text,
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.ambient_subscriptions DROP CONSTRAINT IF EXISTS ambient_subscriptions_channel_check;
ALTER TABLE public.ambient_subscriptions
  ADD CONSTRAINT ambient_subscriptions_channel_check
  CHECK (channel IN ('push', 'sms', 'email', 'slack', 'whatsapp'));
CREATE UNIQUE INDEX IF NOT EXISTS ambient_subscriptions_uniq
  ON public.ambient_subscriptions (user_id, agent_id, channel);

-- ── Fallback telemetry (model + skill) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.model_fallback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents (id) ON DELETE SET NULL,
  primary_model text,
  fallback_model text,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.model_fallback_events
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS primary_model text,
  ADD COLUMN IF NOT EXISTS fallback_model text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS occurred_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS model_fallback_events_agent_idx
  ON public.model_fallback_events (agent_id, occurred_at);
CREATE INDEX IF NOT EXISTS model_fallback_events_user_idx
  ON public.model_fallback_events (user_id, occurred_at);

CREATE TABLE IF NOT EXISTS public.skill_fallback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.agents (id) ON DELETE SET NULL,
  primary_skill text,
  fallback_skill text,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_fallback_events
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS agent_id uuid,
  ADD COLUMN IF NOT EXISTS primary_skill text,
  ADD COLUMN IF NOT EXISTS fallback_skill text,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS occurred_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS skill_fallback_events_agent_idx
  ON public.skill_fallback_events (agent_id, occurred_at);
CREATE INDEX IF NOT EXISTS skill_fallback_events_user_idx
  ON public.skill_fallback_events (user_id, occurred_at);

-- ── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tool_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_fallback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_fallback_events ENABLE ROW LEVEL SECURITY;

-- Per-user tables: full owner-scoped CRUD.
DROP POLICY IF EXISTS agent_memory_owner ON public.agent_memory;
CREATE POLICY agent_memory_owner ON public.agent_memory
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS agent_tool_consents_owner ON public.agent_tool_consents;
CREATE POLICY agent_tool_consents_owner ON public.agent_tool_consents
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS agent_handoffs_owner ON public.agent_handoffs;
CREATE POLICY agent_handoffs_owner ON public.agent_handoffs
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ambient_subscriptions_owner ON public.ambient_subscriptions;
CREATE POLICY ambient_subscriptions_owner ON public.ambient_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Telemetry: owner may READ their own events; writes are service-role only
-- (the router logs from the server). No INSERT/UPDATE policy → RLS denies
-- authenticated/anon writes; the service role bypasses RLS.
DROP POLICY IF EXISTS model_fallback_events_owner_read ON public.model_fallback_events;
CREATE POLICY model_fallback_events_owner_read ON public.model_fallback_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS skill_fallback_events_owner_read ON public.skill_fallback_events;
CREATE POLICY skill_fallback_events_owner_read ON public.skill_fallback_events
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMIT;
