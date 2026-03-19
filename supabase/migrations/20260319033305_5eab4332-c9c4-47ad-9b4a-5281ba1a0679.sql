
-- Create agent_status table for online/offline toggles
CREATE TABLE public.agent_status (
  agent_id TEXT PRIMARY KEY,
  is_online BOOLEAN NOT NULL DEFAULT true,
  maintenance_message TEXT DEFAULT 'This agent is currently undergoing maintenance. Please check back soon.',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agent status"
  ON public.agent_status FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage agent status"
  ON public.agent_status FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create message_log table for activity feed
CREATE TABLE public.message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id TEXT NOT NULL,
  message_preview TEXT NOT NULL,
  user_name TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all message logs"
  ON public.message_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert message logs"
  ON public.message_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert message logs"
  ON public.message_log FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Seed agent_status for all agents
INSERT INTO public.agent_status (agent_id) VALUES
  ('aura'), ('nova'), ('apex'), ('terra'), ('pulse'), ('forge'), ('arc'), ('flux'),
  ('nexus'), ('axis'), ('operations'), ('prism'), ('catalyst'), ('guardian'),
  ('beacon'), ('vertex'), ('customs'), ('maritime'), ('vine'), ('wellness'),
  ('edu'), ('creative'), ('energy'), ('logistics'), ('fintech'), ('proptech'),
  ('legaltech'), ('agritech'), ('enviro')
ON CONFLICT (agent_id) DO NOTHING;
