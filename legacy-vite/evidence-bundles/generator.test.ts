/**
 * Evidence pack generator — unit tests
 * Version: 0.1.0 · 2026-04-09
 *
 * Test suite for evidence-bundles/generator.ts
 *
 * Tests are organised into three groups:
 *   1. Trace check — generator refuses bundles with unsourced findings
 *   2. Simulated flag — simulated: true propagates and cannot be bypassed
 *   3. Zip contents + hash stability — same input → same output
 *
 * Milestone 1: tests are written and named. Assertions that depend on
 * Milestone 2 (real PDFs, JSZip) are marked it.todo().
 */

// @vitest-environment node

import { describe, it, expect } from 'vitest';
import { createHash } from 'crypto';
import { buildBundle } from './generator.js';
import { readZipEntry } from './zip.js';
import type { WorkflowResult, BundleOptions } from './schema.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeCitation(id = 'cit-1'): import('./schema.js').Citation {
  return {
    id,
    type: 'law',
    label: 'Privacy Act 2020 IPP3A',
    locator: 'Privacy Act 2020 s22A',
    retrieved_at: '2026-04-09T00:00:00.000Z',
  };
}

function makeInput(id = 'inp-1', simulated = false): import('./schema.js').WorkflowInput {
  return {
    id,
    kind: 'document',
    source_ref: 'test-doc.pdf',
    content_hash: 'abc123',
    simulated,
  };
}

function makeBaseResult(overrides: Partial<WorkflowResult> = {}): WorkflowResult {
  const base: WorkflowResult = {
    bundle_id: '01HZ000000000000000000000A',
    schema_version: '0.1.0',
    generated_at: '2026-04-09T00:00:00.000Z',
    agent: { name: 'PIKAU-Copilot', version: '0.1.0', kete: 'PIKAU' },
    pipeline: {
      kahu: { started_at: '2026-04-09T00:00:00.000Z', finished_at: '2026-04-09T00:01:00.000Z', notes: null },
      iho: { started_at: '2026-04-09T00:01:00.000Z', finished_at: '2026-04-09T00:02:00.000Z', notes: null },
      ta: { started_at: '2026-04-09T00:02:00.000Z', finished_at: '2026-04-09T00:05:00.000Z', notes: null },
      mahara: { started_at: '2026-04-09T00:05:00.000Z', finished_at: '2026-04-09T00:06:00.000Z', notes: null },
      mana: { started_at: '2026-04-09T00:06:00.000Z', finished_at: '2026-04-09T00:07:00.000Z', notes: null },
    },
    inputs: [makeInput()],
    steps: [],
    findings: [
      {
        id: 'finding-1',
        statement: 'The business collects employee data indirectly via a third-party rostering system.',
        source_pointer: 'cit-1',
        severity: 'high',
        kete_extension: null,
      },
    ],
    citations: [makeCitation()],
    reviewer: null,
    simulated: false,
    kete_extension: { ipp_snapshot: [], breach_risk_score: null, named_privacy_officer: null, dpia_reference: null, ipp3a_collection_source_notices: [], data_inventory_ref: null },
  };
  return { ...base, ...overrides };
}

const defaultOptions: BundleOptions = {
  generator_version: '0.1.0',
};

// ─── 1. Trace check tests ─────────────────────────────────────────────────────

