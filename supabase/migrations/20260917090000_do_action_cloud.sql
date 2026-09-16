-- DO Action Cloud Phase 1 — contract core persistence.
--
-- Tables:
--   do_action_runs      prepare/execute lifecycle
--   do_permits          short-lived authority
--   do_waits            durable waiters
--   do_action_receipts  append-only Action Contract receipts
--
-- Naming note: public.do_receipts already exists for DO Office/Builder evidence.
-- Action Cloud receipts intentionally live in do_action_receipts to avoid
-- colliding with Office schema (see 20260916090000_do_office_persistence.sql).
--
-- Phase 1 runtime uses an in-process memory store for demos/tests; these tables
-- are the durable schema for staging/prod when Action Cloud exits "not live".
-- API routes must not claim live production Action Cloud until Phase exit criteria.

BEGIN;

CREATE TABLE IF NOT EXISTS public.do_action_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id text NOT NULL UNIQUE,
  prep_id text NOT NULL UNIQUE,
  action_name text NOT NULL,
  namespace text NOT NULL DEFAULT 'demo',
  tenant_id text NOT NULL,
  agent_id text,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  args jsonb NOT NULL DEFAULT '{}'::jsonb,
  args_hash text NOT NULL,
  idempotency_key text,
  stage text NOT NULL,
  status text NOT NULL,
  risk_class text NOT NULL DEFAULT 'low'
    CHECK (risk_class IN ('low', 'medium', 'high', 'critical')),
  result jsonb,
  verify jsonb,
  stage_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  permit_id text,
  receipt_id text,
  wait_id text,
  reached_execute boolean NOT NULL DEFAULT false,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_action_runs_action_id_len CHECK (char_length(action_id) BETWEEN 8 AND 64),
  CONSTRAINT do_action_runs_prep_id_len CHECK (char_length(prep_id) BETWEEN 8 AND 64),
  CONSTRAINT do_action_runs_idempotency_len CHECK (
    idempotency_key IS NULL OR char_length(idempotency_key) BETWEEN 8 AND 128
  ),
  CONSTRAINT do_action_runs_stage_len CHECK (char_length(stage) BETWEEN 1 AND 32),
  CONSTRAINT do_action_runs_status_len CHECK (char_length(status) BETWEEN 1 AND 32)
);

CREATE UNIQUE INDEX IF NOT EXISTS do_action_runs_tenant_idempotency_uidx
  ON public.do_action_runs (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS do_action_runs_tenant_recent_idx
  ON public.do_action_runs (tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS do_action_runs_owner_recent_idx
  ON public.do_action_runs (owner_id, updated_at DESC)
  WHERE owner_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.do_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_id text NOT NULL UNIQUE,
  prep_id text NOT NULL,
  action_id text NOT NULL,
  tenant_id text NOT NULL,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  args_hash text NOT NULL,
  max_uses integer NOT NULL DEFAULT 1 CHECK (max_uses >= 1 AND max_uses <= 100),
  uses integer NOT NULL DEFAULT 0 CHECK (uses >= 0),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_permits_permit_id_len CHECK (char_length(permit_id) BETWEEN 8 AND 64),
  CONSTRAINT do_permits_uses_lte_max CHECK (uses <= max_uses)
);

CREATE INDEX IF NOT EXISTS do_permits_prep_idx
  ON public.do_permits (prep_id);

CREATE INDEX IF NOT EXISTS do_permits_action_idx
  ON public.do_permits (action_id);

CREATE INDEX IF NOT EXISTS do_permits_tenant_expires_idx
  ON public.do_permits (tenant_id, expires_at);

CREATE TABLE IF NOT EXISTS public.do_waits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wait_id text NOT NULL UNIQUE,
  action_id text NOT NULL,
  tenant_id text NOT NULL,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'timed_out')),
  timeout_at timestamptz NOT NULL,
  resolved_at timestamptz,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_waits_wait_id_len CHECK (char_length(wait_id) BETWEEN 8 AND 64),
  CONSTRAINT do_waits_kind_len CHECK (char_length(kind) BETWEEN 1 AND 64)
);

CREATE INDEX IF NOT EXISTS do_waits_action_idx
  ON public.do_waits (action_id, created_at DESC);

CREATE INDEX IF NOT EXISTS do_waits_pending_timeout_idx
  ON public.do_waits (timeout_at)
  WHERE status = 'pending';

-- Append-only Action Contract receipts (distinct from Office do_receipts).
CREATE TABLE IF NOT EXISTS public.do_action_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id text NOT NULL UNIQUE,
  action_id text NOT NULL,
  permit_id text,
  tenant_id text NOT NULL,
  owner_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  args_hash text NOT NULL,
  result_digest text NOT NULL,
  stage_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  actor jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_action_receipts_receipt_id_len CHECK (char_length(receipt_id) BETWEEN 8 AND 64)
);

-- One receipt row per action in Phase 1 (fetch-by-action_id).
CREATE UNIQUE INDEX IF NOT EXISTS do_action_receipts_action_uidx
  ON public.do_action_receipts (action_id);

CREATE INDEX IF NOT EXISTS do_action_receipts_tenant_recent_idx
  ON public.do_action_receipts (tenant_id, created_at DESC);

-- RLS: owner-scoped when owner_id is set (aligns with Office do_* pattern).
-- Rows with owner_id IS NULL are service-role only (agent/API path).
ALTER TABLE public.do_action_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_waits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_action_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS do_action_runs_owner ON public.do_action_runs;
CREATE POLICY do_action_runs_owner ON public.do_action_runs
  FOR ALL TO authenticated
  USING (owner_id IS NOT NULL AND owner_id = auth.uid())
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS do_permits_owner ON public.do_permits;
CREATE POLICY do_permits_owner ON public.do_permits
  FOR ALL TO authenticated
  USING (owner_id IS NOT NULL AND owner_id = auth.uid())
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS do_waits_owner ON public.do_waits;
CREATE POLICY do_waits_owner ON public.do_waits
  FOR ALL TO authenticated
  USING (owner_id IS NOT NULL AND owner_id = auth.uid())
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

-- Append-only: authenticated owners may INSERT + SELECT, never UPDATE/DELETE via RLS.
DROP POLICY IF EXISTS do_action_receipts_owner_select ON public.do_action_receipts;
CREATE POLICY do_action_receipts_owner_select ON public.do_action_receipts
  FOR SELECT TO authenticated
  USING (owner_id IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS do_action_receipts_owner_insert ON public.do_action_receipts;
CREATE POLICY do_action_receipts_owner_insert ON public.do_action_receipts
  FOR INSERT TO authenticated
  WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid());

COMMIT;

-- Verification after deployment:
-- select stage, count(*) from public.do_action_runs group by stage;
-- select status, count(*) from public.do_permits group by (revoked_at is not null);
-- authenticated users only see rows where owner_id = auth.uid();
-- do_action_receipts has no UPDATE/DELETE policies for authenticated.
