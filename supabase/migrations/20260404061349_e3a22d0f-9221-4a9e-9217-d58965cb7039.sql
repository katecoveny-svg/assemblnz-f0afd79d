
-- Smart home device links (Alexa, Google Home, Home Assistant)
CREATE TABLE public.toroa_smart_home_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'alexa',
  alexa_token TEXT,
  google_token TEXT,
  home_assistant_url TEXT,
  home_assistant_token TEXT,
  devices JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Smart home event log
CREATE TABLE public.toroa_smart_home_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  device_id TEXT,
  action TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.toroa_smart_home_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_smart_home_events ENABLE ROW LEVEL SECURITY;

-- Service role only (edge functions access these)
CREATE POLICY "Service role manages smart home links"
  ON public.toroa_smart_home_links FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role manages smart home events"
  ON public.toroa_smart_home_events FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Index
CREATE INDEX idx_smart_home_links_family ON public.toroa_smart_home_links(family_id);
CREATE INDEX idx_smart_home_links_alexa ON public.toroa_smart_home_links(alexa_token);
CREATE INDEX idx_smart_home_events_family ON public.toroa_smart_home_events(family_id);
