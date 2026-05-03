/**
 * Scenario loader — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Loads and parses a scenario YAML file from simulator/scenarios/{kete}/*.yaml
 * Returns a fully-typed ScenarioConfig.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'js-yaml';
import type { ScenarioConfig } from '../types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCENARIOS_DIR = resolve(__dirname, '..', 'scenarios');

/**
 * Load a scenario by its path relative to simulator/scenarios/.
 * e.g. loadScenario('pikau/happy-path-cafe-25pax.yaml')
 */
export function loadScenario(relPath: string): ScenarioConfig {
  const fullPath = resolve(SCENARIOS_DIR, relPath);
  const raw = readFileSync(fullPath, 'utf-8');
  const parsed = load(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Failed to parse scenario YAML: ${fullPath}`);
  }
  return parsed as ScenarioConfig;
}
