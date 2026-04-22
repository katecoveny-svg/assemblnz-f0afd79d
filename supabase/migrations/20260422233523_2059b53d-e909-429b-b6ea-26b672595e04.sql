-- Agent overrides: lets admins edit any code-defined agent without code changes.
CREATE TABLE public.agent_overrides (
  agent_id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  tagline TEXT,
  pack TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  expertise JSONB NOT NULL DEFAULT '[]'::jsonb,
  starters JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_overrides ENABLE ROW LEVEL SECURITY;

-- Public read so the frontend can apply overrides for everyone
CREATE POLICY "Agent overrides are readable by everyone"
ON public.agent_overrides FOR SELECT
USING (true);

-- Admin write
CREATE POLICY "Admins can insert agent overrides"
ON public.agent_overrides FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update agent overrides"
ON public.agent_overrides FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete agent overrides"
ON public.agent_overrides FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_agent_overrides_updated_at
BEFORE UPDATE ON public.agent_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();