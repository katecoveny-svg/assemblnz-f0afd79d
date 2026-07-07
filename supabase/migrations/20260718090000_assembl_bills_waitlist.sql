-- Assembl Bills — waitlist capture for the NZ agentic bill-OS landing.
--
-- Assembl Bills is the consumer/SME product surface (NZ households + small
-- businesses) that ingests power, broadband, insurance, council and
-- subscription bills, tracks cost, and proactively surfaces cheaper
-- alternatives grounded in Powerswitch / Consumer NZ. Its landing at /bills on
-- the demo host takes name + email + region + biggest-bill-pain and holds it
-- here until the beta opens. Additive to the unified lead pipeline
-- (lead_inquiries via lib/lead-capture) — the route writes BOTH: a durable
-- waitlist row here (unique on lower(email)) and the standard notify/persist
-- legs.
--
-- The transactional welcome email is NEVER auto-sent. /api/bills/waitlist
-- drafts it into content_approvals (kind 'email-draft', status 'pending') so it
-- surfaces at /admin/approvals for a human yes — consistent with
-- ACTION_DISPATCH_ENABLED staying OFF (nothing outbound ships without approval).
--
-- Idempotent + self-healing: CREATE TABLE IF NOT EXISTS, guarded index/policy.
-- RLS stays ON with no client policies — the route writes with the service role
-- only (bypasses RLS), so there is no anon/authenticated write surface.

BEGIN;

CREATE TABLE IF NOT EXISTS public.assembl_bills_waitlist (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  name              text NOT NULL,
  email             text NOT NULL,
  region            text NOT NULL DEFAULT 'other',
  biggest_bill_pain text,
  source_url        text,
  meta              jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Backfill columns if an earlier shape of the table already exists.
ALTER TABLE public.assembl_bills_waitlist ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'other';
ALTER TABLE public.assembl_bills_waitlist ADD COLUMN IF NOT EXISTS biggest_bill_pain text;
ALTER TABLE public.assembl_bills_waitlist ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.assembl_bills_waitlist ADD COLUMN IF NOT EXISTS meta jsonb NOT NULL DEFAULT '{}'::jsonb;

-- One row per household/business — a repeat submit is a no-op, never a dup.
CREATE UNIQUE INDEX IF NOT EXISTS assembl_bills_waitlist_email_key
  ON public.assembl_bills_waitlist (lower(email));

CREATE INDEX IF NOT EXISTS assembl_bills_waitlist_created_at_idx
  ON public.assembl_bills_waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS assembl_bills_waitlist_region_idx
  ON public.assembl_bills_waitlist (region);

ALTER TABLE public.assembl_bills_waitlist ENABLE ROW LEVEL SECURITY;

-- No client policies on purpose: writes go through the service-role route only.
-- Drop any stale permissive policy from a prior apply so re-running never
-- re-opens a public write surface.
DROP POLICY IF EXISTS assembl_bills_waitlist_insert_anon ON public.assembl_bills_waitlist;

COMMIT;

-- Verify:
--   SELECT count(*) FROM public.assembl_bills_waitlist;
