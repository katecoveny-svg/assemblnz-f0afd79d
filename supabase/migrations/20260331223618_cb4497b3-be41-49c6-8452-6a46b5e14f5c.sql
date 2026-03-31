
-- Pack analytics
CREATE TABLE public.pack_analytics (
  event_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pack_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  device_type TEXT DEFAULT 'desktop',
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own pack analytics"
  ON public.pack_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert pack analytics"
  ON public.pack_analytics FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can view own pack analytics"
  ON public.pack_analytics FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pack analytics"
  ON public.pack_analytics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'business'));

-- Agent analytics events
CREATE TABLE public.agent_analytics_events (
  event_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pack_slug TEXT NOT NULL,
  agent_slug TEXT NOT NULL,
  event_type TEXT NOT NULL,
  session_duration_seconds INTEGER,
  successful_completion BOOLEAN,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own agent analytics"
  ON public.agent_analytics_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own agent analytics"
  ON public.agent_analytics_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent analytics"
  ON public.agent_analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'business'));

-- Funnel analytics
CREATE TABLE public.funnel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own funnel analytics"
  ON public.funnel_analytics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own funnel analytics"
  ON public.funnel_analytics FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all funnel analytics"
  ON public.funnel_analytics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'business'));

-- Indexes
CREATE INDEX idx_pack_analytics_pack_slug ON public.pack_analytics(pack_slug);
CREATE INDEX idx_pack_analytics_event_type ON public.pack_analytics(event_type);
CREATE INDEX idx_pack_analytics_created_at ON public.pack_analytics(created_at);
CREATE INDEX idx_pack_analytics_user_id ON public.pack_analytics(user_id);
CREATE INDEX idx_agent_analytics_agent_slug ON public.agent_analytics_events(agent_slug);
CREATE INDEX idx_agent_analytics_pack_slug ON public.agent_analytics_events(pack_slug);
CREATE INDEX idx_agent_analytics_created_at ON public.agent_analytics_events(created_at);
CREATE INDEX idx_funnel_analytics_user_id ON public.funnel_analytics(user_id);
CREATE INDEX idx_funnel_analytics_step ON public.funnel_analytics(step_name);
CREATE INDEX idx_funnel_analytics_created_at ON public.funnel_analytics(created_at);
