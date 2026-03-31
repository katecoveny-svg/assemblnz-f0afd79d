
-- Create pack_visibility table
CREATE TABLE public.pack_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_slug TEXT NOT NULL UNIQUE,
  pack_name TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  requires_role app_role NOT NULL DEFAULT 'free',
  display_order INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  description TEXT,
  agent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pack_visibility ENABLE ROW LEVEL SECURITY;

-- Public packs visible to all authenticated users
CREATE POLICY "Public packs visible to authenticated users"
  ON public.pack_visibility
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Admin-only packs visible to admin users
CREATE POLICY "Admin packs visible to admins"
  ON public.pack_visibility
  FOR SELECT
  TO authenticated
  USING (is_public = false AND public.has_role(auth.uid(), 'business'));

-- Admins can update pack visibility
CREATE POLICY "Admins can update packs"
  ON public.pack_visibility
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'business'))
  WITH CHECK (public.has_role(auth.uid(), 'business'));

-- Allow anon to see public packs (for landing page)
CREATE POLICY "Public packs visible to anon"
  ON public.pack_visibility
  FOR SELECT
  TO anon
  USING (is_public = true);

-- Create trial_subscriptions table
CREATE TABLE public.trial_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_slug TEXT NOT NULL REFERENCES public.pack_visibility(pack_slug),
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  converted_to_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_slug)
);

ALTER TABLE public.trial_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trials"
  ON public.trial_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trials"
  ON public.trial_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_pack_visibility_display_order ON public.pack_visibility(display_order);
CREATE INDEX idx_trial_subscriptions_user_id ON public.trial_subscriptions(user_id);
CREATE INDEX idx_trial_subscriptions_pack_slug ON public.trial_subscriptions(pack_slug);

-- Seed data
INSERT INTO public.pack_visibility (pack_slug, pack_name, is_public, requires_role, display_order, icon, description, agent_count) VALUES
('pakihi', 'Pakihi (Business)', true, 'free', 1, 'briefcase', '12 AI agents built for NZ businesses. HR compliance, payroll, financial analysis, operations, and strategic intelligence — all integrated.', 12),
('hanga', 'Hanga (Construction)', true, 'free', 2, 'hammer', '7 construction specialists for safety, BIM, project management, resources, consenting, and quality assurance — tikanga-aligned environmental impact review.', 7),
('manaaki', 'Manaaki (Hospitality)', true, 'free', 3, 'utensils', '8 hospitality specialists for food compliance, alcohol licensing, table management, kitchen operations, staff scheduling, and guest wellbeing.', 8),
('toroa', 'Tōroa (Family Navigator)', true, 'free', 4, 'heart', 'Your family''s AI navigator. Tōroa helps whānau find the right services, track wellbeing, coordinate care, and stay connected. Built for Aotearoa families.', 1),
('auaha', 'Auaha (Creative)', false, 'business', 5, 'palette', '10 creative specialists for brand strategy, social media, video production, podcast creation, and campaign management — powered by your Brand DNA.', 10),
('hangarau', 'Hangarau (Technology)', false, 'business', 6, 'cpu', '9 technology specialists for cybersecurity, app development, API management, infrastructure monitoring, and digital transformation.', 9);
