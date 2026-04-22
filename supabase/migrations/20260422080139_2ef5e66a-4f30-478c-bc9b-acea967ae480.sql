-- Learning game results: shared table for both Toro Homework Help games and Assembl Learn missions
CREATE TABLE public.learning_game_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  game_source TEXT NOT NULL,
  child_name TEXT,
  subject TEXT,
  year_level TEXT,
  nzc_level TEXT,
  topic TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC GENERATED ALWAYS AS (
    CASE WHEN total_questions > 0
      THEN ROUND((score::numeric / total_questions::numeric) * 100, 1)
      ELSE 0 END
  ) STORED,
  duration_seconds INTEGER,
  question_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT learning_game_results_owner_present CHECK (user_id IS NOT NULL OR device_id IS NOT NULL)
);

CREATE INDEX idx_learning_game_results_user ON public.learning_game_results(user_id, created_at DESC);
CREATE INDEX idx_learning_game_results_device ON public.learning_game_results(device_id, created_at DESC);
CREATE INDEX idx_learning_game_results_source ON public.learning_game_results(game_source);

-- Validate game_source via trigger (so we don't use a CHECK with a hardcoded list that's hard to evolve)
CREATE OR REPLACE FUNCTION public.validate_learning_game_source()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.game_source NOT IN ('toro_homework', 'assembl_learn') THEN
    RAISE EXCEPTION 'game_source must be toro_homework or assembl_learn';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_learning_game_source
BEFORE INSERT OR UPDATE ON public.learning_game_results
FOR EACH ROW EXECUTE FUNCTION public.validate_learning_game_source();

CREATE TRIGGER trg_learning_game_results_updated_at
BEFORE UPDATE ON public.learning_game_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.learning_game_results ENABLE ROW LEVEL SECURITY;

-- Signed-in parents: full access to their own rows
CREATE POLICY "Parents can view their own results"
  ON public.learning_game_results FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Parents can insert their own results"
  ON public.learning_game_results FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Parents can update their own results"
  ON public.learning_game_results FOR UPDATE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Parents can delete their own results"
  ON public.learning_game_results FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Anonymous saves: anyone may insert a row that has no user_id but carries a device_id
CREATE POLICY "Anyone can save anonymous results"
  ON public.learning_game_results FOR INSERT
  WITH CHECK (user_id IS NULL AND device_id IS NOT NULL AND length(device_id) >= 8);

-- Anonymous reads: only when the caller provides the matching device_id via a request header.
-- We expose device_id matching through a per-request setting set by the client (current_setting).
-- The client must call set_config('request.device_id', '<id>', true) before SELECT.
CREATE POLICY "Anyone can read their own anonymous results"
  ON public.learning_game_results FOR SELECT
  USING (
    user_id IS NULL
    AND device_id IS NOT NULL
    AND device_id = current_setting('request.device_id', true)
  );

CREATE POLICY "Anyone can update their own anonymous results"
  ON public.learning_game_results FOR UPDATE
  USING (
    user_id IS NULL
    AND device_id IS NOT NULL
    AND device_id = current_setting('request.device_id', true)
  );

CREATE POLICY "Anyone can delete their own anonymous results"
  ON public.learning_game_results FOR DELETE
  USING (
    user_id IS NULL
    AND device_id IS NOT NULL
    AND device_id = current_setting('request.device_id', true)
  );