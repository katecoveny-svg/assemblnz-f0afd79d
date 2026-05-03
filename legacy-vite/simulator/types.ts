/**
 * Simulator types — Assembl
 * Version: 0.1.0
 * 2026-04-09
 *
 * ScenarioConfig: the shape of a scenario YAML file.
 * GeneratorOutput: what a kete generator returns.
 * ScenarioRunResult: what the runner returns after a scenario completes.
 */

// Re-export WorkflowResult and related types — the simulator produces these.
export type {
  WorkflowResult,
  WorkflowInput,
  WorkflowStep,
  Finding,
  Citation,
  Kete,
  KeteExtension,
  BundleArtifact,
} from '../evidence-bundles/schema.js';

// ─── Scenario config ──────────────────────────────────────────────────────────

/**
 * The shape of a scenario YAML file in simulator/scenarios/{kete}/*.yaml.
 * These files are the source of truth for what the simulator runs and what CI checks.
 */
export interface ScenarioConfig {
  id: string;                    // e.g. 'pikau-privacy-incident-cafe-25pax-happy'
  kete: string;                  // e.g. 'PIKAU'
  title: string;
  buyer_persona: string;         // description of the target buyer this scenario demonstrates for
  seed: number;                  // integer seed for deterministic data generation
  generator_inputs: Record<string, unknown>;   // kete-specific generator params
  workflow_id: string;           // identifies which agent workflow to run
  expected_bundle: ExpectedBundle;
  success_criteria: SuccessCriteria[];
  public_visibility: boolean;    // true = show on assembl.co.nz/try
  last_verified: string | null;  // ISO 8601 date — CI warns if >120 days ago
}

/** The expected shape of the output bundle for CI assertions. */
export interface ExpectedBundle {
  simulated: true;               // all simulator scenarios produce simulated bundles
  finding_count_min: number;
  finding_count_max: number;
  pipeline_stages_expected: string[];
  kete_extension_fields_required: string[];
}

export interface SuccessCriteria {
  description: string;
  assertion: 'finding_exists' | 'finding_severity' | 'ipp_snapshot_status' | 'bundle_valid' | 'no_unsourced_findings';
  params: Record<string, unknown>;
}

// ─── Generator interface ──────────────────────────────────────────────────────

/**
 * Every kete generator implements this interface.
 * Pure function — same seed + scenario_id always produces the same output.
 * Never calls an LLM at generation time — deterministic is a feature.
 */
export interface KeteGenerator {
  generate(scenario_id: string, seed: number, params: Record<string, unknown>): GeneratorOutput;
}

export interface GeneratorOutput {
  scenario_id: string;
  seed: number;
  kete: string;
  fixtures: Record<string, unknown>;   // kete-specific fixture data
  metadata: GeneratorMetadata;
}

export interface GeneratorMetadata {
  generator_version: string;
  generated_at: string;              // ISO 8601
  real_enough_checklist: string[];   // items documenting what the data covers and what it omits
}

// ─── Runner output ────────────────────────────────────────────────────────────

export interface ScenarioRunResult {
  scenario_id: string;
  kete: string;
  passed: boolean;
  failures: ScenarioFailure[];
  bundle_artifact: import('../evidence-bundles/schema.js').BundleArtifact | null;
  duration_ms: number;
}

export interface ScenarioFailure {
  criterion: string;
  expected: string;
  actual: string;
}
