
CREATE TABLE IF NOT EXISTS public.kb_priority_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT,
  tier SMALLINT NOT NULL CHECK (tier IN (1,2,3)),
  unblocks TEXT[] NOT NULL DEFAULT '{}',
  sectors TEXT[] NOT NULL DEFAULT '{}',
  cadence TEXT,
  last_verified_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  last_refresh_status TEXT,
  content_hash TEXT,
  content_excerpt TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kb_priority_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kb priority docs readable by authenticated"
  ON public.kb_priority_documents FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "kb priority docs admin write"
  ON public.kb_priority_documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'business')
  );

CREATE POLICY "kb priority docs admin update"
  ON public.kb_priority_documents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'business')
  );

CREATE POLICY "kb priority docs admin delete"
  ON public.kb_priority_documents FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'business')
  );

CREATE INDEX IF NOT EXISTS kb_priority_tier_idx ON public.kb_priority_documents(tier, title);

CREATE TRIGGER kb_priority_docs_touch
  BEFORE UPDATE ON public.kb_priority_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
