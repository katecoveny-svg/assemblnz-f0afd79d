
-- Senior profiles
CREATE TABLE IF NOT EXISTS public.senior_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  preferred_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  ethnicity TEXT[],
  preferred_language TEXT DEFAULT 'en',
  address_line_1 TEXT,
  address_line_2 TEXT,
  suburb TEXT,
  city TEXT,
  region TEXT,
  postcode TEXT,
  gp_practice_name TEXT,
  gp_practice_phone TEXT,
  nhi_number TEXT,
  primary_conditions TEXT[],
  mobility_level TEXT CHECK (mobility_level IN ('independent', 'assisted', 'limited', 'immobile')),
  cognitive_status TEXT CHECK (cognitive_status IN ('sharp', 'mild_decline', 'moderate_decline', 'significant_decline')),
  living_situation TEXT CHECK (living_situation IN ('alone', 'with_partner', 'with_whanau', 'rest_home', 'hospital_level_care')),
  check_in_time_preference TIME DEFAULT '09:00',
  check_in_frequency TEXT DEFAULT 'daily' CHECK (check_in_frequency IN ('daily', 'twice_daily', 'weekly')),
  interests TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'discharged'))
);

ALTER TABLE public.senior_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own seniors" ON public.senior_profiles FOR ALL USING (user_id = auth.uid());

-- Whānau connections
CREATE TABLE IF NOT EXISTS public.whanau_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('primary_carer', 'carer', 'viewer', 'emergency_only')),
  receives_daily_summary BOOLEAN DEFAULT false,
  receives_alerts BOOLEAN DEFAULT true,
  alert_priority_threshold TEXT DEFAULT 'medium' CHECK (alert_priority_threshold IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.whanau_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON public.whanau_connections FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
  OR user_id = auth.uid()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  agent TEXT NOT NULL DEFAULT 'ora',
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  channel TEXT DEFAULT 'voice' CHECK (channel IN ('voice', 'text', 'video')),
  model_used TEXT,
  transcript JSONB,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  mood_notes TEXT,
  energy_level TEXT CHECK (energy_level IN ('high', 'normal', 'low', 'very_low')),
  pain_reported BOOLEAN DEFAULT false,
  pain_location TEXT,
  pain_severity INTEGER CHECK (pain_severity BETWEEN 1 AND 10),
  sleep_quality TEXT CHECK (sleep_quality IN ('good', 'fair', 'poor', 'not_asked')),
  appetite TEXT CHECK (appetite IN ('good', 'fair', 'poor', 'not_asked')),
  concern_flags TEXT[],
  alert_triggered BOOLEAN DEFAULT false,
  alert_details JSONB,
  medications_confirmed BOOLEAN,
  medications_missed TEXT[],
  engagement_score INTEGER CHECK (engagement_score BETWEEN 1 AND 10),
  topics_discussed TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own check-ins" ON public.check_ins FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
);

-- Medication schedules
CREATE TABLE IF NOT EXISTS public.medication_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  purpose TEXT,
  important_notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meds" ON public.medication_schedules FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
);

-- Care alerts
CREATE TABLE IF NOT EXISTS public.care_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  source_agent TEXT NOT NULL,
  source_check_in_id UUID REFERENCES public.check_ins(id),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_action TEXT,
  delivered_to JSONB,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own alerts" ON public.care_alerts FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
);

-- Care journeys
CREATE TABLE IF NOT EXISTS public.care_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  referral_type TEXT NOT NULL,
  referral_date DATE,
  referring_practice TEXT,
  speciality TEXT,
  status TEXT NOT NULL DEFAULT 'referred' CHECK (status IN (
    'referred', 'waitlisted', 'fsa_scheduled', 'fsa_completed',
    'treatment_waitlisted', 'treatment_scheduled', 'treatment_completed',
    'recovery', 'discharged', 'declined'
  )),
  fsa_target_date DATE,
  fsa_actual_date DATE,
  treatment_target_date DATE,
  treatment_actual_date DATE,
  facility TEXT,
  region TEXT,
  notes JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.care_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journeys" ON public.care_journeys FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
);

-- Triage sessions
CREATE TABLE IF NOT EXISTS public.triage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  senior_id UUID REFERENCES public.senior_profiles(id),
  channel TEXT DEFAULT 'text' CHECK (channel IN ('voice', 'text')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  primary_symptom TEXT,
  symptom_details JSONB,
  urgency_assessment TEXT CHECK (urgency_assessment IN ('emergency_111', 'ed_today', 'gp_urgent', 'gp_routine', 'healthline', 'pharmacy', 'self_care')),
  recommended_service TEXT,
  recommended_service_details JSONB,
  user_accepted_recommendation BOOLEAN,
  red_flags_detected TEXT[],
  escalated_to_human BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  age_band TEXT,
  ethnicity TEXT[],
  region TEXT,
  model_used TEXT,
  thinking_level TEXT,
  transcript JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own triage" ON public.triage_sessions FOR ALL USING (user_id = auth.uid());

-- Home safety assessments
CREATE TABLE IF NOT EXISTS public.home_safety_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id UUID NOT NULL REFERENCES public.senior_profiles(id) ON DELETE CASCADE,
  assessed_by UUID REFERENCES auth.users(id),
  assessment_type TEXT DEFAULT 'photo' CHECK (assessment_type IN ('photo', 'video', 'checklist')),
  room TEXT,
  hazards_identified JSONB,
  risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
  recommendations JSONB,
  device_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.home_safety_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessments" ON public.home_safety_assessments FOR ALL USING (
  senior_id IN (SELECT id FROM public.senior_profiles WHERE user_id = auth.uid())
  OR assessed_by = auth.uid()
);

-- Caregiver wellbeing
CREATE TABLE IF NOT EXISTS public.caregiver_wellbeing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.whanau_connections(id) ON DELETE CASCADE,
  check_in_date DATE DEFAULT CURRENT_DATE,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  sleep_quality TEXT CHECK (sleep_quality IN ('good', 'fair', 'poor')),
  support_satisfaction TEXT CHECK (support_satisfaction IN ('well_supported', 'some_support', 'unsupported')),
  respite_hours_this_week NUMERIC(4,1),
  burnout_risk TEXT CHECK (burnout_risk IN ('low', 'moderate', 'high', 'critical')),
  burnout_factors TEXT[],
  recommended_actions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.caregiver_wellbeing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wellbeing" ON public.caregiver_wellbeing FOR ALL USING (
  connection_id IN (
    SELECT wc.id FROM public.whanau_connections wc
    JOIN public.senior_profiles sp ON wc.senior_id = sp.id
    WHERE sp.user_id = auth.uid() OR wc.user_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_check_ins_senior ON public.check_ins(senior_id, scheduled_at DESC);
CREATE INDEX idx_check_ins_flags ON public.check_ins USING GIN(concern_flags);
CREATE INDEX idx_care_alerts_senior ON public.care_alerts(senior_id, created_at DESC);
CREATE INDEX idx_care_alerts_priority ON public.care_alerts(priority, created_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX idx_care_journeys_senior ON public.care_journeys(senior_id, status);
CREATE INDEX idx_triage_sessions_equity ON public.triage_sessions(region, urgency_assessment);
CREATE INDEX idx_caregiver_wellbeing_risk ON public.caregiver_wellbeing(burnout_risk) WHERE burnout_risk IN ('high', 'critical');
