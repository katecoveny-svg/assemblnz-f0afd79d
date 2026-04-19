-- ═══════════════════════════════════════════════════════════════
-- Assembl Knowledge Brain — live ingestion architecture
-- (Claude plan §4 adapted for Lovable AI's 768-dim embeddings)
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Source registry ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('rss','json_api','csv','html_scrape','sdmx','oauth_api','arcgis')),
  url text NOT NULL,
  category text NOT NULL,
  agent_packs text[] NOT NULL DEFAULT '{}',
  cadence_minutes int NOT NULL DEFAULT 1440,
  active boolean NOT NULL DEFAULT true,
  last_checked_at timestamptz,
  last_updated_at timestamptz,
  status text DEFAULT 'idle',
  consecutive_failures int NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_sources_active ON public.kb_sources(active, last_checked_at);
CREATE INDEX IF NOT EXISTS idx_kb_sources_packs ON public.kb_sources USING GIN(agent_packs);

-- 2. Documents ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  external_id text,
  title text NOT NULL,
  url text,
  content text NOT NULL,
  content_hash text NOT NULL,
  published_at timestamptz,
  effective_from timestamptz,
  effective_to timestamptz,
  jurisdiction text DEFAULT 'NZ',
  topic_tags text[] NOT NULL DEFAULT '{}',
  superseded_by uuid REFERENCES public.kb_documents(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  inserted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, external_id)
);
CREATE INDEX IF NOT EXISTS idx_kb_documents_source ON public.kb_documents(source_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_published ON public.kb_documents(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_documents_active ON public.kb_documents(superseded_by) WHERE superseded_by IS NULL;
CREATE INDEX IF NOT EXISTS idx_kb_documents_tags ON public.kb_documents USING GIN(topic_tags);

-- 3. Chunks for retrieval ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_doc_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.kb_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  tokens int,
  inserted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON public.kb_doc_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON public.kb_doc_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. Change log ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_changes (
  id bigserial PRIMARY KEY,
  document_id uuid REFERENCES public.kb_documents(id) ON DELETE CASCADE,
  source_id uuid REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  change_type text NOT NULL CHECK (change_type IN ('new','updated','superseded','removed')),
  diff_summary text,
  detected_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kb_changes_detected ON public.kb_changes(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_changes_source ON public.kb_changes(source_id, detected_at DESC);

-- 5. Run history (for SENTINEL) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_source_runs (
  id bigserial PRIMARY KEY,
  source_id uuid REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text,
  new_docs int NOT NULL DEFAULT 0,
  updated_docs int NOT NULL DEFAULT 0,
  duration_ms int,
  error jsonb
);
CREATE INDEX IF NOT EXISTS idx_kb_runs_source ON public.kb_source_runs(source_id, started_at DESC);

-- 6. Sentinel alerts ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kb_sentinel_alerts (
  id bigserial PRIMARY KEY,
  source_id uuid REFERENCES public.kb_sources(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('yellow','red')),
  reason text NOT NULL,
  detail jsonb DEFAULT '{}'::jsonb,
  raised_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_kb_alerts_open ON public.kb_sentinel_alerts(source_id) WHERE resolved_at IS NULL;

-- 7. Embedding queue (simple table-driven) ──────────────────────
CREATE TABLE IF NOT EXISTS public.kb_embed_queue (
  id bigserial PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.kb_documents(id) ON DELETE CASCADE,
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  picked_at timestamptz,
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  error text
);
CREATE INDEX IF NOT EXISTS idx_kb_queue_pending ON public.kb_embed_queue(enqueued_at) WHERE status = 'pending';

-- 8. Health view ────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.kb_source_health AS
SELECT
  s.id, s.name, s.type, s.category, s.cadence_minutes, s.active,
  s.last_checked_at, s.last_updated_at, s.status, s.consecutive_failures,
  EXTRACT(EPOCH FROM (now() - COALESCE(s.last_checked_at, s.created_at))) / 60 AS lag_minutes,
  CASE
    WHEN NOT s.active THEN 'paused'
    WHEN s.last_checked_at IS NULL THEN 'never_run'
    WHEN s.consecutive_failures >= 2 THEN 'red'
    WHEN EXTRACT(EPOCH FROM (now() - s.last_checked_at)) / 60 > s.cadence_minutes * 3 THEN 'yellow'
    WHEN s.status = 'error' THEN 'red'
    ELSE 'green'
  END AS health
FROM public.kb_sources s;

-- 9. Match RPC ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.match_kb_knowledge(
  query_embedding vector(768),
  agent_pack text DEFAULT NULL,
  top_k int DEFAULT 8
) RETURNS TABLE (
  document_id uuid,
  title text,
  url text,
  snippet text,
  source_name text,
  published_at timestamptz,
  similarity float
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    d.id, d.title, d.url, c.content, s.name, d.published_at,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.kb_doc_chunks c
  JOIN public.kb_documents d ON d.id = c.document_id
  JOIN public.kb_sources s ON s.id = d.source_id
  WHERE d.superseded_by IS NULL
    AND c.embedding IS NOT NULL
    AND (agent_pack IS NULL OR agent_pack = ANY(s.agent_packs))
  ORDER BY c.embedding <=> query_embedding
  LIMIT top_k;
$$;

-- 10. updated_at trigger for kb_sources ─────────────────────────
CREATE OR REPLACE FUNCTION public.kb_set_updated_at() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_kb_sources_updated_at ON public.kb_sources;
CREATE TRIGGER trg_kb_sources_updated_at
  BEFORE UPDATE ON public.kb_sources
  FOR EACH ROW EXECUTE FUNCTION public.kb_set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.kb_sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_doc_chunks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_changes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_source_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_sentinel_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_embed_queue       ENABLE ROW LEVEL SECURITY;

-- Public read on the catalogue (proof of trustworthiness)
CREATE POLICY "kb_sources public read"   ON public.kb_sources         FOR SELECT USING (true);
CREATE POLICY "kb_documents public read" ON public.kb_documents       FOR SELECT USING (true);
CREATE POLICY "kb_chunks public read"    ON public.kb_doc_chunks      FOR SELECT USING (true);
CREATE POLICY "kb_changes public read"   ON public.kb_changes         FOR SELECT USING (true);

-- Business role can edit sources and view ops tables
CREATE POLICY "kb_sources business write" ON public.kb_sources
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'business'))
  WITH CHECK (public.has_role(auth.uid(), 'business'));

CREATE POLICY "kb_runs business read"     ON public.kb_source_runs     FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'business'));
CREATE POLICY "kb_alerts business read"   ON public.kb_sentinel_alerts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'business'));
CREATE POLICY "kb_queue business read"    ON public.kb_embed_queue     FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'business'));

-- Note: edge functions use the service role and bypass RLS by design.