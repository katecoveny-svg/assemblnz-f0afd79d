-- Admin management policies for agent_prompts
CREATE POLICY "Admins can view all agent prompts"
ON public.agent_prompts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert agent prompts"
ON public.agent_prompts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update agent prompts"
ON public.agent_prompts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete agent prompts"
ON public.agent_prompts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));