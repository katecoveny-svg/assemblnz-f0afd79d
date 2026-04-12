-- Tool registry — self-describing tool definitions
CREATE TABLE public.tool_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL UNIQUE,
  tool_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  tool_category TEXT,
  description TEXT,
  requires_integration TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tool_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tools"
  ON public.tool_registry FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage tools"
  ON public.tool_registry FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_tool_registry_category ON public.tool_registry(tool_category);
CREATE INDEX idx_tool_registry_active ON public.tool_registry(is_active);

CREATE TRIGGER update_tool_registry_updated_at
  BEFORE UPDATE ON public.tool_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agent-to-tool mapping
CREATE TABLE public.agent_toolsets (
  agent_id TEXT NOT NULL,
  tool_name TEXT NOT NULL REFERENCES public.tool_registry(tool_name) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, tool_name)
);

ALTER TABLE public.agent_toolsets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view agent toolsets"
  ON public.agent_toolsets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage agent toolsets"
  ON public.agent_toolsets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_agent_toolsets_agent ON public.agent_toolsets(agent_id);