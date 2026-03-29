-- Agent Memory table for persistent context across sessions
CREATE TABLE public.agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id text NOT NULL,
  memory_key text NOT NULL,
  memory_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id, memory_key)
);
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON public.agent_memory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.agent_memory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.agent_memory FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.agent_memory FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Output Versions table for document versioning
CREATE TABLE public.output_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id text NOT NULL,
  output_type text NOT NULL DEFAULT 'document',
  title text NOT NULL,
  version text NOT NULL DEFAULT 'v1.0',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.output_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own versions" ON public.output_versions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own versions" ON public.output_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own versions" ON public.output_versions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Action Queue table for persistent action items
CREATE TABLE public.action_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.action_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own actions" ON public.action_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.action_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.action_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own actions" ON public.action_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER agent_memory_updated_at BEFORE UPDATE ON public.agent_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER action_queue_updated_at BEFORE UPDATE ON public.action_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();