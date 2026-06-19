-- SUPERSEDED — no-op.
--
-- This migration originally created the "beat" ad-network serving schema
-- (beat_publishers / beat_campaigns / beat_impressions, text-id publishers,
-- *_cents bids). It was NEVER applied to production: prod's dash_* tables came
-- from 20260619034901_dash_schema (the uuid "payout" generation), and the two
-- generations have since been unified onto that uuid schema by
-- 20260619070000_dash_unify_schema (the serving columns are added there).
--
-- It is neutered to a no-op so that:
--   • a fresh apply produces the single unified uuid schema (not the old text
--     tables, which would diverge from prod), and
--   • `supabase db push` no longer fails (prod's history lacks this migration
--     and 20260619000000_rename_beat_to_dash; applying these no-ops is clean,
--     whereas the old rename would collide with the already-existing dash_*).
--
-- Nothing references the old beat_* objects (no code, no later migration), so
-- dropping the create is safe. Kept as a no-op to preserve migration history.

DO $$ BEGIN END $$;
