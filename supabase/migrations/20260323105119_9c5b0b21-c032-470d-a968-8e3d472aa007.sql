
-- Compliance deadlines (pre-populated NZ regulatory calendar)
CREATE TABLE public.compliance_deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  recurring TEXT CHECK (recurring IN ('once', 'monthly', 'quarterly', 'annually', 'custom')) DEFAULT 'annually',
  recurrence_rule TEXT,
  category TEXT NOT NULL,
  industries TEXT[] DEFAULT '{}',
  agents TEXT[] DEFAULT '{}',
  legislation_ref TEXT,
  severity TEXT DEFAULT 'standard' CHECK (severity IN ('critical', 'high', 'standard', 'informational')),
  auto_generate_document BOOLEAN DEFAULT false,
  document_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User-specific compliance task tracking
CREATE TABLE public.user_compliance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deadline_id UUID REFERENCES public.compliance_deadlines(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'overdue', 'not_applicable')),
  due_date DATE NOT NULL,
  completed_date DATE,
  notes TEXT,
  generated_document_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_compliance_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own compliance tasks"
  ON public.user_compliance_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Legislation changes feed
CREATE TABLE public.legislation_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  act_name TEXT NOT NULL,
  effective_date DATE,
  summary TEXT NOT NULL,
  impact TEXT NOT NULL,
  affected_agents TEXT[] DEFAULT '{}',
  affected_industries TEXT[] DEFAULT '{}',
  severity TEXT DEFAULT 'standard',
  action_required TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public read access for compliance_deadlines (reference data)
ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read compliance deadlines"
  ON public.compliance_deadlines
  FOR SELECT
  TO authenticated
  USING (true);

-- Public read access for legislation_changes
ALTER TABLE public.legislation_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read legislation changes"
  ON public.legislation_changes
  FOR SELECT
  TO authenticated
  USING (true);
