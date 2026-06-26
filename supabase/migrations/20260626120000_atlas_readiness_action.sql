-- Atlas readiness diagnostic — the point rule for completing the 10-question quiz.
--
-- Adds the `readiness-complete` action to the canonical point_rules table so the
-- SECURITY DEFINER award_points() RPC (20260624121000_game_layer) recognises it.
-- Completing the readiness diagnostic awards 200 points + the "First step" badge
-- (discover-1, shared with the first Atlas conversation — the RPC dedupes badges
-- by id, so a user who does both keeps a single "First step"). Mirrors the entry
-- in lib/game/points.ts.
--
-- Must run AFTER 20260624121000_game_layer.sql (which creates point_rules). Idempotent.

BEGIN;

INSERT INTO public.point_rules (action, points, daily_cap, once, dedupe_meta, badge, label) VALUES
  ('readiness-complete', 200, NULL, true, NULL, 'discover-1', 'Completed the AI readiness diagnostic')
ON CONFLICT (action) DO UPDATE SET
  points = excluded.points, daily_cap = excluded.daily_cap, once = excluded.once,
  dedupe_meta = excluded.dedupe_meta, badge = excluded.badge, label = excluded.label;

COMMIT;

-- Verify:
-- SELECT * FROM public.point_rules WHERE action = 'readiness-complete';
