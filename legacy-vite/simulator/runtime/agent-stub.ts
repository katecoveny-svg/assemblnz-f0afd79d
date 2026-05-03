/**
 * Agent stub — Assembl simulator runtime
 * Version: 0.1.0 · 2026-04-09
 *
 * A placeholder agent that accepts GeneratorOutput and returns a WorkflowResult.
 * Produces deterministic, scenario-appropriate findings and citations based on
 * the fixture data — specifically the scenario_params (ipp3a_exposure,
 * overseas_data_processor, employees_notified) and vendor_register.
 *
 * Used by the simulator runner during development before real agent workflows
 * are wired to the managed agents runtime.
 *
 * [TODO: Milestone 4+] Replace with real managed-agents runtime shim.
 */

import type { WorkflowResult, Kete, Citation, Finding, KeteExtension } from '../../evidence-bundles/schema.js';
import type { PikauExtension } from '../../evidence-bundles/schema.js';
import type { GeneratorOutput } from '../types.js';

// [TODO: Milestone 4+] Replace stub with a real runtime shim that:
//   1. Loads the kete's system prompt from agents/{kete}/<name>/system-prompt.md
//   2. Loads the KB files referenced in agents/{kete}/<name>/kb-refs.md
//   3. Calls the managed agents API (with local fallback adapter during dev)
//   4. Collects Kahu -> Iho -> Ta -> Mahara -> Mana stage outputs
//   5. Returns a fully-populated WorkflowResult
export async function runAgentStub(
  generatorOutput: GeneratorOutput,
  workflowId: string,
): Promise<WorkflowResult> {
  const now = new Date().toISOString();
  const stage = (offsetMs = 0) => ({
    started_at: new Date(Date.now() - offsetMs).toISOString(),
    finished_at: new Date(Date.now() - offsetMs + 2000).toISOString(),
    notes: 'stub',
  });
  const kete = generatorOutput.kete as Kete;

  // ── Route to kete-specific output builder ────────────────────────────────
  const { citations, findings, keteExtension } = buildKeteOutputs(generatorOutput.kete, generatorOutput.fixtures, now);

  const result: WorkflowResult = {
    bundle_id: `stub-${generatorOutput.scenario_id}-${generatorOutput.seed}`,
    schema_version: '0.1.0',
    generated_at: now,

    agent: {
      name: `${kete}-Copilot`,
      version: '0.1.0-stub',
      kete,
    },

    pipeline: {
      kahu:   stage(12_000),
      iho:    stage(10_000),
      ta:     stage(6_000),
      mahara: stage(3_000),
      mana:   stage(1_000),
    },

    inputs: [
      {
        id: 'input-0',
        kind: 'simulator-fixture',
        source_ref: `simulator/scenarios/${kete.toLowerCase()}/${generatorOutput.scenario_id}.yaml`,
        content_hash: 'stub-hash',
        simulated: true,
      },
    ],

    steps: [],
    findings,
    citations,
    reviewer: null,
    simulated: true,

    kete_extension: keteExtension,
  };

  void workflowId;
  return result;
}

// ── Kete router ───────────────────────────────────────────────────────────────

function buildKeteOutputs(
  kete: string,
  fixtures: Record<string, unknown>,
  now: string,
): { citations: Citation[]; findings: Finding[]; keteExtension: KeteExtension } {
  if (kete === 'MANAAKI') {
    return buildManaakiOutputs(fixtures, now);
  }
  if (kete === 'WAIHANGA') {
    return buildWaihangaOutputs(fixtures, now);
  }
  // Default: PIKAU privacy logic
  const scenarioParams = (fixtures.scenario_params ?? {}) as {
    ipp3a_exposure: string;
    overseas_data_processor: boolean;
    employees_notified: boolean;
  };
  const isIPP3ATriggered =
    scenarioParams.ipp3a_exposure === 'high' ||
    (scenarioParams.overseas_data_processor && !scenarioParams.employees_notified);
  return isIPP3ATriggered ? buildIPP3ATriggeredOutputs(now) : buildHappyPathOutputs(now);
}

// ── Happy-path outputs (ipp3a_exposure: low) ──────────────────────────────────

