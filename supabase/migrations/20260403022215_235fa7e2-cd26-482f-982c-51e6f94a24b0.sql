
DO $$ BEGIN
  -- Podcast episodes
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

  -- Buffer connections
  CREATE TABLE IF NOT EXISTS public.buffer_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    access_token TEXT NOT NULL,
    profiles JSONB,
    connected_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
  );
  ALTER TABLE public.buffer_connections ENABLE ROW LEVEL SECURITY;

  -- Meta connections
  CREATE TABLE IF NOT EXISTS public.meta_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    access_token TEXT NOT NULL,
    ad_account_id TEXT,
    page_id TEXT,
    instagram_account_id TEXT,
    connected_at TIMESTAMPTZ DEFAULT now(),
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
  );
  ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;

  -- Add missing columns to campaigns
  ALTER TABLE public.campaigns 
    ADD COLUMN IF NOT EXISTS brand_id UUID,
    ADD COLUMN IF NOT EXISTS pipeline_step TEXT DEFAULT 'brief',
    ADD COLUMN IF NOT EXISTS platforms TEXT[],
    ADD COLUMN IF NOT EXISTS start_date DATE,
    ADD COLUMN IF NOT EXISTS end_date DATE,
    ADD COLUMN IF NOT EXISTS performance_summary JSONB;
END $$;

-- Policies (use DO block to handle existing)
DO $$ BEGIN
  BEGIN CREATE POLICY "Users manage own episodes" ON public.podcast_episodes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Users manage own buffer" ON public.buffer_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Users manage own meta" ON public.meta_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_api_usage_user ON public.api_usage(user_id, created_at);
