
CREATE TABLE public.voice_agent_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  phone_number TEXT,
  voice_style TEXT DEFAULT 'professional',
  voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  greeting TEXT DEFAULT 'Kia ora, you''ve reached our team. How can I help?',
  business_hours JSONB DEFAULT '{"mon":"9-5","tue":"9-5","wed":"9-5","thu":"9-5","fri":"9-5","sat":"closed","sun":"closed"}',
  after_hours_behaviour TEXT DEFAULT 'ai_handles',
  qualification_questions JSONB DEFAULT '[]',
  calendar_integration TEXT,
  knowledge_base TEXT,
  language TEXT DEFAULT 'english',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.voice_agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own voice config"
  ON public.voice_agent_config FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.voice_call_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  caller_phone TEXT,
  caller_name TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  summary TEXT,
  outcome TEXT,
  sentiment TEXT,
  appointment_booked BOOLEAN DEFAULT false,
  appointment_datetime TIMESTAMPTZ,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.voice_call_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own call logs"
  ON public.voice_call_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
