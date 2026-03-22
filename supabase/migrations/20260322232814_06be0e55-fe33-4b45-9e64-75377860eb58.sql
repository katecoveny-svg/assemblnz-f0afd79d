CREATE TABLE public.exported_outputs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  output_type TEXT NOT NULL DEFAULT 'document',
  title TEXT NOT NULL,
  content_preview TEXT,
  format TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.exported_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own exports" ON public.exported_outputs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own exports" ON public.exported_outputs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports" ON public.exported_outputs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_exported_outputs_user ON public.exported_outputs(user_id, created_at DESC);