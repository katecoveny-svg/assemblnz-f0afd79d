CREATE TABLE IF NOT EXISTS public.mcp_data_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  action TEXT NOT NULL,
  request_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mcp_data_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_mcp_data_log_function_created
  ON public.mcp_data_log (function_name, created_at DESC);

-- Only admins can read the log
CREATE POLICY "Admins can read mcp_data_log"
  ON public.mcp_data_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));