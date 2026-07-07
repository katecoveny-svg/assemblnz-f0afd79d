-- Alphassembl / Kaiako — grounded chat corpus, retrieval, rate-limit log and
-- the placeholder referral directory.
--
-- The consumer Kaiako chat at /alphassembl/chat grounds every reply in three
-- P1 sources (NZ Dog Control Act 1996, SPCA NZ advice, Ian Dunbar's puppy
-- guidance) and carries a Trust score (A/B/C) on each.
--
-- Retrieval is LEXICAL (Postgres full-text search), not vector. The repo's two
-- vector pipelines (kb_doc_chunks / knowledge_chunks) both embed the query via
-- GEMINI_API_KEY, which is not provisioned in this runtime — a vector chat
-- would silently return zero grounding. For a small, curated three-source
-- corpus, weighted FTS (ts_rank × credibility tier) is reliable, needs no
-- embedding key, and is the "sparse / BM25" leg the Alphassembl spec calls for.
-- The corpus is seeded by scripts/ingest-kaiako-sources.ts (real fetched text).
--
-- Additive + idempotent. RLS on; no client policies — the /api/alphassembl/*
-- routes read and write with the service role only.

BEGIN;

-- ── 1 · The grounding corpus ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alphassembl_knowledge_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_slug  text NOT NULL,                 -- 'nz-dog-control-act-1996' | 'spca-nz-advice' | 'dunbar-puppy'
  source_name  text NOT NULL,                 -- human citation label
  source_url   text,                          -- primary URL for the citation
  tier         text NOT NULL DEFAULT 'A' CHECK (tier IN ('A','B','C')),
  chunk_index  int  NOT NULL DEFAULT 0,
  content      text NOT NULL,
  content_hash text,                          -- dedupe re-ingests
  tsv          tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alphassembl_knowledge_chunks_tsv_idx
  ON public.alphassembl_knowledge_chunks USING gin (tsv);
CREATE INDEX IF NOT EXISTS alphassembl_knowledge_chunks_source_idx
  ON public.alphassembl_knowledge_chunks (source_slug);
CREATE UNIQUE INDEX IF NOT EXISTS alphassembl_knowledge_chunks_dedupe
  ON public.alphassembl_knowledge_chunks (source_slug, chunk_index);

ALTER TABLE public.alphassembl_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- ── 2 · Weighted lexical retrieval (credibility tier × ts_rank) ─────────────
-- OR-of-lexemes matching: a natural question ("my puppy keeps biting")
-- retrieves any chunk sharing a stemmed term, ranked by ts_rank × tier weight.
-- websearch/plainto_tsquery AND every term, which drops good hits whenever the
-- query carries an off-corpus word ("ankles", "recall"), so we build an OR query
-- from the query's own stemmed, stopword-free lexemes instead.
CREATE OR REPLACE FUNCTION public.match_alphassembl_knowledge(
  query_text text,
  top_k int DEFAULT 6
)
RETURNS TABLE (
  source_slug text,
  source_name text,
  source_url  text,
  tier        text,
  content     text,
  rank        real
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (
    SELECT to_tsquery(
      'english',
      NULLIF(array_to_string(tsvector_to_array(to_tsvector('english', COALESCE(query_text, ''))), ' | '), '')
    ) AS tsq
  )
  SELECT
    c.source_slug,
    c.source_name,
    c.source_url,
    c.tier,
    c.content,
    (ts_rank(c.tsv, q.tsq)
       * CASE c.tier WHEN 'A' THEN 1.0 WHEN 'B' THEN 0.8 ELSE 0.6 END)::real AS rank
  FROM public.alphassembl_knowledge_chunks c, q
  WHERE q.tsq IS NOT NULL
    AND c.tsv @@ q.tsq
  ORDER BY rank DESC, c.tier ASC
  LIMIT GREATEST(1, LEAST(COALESCE(top_k, 6), 12));
$$;

-- ── 3 · Chat log — powers the 50/day rate limit + light analytics ───────────
CREATE TABLE IF NOT EXISTS public.alphassembl_chat_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  text,
  ip_hash     text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user','assistant')),
  urgency     text CHECK (urgency IN ('routine','concerning','refer_to_professional')),
  message     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS alphassembl_chat_log_session_idx
  ON public.alphassembl_chat_log (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS alphassembl_chat_log_ip_idx
  ON public.alphassembl_chat_log (ip_hash, created_at DESC);
ALTER TABLE public.alphassembl_chat_log ENABLE ROW LEVEL SECURITY;

-- ── 4 · Referral directory (placeholder — Auckland force-free behaviourists) ─
-- Seeded placeholders + real national referral paths. The full 200+ vet
-- directory is Phase 2; these five give the refer-to-professional card
-- somewhere real to point until then. placeholder=true is surfaced in the UI.
CREATE TABLE IF NOT EXISTS public.alphassembl_vets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  region      text NOT NULL DEFAULT 'Auckland',
  service     text,
  phone       text,
  website     text,
  placeholder boolean NOT NULL DEFAULT true,
  sort        int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alphassembl_vets ENABLE ROW LEVEL SECURITY;

INSERT INTO public.alphassembl_vets (name, region, service, phone, website, placeholder, sort)
VALUES
  ('SPCA New Zealand — advice & welfare line', 'National', 'Welfare, rehoming, advice', '0800 476 722', 'https://www.spca.nz/advice', false, 0),
  ('IAABC — find a certified behaviour consultant', 'National', 'Certified behaviourist directory', NULL, 'https://iaabc.org/consultants', false, 1),
  ('Ask your vet for a veterinary-behaviourist referral', 'Auckland', 'Medical-behaviour overlap, anxiety, aggression', NULL, NULL, false, 2),
  ('Auckland force-free behaviourist — listing coming', 'Auckland', 'Reactivity, aggression, severe anxiety', NULL, NULL, true, 3),
  ('Auckland force-free behaviourist — listing coming', 'Auckland', 'Puppy & adolescent behaviour, bite history', NULL, NULL, true, 4)
ON CONFLICT DO NOTHING;

COMMIT;

-- Verify:
--   SELECT source_slug, count(*) FROM public.alphassembl_knowledge_chunks GROUP BY 1;
--   SELECT * FROM public.match_alphassembl_knowledge('puppy biting', 5);
--   SELECT name, placeholder FROM public.alphassembl_vets ORDER BY sort;
