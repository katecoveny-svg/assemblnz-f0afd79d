/**
 * Simulator runner tests — Assembl
 * Version: 0.1.0 · 2026-04-09
 *
 * End-to-end smoke tests for the simulator pipeline:
 *   loadScenario → pikauGenerator → runAgentStub → buildBundle → assertCriteria
 *
 * These tests are the CI gate — if a scenario doesn't pass its own success_criteria,
 * the build fails before anything lands in main.
 *
 * Tests run in Node.js (no jsdom needed — pure data pipeline).
 */

// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { loadScenario } from './runtime/load-scenario.js';
import { runScenario } from './runtime/runner.js';

// ─── PIKAU happy path ─────────────────────────────────────────────────────────

describe('PIKAU — happy path café', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('pikau/happy-path-cafe-25pax.yaml');
    expect(scenario.id).toBe('pikau-privacy-audit-cafe-25pax-happy');
    expect(scenario.kete).toBe('PIKAU');
    expect(scenario.seed).toBe(42);
    expect(scenario.success_criteria.length).toBeGreaterThan(0);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('pikau/happy-path-cafe-25pax.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      // Surface failure details in test output
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('produces a simulated bundle artifact', async () => {
    const scenario = loadScenario('pikau/happy-path-cafe-25pax.yaml');
    const result = await runScenario(scenario);
    expect(result.bundle_artifact).not.toBeNull();
    expect(result.bundle_artifact!.manifest.simulated).toBe(true);
    expect(result.bundle_artifact!.manifest.kete).toBe('PIKAU');
    expect(result.bundle_artifact!.manifest.scenario_id).toBe('pikau-privacy-audit-cafe-25pax-happy');
  });

  it('bundle contains cover.pdf and detail.pdf', async () => {
    const { readZipEntry } = await import('../evidence-bundles/zip.js');
    const scenario = loadScenario('pikau/happy-path-cafe-25pax.yaml');
    const result = await runScenario(scenario);
    const zipBuf = Buffer.from(result.bundle_artifact!.zip_bytes);
    const cover = readZipEntry(zipBuf, 'cover.pdf');
    const detail = readZipEntry(zipBuf, 'detail.pdf');
    expect(cover).not.toBeNull();
    expect(detail).not.toBeNull();
    expect(cover!.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('IPP3A status is not_applicable in the happy path', async () => {
    const scenario = loadScenario('pikau/happy-path-cafe-25pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { pikauGenerator } = await import('./generators/pikau/index.js');
    const generatorOutput = pikauGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);
    const ext = workflowResult.kete_extension as import('../evidence-bundles/schema.js').PikauExtension;
    const ipp3aEntry = ext.ipp_snapshot.find(e => e.principle === 'IPP3A');
    expect(ipp3aEntry).toBeDefined();
    expect(['not_applicable', 'compliant']).toContain(ipp3aEntry!.status);
  });
});

// ─── PIKAU IPP3A triggered ─────────────────────────────────────────────────────

describe('PIKAU — IPP3A triggered café', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    expect(scenario.id).toBe('pikau-ipp3a-triggered-cafe-25pax');
    expect(scenario.kete).toBe('PIKAU');
    expect(scenario.seed).toBe(137);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('produces a simulated bundle artifact', async () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    const result = await runScenario(scenario);
    expect(result.bundle_artifact).not.toBeNull();
    expect(result.bundle_artifact!.manifest.simulated).toBe(true);
  });

  it('IPP3A status is at_risk in the triggered path', async () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { pikauGenerator } = await import('./generators/pikau/index.js');
    const generatorOutput = pikauGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);
    const ext = workflowResult.kete_extension as import('../evidence-bundles/schema.js').PikauExtension;
    const ipp3aEntry = ext.ipp_snapshot.find(e => e.principle === 'IPP3A');
    expect(ipp3aEntry).toBeDefined();
    expect(['at_risk', 'non_compliant']).toContain(ipp3aEntry!.status);
  });

  it('has at least one critical or high severity finding', async () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { pikauGenerator } = await import('./generators/pikau/index.js');
    const generatorOutput = pikauGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);
    const highOrCritical = workflowResult.findings.filter(
      f => f.severity === 'high' || f.severity === 'critical',
    );
    expect(highOrCritical.length).toBeGreaterThan(0);
  });

  it('ipp3a_collection_source_notices records the rostering data flow', async () => {
    const scenario = loadScenario('pikau/ipp3a-triggered-cafe-25pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { pikauGenerator } = await import('./generators/pikau/index.js');
    const generatorOutput = pikauGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const workflowResult = await runAgentStub(generatorOutput, scenario.workflow_id);
    const ext = workflowResult.kete_extension as import('../evidence-bundles/schema.js').PikauExtension;
    expect(ext.ipp3a_collection_source_notices.length).toBeGreaterThan(0);
    const notice = ext.ipp3a_collection_source_notices[0];
    expect(notice.collection_method).toBe('indirect');
    expect(notice.notice_given).toBe(false);
  });

  it('generator output is deterministic — same seed produces same vendor register', async () => {
    const { pikauGenerator } = await import('./generators/pikau/index.js');
    const params = { employee_count: 25, ipp3a_exposure: 'high', overseas_data_processor: true, employees_notified: false };
    const r1 = pikauGenerator.generate('test', 137, params);
    const r2 = pikauGenerator.generate('test', 137, params);
    expect(JSON.stringify(r1.fixtures.vendor_register)).toBe(JSON.stringify(r2.fixtures.vendor_register));
  });
});

