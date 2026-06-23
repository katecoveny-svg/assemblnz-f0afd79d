-- Atlas + Pilot game layer (1/2) — extend the level enum to six levels.
--
-- Must land in its OWN migration, before 20260624121000_game_layer.sql: Postgres
-- forbids using a newly-added enum value in the same transaction that adds it,
-- and the game_layer functions cast to 'sensei'/'kaitiaki'. Splitting lets these
-- values commit first. Self-healing (ADD VALUE IF NOT EXISTS). Runs after the
-- enum is first created in 20260624090100_profiles_gamification.sql.

ALTER TYPE public.ai_literacy_level ADD VALUE IF NOT EXISTS 'sensei';
ALTER TYPE public.ai_literacy_level ADD VALUE IF NOT EXISTS 'kaitiaki';
