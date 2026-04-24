-- ============================================================
-- ASSEMBL GROWTH ENGINE — Greg Isenberg Framework Implementation
-- ============================================================

-- ============================================================
-- SECTION 1: DATA MOAT INFRASTRUCTURE
-- ============================================================

-- 1.1 Agent interaction analytics
CREATE TABLE IF NOT EXISTS public.assembl_agent_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organisation_id UUID,
  session_id UUID,
  agent_code TEXT NOT NULL,
  kete_code TEXT NOT NULL,
  model_used TEXT,
  model_tier TEXT,
  intent_category TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  workflow_type TEXT,
  evidence_pack_generated BOOLEAN DEFAULT false,
  user_satisfaction INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_analytics_kete ON public.assembl_agent_analytics(kete_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_agent ON public.assembl_agent_analytics(agent_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_org ON public.assembl_agent_analytics(organisation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_workflow ON public.assembl_agent_analytics(workflow_type);

ALTER TABLE public.assembl_agent_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own analytics" ON public.assembl_agent_analytics;
CREATE POLICY "Users see own analytics" ON public.assembl_agent_analytics
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role inserts analytics" ON public.assembl_agent_analytics;
CREATE POLICY "Service role inserts analytics" ON public.assembl_agent_analytics
  FOR INSERT WITH CHECK (true);

-- 1.2 Workflow patterns
CREATE TABLE IF NOT EXISTS public.assembl_workflow_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID,
  kete_code TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  workflow_version INTEGER DEFAULT 1,
  steps JSONB NOT NULL,
  total_time_seconds INTEGER,
  completion_rate NUMERIC(5,2),
  drop_off_step TEXT,
  industry_category TEXT,
  is_template BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_patterns_kete ON public.assembl_workflow_patterns(kete_code);
CREATE INDEX IF NOT EXISTS idx_workflow_patterns_name ON public.assembl_workflow_patterns(workflow_name);

ALTER TABLE public.assembl_workflow_patterns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view workflow patterns" ON public.assembl_workflow_patterns;
CREATE POLICY "Anyone can view workflow patterns" ON public.assembl_workflow_patterns
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role manages workflow patterns" ON public.assembl_workflow_patterns;
CREATE POLICY "Service role manages workflow patterns" ON public.assembl_workflow_patterns
  FOR ALL USING (true) WITH CHECK (true);

-- 1.3 Industry benchmarks
CREATE TABLE IF NOT EXISTS public.assembl_industry_benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kete_code TEXT NOT NULL,
  industry TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(12,4),
  sample_size INTEGER,
  region TEXT DEFAULT 'NZ',
  period_start DATE,
  period_end DATE,
  percentile_25 NUMERIC(12,4),
  percentile_50 NUMERIC(12,4),
  percentile_75 NUMERIC(12,4),
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kete_code, industry, metric_name, period_start)
);

ALTER TABLE public.assembl_industry_benchmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view benchmarks" ON public.assembl_industry_benchmarks;
CREATE POLICY "Anyone can view benchmarks" ON public.assembl_industry_benchmarks
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role manages benchmarks" ON public.assembl_industry_benchmarks;
CREATE POLICY "Service role manages benchmarks" ON public.assembl_industry_benchmarks
  FOR ALL USING (true) WITH CHECK (true);

-- 1.4 Feature usage
CREATE TABLE IF NOT EXISTS public.assembl_feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organisation_id UUID,
  kete_code TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, kete_code, feature_name, action, date)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_kete ON public.assembl_feature_usage(kete_code, date DESC);

ALTER TABLE public.assembl_feature_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own feature usage" ON public.assembl_feature_usage;
CREATE POLICY "Users see own feature usage" ON public.assembl_feature_usage
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role inserts feature usage" ON public.assembl_feature_usage;
CREATE POLICY "Service role inserts feature usage" ON public.assembl_feature_usage
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service role upserts feature usage" ON public.assembl_feature_usage;
CREATE POLICY "Service role upserts feature usage" ON public.assembl_feature_usage
  FOR UPDATE USING (true);

-- ============================================================
-- SECTION 2: LEAD MAGNET INFRASTRUCTURE
-- ============================================================

