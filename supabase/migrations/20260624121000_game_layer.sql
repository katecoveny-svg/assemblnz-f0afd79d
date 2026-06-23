-- Atlas + Pilot game layer (2/2) — points, levels, badges, streaks, missions.
--
-- Turns the v0.1 gamification stub (20260624090100) into a real game shared by
-- Atlas (adoption coach) and Pilot (agent builder). Both surfaces POST actions
-- to /api/game/award; the SECURITY DEFINER award_points() RPC owns the
-- authoritative points (the client can never farm points by lying), enforces
-- once-ever + daily caps via the point_events ledger, awards badges, and tracks
-- streaks. Canonical values mirror lib/game/points.ts.
--
-- Runs after 20260624115000_game_enum_levels.sql (which commits the new enum
-- values so the functions below can cast to them). Self-healing throughout.

BEGIN;

-- ── Profile game columns ───────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- ── Canonical action → points rules (seeded from lib/game/points.ts) ────────
CREATE TABLE IF NOT EXISTS public.point_rules (
  action      text PRIMARY KEY,
  points      integer NOT NULL,
  daily_cap   integer,
  once        boolean NOT NULL DEFAULT false,
  dedupe_meta text,
  badge       text,
  label       text NOT NULL
);
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS point_rules_read ON public.point_rules;
CREATE POLICY point_rules_read ON public.point_rules FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.point_rules (action, points, daily_cap, once, dedupe_meta, badge, label) VALUES
  ('first-conversation', 50,  NULL, true,  NULL,    'discover-1',      'First conversation with Atlas'),
  ('install-agent',      100, NULL, true,  'agent', 'first-install',   'Installed an agent'),
  ('use-agent',          25,  200,  false, NULL,    'first-real-use',  'Used an agent for a real task'),
  ('daily-mission',      50,  NULL, false, NULL,    NULL,              'Completed the daily mission'),
  ('weekly-mission',     200, NULL, false, NULL,    NULL,              'Completed the weekly mission'),
  ('streak-7',           100, NULL, false, NULL,    'streak-7',        '7-day streak'),
  ('streak-30',          500, NULL, false, NULL,    'streak-30',       '30-day streak'),
  ('build-first-agent',  500, NULL, true,  NULL,    'first-build',     'Built your first agent in Pilot'),
  ('ship-personal',      200, NULL, false, NULL,    NULL,              'Shipped a Pilot agent to personal use'),
  ('submit-marketplace', 1000,NULL, false, NULL,    'first-publish',   'Submitted an agent + passed review'),
  ('help-colleague',     150, NULL, false, NULL,    'first-team-share','Helped a colleague onboard'),
  ('say-no',             50,  150,  false, NULL,    NULL,              'Said no to a bad AI suggestion'),
  ('spot-slop',          75,  150,  false, NULL,    'no-slop-spotted', 'Spotted AI slop in a self-review'),
  ('privacy-lesson',     100, NULL, true,  NULL,    'privacy-pro',     'Completed the Privacy Act mini-lesson'),
  ('tikanga-lesson',     100, NULL, true,  NULL,    'tikanga-aware',   'Completed the tikanga mini-lesson'),
  ('pilot-tested',       100, NULL, false, NULL,    NULL,              'Ran the generated tests in Pilot'),
  ('pilot-launch-plan',  75,  NULL, false, NULL,    NULL,              'Generated a launch checklist'),
  ('diagnostic-complete',75,  NULL, true,  NULL,    NULL,              'Mapped your week with Atlas')
ON CONFLICT (action) DO UPDATE SET
  points = excluded.points, daily_cap = excluded.daily_cap, once = excluded.once,
  dedupe_meta = excluded.dedupe_meta, badge = excluded.badge, label = excluded.label;