describe('trace check', () => {
  it('builds a pack when all findings have source pointers', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions);
    expect('kind' in result).toBe(false);
    expect((result as import('./schema.js').BundleArtifact).bundle_id).toBe('01HZ000000000000000000000A');
  });

  it('refuses to build when a finding has an empty source_pointer', () => {
    const resultWithUnsourcedFinding = makeBaseResult({
      findings: [
        {
          id: 'finding-unsourced',
          statement: 'This finding has no source.',
          source_pointer: '',   // empty — should trigger trace error
          severity: 'medium',
          kete_extension: null,
        },
      ],
    });
    const result = buildBundle(resultWithUnsourcedFinding, defaultOptions);
    expect('kind' in result).toBe(true);
    expect((result as import('./schema.js').TraceError).kind).toBe('trace_check_failed');
    expect((result as import('./schema.js').TraceError).finding_ids_without_source).toContain('finding-unsourced');
  });

  it('reports all unsourced finding IDs when multiple findings lack sources', () => {
    const resultWithMultipleUnsourced = makeBaseResult({
      findings: [
        { id: 'f-1', statement: 'no source', source_pointer: '', severity: 'low', kete_extension: null },
        { id: 'f-2', statement: 'also no source', source_pointer: '', severity: 'info', kete_extension: null },
        { id: 'f-3', statement: 'has source', source_pointer: 'cit-1', severity: 'high', kete_extension: null },
      ],
    });
    const result = buildBundle(resultWithMultipleUnsourced, defaultOptions);
    expect('kind' in result).toBe(true);
    const err = result as import('./schema.js').TraceError;
    expect(err.finding_ids_without_source).toContain('f-1');
    expect(err.finding_ids_without_source).toContain('f-2');
    expect(err.finding_ids_without_source).not.toContain('f-3');
  });

  it('builds a pack with zero findings (pipeline ran but found nothing)', () => {
    const resultNoFindings = makeBaseResult({ findings: [], citations: [] });
    const result = buildBundle(resultNoFindings, defaultOptions);
    expect('kind' in result).toBe(false);
  });
});

// ─── 2. Simulated flag tests ──────────────────────────────────────────────────

describe('simulated flag', () => {
  it('builds a pack with simulated: false when no inputs are simulated', () => {
    const result = buildBundle(makeBaseResult({ simulated: false }), defaultOptions);
    expect('kind' in result).toBe(false);
    const artifact = result as import('./schema.js').BundleArtifact;
    expect(artifact.manifest.simulated).toBe(false);
  });

  it('builds a pack with simulated: true when inputs are simulated', () => {
    const simulatedResult = makeBaseResult({
      inputs: [makeInput('inp-1', true)],
      simulated: true,
    });
    const result = buildBundle(simulatedResult, defaultOptions);
    expect('kind' in result).toBe(false);
    const artifact = result as import('./schema.js').BundleArtifact;
    expect(artifact.manifest.simulated).toBe(true);
  });

  it('refuses to build when simulated flag is false but an input is simulated', () => {
    const inconsistentResult = makeBaseResult({
      inputs: [makeInput('inp-1', true)],   // input is simulated
      simulated: false,                     // but flag says false — inconsistent
    });
    const result = buildBundle(inconsistentResult, defaultOptions);
    expect('kind' in result).toBe(true);
    expect((result as import('./schema.js').SimulatedFlagError).kind).toBe('simulated_flag_mismatch');
  });

  it('sets scenario_id in manifest when provided', () => {
    const simulatedResult = makeBaseResult({ inputs: [makeInput('inp-1', true)], simulated: true });
    const result = buildBundle(simulatedResult, {
      generator_version: '0.1.0',
      scenario_id: 'pikau-privacy-audit-cafe-25pax-happy',
    });
    expect('kind' in result).toBe(false);
    const artifact = result as import('./schema.js').BundleArtifact;
    expect(artifact.manifest.scenario_id).toBe('pikau-privacy-audit-cafe-25pax-happy');
  });
});

// ─── 3. Zip contents + hash stability tests ───────────────────────────────────