-- 2.1 Leads
CREATE TABLE IF NOT EXISTS public.assembl_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  company_name TEXT,
  industry TEXT,
  company_size TEXT,
  region TEXT DEFAULT 'NZ',
  source TEXT NOT NULL,
  source_detail TEXT,
  kete_interest TEXT[],
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  quiz_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_engaged_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON public.assembl_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.assembl_leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.assembl_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.assembl_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON public.assembl_leads(industry);

ALTER TABLE public.assembl_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages leads" ON public.assembl_leads;
CREATE POLICY "Service role manages leads" ON public.assembl_leads
  FOR ALL USING (true) WITH CHECK (true);

-- 2.2 Lead magnets
CREATE TABLE IF NOT EXISTS public.assembl_lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  kete_codes TEXT[],
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  leads_captured INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2),
  avg_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_lead_magnets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view lead magnets" ON public.assembl_lead_magnets;
CREATE POLICY "Anyone can view lead magnets" ON public.assembl_lead_magnets
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role manages lead magnets" ON public.assembl_lead_magnets;
CREATE POLICY "Service role manages lead magnets" ON public.assembl_lead_magnets
  FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.assembl_lead_magnets (name, slug, type, kete_codes, description) VALUES
  ('NZ Compliance Calculator', 'compliance-calculator', 'calculator',
   ARRAY['WAIHANGA','MANAAKI','PIKAU','ARATAKI'],
   'Which NZ laws apply to your business? Answer 5 questions, get a personalised compliance checklist.'),
  ('True Cost of Employment', 'employment-cost-calculator', 'calculator',
   ARRAY['MANAAKI','WAIHANGA','AUAHA','PIKAU'],
   'Calculate the REAL cost of hiring in NZ — KiwiSaver, ACC, holidays, training, sick leave included.'),
  ('AI Readiness Assessment', 'ai-readiness', 'quiz',
   ARRAY['WAIHANGA','MANAAKI','PIKAU','ARATAKI','AUAHA'],
   'Is your business ready for AI agents? 10 questions, instant score with recommendations.'),
  ('H&S Site Inspection Template', 'hs-inspection-template', 'template',
   ARRAY['WAIHANGA'],
   'Free H&S site inspection checklist — compliant with Health and Safety at Work Act 2015.'),
  ('Food Control Plan Builder', 'food-control-plan', 'micro_tool',
   ARRAY['MANAAKI'],
   'Generate a Food Act 2014 compliant food control plan in 10 minutes.'),
  ('Customs Documentation Checklist', 'customs-checklist', 'template',
   ARRAY['PIKAU'],
   'Complete NZ customs documentation checklist — import/export, tariff codes, compliance.'),
  ('NZ Businesses Using AI Directory', 'nz-ai-directory', 'directory',
   ARRAY['WAIHANGA','MANAAKI','PIKAU','ARATAKI','AUAHA'],
   'Searchable directory of NZ businesses using AI — filter by industry, size, and use case.')
ON CONFLICT (slug) DO NOTHING;

-- 2.3 Lead scoring rules
CREATE TABLE IF NOT EXISTS public.assembl_lead_scoring_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  decay_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.assembl_lead_scoring_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages scoring rules" ON public.assembl_lead_scoring_rules;
CREATE POLICY "Service role manages scoring rules" ON public.assembl_lead_scoring_rules
  FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.assembl_lead_scoring_rules (action, points, decay_days) VALUES
  ('completed_calculator', 20, 60),
  ('completed_quiz', 25, 60),
  ('downloaded_template', 15, 45),
  ('visited_pricing', 30, 30),
  ('visited_kete_page', 10, 30),
  ('opened_email', 5, 14),
  ('clicked_email_link', 10, 14),
  ('requested_demo', 50, 90),
  ('used_micro_tool', 20, 45),
  ('returned_visit', 10, 14),
  ('shared_on_social', 15, 60)
ON CONFLICT (action) DO NOTHING;

-- ============================================================
-- SECTION 3: CONTENT REPURPOSING PIPELINE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assembl_content_atoms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  core_insight TEXT NOT NULL,
  kete_codes TEXT[],
  topic_tags TEXT[],
  target_persona TEXT,
  source_type TEXT,
  status TEXT DEFAULT 'idea',
  priority INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_content_atoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages content atoms" ON public.assembl_content_atoms;
