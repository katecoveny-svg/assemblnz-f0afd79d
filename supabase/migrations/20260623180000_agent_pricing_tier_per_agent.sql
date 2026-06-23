-- Flat pricing: agents.pricing_tier is now metadata only, uniformly 'per_agent'.
--
-- Pricing moved to flat per-agent + bundles (NZ$15/agent, set by the user's
-- subscription plan via agent_installs.plan / lib/billing/agent-pricing.ts —
-- migration 20260623170000). The per-agent CLASS tier (Tōro/Whānau/Pro/Business)
-- no longer determines price, so every agent's pricing_tier collapses to
-- 'per_agent'. priceTier/priceNzd survive on the code registry purely as
-- authoring metadata (e.g. flagging high-infrastructure agents).
--
-- Relax the CHECK to admit 'per_agent' (keeping the legacy values valid so the
-- frozen 20260623140100 / 20260623160100 seeds still apply on a fresh build),
-- then set every existing row. The regenerated seed (20260623180100) writes
-- 'per_agent' directly.

BEGIN;

ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_pricing_tier_check;
ALTER TABLE public.agents
  ADD CONSTRAINT agents_pricing_tier_check
  CHECK (pricing_tier IN ('per_agent', 'free', 'freemium', 'paid'));

ALTER TABLE public.agents ALTER COLUMN pricing_tier SET DEFAULT 'per_agent';
UPDATE public.agents SET pricing_tier = 'per_agent' WHERE pricing_tier <> 'per_agent';

COMMIT;

-- Verify:
-- SELECT pricing_tier, count(*) FROM public.agents GROUP BY pricing_tier;
--   -- expect a single row: per_agent | 35
