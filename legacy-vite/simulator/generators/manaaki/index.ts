/**
 * MANAAKI kete generator — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Generates deterministic, realistic-enough hospitality fixtures for MANAAKI scenarios.
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

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const result: T[] = [];
  const pool = [...arr];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

// ── Reference data ────────────────────────────────────────────────────────────

const ALLERGENS = [
  'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts', 'soybeans',
  'milk', 'nuts', 'celery', 'mustard', 'sesame', 'sulphites', 'lupin', 'molluscs',
];

const MENU_SECTIONS = ['Starters', 'Mains', 'Desserts', 'Beverages'];

const MENU_ITEM_NAMES: Record<string, string[]> = {
  Starters: ['Seasonal soup', 'Bruschetta', 'Calamari', 'Prawn cocktail', 'Bread service'],
  Mains: ['Eye fillet', 'Lamb rump', 'Gnocchi', 'Grilled salmon', 'Mushroom risotto', 'Fish of the day'],
  Desserts: ['Panna cotta', 'Chocolate fondant', 'Pavlova', 'Cheese board', 'Crème brûlée'],
  Beverages: ['House wine', 'Craft beer selection', 'Soft drinks', 'Hot drinks', 'Juice'],
};

const STAFF_ROLES = [
  'Head Chef', 'Sous Chef', 'Chef de Partie', 'Kitchen Hand',
  'Front of House Manager', 'Waiter', 'Bartender', 'Host',
];

const INSPECTION_OUTCOMES = ['pass', 'pass_with_conditions', 'pass'];

// ── Generator implementation ──────────────────────────────────────────────────

function generateManaakiFixtures(
  scenario_id: string,
  seed: number,
  params: Record<string, unknown>,
): GeneratorOutput {
  const rand = mulberry32(seed);

  const staffCount = (params.staff_count as number) ?? 30;
  const seatCount  = (params.seat_count as number) ?? 30;
  const foodControlPlanCurrent = params.food_control_plan_current !== false;
  const allergenTrainingComplete = params.allergen_training_complete !== false;
  const liquorLicenceValid = params.liquor_licence_valid !== false;
  const hasHaccpRecords = params.has_haccp_records !== false;

  // How many staff are missing allergen training (if gap scenario)
  const staffMissingTraining = allergenTrainingComplete
    ? 0
    : Math.floor(staffCount * (0.2 + rand() * 0.1)); // 20–30% gap

  // ── Staff records ─────────────────────────────────────────────────────────
  const staff_records = Array.from({ length: staffCount }, (_, i) => ({
    id: `staff-${String(i + 1).padStart(3, '0')}`,
    role: pickOne(STAFF_ROLES, rand),
    allergen_training_complete:
      allergenTrainingComplete ? true : i >= (staffCount - staffMissingTraining),
    food_handler_certificate: rand() > 0.15,
    employment_start: `202${Math.floor(rand() * 4 + 1)}-${String(Math.ceil(rand() * 12)).padStart(2, '0')}-01`,
  }));

  // ── Menu items ────────────────────────────────────────────────────────────
  const menu_items: { section: string; name: string; allergens: string[] }[] = [];
  for (const section of MENU_SECTIONS) {
    const count = Math.floor(rand() * 3) + 3;
    const items = pickN(MENU_ITEM_NAMES[section], count, rand);
    for (const name of items) {
      const allergenCount = Math.floor(rand() * 4);
      menu_items.push({
        section,
        name,
        allergens: pickN(ALLERGENS, allergenCount, rand),
      });
    }
  }

  // ── Inspection records ────────────────────────────────────────────────────
  const inspectionCount = Math.floor(rand() * 2) + 2;
  const inspection_records = Array.from({ length: inspectionCount }, (_, i) => ({
    id: `insp-${String(i + 1).padStart(3, '0')}`,
    date: `202${Math.floor(rand() * 3 + 2)}-${String(Math.ceil(rand() * 12)).padStart(2, '0')}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}`,
    inspector: 'Wellington City Council EHO',
    outcome: pickOne(INSPECTION_OUTCOMES, rand),
    conditions: [],
  }));

  // ── HACCP records ─────────────────────────────────────────────────────────
  const haccp_records = hasHaccpRecords
    ? Array.from({ length: Math.floor(rand() * 5) + 10 }, (_, i) => ({
        id: `haccp-${String(i + 1).padStart(3, '0')}`,
        date: `2026-0${Math.floor(rand() * 4) + 1}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}`,
        critical_limit_met: rand() > 0.05,
        corrective_action: null,
      }))
    : [];

  // ── Food control plan ────────────────────────────────────────────────────
  const last_fcp_review_months_ago = foodControlPlanCurrent
    ? Math.floor(rand() * 8 + 1)   // 1–8 months: current
    : Math.floor(rand() * 10 + 13); // 13–22 months: overdue

  const food_control_plan = {
    registered: true,
    template: 'MPI National Programme Level 2',
    last_reviewed_months_ago: last_fcp_review_months_ago,
    current: foodControlPlanCurrent,
    next_mpi_verification_months: Math.floor(rand() * 6) + 1,
  };

  // ── Scenario params for agent-stub routing ────────────────────────────────
  const scenario_params = {
    food_control_plan_current: foodControlPlanCurrent,
    allergen_training_complete: allergenTrainingComplete,
    staff_missing_allergen_training: staffMissingTraining,
    liquor_licence_valid: liquorLicenceValid,
    has_haccp_records: hasHaccpRecords,
    seat_count: seatCount,
    staff_count: staffCount,
  };

  return {
    scenario_id,
    seed,
    kete: 'MANAAKI',
    fixtures: {
      staff_records,
      menu_items,
      inspection_records,
      haccp_records,
      food_control_plan,
      scenario_params,
    },
    metadata: {
      generator_version: '0.1.0',
      generated_at: new Date().toISOString(),
      real_enough_checklist: [
        `Generated ${staffCount} staff records with allergen training status`,
        `Generated ${menu_items.length} menu items across ${MENU_SECTIONS.length} sections with allergen annotations`,
        `Generated ${inspectionCount} EHO inspection records`,
        `Food control plan: last reviewed ${last_fcp_review_months_ago} months ago (${foodControlPlanCurrent ? 'current' : 'OVERDUE'})`,
        `Allergen training: ${allergenTrainingComplete ? 'all staff complete' : `${staffMissingTraining} of ${staffCount} staff missing`}`,
        'Does not include actual MPI food control plan template content',
        'Does not include real allergen quantities or preparation procedures',
        'Liquor licence details are not generated — status flag only',
      ],
    },
  };
}

export const manaakiGenerator: KeteGenerator = {
  generate: generateManaakiFixtures,
};
