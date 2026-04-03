
-- Creative assets table
CREATE TABLE IF NOT EXISTS public.creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_id UUID,
  asset_type TEXT NOT NULL DEFAULT 'image',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT,
  style TEXT,
  platform TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own creative assets" ON public.creative_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Brand identities table
CREATE TABLE IF NOT EXISTS public.brand_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  logo_url TEXT,
  colors JSONB,
  fonts JSONB,
  voice_tone TEXT,
  mission TEXT,
  target_audience TEXT,
  keywords TEXT[],
  scanned_url TEXT,
  scan_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brand_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand identities" ON public.brand_identities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Podcasts table
CREATE TABLE IF NOT EXISTS public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  podcast_name TEXT NOT NULL,
  artwork_url TEXT,
  rss_feed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own podcasts" ON public.podcasts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Podcast episodes table
CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  transcript TEXT,
  show_notes JSONB,
  duration_seconds INTEGER,
  chapter_markers JSONB,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own podcast episodes" ON public.podcast_episodes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- API usage tracking
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  action TEXT NOT NULL,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own API usage" ON public.api_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON public.api_usage(user_id, created_at);

-- Auaha assets storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('auaha-assets', 'auaha-assets', true) ON CONFLICT (id) DO NOTHING;
