/**
 * Generates the hero-agent seed migration from the code registry so the
 * Supabase `public.agents` mirror never drifts from lib/marketplace/agents.ts.
 *
 *   pnpm tsx scripts/build-agents-seed.ts
 *
 * Output: supabase/migrations/20260623140100_seed_hero_agents.sql
 * Re-run whenever the registry changes; the migration is idempotent
 * (INSERT ... ON CONFLICT (slug) DO UPDATE).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MARKETPLACE_AGENTS } from '../lib/marketplace/agents';

// Current canonical seed — CANON roster + Auaha (24 agents, 2026-06-23). Lands
// after all prior agent migrations, PRUNES any agent no longer in the roster,
// then upserts the full set.
const OUT = join(
  process.cwd(),
  'supabase/migrations/20260623210000_seed_canon_24_agents.sql',
);

/** Escape a value as a SQL string literal. */
function s(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** Escape a JS value as a jsonb literal. */
function j(value: unknown): string {
  return `${s(JSON.stringify(value))}::jsonb`;
}

const COLUMNS = [
  'slug',
  'name',
  'te_reo',
  'description',
  'what_it_does',
  'what_you_get',
  'category',
  'model_tier',
  'pricing_tier',
  'price_tier',
  'price_monthly_nzd',
  'nz_knowledge_apis',
  'sample_outputs',
  'tools',
  'skills',
  'fallback_models',
  'icon',
  'accent',
  'greeting',
  'starters',
  'system_prompt',
  'status',
];

const rows = MARKETPLACE_AGENTS.map((a) => {
  const values = [
    s(a.slug),
    s(a.name),
    s(a.teReo),
    s(a.description),
    j(a.whatItDoes),
    j(a.whatYouGet),
    s(a.category),
    s(a.modelTier),
    s(a.pricingTier),
    s(a.priceTier),
    String(a.priceNzd),
    j(a.nzKnowledge),
    j(a.sampleOutputs),
    j(a.tools),
    j(a.skills),
    j(a.fallbackModels),
    s(a.icon),
    s(a.accent),
    s(a.greeting),
    j(a.starters),
    s(a.systemPrompt),
    s(a.status),
  ];
  return `  (${values.join(', ')})`;
}).join(',\n');

const updateAssignments = COLUMNS.filter((c) => c !== 'slug')
  .map((c) => `  ${c} = excluded.${c}`)
  .concat('  updated_at = now()')
  .join(',\n');

const slugList = MARKETPLACE_AGENTS.map((a) => s(a.slug)).join(', ');

const sql = `-- Seed — CANON roster + Auaha (24 agents, 2026-06-23).
--
-- AUTO-GENERATED from lib/marketplace/agents.ts by scripts/build-agents-seed.ts.
-- Do not hand-edit; regenerate with: pnpm tsx scripts/build-agents-seed.ts
--
-- Supersedes every prior agent seed. PRUNES catalogue rows no longer in the
-- roster (the 35→23 cut) and dependent per-user rows referencing them, then
-- upserts the 23 (ON CONFLICT (slug) DO UPDATE). system_prompt + fallback_models
-- are seeded but NOT publicly readable (see 20260623140050 / 20260623160000).

BEGIN;

-- Prune agents that left the roster. Per-user tables key by agent_slug (text)
-- or agent_id (uuid → agents.id ON DELETE CASCADE), so clean both.
DELETE FROM public.agent_installs WHERE agent_slug NOT IN (${slugList});
DELETE FROM public.agent_chat_sessions WHERE agent_slug NOT IN (${slugList});
DELETE FROM public.agents WHERE slug NOT IN (${slugList});

INSERT INTO public.agents (
  ${COLUMNS.join(',\n  ')}
) VALUES
${rows}
ON CONFLICT (slug) DO UPDATE SET
${updateAssignments};

COMMIT;

-- Verify:
-- SELECT count(*) FROM public.agents;                       -- expect 24
-- SELECT category, count(*) FROM public.agents GROUP BY category ORDER BY 1;
-- SELECT slug, name, te_reo, price_tier, price_monthly_nzd
--   FROM public.agents ORDER BY category, name;
`;

writeFileSync(OUT, sql);
console.log(`Wrote ${OUT} (${MARKETPLACE_AGENTS.length} agents)`);
