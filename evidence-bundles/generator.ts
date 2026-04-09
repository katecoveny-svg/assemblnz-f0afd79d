/**
 * Evidence pack generator — Assembl
 * Version: 0.1.0 · 2026-04-09
 *
 * Pure function: WorkflowResult → BundleArtifact | BuildBundleError
 *
 * Rules (non-negotiable, enforced in this file):
 *   1. Trace check: every Finding must have a non-empty source_pointer. Refuses to build if not.
 *   2. Simulated flag: if ANY input has simulated: true, the bundle is SIMULATED — no override.
 *   3. User-facing strings say "evidence pack" — not "bundle", not "compliance pack".
 */

import { createHash } from 'crypto';
import { buildZip } from './zip.js';
import { generateCoverPdf, generateDetailPdf } from './pdf.js';
import type {
  WorkflowResult,
  BundleOptions,
  BundleArtifact,
  BundleManifest,
  BuildBundleError,
  BundleFileEntry,
} from './schema.js';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build an evidence pack from a fully-resolved WorkflowResult.
 *
 * Returns BundleArtifact on success.
 * Returns BuildBundleError if the trace check fails or the simulated flag is inconsistent.
 *
 * Pure: same input → same output. No network calls. No state.
 * Side effects (storage, email, signing) live in the host, not here.
 */
export function buildBundle(
  workflowResult: WorkflowResult,
  options: BundleOptions,
): BundleArtifact | BuildBundleError {
  // ── 1. Simulated flag consistency check ──────────────────────────────────
  const hasSimulatedInput = workflowResult.inputs.some(i => i.simulated);
  if (hasSimulatedInput && !workflowResult.simulated) {
    const error: BuildBundleError = {
      kind: 'simulated_flag_mismatch',
      message:
        'workflow_result.simulated must be true because at least one input has simulated: true. ' +
        'There is no override flag.',
    };
    return error;
  }

  // ── 2. Trace check — no unsourced claims ────────────────────────────────
  const unsourcedFindings = workflowResult.findings.filter(f => !f.source_pointer || f.source_pointer.trim() === '');
  if (unsourcedFindings.length > 0) {
    const error: BuildBundleError = {
      kind: 'trace_check_failed',
      finding_ids_without_source: unsourcedFindings.map(f => f.id),
    };
    return error;
  }

  // ── 3. Generate PDFs ─────────────────────────────────────────────────────
  const coverPdf = generateCoverPdf(workflowResult);
  const detailPdf = generateDetailPdf(workflowResult);

  // ── 4. Assemble data.json ────────────────────────────────────────────────
  const dataJson = JSON.stringify(workflowResult, null, 2);
  const dataJsonBytes = Buffer.from(dataJson, 'utf-8');
  const rawJsonSha256 = sha256(dataJsonBytes);

  // ── 5. Build manifest.json ───────────────────────────────────────────────
  const pipelineStagesRun = Object.entries(workflowResult.pipeline)
    .filter(([, stage]) => stage !== null)
    .map(([name]) => name);

  const files: BundleFileEntry[] = [
    { path: 'cover.pdf',   sha256: sha256(coverPdf),    size_bytes: coverPdf.length },
    { path: 'detail.pdf',  sha256: sha256(detailPdf),   size_bytes: detailPdf.length },
    { path: 'data.json',   sha256: rawJsonSha256,        size_bytes: dataJsonBytes.length },
  ];

  const manifest: BundleManifest = {
    bundle_id: workflowResult.bundle_id,
    schema_version: workflowResult.schema_version,
    generated_at: workflowResult.generated_at,
    generator_version: options.generator_version,
    agent_name: workflowResult.agent.name,
    agent_version: workflowResult.agent.version,
    kete: workflowResult.agent.kete,
    pipeline_stages_run: pipelineStagesRun,
    simulated: workflowResult.simulated,
    scenario_id: options.scenario_id ?? null,
    files,
    raw_json_sha256: rawJsonSha256,
  };

  // Serialise manifest before pushing its own entry (self-referential sha256 is not possible)
  const manifestBytes = Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8');
  manifest.files.push({
    path: 'manifest.json',
    sha256: sha256(manifestBytes),
    size_bytes: manifestBytes.length,
  });
  // Re-serialise so the manifest.json file in the zip includes all four entries
  const finalManifestBytes = Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8');

  // ── 6. Package as zip ────────────────────────────────────────────────────
  const zipBytes = buildZip([
    { name: 'cover.pdf',    data: coverPdf },
    { name: 'detail.pdf',   data: detailPdf },
    { name: 'data.json',    data: dataJsonBytes },
    { name: 'manifest.json', data: finalManifestBytes },
  ]);

  return {
    bundle_id: workflowResult.bundle_id,
    zip_bytes: zipBytes,
    manifest,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}
