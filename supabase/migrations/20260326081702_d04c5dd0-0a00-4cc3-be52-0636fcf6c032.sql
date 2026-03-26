
-- Proactive alerts table for cross-agent intelligence notifications
CREATE TABLE public.proactive_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_agent TEXT NOT NULL,
  target_agent TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'standard',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.proactive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.proactive_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.proactive_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.proactive_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert alerts" ON public.proactive_alerts FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Add expires_at column to shared_context if not exists
ALTER TABLE public.shared_context ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Enable realtime for proactive_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.proactive_alerts;
