-- SUPERSEDED — no-op.
--
-- This migration originally renamed the beat_* tables to dash_* (the brand
-- rename "Beat by assembl" → "Dash by assembl"). With 20260617140000_beat_network
-- now neutered to a no-op, there are no beat_* tables to rename. The unified
-- dash_* schema comes from 20260619034901_dash_schema +
-- 20260619070000_dash_unify_schema instead.
--
-- Neutered (rather than deleted) to preserve migration history and to keep
-- `supabase db push` clean: prod's history lacks this migration, and the old
-- ALTER ... RENAME would collide with the already-existing dash_* tables.

DO $$ BEGIN END $$;