CREATE POLICY "Service role manages content atoms" ON public.assembl_content_atoms
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.assembl_content_derivatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atom_id UUID REFERENCES public.assembl_content_atoms(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  platform TEXT,
  title TEXT,
  content TEXT,
  asset_url TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  agent_used TEXT,
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,4),
  hook_text TEXT,
  hook_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_derivatives_atom ON public.assembl_content_derivatives(atom_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_platform ON public.assembl_content_derivatives(platform, status);
CREATE INDEX IF NOT EXISTS idx_derivatives_hook_score ON public.assembl_content_derivatives(hook_score DESC);

ALTER TABLE public.assembl_content_derivatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages content derivatives" ON public.assembl_content_derivatives;
CREATE POLICY "Service role manages content derivatives" ON public.assembl_content_derivatives
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.assembl_hook_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  derivative_id UUID REFERENCES public.assembl_content_derivatives(id),
  platform TEXT NOT NULL,
  hook_text TEXT NOT NULL,
  variant_label TEXT,
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,4),
  is_winner BOOLEAN DEFAULT false,
  tested_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_hook_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages hook tests" ON public.assembl_hook_tests;
CREATE POLICY "Service role manages hook tests" ON public.assembl_hook_tests
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 4: MANAGED KETE SERVICE TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assembl_managed_engagements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  industry TEXT NOT NULL,
  kete_code TEXT NOT NULL,
  status TEXT DEFAULT 'onboarding',
  start_date DATE DEFAULT CURRENT_DATE,
  transition_target_date DATE,
  setup_fee_nzd NUMERIC(10,2) DEFAULT 749.00,
  monthly_fee_nzd NUMERIC(10,2),
  workflows_mapped INTEGER DEFAULT 0,
  workflows_automated INTEGER DEFAULT 0,
  time_saved_hours_per_week NUMERIC(6,1),
  agents_configured TEXT[],
  training_sessions_completed INTEGER DEFAULT 0,
  customer_confidence_score INTEGER,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_managed_engagements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages engagements" ON public.assembl_managed_engagements;
CREATE POLICY "Service role manages engagements" ON public.assembl_managed_engagements
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.assembl_workflow_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  engagement_id UUID REFERENCES public.assembl_managed_engagements(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_description TEXT NOT NULL,
  current_tool TEXT,
  time_minutes INTEGER,
  pain_level INTEGER,
  automatable BOOLEAN DEFAULT false,
  agent_assigned TEXT,
  automation_status TEXT DEFAULT 'manual',
  notes TEXT,
  mapped_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.assembl_workflow_mapping ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages workflow mapping" ON public.assembl_workflow_mapping;
CREATE POLICY "Service role manages workflow mapping" ON public.assembl_workflow_mapping
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 5: NZ AI DIRECTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assembl_nz_ai_directory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT NOT NULL,
  region TEXT,
  company_size TEXT,
  ai_use_cases TEXT[],
  tools_used TEXT[],
  description TEXT,
  contact_email TEXT,
  is_assembl_customer BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  submitted_by UUID,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_directory_industry ON public.assembl_nz_ai_directory(industry);
CREATE INDEX IF NOT EXISTS idx_directory_region ON public.assembl_nz_ai_directory(region);
CREATE INDEX IF NOT EXISTS idx_directory_featured ON public.assembl_nz_ai_directory(is_featured, views DESC);

ALTER TABLE public.assembl_nz_ai_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view directory" ON public.assembl_nz_ai_directory;
CREATE POLICY "Anyone can view directory" ON public.assembl_nz_ai_directory
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role manages directory" ON public.assembl_nz_ai_directory;
CREATE POLICY "Service role manages directory" ON public.assembl_nz_ai_directory
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SECTION 6: GROWTH DASHBOARD VIEWS (security_invoker)
-- ============================================================

CREATE OR REPLACE VIEW public.assembl_lead_funnel
WITH (security_invoker = true) AS
SELECT
  source,
  status,
  COUNT(*) AS count,
  AVG(lead_score) AS avg_score,
  MIN(created_at) AS earliest,
  MAX(created_at) AS latest
FROM public.assembl_leads
GROUP BY source, status
ORDER BY source, status;

CREATE OR REPLACE VIEW public.assembl_agent_usage_summary
WITH (security_invoker = true) AS
SELECT
  kete_code,
  agent_code,
  COUNT(*) AS total_calls,
  COUNT(DISTINCT user_id) AS unique_users,
  AVG(latency_ms) AS avg_latency_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(*),0) * 100 AS success_rate,
  SUM(CASE WHEN evidence_pack_generated THEN 1 ELSE 0 END) AS packs_generated,
  AVG(user_satisfaction) AS avg_satisfaction,
  SUM(input_tokens + output_tokens) AS total_tokens
