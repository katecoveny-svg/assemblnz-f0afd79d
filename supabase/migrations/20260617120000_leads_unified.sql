-- Unified leads table — belt-and-braces durable record for EVERY lead-capture
-- surface on the site (contact form, HAPAI tool gates, gating wall, electrify
-- PDF capture, Trust Centre security-pack request, …).
--
-- Context (2026-06-17 P0): lead notifications to assembl@assembl.co.nz were not
-- reaching Kate. Most surfaces only ever wrote a per-form Supabase row and never
-- emailed. The fix routes every surface through notifyLead(); this table is the
-- second leg — even if email breaks or lands in spam, Kate has one queryable
-- record of every inquiry.
--
-- Writes are fail-soft and additive: surfaces keep their existing per-form
-- tables (hapai_leads, electrify_leads, trust_pack_requests). This is the
-- single place to query "every lead, newest first".

BEGIN;

CREATE TABLE IF NOT EXISTS public.leads (
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

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_form_name_idx ON public.leads (form_name);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);

-- RLS: open INSERT for the capture surfaces, no public read. The leads dashboard
-- reads via the service role only (bypasses RLS). Mirrors hapai_leads.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS leads_insert_anon ON public.leads;
CREATE POLICY leads_insert_anon ON public.leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;

-- Verification:
-- SELECT created_at, form_name, email, notified FROM public.leads ORDER BY created_at DESC LIMIT 20;
-- INSERT INTO public.leads (form_name, email, name) VALUES ('Contact form', 'test@example.com', 'Test');
