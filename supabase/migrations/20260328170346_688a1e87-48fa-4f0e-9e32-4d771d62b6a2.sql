
-- Agent SMS Config table
CREATE TABLE public.agent_sms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  twilio_phone_number TEXT,
  greeting TEXT NOT NULL DEFAULT 'Hi! I''m your AI assistant. How can I help?',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE public.agent_sms_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sms config" ON public.agent_sms_config
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Agent SMS Messages table
CREATE TABLE public.agent_sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  body TEXT NOT NULL,
  twilio_sid TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sms messages" ON public.agent_sms_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert sms messages" ON public.agent_sms_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Helm SMS Config table
CREATE TABLE public.helm_sms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  twilio_phone_number TEXT,
  morning_briefing BOOLEAN NOT NULL DEFAULT false,
  briefing_time TEXT NOT NULL DEFAULT '07:00',
  reminder_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id)
);

ALTER TABLE public.helm_sms_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members manage helm sms config" ON public.helm_sms_config
  FOR ALL TO authenticated
  USING (public.is_family_member(auth.uid(), family_id))
  WITH CHECK (public.is_family_member(auth.uid(), family_id));

-- Helm SMS Conversations table
CREATE TABLE public.helm_sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  opted_in BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.helm_sms_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Family members manage helm sms conversations" ON public.helm_sms_conversations
  FOR ALL TO authenticated
  USING (public.is_family_member(auth.uid(), family_id))
  WITH CHECK (public.is_family_member(auth.uid(), family_id));
