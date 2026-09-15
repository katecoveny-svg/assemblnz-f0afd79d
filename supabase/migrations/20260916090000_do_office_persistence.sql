-- DO Office durable persistence.
--
-- Additive foundation for the current portable DO AgentSpec runtime.
-- This intentionally does NOT overload:
--   public.agents       (global marketplace/catalogue)
--   public.pilot_agents (legacy/user agent-maker drafts)
--   agent_email_*       (real provisioned email transport + audit)
--
-- DO Office stores user-owned workspaces, portable AgentSpec snapshots,
-- structured handoffs, and evidence receipts. A future mailbox link may point
-- at a genuinely provisioned agent-email identity; this migration never invents
-- or auto-provisions an email address.

BEGIN;

CREATE TABLE IF NOT EXISTS public.do_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'personal'
    CHECK (kind IN ('personal', 'work', 'client')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS do_workspaces_owner_idx
  ON public.do_workspaces (owner_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.do_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.do_workspaces (id) ON DELETE CASCADE,
  name text NOT NULL,
  primitive text NOT NULL
    CHECK (primitive IN ('watch', 'find', 'extract', 'prepare', 'compare')),
  status text NOT NULL DEFAULT 'working'
    CHECK (status IN ('needs_you', 'working', 'done')),
  -- Current portable AgentSpec. Keep structured fields above for indexing/UI;
  -- spec is the canonical DO payload and can evolve without table churn.
  spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Set only if this DO has been linked to a genuinely provisioned identity in
  -- the existing agent-email system. NULL does not mean "derive an address".
  mailbox_agent_slug text,
  mailbox_state text NOT NULL DEFAULT 'none'
    CHECK (mailbox_state IN ('none', 'proposed', 'provisioned', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS do_agents_owner_idx
  ON public.do_agents (owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS do_agents_workspace_status_idx
  ON public.do_agents (workspace_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.do_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.do_workspaces (id) ON DELETE CASCADE,
  from_do_agent_id uuid REFERENCES public.do_agents (id) ON DELETE SET NULL,
  to_do_agent_id uuid REFERENCES public.do_agents (id) ON DELETE SET NULL,
  kind text NOT NULL
    CHECK (kind IN ('handoff', 'update', 'question', 'approval', 'evidence')),
  summary text NOT NULL,
  task_id text,
  requested_action text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS do_handoffs_owner_recent_idx
  ON public.do_handoffs (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS do_handoffs_to_unread_idx
  ON public.do_handoffs (to_do_agent_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE TABLE IF NOT EXISTS public.do_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.do_workspaces (id) ON DELETE CASCADE,
  do_agent_id uuid REFERENCES public.do_agents (id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS do_receipts_owner_recent_idx
  ON public.do_receipts (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS do_receipts_agent_recent_idx
  ON public.do_receipts (do_agent_id, created_at DESC);

ALTER TABLE public.do_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS do_workspaces_owner ON public.do_workspaces;
CREATE POLICY do_workspaces_owner ON public.do_workspaces
  FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS do_agents_owner ON public.do_agents;
CREATE POLICY do_agents_owner ON public.do_agents
  FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_agents.workspace_id
        AND workspace.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_agents.workspace_id
        AND workspace.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS do_handoffs_owner ON public.do_handoffs;
CREATE POLICY do_handoffs_owner ON public.do_handoffs
  FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_handoffs.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      from_do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents source_agent
        WHERE source_agent.id = do_handoffs.from_do_agent_id
          AND source_agent.owner_id = auth.uid()
          AND source_agent.workspace_id = do_handoffs.workspace_id
      )
    )
    AND (
      to_do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents destination_agent
        WHERE destination_agent.id = do_handoffs.to_do_agent_id
          AND destination_agent.owner_id = auth.uid()
          AND destination_agent.workspace_id = do_handoffs.workspace_id
      )
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_handoffs.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      from_do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents source_agent
        WHERE source_agent.id = do_handoffs.from_do_agent_id
          AND source_agent.owner_id = auth.uid()
          AND source_agent.workspace_id = do_handoffs.workspace_id
      )
    )
    AND (
      to_do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents destination_agent
        WHERE destination_agent.id = do_handoffs.to_do_agent_id
          AND destination_agent.owner_id = auth.uid()
          AND destination_agent.workspace_id = do_handoffs.workspace_id
      )
    )
  );

DROP POLICY IF EXISTS do_receipts_owner ON public.do_receipts;
CREATE POLICY do_receipts_owner ON public.do_receipts
  FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_receipts.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents receipt_agent
        WHERE receipt_agent.id = do_receipts.do_agent_id
          AND receipt_agent.owner_id = auth.uid()
          AND receipt_agent.workspace_id = do_receipts.workspace_id
      )
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_receipts.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents receipt_agent
        WHERE receipt_agent.id = do_receipts.do_agent_id
          AND receipt_agent.owner_id = auth.uid()
          AND receipt_agent.workspace_id = do_receipts.workspace_id
      )
    )
  );

COMMIT;

-- Verification after deployment:
-- select kind, count(*) from public.do_workspaces group by kind;
-- select status, count(*) from public.do_agents group by status;
-- authenticated users should only see rows where owner_id = auth.uid().
