-- Pilot — 13-step pack columns + per-step point rules.
--
-- The shared game layer (points, award_points(), point_events, point_rules,
-- missions, levels) is owned by the Atlas session and already lives on main
-- (20260624115000 + 20260624121000). This migration does NOT redefine any of
-- that. It only:
--   1. widens public.pilot_agents to carry the structured spec + the generated
--      19-item pack;
--   2. adds the Pilot per-step micro-reward rules to public.point_rules
--      (additive, ON CONFLICT DO UPDATE — mirrors lib/game/points.ts), so the
--      shared award_points() RPC recognises them. Each pays once per draft
--      (dedupe on the draft id) via the existing point_events ledger.
--
-- Self-healing: ADD COLUMN IF NOT EXISTS; the INSERT upserts.
-- MUST run after 20260624121000 (creates point_rules) and 20260624093000
-- (creates pilot_agents) — hence the 130000 timestamp.

BEGIN;

-- ── pilot_agents: structured spec + 19-item pack ─────────────────────────
ALTER TABLE public.pilot_agents
  ADD COLUMN IF NOT EXISTS spec jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pack jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agent_type text;

-- ── Pilot per-step point rules (steps 1–9) ───────────────────────────────
-- Mirrors the GAME_ACTIONS added in lib/game/points.ts. once + dedupe on the
-- draft id, so each step pays once per agent built, never on revisit.
INSERT INTO public.point_rules (action, points, daily_cap, once, dedupe_meta, badge, label) VALUES
  ('pilot-step-goal',          50,  NULL, true, 'draft', NULL, 'Chose a goal in Pilot'),
  ('pilot-step-workflow',      50,  NULL, true, 'draft', NULL, 'Mapped the workflow in Pilot'),
  ('pilot-step-agent-type',    50,  NULL, true, 'draft', NULL, 'Chose the agent type in Pilot'),
  ('pilot-step-user',          50,  NULL, true, 'draft', NULL, 'Defined the user in Pilot'),
  ('pilot-step-knowledge',     50,  NULL, true, 'draft', NULL, 'Chose knowledge sources in Pilot'),
  ('pilot-step-tools',         50,  NULL, true, 'draft', NULL, 'Picked tools in Pilot'),
  ('pilot-step-guardrails',    50,  NULL, true, 'draft', NULL, 'Set guardrails in Pilot'),
  ('pilot-step-pack',          100, NULL, true, 'draft', NULL, 'Drafted the agent pack in Pilot'),
  ('pilot-step-system-prompt', 100, NULL, true, 'draft', NULL, 'Generated the system prompt in Pilot')
ON CONFLICT (action) DO UPDATE SET
  points = excluded.points, daily_cap = excluded.daily_cap, once = excluded.once,
  dedupe_meta = excluded.dedupe_meta, badge = excluded.badge, label = excluded.label;

COMMIT;
