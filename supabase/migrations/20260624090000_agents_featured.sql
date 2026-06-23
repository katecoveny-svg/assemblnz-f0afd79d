-- Atlas v0.1 — mark featured agents in the catalogue.
--
-- `featured` surfaces an agent as a lead "Start here" card on /agents. It is
-- presentation metadata owned by the code registry (lib/marketplace/agents.ts);
-- this column mirrors it into public.agents so server-side consumers can read
-- it too. Self-healing (ADD COLUMN IF NOT EXISTS); runs after the hero-agent
-- seed (20260623160100), so the rows already exist to update.

BEGIN;

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- Atlas — the free AI literacy coach — leads the shelf.
UPDATE public.agents SET featured = true WHERE slug = 'atlas';

COMMIT;

-- Verify:
-- SELECT slug, name, featured FROM public.agents WHERE featured ORDER BY name;
