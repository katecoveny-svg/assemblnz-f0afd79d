CREATE TABLE IF NOT EXISTS public.tnz_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  tnz_reference TEXT,
  http_status INTEGER,
  tnz_result TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  conversation_id UUID,
  agent_id TEXT,
  source TEXT,
  message_preview TEXT,
  raw_response JSONB
);

CREATE INDEX IF NOT EXISTS idx_tnz_send_log_created_at ON public.tnz_send_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tnz_send_log_success ON public.tnz_send_log (success, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tnz_send_log_channel ON public.tnz_send_log (channel, created_at DESC);

ALTER TABLE public.tnz_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view tnz send log"
ON public.tnz_send_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
