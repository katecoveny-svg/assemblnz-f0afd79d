CREATE TABLE public.agent_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  confidence NUMERIC(3,2) DEFAULT 0.5,
  last_verified TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, topic)
);

ALTER TABLE public.agent_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read knowledge base"
  ON public.agent_knowledge_base FOR SELECT
  USING (true);

CREATE INDEX idx_akb_agent ON public.agent_knowledge_base(agent_id);
CREATE INDEX idx_akb_topic ON public.agent_knowledge_base(topic);

CREATE TRIGGER update_akb_updated_at
  BEFORE UPDATE ON public.agent_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();