function buildHappyPathOutputs(now: string): {
  citations: Citation[];
  findings: Finding[];
  keteExtension: PikauExtension;
} {
  const citations: Citation[] = [
    {
      id: 'cit-pa2020-ipp3',
      type: 'law',
      label: 'Privacy Act 2020 IPP3',
      locator: 'Privacy Act 2020 s21 IPP3 — Collection of personal information from subject',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp5',
      type: 'law',
      label: 'Privacy Act 2020 IPP5',
      locator: 'Privacy Act 2020 s21 IPP5 — Storage and security of personal information',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp9',
      type: 'law',
      label: 'Privacy Act 2020 IPP9',
      locator: 'Privacy Act 2020 s21 IPP9 — Retention of personal information',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp11',
      type: 'law',
      label: 'Privacy Act 2020 IPP11',
      locator: 'Privacy Act 2020 s21 IPP11 — Limits on disclosure of personal information',
      retrieved_at: now,
    },
  ];

  const findings: Finding[] = [
    {
      id: 'f-001',
      statement:
        'No vendor register is in place. The business cannot demonstrate which third parties hold personal information on its behalf, or that data processing agreements are in place — a gap under IPP5.',
      source_pointer: 'cit-pa2020-ipp5',
      severity: 'medium',
      kete_extension: null,
    },
    {
      id: 'f-002',
      statement:
        'No customer-facing privacy policy is displayed at the point of collection. Customers are not being informed of how their personal information is used, held, and disclosed as required by IPP3.',
      source_pointer: 'cit-pa2020-ipp3',
      severity: 'medium',
      kete_extension: null,
    },
    {
      id: 'f-003',
      statement:
        'No documented data retention policy exists. Personal information — including staff records and customer contact details — may be held indefinitely, creating unnecessary risk under IPP9.',
      source_pointer: 'cit-pa2020-ipp9',
      severity: 'low',
      kete_extension: null,
    },
    {
      id: 'f-004',
      statement:
        'Staff emails containing personal customer information are not subject to a formal disclosure policy. Without an IPP11-aligned policy, inadvertent disclosure risk is elevated.',
      source_pointer: 'cit-pa2020-ipp11',
      severity: 'low',
      kete_extension: null,
    },
  ];

  const keteExtension: PikauExtension = {
    ipp_snapshot: [
      { principle: 'IPP3', status: 'at_risk', notes: 'No privacy policy at point of collection' },
      { principle: 'IPP5', status: 'at_risk', notes: 'No vendor register or DPAs confirmed' },
      { principle: 'IPP9', status: 'at_risk', notes: 'No documented data retention policy' },
      { principle: 'IPP11', status: 'at_risk', notes: 'No formal disclosure policy for staff emails' },
      { principle: 'IPP3A', status: 'not_applicable', notes: 'No significant indirect collection identified in this review' },
    ],
    data_inventory_ref: null,
    breach_risk_score: 'low',
    named_privacy_officer: null,
    dpia_reference: null,
    ipp3a_collection_source_notices: [],
  };

  return { citations, findings, keteExtension };
}

// ── IPP3A-triggered outputs (ipp3a_exposure: high, employees_notified: false) ─

function buildIPP3ATriggeredOutputs(now: string): {
  citations: Citation[];
  findings: Finding[];
  keteExtension: PikauExtension;
} {
  const citations: Citation[] = [
    {
      id: 'cit-pa2020-ipp3',
      type: 'law',
      label: 'Privacy Act 2020 IPP3',
      locator: 'Privacy Act 2020 s21 IPP3 — Collection of personal information from subject',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp5',
      type: 'law',
      label: 'Privacy Act 2020 IPP5',
      locator: 'Privacy Act 2020 s21 IPP5 — Storage and security of personal information',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp3a',
      type: 'law',
      label: 'Privacy Act 2020 s22A (IPP3A)',
      locator:
        'Privacy Act 2020 s22A — IPP3A: Collection of personal information from someone other than the individual. ' +
        'Effective 1 May 2026. Where an agency collects personal information from a source other than the individual, ' +
        'it must take reasonable steps to ensure the individual is aware of the collection.',
      retrieved_at: now,
    },
    {
      id: 'cit-pa2020-ipp9',
      type: 'law',
      label: 'Privacy Act 2020 IPP9',
      locator: 'Privacy Act 2020 s21 IPP9 — Retention of personal information',
      retrieved_at: now,
    },
  ];

  const findings: Finding[] = [
    {
      id: 'f-001',
      statement:
        'Employee roster and payroll data is being shared with an overseas payroll processor ' +
        '(FlexiRosta Pty Ltd, Australia) without employees being notified of the indirect collection. ' +
        'This is a breach of IPP3A effective 1 May 2026. Employees have not been made aware that their ' +
        'schedule, contact details, and payroll information is transferred to a third-party overseas processor.',
      source_pointer: 'cit-pa2020-ipp3a',
      severity: 'critical',
      kete_extension: null,
    },
    {
      id: 'f-002',
      statement:
        'No IPP3A collection source notice has been issued to affected employees. ' +
        'The business must take reasonable steps to notify employees of the indirect collection ' +
        'by the rostering system before or at the time of collection, or as soon as practicable afterwards.',
      source_pointer: 'cit-pa2020-ipp3a',
      severity: 'high',
      kete_extension: null,
    },
    {
      id: 'f-003',
      statement:
        'No data processing agreement (DPA) is in place with the overseas payroll processor. ' +
        'The processor holds IRD numbers, bank account details, and salary information. ' +
        'Without a DPA, the business cannot demonstrate adequate safeguards under IPP5.',
      source_pointer: 'cit-pa2020-ipp5',
      severity: 'high',
      kete_extension: null,
    },
    {
      id: 'f-004',
      statement:
        'No vendor register exists. The business cannot demonstrate which third parties hold ' +
        'personal information on its behalf. At minimum, the rostering vendor and overseas payroll ' +
        'processor must be documented with data types held and DPA status.',
      source_pointer: 'cit-pa2020-ipp5',
      severity: 'medium',
      kete_extension: null,
    },
    {
      id: 'f-005',
      statement:
        'No customer-facing privacy policy is displayed at the point of collection. ' +
        'Customers are not being informed of how their personal information is used per IPP3.',
      source_pointer: 'cit-pa2020-ipp3',
      severity: 'medium',
      kete_extension: null,
    },
  ];

  const keteExtension: PikauExtension = {
    ipp_snapshot: [
      { principle: 'IPP3', status: 'at_risk', notes: 'No privacy policy at point of collection' },
      { principle: 'IPP5', status: 'non_compliant', notes: 'No DPA with overseas processor; no vendor register' },
      { principle: 'IPP9', status: 'unknown', notes: 'Not assessed in this review' },
      {
        principle: 'IPP3A',
        status: 'at_risk',
        notes:
          'Indirect collection occurring via rostering system → overseas payroll. ' +
          'Employees not notified. Effective 1 May 2026 — immediate remediation required.',
      },
    ],
    data_inventory_ref: null,
    breach_risk_score: 'high',
    named_privacy_officer: null,
    dpia_reference: null,
    ipp3a_collection_source_notices: [
      {
        data_type: 'employee_roster_and_payroll',
        collection_method: 'indirect',
        source_ref: 'vendor:FlexiRosta-overseas-payroll',
        notice_given: false,
      },
    ],
  };

  return { citations, findings, keteExtension };
}

