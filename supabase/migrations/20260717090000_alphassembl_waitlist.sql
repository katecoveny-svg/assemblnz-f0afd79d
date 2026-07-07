-- Alphassembl — waitlist capture for the NZ dog-owner OS landing.
--
-- Alphassembl is the consumer product surface that fronts the Kaitiaki bundle
-- (lead agent Keeper) for everyday dog owners. Its landing at /alphassembl on
-- the demo host takes a name + email + suburb and holds it here until the
-- product opens. This is additive to the unified lead pipeline (lead_inquiries
-- via lib/lead-capture) — the route writes BOTH: a durable waitlist row here
-- (unique on email) and the standard notify/persist legs.
--
-- The transactional welcome email is NEVER auto-sent. The /api/alphassembl/
-- waitlist route drafts it into content_approvals (kind 'email-draft',
-- status 'pending') so it surfaces at /admin/approvals for Kate to approve —
-- consistent with ACTION_DISPATCH_ENABLED staying OFF (nothing outbound ships
-- without a human yes).
--
-- Idempotent + self-healing: CREATE TABLE IF NOT EXISTS, guarded policy.
-- RLS stays ON with no client policies — the route writes with the service
-- role only (bypasses RLS), so there is no anon/authenticated write surface.

BEGIN;

CREATE TABLE IF NOT EXISTS public.alphassembl_waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  name        text NOT NULL,
  email       text NOT NULL,
  suburb      text,
  source_url  text,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- One row per owner — a repeat submit is an upsert, never a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS alphassembl_waitlist_email_key
  ON public.alphassembl_waitlist (lower(email));

CREATE INDEX IF NOT EXISTS alphassembl_waitlist_created_at_idx
  ON public.alphassembl_waitlist (created_at DESC);

ALTER TABLE public.alphassembl_waitlist ENABLE ROW LEVEL SECURITY;

-- No client policies on purpose: writes go through the service-role route only.
-- (Admin reads use the service client too.) Drop any stale permissive policy
-- from a prior apply so re-running never re-opens a public write surface.
DROP POLICY IF EXISTS alphassembl_waitlist_insert_anon ON public.alphassembl_waitlist;

COMMIT;

-- Verify:
--   SELECT count(*) FROM public.alphassembl_waitlist;