FROM public.assembl_agent_analytics
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY kete_code, agent_code
ORDER BY total_calls DESC;

CREATE OR REPLACE VIEW public.assembl_content_winners
WITH (security_invoker = true) AS
SELECT
  ca.title AS atom_title,
  cd.platform,
  cd.format,
  cd.hook_text,
  cd.impressions,
  cd.engagements,
  cd.engagement_rate,
  cd.hook_score,
  cd.agent_used,
  cd.published_at
FROM public.assembl_content_derivatives cd
JOIN public.assembl_content_atoms ca ON cd.atom_id = ca.id
WHERE cd.status = 'published'
  AND cd.impressions > 100
ORDER BY cd.engagement_rate DESC;

CREATE OR REPLACE VIEW public.assembl_managed_pipeline
WITH (security_invoker = true) AS
SELECT
  kete_code,
  status,
  COUNT(*) AS count,
  AVG(workflows_mapped) AS avg_workflows_mapped,
  AVG(workflows_automated) AS avg_workflows_automated,
  AVG(time_saved_hours_per_week) AS avg_hours_saved,
  AVG(customer_confidence_score) AS avg_confidence
FROM public.assembl_managed_engagements
GROUP BY kete_code, status
ORDER BY kete_code;

CREATE OR REPLACE VIEW public.assembl_magnet_performance
WITH (security_invoker = true) AS
SELECT
  name,
  type,
  kete_codes,
  views,
  starts,
  completions,
  leads_captured,
  CASE WHEN views > 0 THEN
    ROUND(completions::NUMERIC / views * 100, 1)
  ELSE 0 END AS completion_pct,
  CASE WHEN completions > 0 THEN
    ROUND(leads_captured::NUMERIC / completions * 100, 1)
  ELSE 0 END AS capture_pct
FROM public.assembl_lead_magnets
WHERE is_active = true
ORDER BY leads_captured DESC;

-- ============================================================
-- SECTION 7: FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.assembl_calculate_lead_score(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_industry TEXT;
  v_company_size TEXT;
  v_kete_count INTEGER;
BEGIN
  SELECT industry, company_size, COALESCE(array_length(kete_interest, 1), 0)
  INTO v_industry, v_company_size, v_kete_count
  FROM public.assembl_leads WHERE id = p_lead_id;

  IF v_industry IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_company_size IS NOT NULL THEN v_score := v_score + 5; END IF;

  IF v_kete_count > 1 THEN v_score := v_score + (v_kete_count * 5); END IF;

  CASE v_company_size
    WHEN '51+' THEN v_score := v_score + 20;
    WHEN '21-50' THEN v_score := v_score + 15;
    WHEN '6-20' THEN v_score := v_score + 10;
    WHEN '2-5' THEN v_score := v_score + 5;
    ELSE NULL;
  END CASE;

  v_score := LEAST(v_score, 100);

  UPDATE public.assembl_leads SET lead_score = v_score, updated_at = now()
  WHERE id = p_lead_id;

  RETURN v_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.assembl_log_agent_interaction(
  p_user_id UUID,
  p_agent_code TEXT,
  p_kete_code TEXT,
  p_model_used TEXT,
  p_model_tier TEXT,
  p_intent TEXT,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_latency_ms INTEGER,
  p_success BOOLEAN DEFAULT true,
  p_workflow_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.assembl_agent_analytics (
    user_id, agent_code, kete_code, model_used, model_tier,
    intent_category, input_tokens, output_tokens, latency_ms,
    success, workflow_type, metadata
  ) VALUES (
    p_user_id, p_agent_code, p_kete_code, p_model_used, p_model_tier,
    p_intent, p_input_tokens, p_output_tokens, p_latency_ms,
    p_success, p_workflow_type, p_metadata
  )
  RETURNING id INTO v_id;

  INSERT INTO public.assembl_feature_usage (user_id, kete_code, feature_name, action, date)
  VALUES (p_user_id, p_kete_code, p_agent_code, 'use', CURRENT_DATE)
  ON CONFLICT (user_id, kete_code, feature_name, action, date)
  DO UPDATE SET count = public.assembl_feature_usage.count + 1;

  RETURN v_id;
END;
$$;