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

const OUT = join(
  process.cwd(),
  'supabase/migrations/20260623140100_seed_hero_agents.sql',
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

const sql = `-- Seed — 30 hero agents into the marketplace catalogue.
--
-- AUTO-GENERATED from lib/marketplace/agents.ts by scripts/build-agents-seed.ts.
-- Do not hand-edit; regenerate with: pnpm tsx scripts/build-agents-seed.ts
--
-- Mirrors the code registry (the source of truth) into public.agents so joins,
-- analytics, and admin views have the catalogue. Idempotent: re-running the
-- generator and re-applying keeps the table in sync. The system_prompt column
-- is seeded here but is NOT publicly readable — see
-- 20260623140000_agent_catalogue_columns.sql (column-level GRANTs).

BEGIN;

INSERT INTO public.agents (
  ${COLUMNS.join(',\n  ')}
) VALUES
${rows}
ON CONFLICT (slug) DO UPDATE SET
${updateAssignments};

COMMIT;

-- Verify:
-- SELECT count(*) FROM public.agents;                       -- expect 30
-- SELECT category, count(*) FROM public.agents GROUP BY category ORDER BY 1;
-- SELECT slug, name, price_tier, price_monthly_nzd, status
--   FROM public.agents ORDER BY category, name;
`;

writeFileSync(OUT, sql);
console.log(`Wrote ${OUT} (${MARKETPLACE_AGENTS.length} agents)`);
