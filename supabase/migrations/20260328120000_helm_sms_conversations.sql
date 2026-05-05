-- HELM SMS conversations table for Twilio text interface (family-based)
CREATE TABLE IF NOT EXISTS public.helm_sms_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  verified BOOLEAN DEFAULT false,
  opted_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phone_number)
);

ALTER TABLE public.helm_sms_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members view own SMS conversations" ON public.helm_sms_conversations;
CREATE POLICY "Family members view own SMS conversations"
  ON public.helm_sms_conversations FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

-- SMS message log (shared by HELM and generic agent SMS)
CREATE TABLE IF NOT EXISTS public.helm_sms_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.helm_sms_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.helm_sms_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members view own SMS messages" ON public.helm_sms_messages;
CREATE POLICY "Family members view own SMS messages"
  ON public.helm_sms_messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.helm_sms_conversations
      WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.helm_sms_conversations
      WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

-- SMS config per family for HELM
CREATE TABLE IF NOT EXISTS public.helm_sms_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  twilio_phone_number TEXT,
  morning_briefing BOOLEAN DEFAULT true,
  briefing_time TIME DEFAULT '07:00',
  reminder_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.helm_sms_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members manage SMS config" ON public.helm_sms_config;
CREATE POLICY "Family members manage SMS config"
  ON public.helm_sms_config FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
    )
  );

-- Generic agent SMS config (per user, per agent — mirrors voice_agent_config pattern)
CREATE TABLE IF NOT EXISTS public.agent_sms_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  twilio_phone_number TEXT,
  greeting TEXT DEFAULT 'Kia ora! How can I help you today?',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.agent_sms_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own agent SMS config" ON public.agent_sms_config;
CREATE POLICY "Users manage own agent SMS config"
  ON public.agent_sms_config FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generic agent SMS message log
CREATE TABLE IF NOT EXISTS public.agent_sms_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_sms_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own agent SMS messages" ON public.agent_sms_messages;
CREATE POLICY "Users view own agent SMS messages"
  ON public.agent_sms_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
