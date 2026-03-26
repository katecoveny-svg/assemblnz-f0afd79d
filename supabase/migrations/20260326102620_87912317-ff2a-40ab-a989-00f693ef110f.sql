CREATE TABLE public.industry_pain_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  agent_name text NOT NULL,
  pain_point_text text NOT NULL,
  severity integer NOT NULL DEFAULT 5,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.industry_pain_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pain points" ON public.industry_pain_points
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage pain points" ON public.industry_pain_points
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));