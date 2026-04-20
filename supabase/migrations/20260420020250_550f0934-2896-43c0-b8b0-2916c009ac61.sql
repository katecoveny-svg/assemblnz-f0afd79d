-- 1. Patch agent_memory with new columns (existing table has user_id, agent_id, memory_key, memory_value)
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS memory_type text;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS importance int DEFAULT 3;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS source text DEFAULT 'extracted';
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz DEFAULT now();
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS access_count int DEFAULT 0;
ALTER TABLE public.agent_memory ADD COLUMN IF NOT EXISTS superseded_by uuid REFERENCES public.agent_memory(id) ON DELETE SET NULL;

-- Add validation trigger for memory_type and importance (instead of CHECK constraints, per house rules)
CREATE OR REPLACE FUNCTION public.validate_agent_memory_row()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.memory_type IS NOT NULL
     AND NEW.memory_type NOT IN ('profile','project','preference','fact','relationship') THEN
    RAISE EXCEPTION 'memory_type must be profile, project, preference, fact, or relationship';
  END IF;
  IF NEW.importance IS NOT NULL AND (NEW.importance < 1 OR NEW.importance > 5) THEN
    RAISE EXCEPTION 'importance must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agent_memory_validate ON public.agent_memory;
CREATE TRIGGER agent_memory_validate
  BEFORE INSERT OR UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.validate_agent_memory_row();

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_agent_memory_tenant_user
  ON public.agent_memory(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type
  ON public.agent_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memory_importance
  ON public.agent_memory(importance DESC, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding
  ON public.agent_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. RLS
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_memory_tenant_read" ON public.agent_memory;
CREATE POLICY "agent_memory_tenant_read"
  ON public.agent_memory FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "agent_memory_tenant_write" ON public.agent_memory;
CREATE POLICY "agent_memory_tenant_write"
  ON public.agent_memory FOR INSERT
  WITH CHECK (
    tenant_id IS NULL
    OR tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "agent_memory_service_all" ON public.agent_memory;
CREATE POLICY "agent_memory_service_all"
  ON public.agent_memory FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4. Extraction queue
CREATE TABLE IF NOT EXISTS public.memory_extraction_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  attempts int NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE OR REPLACE FUNCTION public.validate_memory_queue_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status NOT IN ('pending','processing','done','failed') THEN
    RAISE EXCEPTION 'status must be pending, processing, done, or failed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS memory_queue_validate ON public.memory_extraction_queue;
CREATE TRIGGER memory_queue_validate
  BEFORE INSERT OR UPDATE ON public.memory_extraction_queue
  FOR EACH ROW EXECUTE FUNCTION public.validate_memory_queue_status();

CREATE INDEX IF NOT EXISTS idx_memory_queue_status
  ON public.memory_extraction_queue(status, created_at)
  WHERE status IN ('pending','processing');

ALTER TABLE public.memory_extraction_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memory_queue_service" ON public.memory_extraction_queue;
CREATE POLICY "memory_queue_service"
  ON public.memory_extraction_queue FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. Updated-at trigger (reuse existing function if present)
DROP TRIGGER IF EXISTS agent_memory_set_updated_at ON public.agent_memory;
CREATE TRIGGER agent_memory_set_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Semantic-search function
CREATE OR REPLACE FUNCTION public.match_agent_memory(
  p_tenant_id uuid,
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_match_count int DEFAULT 10,
  p_min_similarity float DEFAULT 0.65
)
RETURNS TABLE (
  id uuid,
  memory_type text,
  subject text,
  content text,
  importance int,
  similarity float
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    m.id, m.memory_type, m.subject, m.content, m.importance,
    1 - (m.embedding <=> p_query_embedding) AS similarity
  FROM public.agent_memory m
  WHERE (p_tenant_id IS NULL OR m.tenant_id = p_tenant_id OR m.tenant_id IS NULL)
    AND (p_user_id IS NULL OR m.user_id = p_user_id OR m.user_id IS NULL)
    AND m.superseded_by IS NULL
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> p_query_embedding) >= p_min_similarity
  ORDER BY m.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;