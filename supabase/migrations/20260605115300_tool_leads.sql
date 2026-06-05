-- HAPAI tool leads — optional "email me my result" capture across free tools
-- Per Claude Code work order (June 2026), P2: "Add lead capture to free HAPAI tools".
--
-- The free HAPAI tools spread (OG image + share-email) but captured nothing.
-- This table backs an optional capture box: the user can leave an email to get
-- their result. Capture is fail-closed and never blocks the tool itself.

BEGIN;

CREATE TABLE IF NOT EXISTS public.tool_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  tool_slug text NOT NULL,            -- HAPAI tool slug, e.g. 'customs-entry'
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,  -- the tool result snapshot
  consent_marketing boolean NOT NULL DEFAULT false,
  source text,                        -- optional referrer / campaign hint
  emailed boolean NOT NULL DEFAULT false,
  emailed_at timestamptz
);

CREATE INDEX IF NOT EXISTS tool_leads_tool_slug_idx ON public.tool_leads (tool_slug);
CREATE INDEX IF NOT EXISTS tool_leads_email_idx ON public.tool_leads (email);
CREATE INDEX IF NOT EXISTS tool_leads_created_at_idx ON public.tool_leads (created_at DESC);

-- RLS: open INSERT for anon (the capture box), no public SELECT. The leads
-- dashboard reads via the service role only.
ALTER TABLE public.tool_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tool_leads_insert_anon ON public.tool_leads;
CREATE POLICY tool_leads_insert_anon ON public.tool_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- No SELECT/UPDATE/DELETE policy = no public read or mutation. Service role only.

COMMIT;

-- Verification:
-- SELECT count(*) FROM tool_leads;
-- INSERT INTO tool_leads (email, tool_slug, payload) VALUES ('test@example.com', 'customs-entry', '{"demo": true}'::jsonb);
