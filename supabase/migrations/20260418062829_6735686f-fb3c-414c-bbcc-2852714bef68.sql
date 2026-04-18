-- Industry Knowledge Base — metadata catalogue for kete-specific compliance sources
CREATE TABLE IF NOT EXISTS public.industry_knowledge_base (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kete                  TEXT NOT NULL,
  doc_title             TEXT NOT NULL,
  doc_source_url        TEXT,
  doc_source_publisher  TEXT,
  content               TEXT,
  summary               TEXT,
  tier                  INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
  applicable_agents     JSONB NOT NULL DEFAULT '[]'::jsonb,
  update_cadence        TEXT,
  last_reviewed         DATE,
  next_review_due       DATE,
  tags                  JSONB DEFAULT '[]'::jsonb,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ikb_kete   ON public.industry_knowledge_base(kete);
CREATE INDEX IF NOT EXISTS idx_ikb_tier   ON public.industry_knowledge_base(tier);
CREATE INDEX IF NOT EXISTS idx_ikb_agents ON public.industry_knowledge_base USING GIN(applicable_agents);
CREATE INDEX IF NOT EXISTS idx_ikb_tags   ON public.industry_knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_ikb_review ON public.industry_knowledge_base(next_review_due);

-- Reuse existing public.update_updated_at_column() trigger
CREATE TRIGGER trg_ikb_updated_at
  BEFORE UPDATE ON public.industry_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.industry_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public read: this is a regulatory reference catalogue
CREATE POLICY "ikb: public read"
  ON public.industry_knowledge_base FOR SELECT
  USING (true);

-- Admin-only write (uses existing app_role enum + has_role helper)
CREATE POLICY "ikb: admins insert"
  ON public.industry_knowledge_base FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'business'::public.app_role));

CREATE POLICY "ikb: admins update"
  ON public.industry_knowledge_base FOR UPDATE
  USING (public.has_role(auth.uid(), 'business'::public.app_role));

CREATE POLICY "ikb: admins delete"
  ON public.industry_knowledge_base FOR DELETE
  USING (public.has_role(auth.uid(), 'business'::public.app_role));