-- Output feedback table — tracks user accept/edit/reject of agent outputs
CREATE TABLE public.output_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  output_type TEXT NOT NULL DEFAULT 'advice',
  action TEXT NOT NULL DEFAULT 'accepted',
  edit_diff TEXT,
  original_output TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.output_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.output_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.output_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
  ON public.output_feedback FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_output_feedback_user_agent ON public.output_feedback(user_id, agent_id);
CREATE INDEX idx_output_feedback_action ON public.output_feedback(action);

-- Compliance updates table — daily legislative change feed
CREATE TABLE public.compliance_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url TEXT,
  source_name TEXT NOT NULL,
  title TEXT NOT NULL,
  change_summary TEXT NOT NULL,
  impact_level TEXT NOT NULL DEFAULT 'low',
  affected_agents TEXT[] DEFAULT '{}',
  affected_industries TEXT[] DEFAULT '{}',
  legislation_ref TEXT,
  effective_date DATE,
  auto_applied BOOLEAN DEFAULT false,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.compliance_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view compliance updates"
  ON public.compliance_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX idx_compliance_updates_impact ON public.compliance_updates(impact_level);
CREATE INDEX idx_compliance_updates_date ON public.compliance_updates(created_at DESC);
CREATE INDEX idx_compliance_updates_agents ON public.compliance_updates USING GIN(affected_agents);

-- Validation trigger for output_feedback action
CREATE OR REPLACE FUNCTION public.validate_feedback_action()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action NOT IN ('accepted', 'edited', 'rejected', 'regenerated') THEN
    RAISE EXCEPTION 'action must be accepted, edited, rejected, or regenerated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_output_feedback_action
  BEFORE INSERT OR UPDATE ON public.output_feedback
  FOR EACH ROW EXECUTE FUNCTION public.validate_feedback_action();

-- Validation trigger for compliance_updates impact_level
CREATE OR REPLACE FUNCTION public.validate_impact_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impact_level NOT IN ('low', 'medium', 'high') THEN
    RAISE EXCEPTION 'impact_level must be low, medium, or high';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_compliance_impact
  BEFORE INSERT OR UPDATE ON public.compliance_updates
  FOR EACH ROW EXECUTE FUNCTION public.validate_impact_level();

-- Updated_at trigger for compliance_updates
CREATE TRIGGER update_compliance_updates_updated_at
  BEFORE UPDATE ON public.compliance_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();