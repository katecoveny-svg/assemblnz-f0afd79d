-- Agent-paid tool keys, daily spend, and receipts.
-- Production path for lib/tools store when SUPABASE_SERVICE_ROLE_KEY is set.
-- Preview/local may use process-memory instead (see docs/ENVIRONMENT.md).

BEGIN;

CREATE TABLE IF NOT EXISTS public.assembl_tool_keys (
  id text PRIMARY KEY,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  label text NOT NULL DEFAULT '',
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  daily_cap_cents integer NOT NULL DEFAULT 100,
  unit_cost_cents integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.assembl_tool_spend (
  key_id text NOT NULL REFERENCES public.assembl_tool_keys (id) ON DELETE CASCADE,
  day date NOT NULL,
  spent_cents integer NOT NULL DEFAULT 0,
  call_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (key_id, day)
);

CREATE TABLE IF NOT EXISTS public.assembl_tool_receipts (
  id text PRIMARY KEY,
  key_id text NOT NULL REFERENCES public.assembl_tool_keys (id) ON DELETE CASCADE,
  tool_slug text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  status text NOT NULL,
  unit_cost_cents integer NOT NULL DEFAULT 1,
  request_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assembl_tool_receipts_key_id_created_idx
  ON public.assembl_tool_receipts (key_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assembl_tool_receipts_tool_slug_idx
  ON public.assembl_tool_receipts (tool_slug);

ALTER TABLE public.assembl_tool_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembl_tool_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembl_tool_receipts ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: service-role only (Next.js tool routes).

COMMIT;
