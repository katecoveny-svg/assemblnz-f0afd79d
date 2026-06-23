-- Agent catalogue — columns for the 30-agent hero seed.
--
-- The base marketplace migration (20260623120000_agent_marketplace.sql) created
-- public.agents as a mirror of the code registry (lib/marketplace/agents.ts).
-- The 30-agent roster carries richer catalogue data than the original columns
-- held, so this migration widens the table before the seed
-- (20260623140100_seed_hero_agents.sql) lands.
--
-- Adds:
--   price_tier         NZ pricing ladder (free / toro / whanau / pro / business)
--   price_monthly_nzd  headline monthly price in NZD (0 = free)
--   nz_knowledge_apis  the live NZ sources / APIs each agent is wired into
--   sample_outputs     two short example outputs shown on the detail page
--   icon / accent      Dash-brand avatar (lucide icon name + accent hex)
--   greeting / starters chat empty-state copy
--
-- Also relaxes the status CHECK to allow 'coming_soon' (per the roster), and —
-- importantly — locks the system_prompt column away from public reads. The
-- catalogue rows are world-readable via RLS, but the locked prompts are
-- server-only IP; column-level GRANTs keep anon/authenticated out of that one
-- column while leaving every other catalogue field readable.

BEGIN;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS price_tier text NOT NULL DEFAULT 'free'
    CHECK (price_tier IN ('free', 'toro', 'whanau', 'pro', 'business')),
  ADD COLUMN IF NOT EXISTS price_monthly_nzd numeric(8, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nz_knowledge_apis jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sample_outputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS accent text,
  ADD COLUMN IF NOT EXISTS greeting text,
  ADD COLUMN IF NOT EXISTS starters jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Allow 'coming_soon' alongside the existing states.
ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_status_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_status_check
  CHECK (status IN ('live', 'draft', 'retired', 'coming_soon'));

CREATE INDEX IF NOT EXISTS agents_price_tier_idx ON public.agents (price_tier);

-- ── Keep the locked system prompts out of public reads ───────────────────
-- RLS makes the row world-readable; column-level privileges keep system_prompt
-- server-only. anon/authenticated may read every catalogue column EXCEPT
-- system_prompt. Clients must therefore select explicit columns (a bare
-- `select *` as anon will be denied on system_prompt — intended).
REVOKE SELECT ON public.agents FROM anon, authenticated;
GRANT SELECT (
  id, slug, name, te_reo, description, what_it_does, what_you_get, category,
  model_tier, pricing_tier, price_tier, price_monthly_nzd, nz_knowledge_apis,
  sample_outputs, icon, accent, greeting, starters, avatar_url, status,
  created_at, updated_at
) ON public.agents TO anon, authenticated;

COMMIT;