// ── MANAAKI outputs (Food Act 2014 / hospitality compliance) ──────────────────

function buildManaakiOutputs(
  fixtures: Record<string, unknown>,
  now: string,
): { citations: Citation[]; findings: Finding[]; keteExtension: KeteExtension } {
  const params = (fixtures.scenario_params ?? {}) as {
    food_control_plan_current: boolean;
    allergen_training_complete: boolean;
    staff_missing_allergen_training: number;
    staff_count: number;
  };

  const citations: Citation[] = [
    {
      id: 'cit-food-act-2014-fcp',
      type: 'law',
      label: 'Food Act 2014 s60',
      locator: 'Food Act 2014 s60 — Requirement to operate under a food control plan registered with MPI',
      retrieved_at: now,
    },
    {
      id: 'cit-food-act-2014-duty',
      type: 'law',
      label: 'Food Act 2014 s19',
      locator: 'Food Act 2014 s19 — General duty to ensure food is suitable and does not pose safety risk',
      retrieved_at: now,
    },
    {
      id: 'cit-hswa-2015',
      type: 'law',
      label: 'HSWA 2015 s36',
      locator: 'Health and Safety at Work Act 2015 s36 — Primary duty of care: ensure health and safety of workers',
      retrieved_at: now,
    },
  ];

  const findings: Finding[] = [];

  if (!params.food_control_plan_current) {
    findings.push({
      id: 'f-001',
      statement:
        'The food control plan (FCP) has not been reviewed within the required period. Under the Food Act 2014, ' +
        'the business must operate under a current, MPI-registered FCP and ensure it is reviewed at least annually ' +
        'or when operations change materially. An out-of-date FCP is a material compliance gap that could result ' +
        'in a failed MPI verification audit.',
      source_pointer: 'cit-food-act-2014-fcp',
      severity: 'high',
      kete_extension: null,
    });
  }

  if (!params.allergen_training_complete) {
    const missing = params.staff_missing_allergen_training ?? 0;
    const total = params.staff_count ?? 30;
    findings.push({
      id: findings.length === 0 ? 'f-001' : 'f-002',
      statement:
        `${missing} of ${total} staff have not completed allergen awareness training. Under the Food Act 2014 s19 ` +
        'general duty and the HSWA 2015 primary duty of care, the business must ensure all food handlers can ' +
        'identify and correctly communicate the 14 major allergens. A guest allergen incident without training ' +
        'records in place could constitute a breach of the general duty.',
      source_pointer: 'cit-food-act-2014-duty',
      severity: 'high',
      kete_extension: null,
    });
  }

  // Always include at least one maintenance finding
  findings.push({
    id: `f-00${findings.length + 1}`,
    statement:
      'HACCP critical limit records and temperature logs should be cross-checked against the registered food ' +
      'control plan before the next MPI verification audit. Ensure corrective action records are completed for ' +
      'any exceedances, as incomplete records are a common audit finding under the Food Act 2014.',
    source_pointer: 'cit-food-act-2014-fcp',
    severity: params.food_control_plan_current ? 'low' : 'medium',
    kete_extension: null,
  });

  if (params.food_control_plan_current && params.allergen_training_complete) {
    // Happy path: add a positive info finding
    findings.push({
      id: `f-00${findings.length + 1}`,
      statement:
        'Food control plan is current and registered with MPI. Allergen awareness training is documented for ' +
        'all food handlers. The business is well-positioned for its next MPI verification audit.',
      source_pointer: 'cit-food-act-2014-fcp',
      severity: 'info',
      kete_extension: null,
    });
  }

  return { citations, findings, keteExtension: {} };
}

