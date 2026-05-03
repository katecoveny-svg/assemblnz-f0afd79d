/**
 * PIKAU data generator — Assembl simulator
 * Version: 0.1.0 · 2026-04-09
 *
 * Generates synthetic NZ-realistic data for the PIKAU (privacy/tech) kete.
 * Pure function — deterministic given scenario_id + seed. No LLM calls.
 *
 * Fixture types produced:
 *   - company: synthetic NZ company details
 *   - support_tickets: IT support tickets
 *   - vendor_register: third-party data processors
 *   - incident_timeline: data sharing events
 *   - access_logs: authentication events
 *   - scenario_params: raw params passed to agent-stub for fixture-aware findings
 */

import type { KeteGenerator, GeneratorOutput } from '../../types.js';

/** Seeded pseudo-random number generator (Mulberry32). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Fake-data pools ──────────────────────────────────────────────────────────
// All names, addresses, IRD numbers, and domains are synthetic.
// IRD numbers use 000-prefix (reserved fake range).
// Domains use example.co.nz.

const COMPANY_NAMES = [
  'Tūhono Tech Ltd',
  'Aotearoa Cloud Services Ltd',
  'Kōpura Systems Limited',
  'Rerenga Digital Ltd',
  'Pūanga Software Limited',
];

const FIRST_NAMES = ['Aroha', 'Tama', 'Mere', 'Hemi', 'Anika', 'James', 'Sarah', 'Daniel', 'Ngaio', 'Rangi'];
const LAST_NAMES = ['Tane', 'Walker', 'Smith', 'Brown', 'Ngata', 'Chen', 'Parata', 'Williams', 'Harawira', 'King'];

const AUCKLAND_STREETS = [
  '12 Simulated Street',
  '44 Fictional Avenue',
  '7 Placeholder Lane',
  '99 Demo Road',
  '3 Example Terrace',
];

const VENDOR_NAMES_DOMESTIC = [
  { name: 'CloudPay NZ Ltd', category: 'payroll', overseas: false, country: null },
  { name: 'SecureSign NZ', category: 'e-signature', overseas: false, country: null },
  { name: 'NZ Business Bank', category: 'banking_integration', overseas: false, country: null },
];

const VENDOR_NAMES_OVERSEAS = [
  { name: 'FlexiRosta Pty Ltd', category: 'rostering', overseas: true, country: 'Australia' },
  { name: 'GlobalPay Solutions Inc', category: 'payroll_processing', overseas: true, country: 'United States' },
  { name: 'OmniTrack Ltd', category: 'employee_monitoring', overseas: true, country: 'United Kingdom' },
];

const TICKET_CATEGORIES = ['access', 'hardware', 'software', 'security', 'account'];
const TICKET_PRIORITIES = ['low', 'medium', 'high'];

// ─── Generator implementation ─────────────────────────────────────────────────

export const pikauGenerator: KeteGenerator = {
  generate(scenario_id: string, seed: number, params: Record<string, unknown>): GeneratorOutput {
    const rng = mulberry32(seed);
    const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
    const pickN = <T>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => rng() - 0.5);
      return shuffled.slice(0, n);
    };

    const companyName = pick(COMPANY_NAMES);
    const employeeCount = (params.employee_count as number) ?? 25;
    const ipp3aExposure = (params.ipp3a_exposure as string) ?? 'low';
    const overseasProcessor = Boolean(params.overseas_data_processor);
    const employeesNotified = Boolean(params.employees_notified ?? true);
    const hasVendorRegister = Boolean(params.has_vendor_register ?? false);

    const now = new Date('2026-04-09T00:00:00.000Z');
    const tsOffset = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

    // ── Support tickets ──────────────────────────────────────────────────────
    const ticketCount = 3 + Math.floor(rng() * 3); // 3–5
    const support_tickets = Array.from({ length: ticketCount }, (_, i) => {
      const assignee = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      const category = pick(TICKET_CATEGORIES);
      const priority = pick(TICKET_PRIORITIES);
      return {
        id: `ST-${String(i + 1).padStart(3, '0')}`,
        subject: ticketSubject(category, rng),
        category,
        priority,
        assignee,
        created_at: tsOffset(rng() * 720),
        resolved: rng() > 0.3,
      };
    });

    // ── Vendor register ──────────────────────────────────────────────────────
    const domesticVendors = pickN(VENDOR_NAMES_DOMESTIC, 2).map(v => ({
      ...v,
      data_types: vendorDataTypes(v.category),
      dpa_in_place: rng() > 0.4,
      notified_employees: true,
    }));

    const overseasVendors = overseasProcessor
      ? VENDOR_NAMES_OVERSEAS.slice(0, 1 + Math.floor(rng() * 2)).map(v => ({
          ...v,
          data_types: vendorDataTypes(v.category),
          dpa_in_place: false,                   // gap — DPA not in place
          notified_employees: employeesNotified,  // key IPP3A trigger
        }))
      : [];

    const vendor_register = [...domesticVendors, ...overseasVendors];

    // ── Incident timeline ────────────────────────────────────────────────────
    const incident_timeline = (ipp3aExposure === 'high' || overseasProcessor)
      ? [
          {
            timestamp: tsOffset(30 * 24),
            event: 'Third-party rostering system onboarded — employee schedule data begins flowing to overseas payroll processor',
            actor: 'admin',
            category: 'data_sharing',
          },
          {
            timestamp: tsOffset(10 * 24),
            event: 'Payroll reconciliation run — employee bank account details and IRD numbers shared with processor',
            actor: 'system',
            category: 'data_transfer',
          },
        ]
      : [];

    // ── Access logs ──────────────────────────────────────────────────────────
    const access_logs = Array.from({ length: 10 + Math.floor(rng() * 11) }, (_, i) => ({
      id: `AL-${String(i + 1).padStart(4, '0')}`,
      timestamp: tsOffset(rng() * 168),
      user_id: `u-${Math.floor(rng() * employeeCount).toString().padStart(3, '0')}`,
      event: rng() > 0.15 ? 'login' : 'failed_login',
      result: rng() > 0.15 ? 'success' : 'failure',
      ip: `10.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
    }));

    return {
      scenario_id,
      seed,
      kete: 'PIKAU',
      fixtures: {
        company: {
          name: companyName,
          ird_number: `000-${Math.floor(rng() * 900000 + 100000)}-${Math.floor(rng() * 9)}`,
          address: `${pick(AUCKLAND_STREETS)}, Auckland 1010`,
          domain: 'example.co.nz',
          employee_count: employeeCount,
          industry: (params.industry as string) ?? 'technology',
        },
        scenario_params: {
          ipp3a_exposure: ipp3aExposure,
          overseas_data_processor: overseasProcessor,
          employees_notified: employeesNotified,
          has_vendor_register: hasVendorRegister,
          data_scenario: (params.data_scenario as string) ?? 'baseline_no_breach',
        },
        support_tickets,
        vendor_register,
        incident_timeline,
        access_logs,
      },
      metadata: {
        generator_version: '0.1.0',
        generated_at: new Date().toISOString(),
        real_enough_checklist: [
          'Company name uses te reo Māori / NZ English mix — realistic for NZ tech sector',
          'IRD numbers use 000-prefix reserved fake range — will never match a real IRD number',
          'Domain is example.co.nz — cannot resolve to a real site',
          'Street names are from a curated fictional list — not real Auckland addresses',
          'Overseas vendors have DPA not in place — realistic gap for small businesses',
          'Access logs use RFC 1918 IP space only (10.x.x.x)',
          'Ticket IDs and access log IDs are sequential from 001 — not real production IDs',
        ],
      },
    };
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function ticketSubject(category: string, rng: () => number): string {
  const subjects: Record<string, string[]> = {
    access: ['Password reset request', 'MFA setup issue', 'Account locked out', 'New starter access setup'],
    hardware: ['Laptop not turning on', 'Monitor flickering', 'Keyboard replacement needed'],
    software: ['Xero not syncing', 'Microsoft 365 activation issue', 'Printer driver update required'],
    security: ['Suspicious email received', 'Possible phishing attempt', 'Unexpected login alert'],
    account: ['Staff offboarding — revoke access', 'Role change — update permissions', 'New starter onboarding'],
  };
  const pool = subjects[category] ?? subjects['access'];
  return pool[Math.floor(rng() * pool.length)];
}

function vendorDataTypes(category: string): string[] {
  const types: Record<string, string[]> = {
    payroll: ['salary_details', 'ird_number', 'bank_account', 'kiwisaver_rate'],
    payroll_processing: ['salary_details', 'ird_number', 'bank_account', 'employee_contact'],
    rostering: ['employee_schedule', 'contact_details', 'availability_preferences'],
    e_signature: ['document_content', 'signatory_name', 'email_address'],
    banking_integration: ['account_number', 'transaction_data'],
    employee_monitoring: ['location_data', 'productivity_metrics', 'access_times'],
  };
  return types[category] ?? ['personal_information'];
}