-- ── Point ledger (idempotency + daily caps + activity feed) ─────────────────
CREATE TABLE IF NOT EXISTS public.point_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      text NOT NULL,
  points      integer NOT NULL,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS point_events_dedupe
  ON public.point_events (user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS point_events_user_day
  ON public.point_events (user_id, action, created_at);
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS point_events_owner ON public.point_events;
CREATE POLICY point_events_owner ON public.point_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ── Missions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.missions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind         text NOT NULL CHECK (kind IN ('daily', 'weekly')),
  for_date     date NOT NULL,
  title        text NOT NULL,
  detail       text NOT NULL,
  action       text NOT NULL,
  points       integer NOT NULL DEFAULT 50,
  completed    boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS missions_user_kind_date
  ON public.missions (user_id, kind, for_date);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS missions_owner_read ON public.missions;
DROP POLICY IF EXISTS missions_owner_write ON public.missions;
DROP POLICY IF EXISTS missions_owner_insert ON public.missions;
CREATE POLICY missions_owner_read ON public.missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY missions_owner_insert ON public.missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY missions_owner_write ON public.missions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── Level helper ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.level_for_points(_points integer)
RETURNS public.ai_literacy_level
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN _points >= 25000 THEN 'kaitiaki'
    WHEN _points >= 12000 THEN 'sensei'
    WHEN _points >= 5000  THEN 'builder'
    WHEN _points >= 2000  THEN 'fluent'
    WHEN _points >= 500   THEN 'familiar'
    ELSE 'beginner'
  END::public.ai_literacy_level
$$;

-- ── award_points — the authoritative emitter ────────────────────────────────
-- Returns jsonb: { ok, awarded, points, level, leveled_up, new_badges }.
CREATE OR REPLACE FUNCTION public.award_points(_action text, _meta jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _rule public.point_rules%ROWTYPE;
  _dedupe text;
  _today date := (now() AT TIME ZONE 'UTC')::date;
  _today_sum integer;
  _awarded integer;
  _prev_points integer;
  _new_points integer;
  _prev_level public.ai_literacy_level;
  _new_level public.ai_literacy_level;
  _badges jsonb;
  _new_badges jsonb := '[]'::jsonb;
  _last date;
  _streak integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not authenticated');
  END IF;

  SELECT * INTO _rule FROM public.point_rules WHERE action = _action;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unknown action');
  END IF;

  -- dedupe key for once-ever (optionally per-meta) actions
  IF _rule.once THEN
    _dedupe := _action;
    IF _rule.dedupe_meta IS NOT NULL THEN
      _dedupe := _dedupe || ':' || COALESCE(_meta->>_rule.dedupe_meta, '');
    END IF;
    IF EXISTS (SELECT 1 FROM public.point_events WHERE user_id = _uid AND dedupe_key = _dedupe) THEN
      SELECT points, level, badges INTO _prev_points, _new_level, _badges FROM public.profiles WHERE id = _uid;
      RETURN jsonb_build_object('ok', true, 'awarded', 0, 'points', COALESCE(_prev_points,0),
        'level', _new_level, 'leveled_up', false, 'new_badges', '[]'::jsonb);
    END IF;
  END IF;

  -- daily cap
  _awarded := _rule.points;
  IF _rule.daily_cap IS NOT NULL THEN
    SELECT COALESCE(sum(points), 0) INTO _today_sum
      FROM public.point_events
      WHERE user_id = _uid AND action = _action AND created_at::date = _today;
    _awarded := LEAST(_rule.points, GREATEST(0, _rule.daily_cap - _today_sum));
  END IF;

  -- read current profile (create a row if somehow missing)
  SELECT points, level, badges, last_active_date, streak
    INTO _prev_points, _prev_level, _badges, _last, _streak
    FROM public.profiles WHERE id = _uid;
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id) VALUES (_uid)
      ON CONFLICT (id) DO NOTHING;
    _prev_points := 0; _prev_level := 'beginner'; _badges := '[]'::jsonb; _last := NULL; _streak := 0;
  END IF;
  _badges := COALESCE(_badges, '[]'::jsonb);

  -- record the event (even a 0-point capped hit, so the feed is honest)
  INSERT INTO public.point_events (user_id, action, points, meta, dedupe_key)
    VALUES (_uid, _action, _awarded, COALESCE(_meta, '{}'::jsonb), _dedupe);

  _new_points := COALESCE(_prev_points, 0) + _awarded;

  -- streak: increment on a new day, reset if a day was missed
  IF _last IS NULL OR _last < _today - 1 THEN
    _streak := 1;
  ELSIF _last = _today - 1 THEN
    _streak := COALESCE(_streak, 0) + 1;
  END IF; -- _last = _today → unchanged

  -- badge from the rule
  IF _rule.badge IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(_badges) b WHERE b->>'id' = _rule.badge) THEN
    _new_badges := _new_badges || jsonb_build_object('id', _rule.badge,
      'awarded_at', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
  END IF;

  _badges := _badges || _new_badges;
  _new_level := public.level_for_points(_new_points);

  UPDATE public.profiles
    SET points = _new_points, badges = _badges, level = _new_level,
        streak = _streak, last_active_date = _today, updated_at = now()
    WHERE id = _uid;

  RETURN jsonb_build_object(
    'ok', true,
    'awarded', _awarded,
    'points', _new_points,
    'level', _new_level,
    'streak', _streak,
    'leveled_up', _new_level <> _prev_level,
    'new_badges', _new_badges
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.level_for_points(integer) TO authenticated, anon;

COMMIT;

-- Verify:
-- SELECT public.award_points('first-conversation');     -- as an authed user
-- SELECT id, points, level, streak, badges FROM public.profiles LIMIT 5;
-- SELECT action, points, created_at FROM public.point_events ORDER BY created_at DESC LIMIT 10;
