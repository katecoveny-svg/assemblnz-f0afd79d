/**
 * Evidence bundle schema — Assembl
 * Version: 0.1.0
 * 2026-04-09
 *
 * WorkflowResult is the pure-function input to the bundle generator.
 * BundleArtifact is the output.
 *
 * Internal type names use "Bundle" for code clarity.
 * Any string rendered to a human must use "evidence pack" — not "bundle".
 */

// ─── Kete ────────────────────────────────────────────────────────────────────

export type Kete = 'MANAAKI' | 'WAIHANGA' | 'AUAHA' | 'ARATAKI' | 'PIKAU';

// ─── Pipeline stages ─────────────────────────────────────────────────────────

/** One pipeline stage. null means the stage did not run. */
export interface PipelineStage {
  started_at: string;    // ISO 8601
  finished_at: string;   // ISO 8601
  notes: string | null;
}

export interface Pipeline {
  kahu: PipelineStage | null;
  iho: PipelineStage | null;
  ta: PipelineStage | null;
  mahara: PipelineStage | null;
  mana: PipelineStage | null;
}

// ─── Inputs ──────────────────────────────────────────────────────────────────

/** A raw input fed into the workflow. */
export interface WorkflowInput {
  id: string;
  kind: string;           // e.g. 'document' | 'ticket' | 'form' | 'data-export'
  source_ref: string;     // filename or external URI
  content_hash: string;   // sha-256 of raw content bytes
  simulated: boolean;     // set by Kahu — true if source is the Tōro simulator
}

// ─── Steps ───────────────────────────────────────────────────────────────────

/** An agent action step taken during the Tā stage. */
export interface WorkflowStep {
  id: string;
  agent_action: string;
  prompt_ref: string;     // repo path to the prompt file used, e.g. agents/pikau/privacy-copilot/system-prompt.md
  model: string;          // e.g. 'claude-sonnet-4-6'
  model_version: string;
  output_ref: string;
  citations: string[];    // citation IDs — must resolve in WorkflowResult.citations
}

// ─── Citations ───────────────────────────────────────────────────────────────

/**
 * A source record for a finding or step.
 *
 * type 'doc'       → a document the user supplied. locator = attachment filename.
 * type 'law'       → a NZ Act, regulation, or standard. locator = "Privacy Act 2020 s3A".
 * type 'reasoning' → the agent's own reasoning chain. locator = verbatim reasoning text.
 */
export interface Citation {
  id: string;
  type: 'doc' | 'law' | 'reasoning';
  label: string;
  locator: string;       // non-empty — enforced by generator
  retrieved_at: string;  // ISO 8601
}

// ─── Findings ────────────────────────────────────────────────────────────────

/**
 * A factual claim produced by the workflow.
 *
 * Every finding MUST have a non-empty source_pointer (citation ID).
 * The generator refuses to build a pack if any finding lacks a source_pointer.
 */
export interface Finding {
  id: string;
  statement: string;
  source_pointer: string;   // citation ID — REQUIRED, empty string is a hard error
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  kete_extension: Record<string, unknown> | null;
}

// ─── Reviewer ────────────────────────────────────────────────────────────────

/** The human reviewer who signs the evidence pack. null = unsigned. */
export interface Reviewer {
  name: string;
  role: string;
  org: string;
  signed_at: string;  // ISO 8601
}

// ─── Per-kete extensions ─────────────────────────────────────────────────────

export interface ManaakiExtension {
  food_control_plan_ref: string | null;
  alcohol_licence_number: string | null;
  last_verification_date: string | null;   // ISO 8601 date
  audit_period: string | null;
  named_duty_manager: string | null;
  allergen_control_summary: string | null;
}

export interface WaihangaExtension {
  site_address: string | null;
  principal_contractor: string | null;
  lbp_numbers: string[];
  notifiable_event: boolean;
  worksafe_ref: string | null;
  swms_list: string[];
  consent_reference: string | null;
  retention_money_status: string | null;
}

