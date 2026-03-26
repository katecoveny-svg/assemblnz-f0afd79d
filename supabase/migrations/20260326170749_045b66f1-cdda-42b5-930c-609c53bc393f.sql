
-- Ad campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  industries TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  visual_style TEXT DEFAULT '3d_glass',
  status TEXT DEFAULT 'generating',
  total_ads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own campaigns" ON public.ad_campaigns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ad creatives table
CREATE TABLE public.ad_creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  industry TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'single_image',
  pain_point TEXT NOT NULL,
  ad_structure TEXT NOT NULL,
  headline TEXT NOT NULL,
  primary_text TEXT NOT NULL,
  description TEXT,
  cta TEXT NOT NULL,
  hashtags TEXT[],
  target_audience TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own creatives" ON public.ad_creatives FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add stat and hook columns to existing industry_pain_points
ALTER TABLE public.industry_pain_points ADD COLUMN IF NOT EXISTS stat TEXT;
ALTER TABLE public.industry_pain_points ADD COLUMN IF NOT EXISTS hook TEXT;
