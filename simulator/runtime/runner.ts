/**
 * Scenario runner — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Takes a ScenarioConfig, runs it through the generator + agent, pipes the
 * WorkflowResult to the evidence bundle generator, and asserts the output
 * matches the scenario's success criteria.
 *
 * [TODO: Milestone 4+] Replace runAgentStub with the real managed agents runtime shim.
 */

import type { ScenarioConfig, ScenarioRunResult, ScenarioFailure, SuccessCriteria } from '../types.js';
import type { BundleArtifact, WorkflowResult } from '../../evidence-bundles/schema.js';
import type { PikauExtension } from '../../evidence-bundles/schema.js';
import { pikauGenerator } from '../generators/pikau/index.js';
import { manaakiGenerator } from '../generators/manaaki/index.js';
import { waihangaGenerator } from '../generators/waihanga/index.js';
import { aratakiGenerator } from '../generators/arataki/index.js';
import { runAgentStub } from './agent-stub.js';
import { buildBundle } from '../../evidence-bundles/generator.js';

const GENERATORS: Record<string, import('../types.js').KeteGenerator> = {
  PIKAU: pikauGenerator,
  MANAAKI: manaakiGenerator,
  WAIHANGA: waihangaGenerator,
  ARATAKI: aratakiGenerator,
  // [TODO: future] add AUAHA generator
};

/** Severity rank for ordering comparisons. */
const SEVERITY_RANK: Record<string, number> = {
  info: 0, low: 1, medium: 2, high: 3, critical: 4,
};

/**
 * Run a single scenario and return the result.
 */
export async function runScenario(scenario: ScenarioConfig): Promise<ScenarioRunResult> {
  const start = Date.now();

  const generator = GENERATORS[scenario.kete];
  if (!generator) {
    return {
      scenario_id: scenario.id,
      kete: scenario.kete,
      passed: false,
      failures: [{ criterion: 'generator_exists', expected: `generator for ${scenario.kete}`, actual: 'not found' }],
      bundle_artifact: null,
      duration_ms: Date.now() - start,
    };
  }

  // 1. Generate synthetic fixtures
  const generatorOutput = generator.generate(scenario.id, scenario.seed, scenario.generator_inputs);

  // 2. Run through the agent (stub — see agent-stub.ts)
  const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);

  // 3. Build the evidence pack
  const buildResult = buildBundle(workflowResult, {
    scenario_id: scenario.id,
    generator_version: generatorOutput.metadata.generator_version,
  });

  if ('kind' in buildResult) {
    return {
      scenario_id: scenario.id,
      kete: scenario.kete,
      passed: false,
      failures: [{ criterion: 'bundle_builds', expected: 'BundleArtifact', actual: `error: ${buildResult.kind}` }],
      bundle_artifact: null,
      duration_ms: Date.now() - start,
    };
  }

  const bundleArtifact = buildResult as BundleArtifact;

  // 4. Assert success criteria
  const failures: ScenarioFailure[] = [];
  for (const criterion of scenario.success_criteria) {
    const failure = assertCriterion(criterion, workflowResult, bundleArtifact);
    if (failure) failures.push(failure);
  }

  return {
    scenario_id: scenario.id,
    kete: scenario.kete,
    passed: failures.length === 0,
    failures,
    bundle_artifact: bundleArtifact,
    duration_ms: Date.now() - start,
  };
}

// ── Assertion implementations ─────────────────────────────────────────────────

function assertCriterion(
  criterion: SuccessCriteria,
  workflowResult: WorkflowResult,
  _bundle: BundleArtifact,
): ScenarioFailure | null {
  switch (criterion.assertion) {

    case 'no_unsourced_findings': {
      const unsourced = workflowResult.findings.filter(f => !f.source_pointer);
      if (unsourced.length > 0) {
        return {
          criterion: criterion.description,
          expected: 'all findings have source_pointer',
          actual: `${unsourced.length} findings without source_pointer: ${unsourced.map(f => f.id).join(', ')}`,
        };
      }
      return null;
    }

    case 'bundle_valid': {
      const params = criterion.params as { simulated?: boolean };
      if (params.simulated && !workflowResult.simulated) {
        return {
          criterion: criterion.description,
          expected: 'simulated: true',
          actual: 'simulated: false',
        };
      }
      return null;
    }

    case 'ipp_snapshot_status': {
      const params = criterion.params as { principle: string; expected_statuses: string[] };
      const ext = workflowResult.kete_extension as PikauExtension;
      const snapshot = ext?.ipp_snapshot ?? [];
      const entry = snapshot.find(e => e.principle === params.principle);
      if (!entry) {
        const available = snapshot.map(e => e.principle).join(', ') || 'none';
        return {
          criterion: criterion.description,
          expected: `ipp_snapshot entry for ${params.principle}`,
          actual: `no entry found; available: [${available}]`,
        };
      }
      if (!params.expected_statuses.includes(entry.status)) {
        return {
          criterion: criterion.description,
          expected: `${params.principle} status one of [${params.expected_statuses.join(', ')}]`,
          actual: `status: ${entry.status}`,
        };
      }
      return null;
    }

    case 'finding_exists': {
      const params = criterion.params as { source_type?: string; label_contains?: string };
      const matchingCitations = workflowResult.citations.filter(c => {
        const typeMatch = !params.source_type || c.type === params.source_type;
        const labelMatch = !params.label_contains || c.label.includes(params.label_contains);
        return typeMatch && labelMatch;
      });
      const hasMatchingFinding = workflowResult.findings.some(f =>
        matchingCitations.some(c => c.id === f.source_pointer),
      );
      if (!hasMatchingFinding) {
        return {
          criterion: criterion.description,
          expected: `finding with citation type=${params.source_type ?? 'any'} label containing "${params.label_contains ?? ''}"`,
          actual: 'no matching finding found',
        };
      }
      return null;
    }

    case 'finding_severity': {
      const params = criterion.params as { min_severity: string };
      const minRank = SEVERITY_RANK[params.min_severity] ?? 0;
      const hasHighEnough = workflowResult.findings.some(
        f => (SEVERITY_RANK[f.severity] ?? 0) >= minRank,
      );
      if (!hasHighEnough) {
        const found = workflowResult.findings.map(f => f.severity).join(', ') || 'none';
        return {
          criterion: criterion.description,
          expected: `at least one finding with severity >= ${params.min_severity}`,
          actual: `severities found: [${found}]`,
        };
      }
      return null;
    }

    default:
      return null;
  }
}
