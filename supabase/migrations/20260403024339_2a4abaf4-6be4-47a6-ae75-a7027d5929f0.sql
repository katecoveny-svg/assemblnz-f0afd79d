
-- Tōroa family profiles
CREATE TABLE IF NOT EXISTS public.toroa_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_phone TEXT NOT NULL UNIQUE,
  family_name TEXT,
  members JSONB DEFAULT '[]',
  location TEXT DEFAULT 'Auckland',
  status TEXT DEFAULT 'trial',
  messages_remaining INTEGER DEFAULT 10,
  subscription_id TEXT,
  grocery_list JSONB DEFAULT '[]',
  reminders JSONB DEFAULT '[]',
  budget JSONB DEFAULT '{"weekly_limit": 0, "spent_this_week": 0}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_toroa_family_status()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status NOT IN ('trial', 'active', 'paused', 'cancelled') THEN
    RAISE EXCEPTION 'status must be trial, active, paused, or cancelled';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_toroa_family_status
  BEFORE INSERT OR UPDATE ON public.toroa_families
  FOR EACH ROW EXECUTE FUNCTION public.validate_toroa_family_status();

-- Tōroa message history
CREATE TABLE IF NOT EXISTS public.toroa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  from_number TEXT NOT NULL,
  body TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Validation trigger for direction
CREATE OR REPLACE FUNCTION public.validate_toroa_msg_direction()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.direction NOT IN ('inbound', 'outbound') THEN
    RAISE EXCEPTION 'direction must be inbound or outbound';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_validate_toroa_msg_direction
  BEFORE INSERT OR UPDATE ON public.toroa_messages
  FOR EACH ROW EXECUTE FUNCTION public.validate_toroa_msg_direction();

CREATE INDEX idx_toroa_messages_family ON public.toroa_messages(family_id, created_at);

-- Tōroa calendar events
CREATE TABLE IF NOT EXISTS public.toroa_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  source TEXT DEFAULT 'manual',
  gear_list JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Upgrade toroa_waitlist with additional fields if needed
ALTER TABLE public.toroa_waitlist ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.toroa_waitlist ADD COLUMN IF NOT EXISTS biggest_pain TEXT;
ALTER TABLE public.toroa_waitlist ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN DEFAULT true;
ALTER TABLE public.toroa_waitlist ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.toroa_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_calendar ENABLE ROW LEVEL SECURITY;

-- Service role policies (edge functions use service role)
CREATE POLICY "service_manage_toroa_families" ON public.toroa_families FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_manage_toroa_messages" ON public.toroa_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_manage_toroa_calendar" ON public.toroa_calendar FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anon to insert into waitlist and read count
CREATE POLICY "anon_insert_waitlist" ON public.toroa_waitlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_count_waitlist" ON public.toroa_waitlist FOR SELECT TO anon USING (true);
