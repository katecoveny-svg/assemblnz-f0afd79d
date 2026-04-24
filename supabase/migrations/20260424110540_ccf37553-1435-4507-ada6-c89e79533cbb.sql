-- AUAHA Creative Kete — schema
CREATE TABLE IF NOT EXISTS public.auaha_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  project_name TEXT NOT NULL,
  client_name TEXT,
  brief TEXT,
  objectives JSONB DEFAULT '[]'::jsonb,
  target_audience TEXT,
  brand_guidelines JSONB DEFAULT '{}'::jsonb,
  budget DECIMAL(10,2),
  spent DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'briefing' CHECK (status IN ('briefing', 'in_progress', 'review', 'approved', 'published', 'archived')),
  kete_accent TEXT DEFAULT '#E0A88C',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_projects_org ON public.auaha_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_auaha_projects_status ON public.auaha_projects(status);
CREATE POLICY "auaha_projects_authenticated" ON public.auaha_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.auaha_projects(id) ON DELETE CASCADE,
  org_id UUID,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'audio', 'copy', 'animation', 'document', 'social_post', 'ad', 'email', 'presentation')),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  duration_seconds INT,
  dimensions JSONB,
  provider TEXT,
  model_used TEXT,
  prompt_used TEXT,
  style TEXT,
  variations JSONB DEFAULT '[]'::jsonb,
  brand_score INT CHECK (brand_score >= 0 AND brand_score <= 100),
  qa_status TEXT DEFAULT 'pending' CHECK (qa_status IN ('pending', 'passed', 'failed', 'revision_needed')),
  qa_notes TEXT,
  version INT DEFAULT 1,
  parent_asset_id UUID REFERENCES public.auaha_assets(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by_agent TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
ALTER TABLE public.auaha_assets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_assets_project ON public.auaha_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_auaha_assets_org ON public.auaha_assets(org_id);
CREATE INDEX IF NOT EXISTS idx_auaha_assets_type ON public.auaha_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_auaha_assets_qa ON public.auaha_assets(qa_status);
CREATE INDEX IF NOT EXISTS idx_auaha_assets_deleted ON public.auaha_assets(deleted_at) WHERE deleted_at IS NULL;
CREATE POLICY "auaha_assets_authenticated" ON public.auaha_assets FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.auaha_projects(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.auaha_assets(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('brief', 'copy', 'design', 'video', 'audio', 'review', 'schedule', 'publish', 'analyse', 'iterate')),
  agent_name TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_pipeline_project ON public.auaha_pipeline_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_auaha_pipeline_asset ON public.auaha_pipeline_stages(asset_id);
CREATE INDEX IF NOT EXISTS idx_auaha_pipeline_stage ON public.auaha_pipeline_stages(stage);
CREATE POLICY "auaha_pipeline_authenticated" ON public.auaha_pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  brand_name TEXT NOT NULL,
  tagline TEXT,
  voice_attributes JSONB DEFAULT '[]'::jsonb,
  tone_keywords TEXT[] DEFAULT '{}',
  banned_words TEXT[] DEFAULT '{}',
  colour_palette JSONB DEFAULT '[]'::jsonb,
  font_stack JSONB DEFAULT '{}'::jsonb,
  logo_url TEXT,
  logo_variants JSONB DEFAULT '[]'::jsonb,
  style_guide_url TEXT,
  target_audience TEXT,
  competitor_brands TEXT[] DEFAULT '{}',
  industry TEXT,
  messaging_pillars JSONB DEFAULT '[]'::jsonb,
  do_list TEXT[] DEFAULT '{}',
  dont_list TEXT[] DEFAULT '{}',
  example_copy JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_brand_org ON public.auaha_brand_profiles(org_id);
CREATE POLICY "auaha_brand_authenticated" ON public.auaha_brand_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.auaha_projects(id) ON DELETE CASCADE,
  org_id UUID,
  asset_id UUID REFERENCES public.auaha_assets(id),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'facebook', 'youtube', 'twitter_x', 'pinterest', 'email', 'blog', 'website', 'podcast', 'other')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  link_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  buffer_post_id TEXT,
  engagement JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_content_calendar ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_calendar_project ON public.auaha_content_calendar(project_id);
CREATE INDEX IF NOT EXISTS idx_auaha_calendar_org ON public.auaha_content_calendar(org_id);
CREATE INDEX IF NOT EXISTS idx_auaha_calendar_scheduled ON public.auaha_content_calendar(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_auaha_calendar_platform ON public.auaha_content_calendar(platform);
CREATE POLICY "auaha_calendar_authenticated" ON public.auaha_content_calendar FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_entry_id UUID REFERENCES public.auaha_content_calendar(id),
  asset_id UUID REFERENCES public.auaha_assets(id),
  platform TEXT NOT NULL,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  reach INT DEFAULT 0,
  engagement INT DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  clicks INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  comments INT DEFAULT 0,
  likes INT DEFAULT 0,
  video_views INT DEFAULT 0,
  watch_time_seconds INT DEFAULT 0,
  followers_gained INT DEFAULT 0,
  conversions INT DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  roas DECIMAL(6,2),
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_analytics ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_analytics_calendar ON public.auaha_analytics(calendar_entry_id);
CREATE INDEX IF NOT EXISTS idx_auaha_analytics_asset ON public.auaha_analytics(asset_id);
CREATE INDEX IF NOT EXISTS idx_auaha_analytics_platform ON public.auaha_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_auaha_analytics_date ON public.auaha_analytics(metric_date);
CREATE POLICY "auaha_analytics_authenticated" ON public.auaha_analytics FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.auaha_projects(id) ON DELETE CASCADE,
  org_id UUID,
  campaign_name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'tiktok', 'google', 'linkedin', 'youtube')),
  objective TEXT,
  daily_budget DECIMAL(8,2),
  total_budget DECIMAL(10,2),
  total_spent DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  targeting JSONB DEFAULT '{}'::jsonb,
  ad_sets JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  external_campaign_id TEXT,
  performance JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_ads_project ON public.auaha_ad_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_auaha_ads_org ON public.auaha_ad_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_auaha_ads_platform ON public.auaha_ad_campaigns(platform);
CREATE POLICY "auaha_ads_authenticated" ON public.auaha_ad_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.auaha_podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.auaha_projects(id) ON DELETE CASCADE,
  org_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  script TEXT,
  audio_url TEXT,
  transcript TEXT,
  show_notes TEXT,
  duration_seconds INT,
  episode_number INT,
  season INT DEFAULT 1,
  guests JSONB DEFAULT '[]'::jsonb,
  chapters JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'recording', 'editing', 'published')),
  published_at TIMESTAMPTZ,
  distribution JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auaha_podcast_episodes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_auaha_podcast_project ON public.auaha_podcast_episodes(project_id);
CREATE INDEX IF NOT EXISTS idx_auaha_podcast_org ON public.auaha_podcast_episodes(org_id);
CREATE POLICY "auaha_podcast_authenticated" ON public.auaha_podcast_episodes FOR ALL TO authenticated USING (true) WITH CHECK (true);