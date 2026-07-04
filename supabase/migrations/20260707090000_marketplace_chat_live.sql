-- Marketplace chat goes live on every agent: receipts ledger + chat flood
-- control. Self-healing (IF NOT EXISTS everywhere) so a fresh-apply or a
-- re-run is always green.

-- Mana Receipts ledger — the table /admin/receipts (searchReceipts) already
-- reads. One row per marketplace chat exchange (and, later, per ops action).
CREATE TABLE IF NOT EXISTS public.mana_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent text,
  domain text,
  issuer text,
  hitl jsonb NOT NULL DEFAULT '{}'::jsonb,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mana_receipts_agent_idx ON public.mana_receipts (agent, created_at DESC);
CREATE INDEX IF NOT EXISTS mana_receipts_created_idx ON public.mana_receipts (created_at DESC);

ALTER TABLE public.mana_receipts ENABLE ROW LEVEL SECURITY;
-- Service-role only (chat runtime + admin hub). No anon/authenticated policies.

-- Chat flood control — rolling-window request log, hashed IPs only.
CREATE TABLE IF NOT EXISTS public.agent_chat_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash text NOT NULL,
  agent_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_chat_requests_window_idx
  ON public.agent_chat_requests (ip_hash, agent_slug, created_at DESC);

ALTER TABLE public.agent_chat_requests ENABLE ROW LEVEL SECURITY;
-- Service-role only; rows are short-lived flood-control counters.