// ─── MANAAKI happy path ───────────────────────────────────────────────────────

describe('MANAAKI — happy path restaurant', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('manaaki/happy-path-restaurant-30seats.yaml');
    expect(scenario.id).toBe('manaaki-food-safety-restaurant-30seats-happy');
    expect(scenario.kete).toBe('MANAAKI');
    expect(scenario.seed).toBe(71);
    expect(scenario.success_criteria.length).toBeGreaterThan(0);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('manaaki/happy-path-restaurant-30seats.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('produces a simulated MANAAKI bundle artifact', async () => {
    const scenario = loadScenario('manaaki/happy-path-restaurant-30seats.yaml');
    const result = await runScenario(scenario);
    expect(result.bundle_artifact).not.toBeNull();
    expect(result.bundle_artifact!.manifest.simulated).toBe(true);
    expect(result.bundle_artifact!.manifest.kete).toBe('MANAAKI');
  });

  it('generator output is deterministic — same seed produces same staff records', async () => {
    const { manaakiGenerator } = await import('./generators/manaaki/index.js');
    const params = { seat_count: 30, staff_count: 30, food_control_plan_current: true, allergen_training_complete: true };
    const r1 = manaakiGenerator.generate('test', 71, params);
    const r2 = manaakiGenerator.generate('test', 71, params);
    expect(JSON.stringify(r1.fixtures.staff_records)).toBe(JSON.stringify(r2.fixtures.staff_records));
  });
});

// ─── MANAAKI food safety gap ───────────────────────────────────────────────────

describe('MANAAKI — food safety gap restaurant', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('manaaki/food-safety-gap-restaurant-30seats.yaml');
    expect(scenario.id).toBe('manaaki-food-safety-gap-restaurant-30seats');
    expect(scenario.kete).toBe('MANAAKI');
    expect(scenario.seed).toBe(89);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('manaaki/food-safety-gap-restaurant-30seats.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('has at least one high severity finding for FCP gap', async () => {
    const { manaakiGenerator } = await import('./generators/manaaki/index.js');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const scenario = loadScenario('manaaki/food-safety-gap-restaurant-30seats.yaml');
    const gen = manaakiGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const wr = await runAgentStub(gen, scenario.workflow_id);
    const high = wr.findings.filter(f => f.severity === 'high' || f.severity === 'critical');
    expect(high.length).toBeGreaterThan(0);
  });
});

// ─── WAIHANGA happy path ───────────────────────────────────────────────────────

describe('WAIHANGA — happy path build site', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('waihanga/happy-path-build-site.yaml');
    expect(scenario.id).toBe('waihanga-site-safety-build-site-happy');
    expect(scenario.kete).toBe('WAIHANGA');
    expect(scenario.seed).toBe(53);
    expect(scenario.success_criteria.length).toBeGreaterThan(0);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('waihanga/happy-path-build-site.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('produces a simulated WAIHANGA bundle artifact', async () => {
    const scenario = loadScenario('waihanga/happy-path-build-site.yaml');
    const result = await runScenario(scenario);
    expect(result.bundle_artifact).not.toBeNull();
    expect(result.bundle_artifact!.manifest.simulated).toBe(true);
    expect(result.bundle_artifact!.manifest.kete).toBe('WAIHANGA');
  });

  it('generator output is deterministic — same seed produces same crew records', async () => {
    const { waihangaGenerator } = await import('./generators/waihanga/index.js');
    const params = { crew_size: 12, site_safety_plan_current: true, subcontractor_induction_complete: true };
    const r1 = waihangaGenerator.generate('test', 53, params);
    const r2 = waihangaGenerator.generate('test', 53, params);
    expect(JSON.stringify(r1.fixtures.crew_records)).toBe(JSON.stringify(r2.fixtures.crew_records));
  });
});

// ─── WAIHANGA site safety gap ─────────────────────────────────────────────────

