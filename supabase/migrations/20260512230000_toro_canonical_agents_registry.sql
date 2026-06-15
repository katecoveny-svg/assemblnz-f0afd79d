-- Tōro · register the three canonical agents so the legacy→canonical flip
-- migrations (20260512231542, 20260513110000) find their prerequisite rows on a
-- from-scratch replay.
--
-- Why this exists
-- ---------------
-- kid-money, term-planner and holiday-ideas are registered into agent_prompts at
-- runtime by assembl-plugins (source of truth: assembl-plugins @ 3696629), not by
-- any migration. Both flip migrations open with a guard that hard-fails unless all
-- three already exist under pack='toro'. On production that's satisfied — the rows
-- were registered before the flip ran — but a from-scratch replay (e.g. a Supabase
-- preview branch carrying no prod/runtime data) has no such rows, so the guard
-- aborts the entire replay. This migration seeds the rows idempotently *before*
-- the guard runs, making the migration history self-contained.
--
-- Safety / idempotency
--   • ON CONFLICT (agent_name, pack) DO NOTHING → a strict no-op on production and
--     any environment where the canonical agents are already registered. It never
--     touches the real, runtime-authored system_prompt / model / icon.
--   • system_prompt below is a deliberate placeholder. The canonical definition is
--     owned by assembl-plugins and upserted at deploy time; the placeholder only
--     ever materialises on a throwaway replay database.
--   • Rows are seeded is_active=false; migration 20260512231542 / 20260513110000
--     performs the activation as part of the flip.

insert into public.agent_prompts (agent_name, pack, display_name, system_prompt, is_active)
values
  ('kid-money',     'toro', 'Kid Money',     '(placeholder — canonical definition is authored at runtime by assembl-plugins; see migration header)', false),
  ('term-planner',  'toro', 'Term Planner',  '(placeholder — canonical definition is authored at runtime by assembl-plugins; see migration header)', false),
  ('holiday-ideas', 'toro', 'Holiday Ideas', '(placeholder — canonical definition is authored at runtime by assembl-plugins; see migration header)', false)
on conflict (agent_name, pack) do nothing;
