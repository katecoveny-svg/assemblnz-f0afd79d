
-- Tōroa Family Memory: persistent, encrypted-at-rest memory for each family
CREATE TABLE public.toroa_family_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(3,2) DEFAULT 1.0,
  source TEXT DEFAULT 'conversation',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast family lookups
CREATE INDEX idx_toroa_family_memory_family ON public.toroa_family_memory(family_id);
CREATE INDEX idx_toroa_family_memory_category ON public.toroa_family_memory(family_id, category);
CREATE UNIQUE INDEX idx_toroa_family_memory_key ON public.toroa_family_memory(family_id, category, memory_key);

-- Tōroa Saved Locations: home, school, work addresses for traffic intelligence
CREATE TABLE public.toroa_family_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10,7),
  lon NUMERIC(10,7),
  location_type TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_toroa_family_locations_family ON public.toroa_family_locations(family_id);

-- Tōroa Proactive Alerts: track what's been sent to avoid duplicates
CREATE TABLE public.toroa_proactive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.toroa_families(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  alert_key TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false
);

CREATE INDEX idx_toroa_proactive_alerts_family ON public.toroa_proactive_alerts(family_id, alert_type);
CREATE INDEX idx_toroa_proactive_alerts_key ON public.toroa_proactive_alerts(family_id, alert_key, sent_at);

-- RLS: service role only (edge functions access these)
ALTER TABLE public.toroa_family_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_family_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toroa_proactive_alerts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role key)
CREATE POLICY "Service role full access" ON public.toroa_family_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_family_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON public.toroa_proactive_alerts FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER set_toroa_memory_updated_at
  BEFORE UPDATE ON public.toroa_family_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
