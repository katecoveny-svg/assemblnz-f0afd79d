-- Version history snapshots for agent system prompts
CREATE TABLE IF NOT EXISTS public.agent_prompt_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES public.agent_prompts(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  pack TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  system_prompt TEXT NOT NULL,
  model_preference TEXT,
  is_active BOOLEAN,
  version INTEGER NOT NULL,
  changed_by UUID,
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_prompt_versions_prompt_id_created
  ON public.agent_prompt_versions (prompt_id, created_at DESC);

ALTER TABLE public.agent_prompt_versions ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write history
CREATE POLICY "Admins can view prompt versions"
ON public.agent_prompt_versions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert prompt versions"
ON public.agent_prompt_versions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete prompt versions"
ON public.agent_prompt_versions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));