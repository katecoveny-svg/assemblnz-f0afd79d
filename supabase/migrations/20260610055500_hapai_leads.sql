-- HAPAI leads — unified email capture across the free HAPAI tools and the
-- /hapai library page. Per launch-week brief (June 2026), Tasks 3 + 5.
--
-- Supersedes the earlier tool_leads table with the brief's canonical shape
-- (id, email, tool_slug, created_at, source, consent). Keeps a payload jsonb
-- for the tool result snapshot. Capture is fail-closed and never blocks a tool.

BEGIN;

CREATE TABLE IF NOT EXISTS public.hapai_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  tool_slug text NOT NULL,                 -- e.g. 'customs-entry', 'admin-tax', 'hapai-library'
  source text,                             -- where the capture happened (path / campaign)
  consent boolean NOT NULL DEFAULT false,  -- opted in to occasional updates
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hapai_leads_tool_slug_idx ON public.hapai_leads (tool_slug);
CREATE INDEX IF NOT EXISTS hapai_leads_email_idx ON public.hapai_leads (email);
CREATE INDEX IF NOT EXISTS hapai_leads_created_at_idx ON public.hapai_leads (created_at DESC);

-- RLS: open INSERT for anon (the capture box), no public read. Leads dashboard
-- reads via the service role only.
ALTER TABLE public.hapai_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hapai_leads_insert_anon ON public.hapai_leads;
CREATE POLICY hapai_leads_insert_anon ON public.hapai_leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);

COMMIT;

-- Verification:
-- SELECT count(*) FROM hapai_leads;
-- INSERT INTO hapai_leads (email, tool_slug, source, consent) VALUES ('test@example.com', 'hapai-library', 'hapai-library', true);
