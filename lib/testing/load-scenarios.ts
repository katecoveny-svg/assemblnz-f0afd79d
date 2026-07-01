/**
 * Scenario-pack loader + validator (Phase 1C).
 *
 * Packs live on disk as JSON at tests/agents/{bundle}.json (the deliverable
 * artefact). JSON — not YAML — so the loader needs no dependency and the same
 * packs can be read by the Deno edge function too.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { BUNDLES, BUNDLE_IDS } from './bundles';
import type { BundleId, Scenario, ScenarioPack } from './types';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** repo-root/tests/agents */
export const SCENARIO_DIR = path.resolve(HERE, '..', '..', 'tests', 'agents');

const VALID_KINDS = new Set(['routing', 'red-flag', 'ambiguous', 'te-reo', 'hostile']);

/** Validate a pack; throws with a precise message on the first problem. */
export function validatePack(pack: ScenarioPack): void {
  if (!BUNDLES[pack.bundle]) throw new Error(`Unknown bundle: ${pack.bundle}`);
  const cfg = BUNDLES[pack.bundle];
  const seen = new Set<string>();
  for (const s of pack.scenarios) {
    const where = `${pack.bundle}/${s.id}`;
    if (!s.id) throw new Error(`${pack.bundle}: scenario missing id`);
    if (seen.has(s.id)) throw new Error(`${where}: duplicate scenario id`);
    seen.add(s.id);
    if (s.bundle !== pack.bundle) throw new Error(`${where}: bundle mismatch (${s.bundle})`);
    if (!VALID_KINDS.has(s.kind)) throw new Error(`${where}: invalid kind "${s.kind}"`);
    if (!s.input) throw new Error(`${where}: missing input`);
    const routeOk =
      s.expected_route === 'clarify' ||
      s.expected_route === 'refuse' ||
      cfg.routes.includes(s.expected_route);
    if (!routeOk) {
      throw new Error(
        `${where}: expected_route "${s.expected_route}" is not a ${pack.bundle} route ` +
          `(valid: ${cfg.routes.join(', ')}, clarify, refuse)`,
      );
    }
    for (const arr of ['expected_behaviours', 'hard_stop_checks', 'nz_facts', 'forbidden', 'expected_mana_receipt_sources'] as const) {
      if (!Array.isArray(s[arr])) throw new Error(`${where}: ${arr} must be an array`);
    }
  }
}

export function loadPack(bundle: BundleId): ScenarioPack {
  const file = path.join(SCENARIO_DIR, `${bundle}.json`);
  const pack = JSON.parse(readFileSync(file, 'utf8')) as ScenarioPack;
  validatePack(pack);
  return pack;
}

export function loadAllPacks(): ScenarioPack[] {
  const files = readdirSync(SCENARIO_DIR).filter((f) => f.endsWith('.json'));
  const packs = files.map((f) => {
    const pack = JSON.parse(readFileSync(path.join(SCENARIO_DIR, f), 'utf8')) as ScenarioPack;
    validatePack(pack);
    return pack;
  });
  return packs;
}

/** Every bundle ships a pack — the CI gate asserts this. */
export function assertEveryBundleHasPack(): void {
  const present = new Set(loadAllPacks().map((p) => p.bundle));
  const missing = BUNDLE_IDS.filter((b) => !present.has(b));
  if (missing.length) throw new Error(`Bundles without a scenario pack: ${missing.join(', ')}`);
}

export function findScenario(scenarioId: string): { pack: ScenarioPack; scenario: Scenario } | null {
  for (const pack of loadAllPacks()) {
    const scenario = pack.scenarios.find((s) => s.id === scenarioId);
    if (scenario) return { pack, scenario };
  }
  return null;
}
