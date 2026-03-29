
-- Create saved_items table for bookmarking agent responses
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  content TEXT NOT NULL,
  preview TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved items
CREATE POLICY "Users can view own saved items"
ON public.saved_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved items"
ON public.saved_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved items"
ON public.saved_items FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_saved_items_user_id ON public.saved_items(user_id);
