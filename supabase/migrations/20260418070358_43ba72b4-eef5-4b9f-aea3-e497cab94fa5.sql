-- ═══════════════════════════════════════════════════════════════════════
-- Industry Knowledge Base — chunked + vector pipeline
--
-- Adds:
--   • pgvector extension
--   • industry_kb_chunks table (chunked text + 768-dim embeddings)
--   • search_industry_kb() RPC for similarity search filtered by kete + agent
--   • columns on industry_knowledge_base for ingestion bookkeeping
--   • pg_cron job that nightly scans next_review_due and queues re-fetches
--     by POSTing rows to the ikb-ingest edge function via pg_net
-- ═══════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Bookkeeping columns on industry_knowledge_base ─────────────────────
ALTER TABLE public.industry_knowledge_base
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_fetch_status TEXT,
  ADD COLUMN IF NOT EXISTS chunk_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ikb_next_review_status
  ON public.industry_knowledge_base (next_review_due, last_fetch_status);

-- ─── Chunks table (one row per ~1200-char chunk) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.industry_kb_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES public.industry_knowledge_base(id) ON DELETE CASCADE,
  kete            TEXT NOT NULL,
  tier            INTEGER NOT NULL,
  applicable_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
  chunk_index     INTEGER NOT NULL,
  chunk_text      TEXT NOT NULL,
  token_estimate  INTEGER,
  embedding       vector(768),
  source_url      TEXT,
  doc_title       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_ikb_chunks_doc        ON public.industry_kb_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_ikb_chunks_kete       ON public.industry_kb_chunks (kete);
CREATE INDEX IF NOT EXISTS idx_ikb_chunks_agents_gin ON public.industry_kb_chunks USING gin (applicable_agents);
CREATE INDEX IF NOT EXISTS idx_ikb_chunks_embedding
  ON public.industry_kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ─── RLS: public read (matches parent table), admins write ──────────────
ALTER TABLE public.industry_kb_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ikb_chunks: public read" ON public.industry_kb_chunks;
CREATE POLICY "ikb_chunks: public read"
  ON public.industry_kb_chunks FOR SELECT USING (true);

DROP POLICY IF EXISTS "ikb_chunks: admins insert" ON public.industry_kb_chunks;
CREATE POLICY "ikb_chunks: admins insert"
  ON public.industry_kb_chunks FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'business'::app_role));

DROP POLICY IF EXISTS "ikb_chunks: admins update" ON public.industry_kb_chunks;
CREATE POLICY "ikb_chunks: admins update"
  ON public.industry_kb_chunks FOR UPDATE
  USING (public.has_role(auth.uid(), 'business'::app_role));

DROP POLICY IF EXISTS "ikb_chunks: admins delete" ON public.industry_kb_chunks;
CREATE POLICY "ikb_chunks: admins delete"
  ON public.industry_kb_chunks FOR DELETE
  USING (public.has_role(auth.uid(), 'business'::app_role));

-- ─── Similarity-search RPC ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.search_industry_kb(
  query_embedding vector(768),
  filter_kete     TEXT DEFAULT NULL,
  filter_agent    TEXT DEFAULT NULL,
  match_count     INTEGER DEFAULT 6,
  min_similarity  FLOAT  DEFAULT 0.20
)
RETURNS TABLE (
  chunk_id        UUID,
  document_id     UUID,
  kete            TEXT,
  tier            INTEGER,
  doc_title       TEXT,
  source_url      TEXT,
  chunk_text      TEXT,
  similarity      FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    c.id, c.document_id, c.kete, c.tier, c.doc_title, c.source_url, c.chunk_text,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.industry_kb_chunks c
  WHERE c.embedding IS NOT NULL
    AND (filter_kete  IS NULL OR c.kete = filter_kete)
    AND (filter_agent IS NULL OR c.applicable_agents ? filter_agent)
    AND 1 - (c.embedding <=> query_embedding) >= min_similarity
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_industry_kb(vector, text, text, integer, float)
  TO anon, authenticated, service_role;