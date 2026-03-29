
-- Leads (for FLUX/Sales)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  value NUMERIC(10,2),
  stage TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  notes TEXT,
  score TEXT DEFAULT 'warm',
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Follow-ups (for FLUX)
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  subject TEXT NOT NULL,
  agent_name TEXT NOT NULL DEFAULT 'FLUX',
  status TEXT NOT NULL DEFAULT 'scheduled',
  due_date TIMESTAMPTZ,
  notes TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follow_ups" ON public.follow_ups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own follow_ups" ON public.follow_ups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own follow_ups" ON public.follow_ups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own follow_ups" ON public.follow_ups FOR DELETE USING (auth.uid() = user_id);

-- Clients (shared)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Campaigns (for PRISM)
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  subject_line TEXT,
  body_json JSONB,
  audience TEXT,
  tone TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Social Posts (for PRISM)
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT,
  topic TEXT,
  tone TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social_posts" ON public.social_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social_posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social_posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social_posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- Brand Profiles (for PRISM)
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_name TEXT,
  industry TEXT,
  tone TEXT,
  audience TEXT,
  key_message TEXT,
  creative_brief JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand_profiles" ON public.brand_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand_profiles" ON public.brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand_profiles" ON public.brand_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand_profiles" ON public.brand_profiles FOR DELETE USING (auth.uid() = user_id);

-- Video Scripts (for PRISM)
CREATE TABLE public.video_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  audience TEXT,
  duration TEXT,
  format TEXT DEFAULT 'landscape',
  storyboard JSONB,
  narration TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video_scripts" ON public.video_scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own video_scripts" ON public.video_scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own video_scripts" ON public.video_scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own video_scripts" ON public.video_scripts FOR DELETE USING (auth.uid() = user_id);

-- Agent Training Data (all agents)
CREATE TABLE public.agent_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  personality TEXT,
  tone TEXT DEFAULT 'Professional',
  business_context TEXT,
  faqs JSONB DEFAULT '[]'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  role_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.agent_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent_training" ON public.agent_training FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent_training" ON public.agent_training FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent_training" ON public.agent_training FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent_training" ON public.agent_training FOR DELETE USING (auth.uid() = user_id);

-- Automations (for AXIS)
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT false,
  run_count INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'zap',
  agent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations" ON public.automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own automations" ON public.automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automations" ON public.automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own automations" ON public.automations FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_training_updated_at BEFORE UPDATE ON public.agent_training FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
