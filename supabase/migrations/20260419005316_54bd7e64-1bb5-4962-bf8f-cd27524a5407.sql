
-- 1. reel_renders table for batch MP4 generation tracking
CREATE TABLE IF NOT EXISTS public.reel_renders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid,
  batch_id uuid NOT NULL,
  batch_index integer NOT NULL DEFAULT 0,
  topic text NOT NULL,
  prompt text NOT NULL,
  aspect_ratio text NOT NULL DEFAULT '9:16',
  provider text NOT NULL DEFAULT 'fal-kling',
  status text NOT NULL DEFAULT 'queued',
  request_id text,
  video_url text,
  thumbnail_url text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reel_renders_user_idx ON public.reel_renders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reel_renders_batch_idx ON public.reel_renders(batch_id);
CREATE INDEX IF NOT EXISTS reel_renders_status_idx ON public.reel_renders(status);

ALTER TABLE public.reel_renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reel renders"
  ON public.reel_renders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own reel renders"
  ON public.reel_renders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reel renders"
  ON public.reel_renders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own reel renders"
  ON public.reel_renders FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER reel_renders_updated_at
  BEFORE UPDATE ON public.reel_renders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Wire all active kete to the universal handler (except toroa which has its own)
UPDATE public.kete_definitions
   SET handler_fn = 'kete-default-handler', updated_at = now()
 WHERE is_active = true
   AND handler_fn IS NULL;