describe('WAIHANGA — site safety gap build site', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('waihanga/site-safety-gap-build-site.yaml');
    expect(scenario.id).toBe('waihanga-site-safety-gap-build-site');
    expect(scenario.kete).toBe('WAIHANGA');
    expect(scenario.seed).toBe(67);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('waihanga/site-safety-gap-build-site.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('has at least one high severity finding for SSP gap', async () => {
    const { waihangaGenerator } = await import('./generators/waihanga/index.js');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const scenario = loadScenario('waihanga/site-safety-gap-build-site.yaml');
    const gen = waihangaGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const wr = await runAgentStub(gen, scenario.workflow_id);
    const high = wr.findings.filter(f => f.severity === 'high' || f.severity === 'critical');
    expect(high.length).toBeGreaterThan(0);
  });
});

// ─── ARATAKI happy path ───────────────────────────────────────────────────────

describe('ARATAKI — happy path consultancy (IPP3A-aware)', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('arataki/happy-path-consultancy-20pax.yaml');
    expect(scenario.id).toBe('arataki-privacy-consultancy-20pax-happy');
    expect(scenario.kete).toBe('ARATAKI');
    expect(scenario.seed).toBe(101);
    expect(scenario.success_criteria.length).toBeGreaterThan(0);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('arataki/happy-path-consultancy-20pax.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('produces a simulated ARATAKI bundle artifact', async () => {
    const scenario = loadScenario('arataki/happy-path-consultancy-20pax.yaml');
    const result = await runScenario(scenario);
    expect(result.bundle_artifact).not.toBeNull();
    expect(result.bundle_artifact!.manifest.simulated).toBe(true);
    expect(result.bundle_artifact!.manifest.kete).toBe('ARATAKI');
  });

  it('IPP3A status is not_applicable in the happy path (employees notified)', async () => {
    const scenario = loadScenario('arataki/happy-path-consultancy-20pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { aratakiGenerator } = await import('./generators/arataki/index.js');
    const gen = aratakiGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const wr = await runAgentStub(gen, scenario.workflow_id);
    const ext = wr.kete_extension as import('../evidence-bundles/schema.js').PikauExtension;
    const ipp3aEntry = ext.ipp_snapshot.find(e => e.principle === 'IPP3A');
    expect(ipp3aEntry).toBeDefined();
    expect(['not_applicable', 'compliant']).toContain(ipp3aEntry!.status);
  });

  it('generator output is deterministic — same seed produces same employee records', async () => {
    const { aratakiGenerator } = await import('./generators/arataki/index.js');
    const params = { employee_count: 20, ipp3a_exposure: 'low', overseas_data_processor: true, employees_notified: true };
    const r1 = aratakiGenerator.generate('test', 101, params);
    const r2 = aratakiGenerator.generate('test', 101, params);
    expect(JSON.stringify(r1.fixtures.employee_records)).toBe(JSON.stringify(r2.fixtures.employee_records));
  });
});

// ─── ARATAKI IPP3A triggered ──────────────────────────────────────────────────

describe('ARATAKI — IPP3A triggered consultancy', () => {
  it('loads the scenario from YAML', () => {
    const scenario = loadScenario('arataki/ipp3a-triggered-consultancy-20pax.yaml');
    expect(scenario.id).toBe('arataki-ipp3a-triggered-consultancy-20pax');
    expect(scenario.kete).toBe('ARATAKI');
    expect(scenario.seed).toBe(113);
  });

  it('runs end-to-end and passes all success criteria', async () => {
    const scenario = loadScenario('arataki/ipp3a-triggered-consultancy-20pax.yaml');
    const result = await runScenario(scenario);

    if (!result.passed) {
      console.error('Scenario failures:', JSON.stringify(result.failures, null, 2));
    }

    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('IPP3A status is at_risk in the triggered path (employees not notified)', async () => {
    const scenario = loadScenario('arataki/ipp3a-triggered-consultancy-20pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { aratakiGenerator } = await import('./generators/arataki/index.js');
    const gen = aratakiGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const wr = await runAgentStub(gen, scenario.workflow_id);
    const ext = wr.kete_extension as import('../evidence-bundles/schema.js').PikauExtension;
    const ipp3aEntry = ext.ipp_snapshot.find(e => e.principle === 'IPP3A');
    expect(ipp3aEntry).toBeDefined();
    expect(['at_risk', 'non_compliant']).toContain(ipp3aEntry!.status);
  });

  it('has at least one high or critical severity finding', async () => {
    const scenario = loadScenario('arataki/ipp3a-triggered-consultancy-20pax.yaml');
    const { runAgentStub } = await import('./runtime/agent-stub.js');
    const { aratakiGenerator } = await import('./generators/arataki/index.js');
    const gen = aratakiGenerator.generate(scenario.id, scenario.seed, scenario.generator_inputs);
    const wr = await runAgentStub(gen, scenario.workflow_id);
    const high = wr.findings.filter(f => f.severity === 'high' || f.severity === 'critical');
    expect(high.length).toBeGreaterThan(0);
  });
});
