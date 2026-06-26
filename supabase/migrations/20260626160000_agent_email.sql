-- Email per agent — inbound + outbound.
--
-- Gives every premium agent (plus Atlas) its own address at
-- <local-part>@assembl.co.nz. Inbound mail lands as a thread the agent (and the
-- admin) can see; outbound replies go FROM the same address via Brevo.
--
-- This migration is purely ADDITIVE and self-healing (ADD COLUMN IF NOT EXISTS,
-- CREATE TABLE IF NOT EXISTS). It does not touch the existing agent catalogue,
-- chat, leads, or AgentMail-inbound (toro_drafts) flows.
--
--   agents.email_slug        local-part of the agent's address. NULL = no inbox.
--                            Resolver matches an inbound `to:` local-part against
--                            email_slug first, then falls back to slug.
--   agent_email_threads      one conversation per (agent, customer email).
--   agent_email_messages     every inbound/outbound message, with the raw email
--                            and attachments kept for audit (Mana Receipt
--                            evidence). Sensitive content is quarantined.
--
-- RLS: agents stays world-readable; the two new tables deny all by default
-- (no permissive policy) so only the service role — i.e. the token-gated admin
-- pages and the edge functions — can ever read them. Customers are external
-- senders with no auth row, so there is no owner policy to grant.

BEGIN;

-- ── Per-agent address ──────────────────────────────────────────────────────
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS email_slug text;

-- One inbox per local-part. Partial unique so NULLs (most agents) don't clash.
CREATE UNIQUE INDEX IF NOT EXISTS agents_email_slug_uniq
  ON public.agents (email_slug)
  WHERE email_slug IS NOT NULL;

-- Seed the canon premium agents + Atlas. Local-parts are the "pretty" public
-- addresses (customs, not customs-entry) — see lib/agent-email/addresses.ts,
-- the single source of truth this mirrors. Only sets a value where the slug
-- exists; a missing roster row is a no-op.
UPDATE public.agents SET email_slug = 'atlas'       WHERE slug = 'atlas'           AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'tax-tidy'    WHERE slug = 'tax-tidy'        AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'customs'     WHERE slug = 'customs-entry'   AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'care-scribe' WHERE slug = 'care-scribe'     AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'voice-cs'    WHERE slug = 'voice-cs'        AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'food-temp'   WHERE slug = 'food-temp-logs'  AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'stock-count' WHERE slug = 'stock-count'     AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'compliance'  WHERE slug = 'compliance-check' AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'maritime'    WHERE slug = 'maritime-brief'  AND email_slug IS NULL;
UPDATE public.agents SET email_slug = 'arataki'     WHERE slug = 'arataki'         AND email_slug IS NULL;

-- ── Threads ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_email_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents (id) ON DELETE CASCADE,
  agent_slug text NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  subject text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'quarantined', 'closed', 'spam')),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_slug, customer_email)
);

CREATE INDEX IF NOT EXISTS agent_email_threads_agent_idx
  ON public.agent_email_threads (agent_slug, last_message_at DESC);
CREATE INDEX IF NOT EXISTS agent_email_threads_recent_idx
  ON public.agent_email_threads (last_message_at DESC);

-- ── Messages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.agent_email_threads (id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_email text,
  to_email text,
  subject text,
  -- The body the agent + admin actually see: PII-redacted, and replaced with a
  -- placeholder when quarantined. The untouched original lives in `raw`.
  body text NOT NULL DEFAULT '',
  -- Raw email payload + original body, for audit. Service-role only (RLS denies
  -- all reads to anon/authenticated on this table).
  raw jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  quarantined boolean NOT NULL DEFAULT false,
  quarantine_reason text,
  redaction_stats jsonb,
  -- AgentMail's message id, for idempotent webhook delivery.
  agentmail_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_email_messages_thread_idx
  ON public.agent_email_messages (thread_id, created_at);

-- Idempotency: AgentMail can redeliver a webhook. Dedup on its message id.
CREATE UNIQUE INDEX IF NOT EXISTS agent_email_messages_agentmail_uniq
  ON public.agent_email_messages (agentmail_message_id)
  WHERE agentmail_message_id IS NOT NULL;

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Both tables: RLS on, NO permissive policy → anon/authenticated read nothing.
-- The service role (token-gated admin pages, edge functions) bypasses RLS.
ALTER TABLE public.agent_email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_email_messages ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification:
-- SELECT slug, email_slug FROM public.agents WHERE email_slug IS NOT NULL ORDER BY email_slug;
-- SELECT count(*) FROM public.agent_email_threads;   -- service role only
