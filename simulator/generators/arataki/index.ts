/**
 * ARATAKI kete generator — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Generates deterministic, realistic-enough professional services fixtures for
 * ARATAKI Privacy & Business Compliance scenarios.
 *
 * Produces the same scenario_params shape as the PIKAU generator so that the
 * existing PIKAU privacy agent-stub logic handles ARATAKI scenarios unchanged.
 *
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

const TICKET_CATEGORIES = [
  'privacy_request', 'data_access', 'employee_onboarding',
  'client_data_query', 'vendor_management', 'policy_review',
];

const TICKET_PRIORITIES = ['low', 'medium', 'high'];

const VENDOR_NAMES_DOMESTIC = [
  'Xero NZ', 'BNZ Business Banking', 'DocuSign NZ',
];

const VENDOR_NAMES_OVERSEAS = [
  'BambooHR (US)', 'Greenhouse Recruiting (US)', 'Microsoft 365 (EU)',
];

const STAFF_DEPARTMENTS = [
  'Consulting', 'Advisory', 'Operations', 'Finance', 'Business Development',
];

// ── Generator implementation ──────────────────────────────────────────────────

function generateAratakiFixtures(
  scenario_id: string,
  seed: number,
  params: Record<string, unknown>,
): GeneratorOutput {
  const rand = mulberry32(seed);

  const employeeCount    = (params.employee_count as number) ?? 20;
  const ipp3aExposure    = (params.ipp3a_exposure as string) ?? 'low';
  const hasVendorRegister = params.has_vendor_register !== false;
  const overseasProcessor = params.overseas_data_processor === true;
  const employeesNotified = params.employees_notified !== false;

  // ── Support tickets ────────────────────────────────────────────────────────
  const ticketCount = Math.floor(rand() * 3) + 3;
  const support_tickets = Array.from({ length: ticketCount }, (_, i) => ({
    id: `t-${String(i + 1).padStart(3, '0')}`,
    category: pickOne(TICKET_CATEGORIES, rand),
    priority: pickOne(TICKET_PRIORITIES, rand),
    created_at: `2026-0${Math.floor(rand() * 4) + 1}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}`,
    resolved: rand() > 0.3,
  }));

  // ── Employee records ───────────────────────────────────────────────────────
  const employee_records = Array.from({ length: employeeCount }, (_, i) => ({
    id: `emp-${String(i + 1).padStart(3, '0')}`,
    department: pickOne(STAFF_DEPARTMENTS, rand),
    ipp3a_notice_received: employeesNotified ? true : rand() > 0.6,
    privacy_policy_acknowledged: rand() > 0.2,
    employment_start: `202${Math.floor(rand() * 4) + 1}-${String(Math.ceil(rand() * 12)).padStart(2, '0')}-01`,
  }));

  // ── Vendor register ────────────────────────────────────────────────────────
  const domesticVendors = pickN(VENDOR_NAMES_DOMESTIC, 2, rand);
  const vendor_register = hasVendorRegister
    ? [
        ...domesticVendors.map(name => ({
          id: `v-${name.replace(/\s+/g, '-').toLowerCase().slice(0, 10)}`,
          name,
          data_types: ['invoicing', 'contact_data'],
          dpa_in_place: rand() > 0.1,
          country: 'NZ',
          overseas: false,
        })),
        ...(overseasProcessor
          ? pickN(VENDOR_NAMES_OVERSEAS, 2, rand).map(name => ({
              id: `v-${name.replace(/\s+/g, '-').toLowerCase().slice(0, 10)}`,
              name,
              data_types: ['employee_records', 'recruitment_data'],
              dpa_in_place: rand() > 0.4,
              country: name.includes('EU') ? 'EU' : 'US',
              overseas: true,
            }))
          : []),
      ]
    : [];

  // ── Access logs ────────────────────────────────────────────────────────────
  const logCount = Math.floor(rand() * 10) + 10;
  const access_logs = Array.from({ length: logCount }, (_, i) => ({
    id: `log-${String(i + 1).padStart(4, '0')}`,
    timestamp: `2026-0${Math.floor(rand() * 4) + 1}-${String(Math.ceil(rand() * 28)).padStart(2, '0')}T${String(Math.floor(rand() * 24)).padStart(2, '0')}:00:00Z`,
    action: pickOne(['read', 'export', 'update', 'delete'] as const, rand),
    resource: pickOne(['employee_record', 'client_data', 'contract', 'invoice'] as const, rand),
    authorised: rand() > 0.02,
  }));

  // ── Scenario params for agent-stub routing (same shape as PIKAU) ──────────
  const scenario_params = {
    ipp3a_exposure:          ipp3aExposure,
    overseas_data_processor: overseasProcessor,
    employees_notified:      employeesNotified,
    has_vendor_register:     hasVendorRegister,
    employee_count:          employeeCount,
  };

  return {
    scenario_id,
    seed,
    kete: 'ARATAKI',
    fixtures: {
      support_tickets,
      employee_records,
      vendor_register,
      access_logs,
      scenario_params,
    },
    metadata: {
      generator_version: '0.1.0',
      generated_at: new Date().toISOString(),
      real_enough_checklist: [
        `Generated ${ticketCount} support tickets across privacy/data categories`,
        `Generated ${employeeCount} employee records with IPP3A notice status`,
        `Generated ${vendor_register.length} vendor register entries (${overseasProcessor ? 'includes overseas HR platforms' : 'domestic only'})`,
        `Generated ${logCount} access log entries`,
        `IPP3A exposure: ${ipp3aExposure} — employees notified: ${String(employeesNotified)}`,
        'Does not include actual privacy policy text or data processing agreements',
        'Does not include real employee names, IRD numbers, or client details',
        'Scenario params shape is identical to PIKAU generator — uses same agent-stub logic',
      ],
    },
  };
}

export const aratakiGenerator: KeteGenerator = {
  generate: generateAratakiFixtures,
};