// ── WAIHANGA outputs (HSWA 2015 / construction site safety) ──────────────────

function buildWaihangaOutputs(
  fixtures: Record<string, unknown>,
  now: string,
): { citations: Citation[]; findings: Finding[]; keteExtension: KeteExtension } {
  const params = (fixtures.scenario_params ?? {}) as {
    site_safety_plan_current: boolean;
    subcontractor_induction_complete: boolean;
    crew_missing_induction: number;
    crew_size: number;
    toolbox_talk_records: boolean;
  };

  const citations: Citation[] = [
    {
      id: 'cit-hswa-2015-s36',
      type: 'law',
      label: 'HSWA 2015 s36',
      locator: 'Health and Safety at Work Act 2015 s36 — Primary duty of care: PCBU must ensure work health and safety so far as is reasonably practicable',
      retrieved_at: now,
    },
    {
      id: 'cit-hswa-2015-s48',
      type: 'law',
      label: 'HSWA 2015 s48',
      locator: 'Health and Safety at Work Act 2015 s48 — Duty of PCBU who designs, manufactures, or supplies plant, substances, or structures',
      retrieved_at: now,
    },
    {
      id: 'cit-building-act-2004',
      type: 'law',
      label: 'Building Act 2004 s17',
      locator: 'Building Act 2004 s17 — All building work must comply with the building code',
      retrieved_at: now,
    },
  ];

  const findings: Finding[] = [];

  if (!params.site_safety_plan_current) {
    findings.push({
      id: 'f-001',
      statement:
        'The site safety plan (SSP) has not been reviewed since the site commenced. Under HSWA 2015 s36, ' +
        'the PCBU must ensure the health and safety of workers by maintaining an up-to-date SSP that reflects ' +
        'current site conditions, hazards, and controls. An out-of-date SSP is a material compliance gap ' +
        'and a common finding in WorkSafe proactive assessments.',
      source_pointer: 'cit-hswa-2015-s36',
      severity: 'high',
      kete_extension: null,
    });
  }

  if (!params.subcontractor_induction_complete) {
    const missing = params.crew_missing_induction ?? 0;
    const total = params.crew_size ?? 12;
    findings.push({
      id: findings.length === 0 ? 'f-001' : 'f-002',
      statement:
        `${missing} of ${total} crew members have not completed a site induction. Under HSWA 2015 s36, ` +
        'the PCBU must ensure workers understand the site hazards, emergency procedures, and control measures ' +
        'before commencing work. Uninducted workers on site is a critical H&S exposure — any incident ' +
        'involving an uninducted worker would likely be viewed as a failure of the primary duty of care.',
      source_pointer: 'cit-hswa-2015-s36',
      severity: 'high',
      kete_extension: null,
    });
  }

  // Always include a maintenance finding
  findings.push({
    id: `f-00${findings.length + 1}`,
    statement:
      'Hazard register entries should be reviewed before any significant phase change (e.g. from framing ' +
      'to weathertight). HSWA 2015 s36 requires controls to be reassessed when work conditions change. ' +
      'Ensure corrective actions from any incidents or near misses are recorded and closed out.',
    source_pointer: 'cit-hswa-2015-s36',
    severity: params.site_safety_plan_current ? 'low' : 'medium',
    kete_extension: null,
  });

  if (params.site_safety_plan_current && params.subcontractor_induction_complete) {
    findings.push({
      id: `f-00${findings.length + 1}`,
      statement:
        'Site safety plan is current and all crew have completed site inductions. Toolbox talk records ' +
        'are maintained. The site is well-positioned for a WorkSafe proactive assessment.',
      source_pointer: 'cit-hswa-2015-s36',
      severity: 'info',
      kete_extension: null,
    });
  }

  return { citations, findings, keteExtension: {} };
}
