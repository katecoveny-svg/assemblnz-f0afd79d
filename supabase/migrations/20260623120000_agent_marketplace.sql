-- Agent marketplace foundation.
--
-- Backs the App Store-style pivot: users browse agents (/agents), chat with
-- them (/agents/[slug]/chat), install them as PWAs, and — in a follow-up — pay
-- per agent. This migration adds:
--
--   agents               public catalogue mirror (code registry in
--                        lib/marketplace/agents.ts is the source of truth; this
--                        table is for joins/analytics/admin and stays in sync
--                        via a follow-up sync job).
--   agent_installs       which agents a user has installed, on what plan.
--   agent_chat_sessions  one conversation thread per (user, agent).
--   agent_chat_messages  the turns within a session.
--
-- Agents are referenced by their stable text `slug` (matching the code
-- registry), NOT a uuid FK — so the per-user tables work without first seeding
-- the catalogue and never drift from code.
--
-- RLS: the catalogue is world-readable; installs/sessions/messages are strictly
-- owner-scoped (a user can only ever see or edit their own).

BEGIN;

-- ── Catalogue ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  te_reo text,
  description text,
  what_it_does jsonb NOT NULL DEFAULT '[]'::jsonb,
  what_you_get jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text,
  model_tier text NOT NULL DEFAULT 'mid' CHECK (model_tier IN ('cheap', 'mid', 'premium')),
  pricing_tier text NOT NULL DEFAULT 'free' CHECK (pricing_tier IN ('free', 'freemium', 'paid')),
  -- Locked system prompts live in server-side code; this column is reserved for
  -- future admin-managed prompts and MUST never be exposed via a public read.
  system_prompt text,
  avatar_url text,
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'draft', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agents_category_idx ON public.agents (category);
CREATE INDEX IF NOT EXISTS agents_status_idx ON public.agents (status);

-- ── Installs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_installs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_slug text NOT NULL,
  installed_at timestamptz NOT NULL DEFAULT now(),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'freemium', 'paid')),
  stripe_subscription_id text,
  UNIQUE (user_id, agent_slug)
);

CREATE INDEX IF NOT EXISTS agent_installs_user_idx ON public.agent_installs (user_id);

-- ── Chat sessions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  agent_slug text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_chat_sessions_user_idx ON public.agent_chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS agent_chat_sessions_agent_idx ON public.agent_chat_sessions (user_id, agent_slug);

-- ── Chat messages ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.agent_chat_sessions (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_chat_messages_session_idx
  ON public.agent_chat_messages (session_id, created_at);

-- ── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_chat_messages ENABLE ROW LEVEL SECURITY;

-- Catalogue: world-readable. Writes are service-role only (RLS denies all by
-- default; the service role bypasses RLS).
DROP POLICY IF EXISTS agents_select_all ON public.agents;
CREATE POLICY agents_select_all ON public.agents
  FOR SELECT TO anon, authenticated USING (true);

-- Installs: owner-scoped CRUD.
DROP POLICY IF EXISTS agent_installs_owner ON public.agent_installs;
CREATE POLICY agent_installs_owner ON public.agent_installs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sessions: owner-scoped CRUD.
DROP POLICY IF EXISTS agent_chat_sessions_owner ON public.agent_chat_sessions;
CREATE POLICY agent_chat_sessions_owner ON public.agent_chat_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: scoped through the owning session.
DROP POLICY IF EXISTS agent_chat_messages_owner ON public.agent_chat_messages;
CREATE POLICY agent_chat_messages_owner ON public.agent_chat_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_chat_sessions s
      WHERE s.id = agent_chat_messages.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_chat_sessions s
      WHERE s.id = agent_chat_messages.session_id AND s.user_id = auth.uid()
    )
  );

COMMIT;

-- Verification:
-- SELECT slug, name, pricing_tier, status FROM public.agents ORDER BY name;
-- A user can only ever read their own installs/sessions/messages (auth.uid()).