describe('zip contents', () => {
  it('zip contains data.json', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions);
    expect('kind' in result).toBe(false);
    const artifact = result as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(artifact.zip_bytes), 'data.json');
    expect(entry).not.toBeNull();
  });

  it('zip contains manifest.json', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions);
    const artifact = result as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(artifact.zip_bytes), 'manifest.json');
    expect(entry).not.toBeNull();
  });

  it('data.json in zip parses back to the original WorkflowResult', () => {
    const input = makeBaseResult();
    const result = buildBundle(input, defaultOptions);
    const artifact = result as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(artifact.zip_bytes), 'data.json');
    expect(entry).not.toBeNull();
    const parsed = JSON.parse(entry!.toString('utf-8')) as WorkflowResult;
    expect(parsed.bundle_id).toBe(input.bundle_id);
    expect(parsed.agent.kete).toBe('PIKAU');
  });

  it('manifest.json raw_json_sha256 matches sha256 of data.json bytes', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions);
    const artifact = result as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(artifact.zip_bytes), 'data.json');
    expect(entry).not.toBeNull();
    const actualHash = createHash('sha256').update(entry!).digest('hex');
    expect(artifact.manifest.raw_json_sha256).toBe(actualHash);
  });

  it('manifest.raw_json_sha256 is stable — same input produces same hash', () => {
    const input = makeBaseResult();
    const r1 = buildBundle(input, defaultOptions) as import('./schema.js').BundleArtifact;
    const r2 = buildBundle(input, defaultOptions) as import('./schema.js').BundleArtifact;
    expect(r1.manifest.raw_json_sha256).toBe(r2.manifest.raw_json_sha256);
  });

  it('manifest.pipeline_stages_run lists only stages that ran', () => {
    const partialPipeline = makeBaseResult({
      pipeline: {
        kahu: { started_at: '2026-04-09T00:00:00.000Z', finished_at: '2026-04-09T00:01:00.000Z', notes: null },
        iho: null,
        ta: null,
        mahara: null,
        mana: { started_at: '2026-04-09T00:01:00.000Z', finished_at: '2026-04-09T00:02:00.000Z', notes: null },
      },
    });
    const result = buildBundle(partialPipeline, defaultOptions) as import('./schema.js').BundleArtifact;
    expect(result.manifest.pipeline_stages_run).toContain('kahu');
    expect(result.manifest.pipeline_stages_run).toContain('mana');
    expect(result.manifest.pipeline_stages_run).not.toContain('iho');
    expect(result.manifest.pipeline_stages_run).not.toContain('ta');
    expect(result.manifest.pipeline_stages_run).not.toContain('mahara');
  });

  it('zip contains cover.pdf', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions) as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(result.zip_bytes), 'cover.pdf');
    expect(entry).not.toBeNull();
    // Valid PDF starts with %PDF-
    expect(entry!.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('zip contains detail.pdf with full pipeline trace', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions) as import('./schema.js').BundleArtifact;
    const entry = readZipEntry(Buffer.from(result.zip_bytes), 'detail.pdf');
    expect(entry).not.toBeNull();
    expect(entry!.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('cover.pdf contains SIMULATED text when simulated: true', () => {
    const simulatedResult = makeBaseResult({ inputs: [makeInput('inp-1', true)], simulated: true });
    const result = buildBundle(simulatedResult, defaultOptions) as import('./schema.js').BundleArtifact;
    const coverPdf = readZipEntry(Buffer.from(result.zip_bytes), 'cover.pdf');
    expect(coverPdf).not.toBeNull();
    // PDF stream contains the watermark text
    expect(coverPdf!.toString('latin1')).toContain('SIMULATED');
  });

  it('manifest.files contains entries for cover.pdf and detail.pdf', () => {
    const result = buildBundle(makeBaseResult(), defaultOptions) as import('./schema.js').BundleArtifact;
    const paths = result.manifest.files.map(f => f.path);
    expect(paths).toContain('cover.pdf');
    expect(paths).toContain('detail.pdf');
    // Each has a non-empty sha256
    const cover = result.manifest.files.find(f => f.path === 'cover.pdf')!;
    const detail = result.manifest.files.find(f => f.path === 'detail.pdf')!;
    expect(cover.sha256).toHaveLength(64);
    expect(detail.sha256).toHaveLength(64);
  });
});
