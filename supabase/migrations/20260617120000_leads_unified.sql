-- Unified lead-capture inquiries table — belt-and-braces durable record for
-- EVERY lead-capture surface on the site (contact form, HAPAI tool gates,
-- gating wall, electrify PDF capture, Trust Centre security-pack request, …).
--
-- Context (2026-06-17 P0): lead notifications to assembl@assembl.co.nz were not
-- reaching Kate. Most surfaces only ever wrote a per-form Supabase row and never
-- emailed. The fix routes every surface through notifyLead(); this table is the
-- second leg — even if email breaks or lands in spam, Kate has one queryable
-- record of every inquiry.
--
-- NOTE: this table is deliberately named `lead_inquiries`, NOT `leads`.
-- `public.leads` is already taken by an unrelated CRM/pipeline table
-- (20260320200851 — user_id NOT NULL, stage/value/score, owner-scoped RLS).
-- The original cut of this migration used `public.leads`, which silently
-- no-opped against that table (CREATE TABLE IF NOT EXISTS) and then errored on
-- the form_name index — breaking a clean replay. Distinct name avoids the
-- collision entirely.
--
-- Writes are fail-soft and additive: surfaces keep their existing per-form
-- tables (hapai_leads, electrify_leads, trust_pack_requests). This is the
-- single place to query "every site lead, newest first".

BEGIN;

CREATE TABLE IF NOT EXISTS public.lead_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  form_name text NOT NULL,                  -- e.g. 'Contact form', 'Trust Pack request'
  email text,                               -- the lead's email, if captured
  name text,                                -- the lead's name, if captured
  source_url text,                          -- page the lead came from
  ip text,                                  -- best-effort client IP
  fields jsonb NOT NULL DEFAULT '{}'::jsonb, -- every other form field, verbatim
  notified boolean NOT NULL DEFAULT false    -- did the email notification succeed
);

CREATE INDEX IF NOT EXISTS lead_inquiries_created_at_idx ON public.lead_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS lead_inquiries_form_name_idx ON public.lead_inquiries (form_name);
CREATE INDEX IF NOT EXISTS lead_inquiries_email_idx ON public.lead_inquiries (email);

-- RLS: open INSERT for the capture surfaces, no public read. The leads dashboard
-- reads via the service role only (bypasses RLS). Mirrors hapai_leads.
ALTER TABLE public.lead_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lead_inquiries_insert_anon ON public.lead_inquiries;
CREATE POLICY lead_inquiries_insert_anon ON public.lead_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;

-- Verification:
-- SELECT created_at, form_name, email, notified FROM public.lead_inquiries ORDER BY created_at DESC LIMIT 20;
-- INSERT INTO public.lead_inquiries (form_name, email, name) VALUES ('Contact form', 'test@example.com', 'Test');
