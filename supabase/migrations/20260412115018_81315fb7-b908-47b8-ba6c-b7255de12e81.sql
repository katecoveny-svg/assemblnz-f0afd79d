
CREATE TABLE public.scheduled_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  schedule_cron TEXT,
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  run_count INTEGER NOT NULL DEFAULT 0,
  max_runs INTEGER,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled tasks"
  ON public.scheduled_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled tasks"
  ON public.scheduled_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled tasks"
  ON public.scheduled_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled tasks"
  ON public.scheduled_tasks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_scheduled_tasks_next_run ON public.scheduled_tasks (next_run_at)
  WHERE status = 'active';

CREATE INDEX idx_scheduled_tasks_user ON public.scheduled_tasks (user_id);

CREATE TRIGGER update_scheduled_tasks_updated_at
  BEFORE UPDATE ON public.scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_scheduled_task_status()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'paused', 'completed', 'failed') THEN
    RAISE EXCEPTION 'status must be active, paused, completed, or failed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_scheduled_task_status_trigger
  BEFORE INSERT OR UPDATE ON public.scheduled_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_scheduled_task_status();