export interface AuahaExtension {
  project_name: string | null;
  ip_ownership_statement: string | null;
  contributors: Array<{ name: string; credit: string }>;
  rights_clearance_log: string[];
  deliverable_format_register: string[];
  nzfc_funder_reference: string | null;
}

export interface AratakiExtension {
  entity_name: string | null;
  nzbn: string | null;
  governance_body: string | null;
  resolution_reference: string | null;
  conflict_of_interest_declarations: string[];
  applicable_acts: string[];
}

export interface PikauExtension {
  ipp_snapshot: Array<{
    principle: string;   // e.g. 'IPP1', 'IPP3A'
    status: 'compliant' | 'at_risk' | 'non_compliant' | 'not_applicable' | 'unknown';
    notes: string | null;
  }>;
  data_inventory_ref: string | null;
  breach_risk_score: 'critical' | 'high' | 'medium' | 'low' | null;
  named_privacy_officer: string | null;
  dpia_reference: string | null;
  /** Per IPP3A: record for every indirect-collection input */
  ipp3a_collection_source_notices: Array<{
    data_type: string;
    collection_method: 'direct' | 'indirect';
    source_ref: string | null;
    notice_given: boolean;
  }>;
}

export type KeteExtension =
  | ManaakiExtension
  | WaihangaExtension
  | AuahaExtension
  | AratakiExtension
  | PikauExtension
  | Record<string, unknown>;  // forward-compatible for future kete

// ─── WorkflowResult ──────────────────────────────────────────────────────────

/**
 * The fully-resolved result of a pipeline run.
 * This is the input to build_bundle().
 *
 * Pure: all fields are set by the pipeline stages (Kahu → Iho → Tā → Mahara → Mana).
 * The generator adds nothing — timestamps, IDs, reviewer details are all in here already.
 */
export interface WorkflowResult {
  bundle_id: string;           // ULID
  schema_version: string;      // semver e.g. '0.1.0'
  generated_at: string;        // ISO 8601

  agent: {
    name: string;
    version: string;
    kete: Kete;
  };

  pipeline: Pipeline;
  inputs: WorkflowInput[];
  steps: WorkflowStep[];
  findings: Finding[];
  citations: Citation[];
  reviewer: Reviewer | null;

  /**
   * True if ANY input has simulated: true.
   * Set by Kahu. Cannot be overridden downstream.
   * If true → every PDF page carries a diagonal SIMULATED watermark.
   *           Cover badge is RED. No override flag. No quiet mode.
   */
  simulated: boolean;

  kete_extension: KeteExtension;
}

// ─── Bundle output ────────────────────────────────────────────────────────────

export interface BundleFileEntry {
  path: string;      // e.g. 'cover.pdf', 'data.json', 'manifest.json'
  sha256: string;
  size_bytes: number;
}

/**
 * The manifest embedded in every evidence pack as manifest.json.
 * User-facing label: "evidence pack manifest".
 */
export interface BundleManifest {
  bundle_id: string;
  schema_version: string;
  generated_at: string;
  generator_version: string;
  agent_name: string;
  agent_version: string;
  kete: Kete;
  pipeline_stages_run: string[];
  simulated: boolean;
  scenario_id: string | null;     // set if the pack came from the simulator
  files: BundleFileEntry[];
  raw_json_sha256: string;        // sha-256 of data.json
}

export interface BundleOptions {
  scenario_id?: string;
  generator_version: string;
}

/**
 * The output of build_bundle().
 * zip_bytes: the complete .zip file as bytes.
 * manifest: the manifest object (also embedded in the zip as manifest.json).
 * bundle_id: the ULID — same as workflow_result.bundle_id.
 */
export interface BundleArtifact {
  bundle_id: string;
  zip_bytes: Uint8Array;
  manifest: BundleManifest;
}

// ─── Error types ─────────────────────────────────────────────────────────────

export type TraceError = {
  kind: 'trace_check_failed';
  finding_ids_without_source: string[];
};

export type SimulatedFlagError = {
  kind: 'simulated_flag_mismatch';
  message: string;
};

export type BuildBundleError = TraceError | SimulatedFlagError;
