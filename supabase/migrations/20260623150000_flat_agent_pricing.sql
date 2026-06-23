-- Flat per-agent + bundle pricing.
--
-- Two changes on top of the agent-marketplace foundation (20260623120000):
--
--   1. agent_installs.plan now accepts the flat ladder's plan ids
--      (per_agent / bundle_5 / bundle_10 / bundle_20 / all_access). The legacy
--      buckets (free/freemium/paid) stay allowed so any existing rows + subs
--      keep working. The webhook writes the concrete plan id; an all-access
--      install is a single row with agent_slug = '*'.
--
--   2. agent_chat_sessions becomes the free-tier counter: the first 3 messages
--      per agent are free, then the paywall. The counter is keyed to either a
--      signed-in user (user_id) OR an anonymous device cookie (anon_id) so the
--      3 free messages work before sign-up. Exactly one identity is set per row,
--      enforced by a CHECK, and there is one counter row per (identity, agent).

BEGIN;

-- ── 1. agent_installs plan ladder ─────────────────────────────────────────
ALTER TABLE public.agent_installs DROP CONSTRAINT IF EXISTS agent_installs_plan_check;
ALTER TABLE public.agent_installs
  ADD CONSTRAINT agent_installs_plan_check CHECK (
    plan IN (
      'free', 'freemium', 'paid',                 -- legacy buckets (kept for old rows/subs)
      'per_agent', 'bundle_5', 'bundle_10', 'bundle_20', 'all_access'
    )
  );

-- ── 2. agent_chat_sessions free-tier counter ──────────────────────────────
ALTER TABLE public.agent_chat_sessions
  ADD COLUMN IF NOT EXISTS free_message_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.agent_chat_sessions
  ADD COLUMN IF NOT EXISTS anon_id text;

-- A counter row can belong to a signed-in user OR an anonymous device, so
-- user_id is no longer required.
ALTER TABLE public.agent_chat_sessions ALTER COLUMN user_id DROP NOT NULL;

-- Exactly one identity must be present.
ALTER TABLE public.agent_chat_sessions
  DROP CONSTRAINT IF EXISTS agent_chat_sessions_identity_present;
ALTER TABLE public.agent_chat_sessions
  ADD CONSTRAINT agent_chat_sessions_identity_present
  CHECK (user_id IS NOT NULL OR anon_id IS NOT NULL);

-- One counter row per (identity, agent). Partial uniques so the two identity
-- kinds never collide and NULLs don't count.
CREATE UNIQUE INDEX IF NOT EXISTS agent_chat_sessions_user_agent_uniq
  ON public.agent_chat_sessions (user_id, agent_slug) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS agent_chat_sessions_anon_agent_uniq
  ON public.agent_chat_sessions (anon_id, agent_slug) WHERE anon_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_chat_sessions_anon_idx
  ON public.agent_chat_sessions (anon_id) WHERE anon_id IS NOT NULL;

COMMIT;

-- Verification:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.agent_installs'::regclass;
-- \d+ public.agent_chat_sessions  -- free_message_count + anon_id present, user_id nullable
-- Anonymous counter rows (user_id IS NULL) are written only by the service role;
-- the owner RLS policy (user_id = auth.uid()) never matches them.
