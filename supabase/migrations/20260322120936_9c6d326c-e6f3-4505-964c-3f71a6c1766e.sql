-- Shared Context Bus table
CREATE TABLE public.shared_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  context_key text NOT NULL,
  context_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_agent text NOT NULL,
  confidence float NOT NULL DEFAULT 0.8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, context_key)
);
ALTER TABLE public.shared_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own context" ON public.shared_context FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context" ON public.shared_context FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context" ON public.shared_context FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context" ON public.shared_context FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Agent Triggers table for symbiotic workflows
CREATE TABLE public.agent_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trigger_agent text NOT NULL,
  trigger_event text NOT NULL,
  target_agent text NOT NULL,
  target_action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own triggers" ON public.agent_triggers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own triggers" ON public.agent_triggers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own triggers" ON public.agent_triggers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own triggers" ON public.agent_triggers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Conversation Summaries for cross-agent memory sharing
CREATE TABLE public.conversation_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_id text NOT NULL,
  summary text NOT NULL,
  key_facts_extracted jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own summaries" ON public.conversation_summaries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own summaries" ON public.conversation_summaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own summaries" ON public.conversation_summaries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER shared_context_updated_at BEFORE UPDATE ON public.shared_context FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();