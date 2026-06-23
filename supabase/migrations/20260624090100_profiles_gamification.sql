-- Atlas v0.1 — gamification stub on user profiles.
--
-- The brief calls this "user_profiles"; the live table is public.profiles
-- (created in 20260319012833). Adds an AI-literacy level + a badges array.
-- v0.1 only awards a "First step" badge on a first Atlas conversation; streaks,
-- daily challenges and leaderboards are v0.5 — these columns are the hooks.
--
-- Self-healing: the enum is created only if absent, columns use IF NOT EXISTS.
-- RLS already covers public.profiles (users read/update their own row), so the
-- new columns inherit it — no extra policy needed.

BEGIN;

-- AI-literacy level enum: beginner → familiar → fluent → builder.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_literacy_level') THEN
    CREATE TYPE public.ai_literacy_level AS ENUM ('beginner', 'familiar', 'fluent', 'builder');
  END IF;
END$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level public.ai_literacy_level NOT NULL DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS badges jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Award a badge idempotently to the calling user's own profile. SECURITY DEFINER
-- so it can read+write the row, but it only ever touches auth.uid()'s profile —
-- never another user's. Returns the resulting badges array.
CREATE OR REPLACE FUNCTION public.award_badge(_badge_id text, _label text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _badges jsonb;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT badges INTO _badges FROM public.profiles WHERE id = _uid;
  IF _badges IS NULL THEN
    _badges := '[]'::jsonb;
  END IF;

  -- Already earned? Return as-is (idempotent).
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_badges) b WHERE b->>'id' = _badge_id
  ) THEN
    RETURN _badges;
  END IF;

  _badges := _badges || jsonb_build_object(
    'id', _badge_id,
    'label', _label,
    'awarded_at', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );

  UPDATE public.profiles SET badges = _badges, updated_at = now() WHERE id = _uid;
  RETURN _badges;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_badge(text, text) TO authenticated;

COMMIT;

-- Verify:
-- SELECT id, level, badges FROM public.profiles LIMIT 5;
-- SELECT public.award_badge('first-step', 'First step');  -- as an authed user
