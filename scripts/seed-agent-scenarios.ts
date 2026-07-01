/**
 * Seed / sync the agent_test_scenarios table from the on-disk packs.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm tsx scripts/seed-agent-scenarios.ts
 *
 * The JSON packs in tests/agents/*.json are the source of truth; this upserts
 * them into the seeded mirror table (Phase 1C, spec §7.2.1). Safe to re-run.
 */

import { createClient } from '@supabase/supabase-js';
import { loadAllPacks } from '../lib/testing/load-scenarios';

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required. Skipping.');
    process.exit(1);
  }

  const sb = createClient(url, key);
  const packs = loadAllPacks();
  const rows = packs.flatMap((pack) =>
    pack.scenarios.map((s) => ({
      scenario_id: s.id,
      bundle: s.bundle,
      kind: s.kind,
      input: s.input,
      expected_route: s.expected_route,
      seed: s.seed,
      definition: s,
      version: pack.version,
      updated_at: new Date().toISOString(),
    })),
  );

  const { error } = await sb.from('agent_test_scenarios').upsert(rows, { onConflict: 'scenario_id' });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded ${rows.length} scenarios across ${packs.length} bundles.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
