-- Durable Builder/Office job events + receipt kinds.
-- Extends the existing do_* Office schema rather than inventing a parallel job database.
-- Builder jobs continue to live as do_agents rows (primitive 'build') with BuilderJob in spec.

BEGIN;

-- Allow Builder DO as a first-class Office agent identity.
ALTER TABLE public.do_agents
  DROP CONSTRAINT IF EXISTS do_agents_primitive_check;
ALTER TABLE public.do_agents
  ADD CONSTRAINT do_agents_primitive_check
  CHECK (primitive IN ('watch', 'find', 'extract', 'prepare', 'compare', 'build'));

-- Distinguish acceptance/planning receipts from execution outcomes.
-- Never mint build_succeeded / proved receipts from plan-only actions in application code.
ALTER TABLE public.do_receipts
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'note'
    CHECK (kind IN (
      'note',
      'job_accepted',
      'handoff_prepared',
      'event',
      'needs_you',
      'build_succeeded',
      'proved'
    ));

ALTER TABLE public.do_receipts
  ADD COLUMN IF NOT EXISTS idempotency_key text;

CREATE UNIQUE INDEX IF NOT EXISTS do_receipts_owner_idempotency_uidx
  ON public.do_receipts (owner_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Idempotent job lifecycle events (client event_id unique per owner).
CREATE TABLE IF NOT EXISTS public.do_job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.do_workspaces (id) ON DELETE CASCADE,
  do_agent_id uuid REFERENCES public.do_agents (id) ON DELETE SET NULL,
  event_id text NOT NULL,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_job_events_event_id_len CHECK (char_length(event_id) BETWEEN 8 AND 128),
  CONSTRAINT do_job_events_kind_len CHECK (char_length(kind) BETWEEN 1 AND 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS do_job_events_owner_event_uidx
  ON public.do_job_events (owner_id, event_id);

CREATE INDEX IF NOT EXISTS do_job_events_agent_recent_idx
  ON public.do_job_events (do_agent_id, created_at DESC);

ALTER TABLE public.do_job_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS do_job_events_owner ON public.do_job_events;
CREATE POLICY do_job_events_owner ON public.do_job_events
  FOR ALL TO authenticated
  USING (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_job_events.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents event_agent
        WHERE event_agent.id = do_job_events.do_agent_id
          AND event_agent.owner_id = auth.uid()
          AND event_agent.workspace_id = do_job_events.workspace_id
      )
    )
  )
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.do_workspaces workspace
      WHERE workspace.id = do_job_events.workspace_id
        AND workspace.owner_id = auth.uid()
    )
    AND (
      do_agent_id IS NULL OR EXISTS (
        SELECT 1 FROM public.do_agents event_agent
        WHERE event_agent.id = do_job_events.do_agent_id
          AND event_agent.owner_id = auth.uid()
          AND event_agent.workspace_id = do_job_events.workspace_id
      )
    )
  );

COMMIT;
