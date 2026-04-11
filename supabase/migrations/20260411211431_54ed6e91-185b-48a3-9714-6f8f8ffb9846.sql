-- Content items: individual pieces flowing through the Auaha creative pipeline
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'social_post',
  platform TEXT,
  tone TEXT,
  body TEXT,
  pipeline_stage TEXT NOT NULL DEFAULT 'brief',
  agent_attribution TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content items"
  ON public.content_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content items"
  ON public.content_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content items"
  ON public.content_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content items"
  ON public.content_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_content_items_user ON public.content_items(user_id);
CREATE INDEX idx_content_items_pipeline ON public.content_items(pipeline_stage);
CREATE INDEX idx_content_items_campaign ON public.content_items(campaign_id);