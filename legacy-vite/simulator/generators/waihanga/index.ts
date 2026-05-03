/**
 * WAIHANGA kete generator — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Generates deterministic, realistic-enough construction site safety fixtures.
 * Pure function — same seed always produces the same output.
 * Never calls an LLM — deterministic is a feature.
 */

import type { KeteGenerator, GeneratorOutput } from '../../types.js';

// ── Seeded RNG (Mulberry32) ───────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pickOne<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

// ── Reference data ────────────────────────────────────────────────────────────

const CREW_TRADES = [
  'Carpenter', 'Electrician', 'Plumber', 'Concrete Layer', 'Painter',
  'Roofer', 'Scaffolder', 'Site Supervisor', 'Digger Operator', 'Labourer',
];

const HAZARD_CATEGORIES = [
  'Working at height', 'Manual handling', 'Electrical safety', 'Scaffolding',
  'Excavation', 'Confined space', 'Noise', 'UV exposure', 'Silica dust', 'Hand tools',
];

const TOOLBOX_TOPICS = [
  'Fall protection', 'Housekeeping', 'PPE requirements', 'Silica dust controls',
  'Electrical safety', 'Emergency procedures', 'Scaffolding inspection', 'Concrete works',
];

const INCIDENT_TYPES = ['near miss', 'first aid', 'near miss'];

// ── Generator implementation ──────────────────────────────────────────────────

function generateWaihangaFixtures(
  scenario_id: string,
  seed: number,
  params: Record<string, unknown>,
): GeneratorOutput {
  const rand = mulberry32(seed);

  const crewSize = (params.crew_size as number) ?? 12;
  const siteSafetyPlanCurrent = params.site_safety_plan_current !== false;
  const subcontractorInductionComplete = params.subcontractor_induction_complete !== false;
  const toolboxTalkRecords = params.toolbox_talk_records !== false;
  const buildingConsentActive = params.building_consent_active !== false;

  const crewMissingInduction = subcontractorInductionComplete
    ? 0
    : Math.floor(crewSize * (0.2 + rand() * 0.1)); // 20–30% uninducted

  // ── Crew records ──────────────────────────────────────────────────────────
  const crew_records = Array.from({ length: crewSize }, (_, i) => ({
    id: `crew-${String(i + 1).padStart(3, '0')}`,
    trade: pickOne(CREW_TRADES, rand),
    site_inducted: subcontractorInductionComplete ? true : i >= (crewSize - crewMissingInduction),
    ppe_supplied: rand() > 0.05,
    employment_type: rand() > 0.4 ? 'subcontractor' : 'employee',
  }));

  // ── Hazard register ───────────────────────────────────────────────────────
  const hazard_count = Math.floor(rand() * 4) + 5;
  const hazard_register = Array.from({ length: hazard_count }, (_, i) => ({
    id: `hazard-${String(i + 1).padStart(3, '0')}`,
    category: HAZARD_CATEGORIES[i % HAZARD_CATEGORIES.length],
    likelihood: pickOne(['low', 'medium', 'high'] as const, rand),
    controls_documented: rand() > 0.1,
  }));

  // ── Toolbox talks ─────────────────────────────────────────────────────────
  const toolbox_count = toolboxTalkRecords ? Math.floor(rand() * 8) + 4 : 0;
  const toolbox_talks = Array.from({ length: toolbox_count }, (_, i) => ({
    id: `ttalk-${String(i + 1).padStart(3, '0')}`,
    date: `2026-0${Math.floor(rand() * 4) + 1}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}`,
    topic: pickOne(TOOLBOX_TOPICS, rand),
    attendees: Math.floor(rand() * crewSize * 0.8) + Math.floor(crewSize * 0.2),
    signed: rand() > 0.15,
  }));

  // ── Incident log ──────────────────────────────────────────────────────────
  const incidentCount = Math.floor(rand() * 2);
  const incident_log = Array.from({ length: incidentCount }, (_, i) => ({
    id: `incident-${String(i + 1).padStart(3, '0')}`,
    date: `2026-0${Math.floor(rand() * 3) + 1}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}`,
    type: pickOne(INCIDENT_TYPES, rand),
    investigated: rand() > 0.2,
    corrective_action_recorded: rand() > 0.3,
  }));

  // ── Site safety plan ──────────────────────────────────────────────────────
  const last_ssp_review_months_ago = siteSafetyPlanCurrent
    ? Math.floor(rand() * 3 + 1)   // 1–3 months: current
    : Math.floor(rand() * 8 + 5);  // 5–12 months: overdue

  const site_safety_plan = {
    exists: true,
    worksafe_template: true,
    last_reviewed_months_ago: last_ssp_review_months_ago,
    current: siteSafetyPlanCurrent,
    emergency_procedures_included: rand() > 0.1,
    notifiable_work_identified: rand() > 0.5,
  };

  // ── Building consent ─────────────────────────────────────────────────────
  const building_consent = {
    active: buildingConsentActive,
    council: 'Wellington City Council',
    consent_number: `BC2026-${Math.floor(rand() * 9000) + 1000}`,
    stage: pickOne(['foundation', 'framing', 'weathertight', 'lining'] as const, rand),
  };

  // ── Scenario params for agent-stub routing ────────────────────────────────
  const scenario_params = {
    site_safety_plan_current: siteSafetyPlanCurrent,
    subcontractor_induction_complete: subcontractorInductionComplete,
    crew_missing_induction: crewMissingInduction,
    toolbox_talk_records: toolboxTalkRecords,
    building_consent_active: buildingConsentActive,
    crew_size: crewSize,
  };

  return {
    scenario_id,
    seed,
    kete: 'WAIHANGA',
    fixtures: {
      crew_records,
      hazard_register,
      toolbox_talks,
      incident_log,
      site_safety_plan,
      building_consent,
      scenario_params,
    },
    metadata: {
      generator_version: '0.1.0',
      generated_at: new Date().toISOString(),
      real_enough_checklist: [
        `Generated ${crewSize} crew records with site induction status`,
        `Generated ${hazard_count} hazard register entries`,
        `Generated ${toolbox_count} toolbox talk records`,
        `Generated ${incidentCount} incident log entries`,
        `Site safety plan: last reviewed ${last_ssp_review_months_ago} months ago (${siteSafetyPlanCurrent ? 'current' : 'OVERDUE'})`,
        `Subcontractor inductions: ${subcontractorInductionComplete ? 'all complete' : `${crewMissingInduction} of ${crewSize} missing`}`,
        'Does not include actual site safety plan content or WorkSafe forms',
        'Does not include real building consent drawings or inspection history',
      ],
    },
  };
}

export const waihangaGenerator: KeteGenerator = {
  generate: generateWaihangaFixtures,
};
