/**
 * Demo data for the Aironaut × Pīkau pilot.
 *
 * This is the single source of truth the workspace renders from. The Supabase
 * tables (migration 20260701150000) are progressive enhancement: when they
 * exist and hold rows, the store prefers them; until then — and for anyone
 * viewing through the password gate rather than as an authenticated tenant
 * member — these fixtures drive every screen. That mirrors the Evidence
 * Ledger's getReceipt() fallback pattern and means the pilot is never blank.
 *
 * Everything here is DEMO DATA: fictional importers, fictional staff, made-up
 * shipment references. It is realistic (real HS lines, real NZ import
 * categories, real statutes) but it is not a real Aironaut client book. The
 * handoff doc explains how to replace it with the first real importer.
 *
 * Reference "now" for deterministic relative dates: 2026-07-01 (NZ).
 */
import type {
  CommsDraft,
  ComplianceEvent,
  CustomsEntryRecord,
  EntryInput,
  Importer,
  Invoice,
  OpsEvent,
  Shift,
  StaffMember,
} from './types';
import { TENANT_SLUG } from './types';
import { classifyGoods } from './classify';
import { buildEntryPlan } from './entry-planner';

/** Fixed reference clock so relative deadlines render deterministically. */
export const DEMO_NOW = new Date('2026-07-01T09:00:00+12:00');

export const AIRONAUT_BRAND = {
  slug: TENANT_SLUG,
  legalName: 'Aironaut Customs Brokers Ltd',
  wordmark: 'Aironaut',
  wordmarkSub: 'Customs Brokers',
  tagline: 'The precious-cargo shipping & customs specialists.',
  address: 'Level 4, 156 Parnell Road, Parnell, Auckland',
  phone: '+64 9 309 8814',
  established: 1989,
} as const;

// ── Importers ──────────────────────────────────────────────────────────────

export const DEMO_IMPORTERS: Importer[] = [
  {
    id: 'imp_lumen',
    name: 'Lumen Architectural Lighting Ltd',
    clientCode: 'LUMEN01',
    nzbn: '9429041000011',
    gstRegistered: true,
    contacts: [
      { name: 'Priya Raman', role: 'Procurement Manager', email: 'priya@lumenlighting.example', phone: '+64 21 555 0142' },
    ],
    creditTerms: '20th of month following invoice',
    standingPreferences: ['AANZFTA where origin AU', 'Deferred payment scheme'],
    commonHsCodes: ['9405.11.00', '8539.52.00'],
    entriesThisYear: 34,
    since: '2014-03-01',
    notes: 'High-volume LED importer. Usually air freight from AU/CN. Prefers landed-cost report per consignment.',
  },
  {
    id: 'imp_cellardoor',
    name: 'Cellar Door Imports Ltd',
    clientCode: 'CELLAR07',
    nzbn: '9429032000022',
    gstRegistered: true,
    contacts: [
      { name: 'Marco Bianchi', role: 'Director', email: 'marco@cellardoorimports.example', phone: '+64 21 555 0199' },
    ],
    creditTerms: 'Payment on clearance',
    standingPreferences: ['CPTPP where origin JP', 'Wine excise deferral'],
    commonHsCodes: ['2204.21.00'],
    entriesThisYear: 18,
    since: '2011-09-15',
    notes: 'Fine-wine importer. Sea freight, reefer containers. Excise-equivalent duty on alcohol — always broker-confirmed.',
  },
  {
    id: 'imp_taranaki',
    name: 'Taranaki Dairy Engineering Ltd',
    clientCode: 'TDENG02',
    nzbn: '9429028000033',
    gstRegistered: true,
    contacts: [
      { name: 'Hemi Walker', role: 'Operations', email: 'hemi@taranakidairyeng.example', phone: '+64 27 555 0121' },
    ],
    creditTerms: '30 days',
    standingPreferences: ['AANZFTA where origin AU'],
    commonHsCodes: ['8434.10.00', '8434.20.00'],
    entriesThisYear: 7,
    since: '2018-06-20',
    notes: 'Imports milking plant and dairy machinery. Often over-dimension sea freight; ISPM 15 on timber crates.',
  },
  {
    id: 'imp_private_kerr',
    name: 'J. Kerr (private importer)',
    clientCode: 'PRIV-KERR',
    nzbn: undefined,
    gstRegistered: false,
    contacts: [
      { name: 'James Kerr', role: 'Owner', email: 'jkerr@example.com', phone: '+64 21 555 0007' },
    ],
    creditTerms: 'Prepaid',
    standingPreferences: [],
    commonHsCodes: [],
    entriesThisYear: 1,
    since: '2026-06-10',
    notes: 'One-off private import of a vintage motor vehicle. Classification + valuation needs care; consider a binding ruling.',
  },
];

// ── Staff, roster, pay ─────────────────────────────────────────────────────

export const DEMO_STAFF: StaffMember[] = [
  {
    id: 'stf_alan',
    name: 'Alan Kerr',
    role: 'senior_broker',
    brokerLicence: 'CB-1042',
    email: 'alan@aironaut.example',
    wageRateNzd: 62,
    employmentType: 'permanent',
    cpdHoursYtd: 14,
    cpdHoursRequired: 20,
    active: true,
  },
  {
    id: 'stf_moana',
    name: 'Moana Tipene',
    role: 'broker',
    brokerLicence: 'CB-2231',
    email: 'moana@aironaut.example',
    wageRateNzd: 48,
    employmentType: 'permanent',
    cpdHoursYtd: 19,
    cpdHoursRequired: 20,
    active: true,
  },
  {
    id: 'stf_sam',
    name: 'Sam Whitiora',
    role: 'entry_clerk',
    email: 'sam@aironaut.example',
    wageRateNzd: 34,
    employmentType: 'permanent',
    cpdHoursYtd: 6,
    cpdHoursRequired: 10,
    active: true,
  },
  {
    id: 'stf_becky',
    name: 'Becky Ford',
    role: 'admin',
    email: 'becky@aironaut.example',
    wageRateNzd: 32,
    employmentType: 'casual',
    cpdHoursYtd: 0,
    cpdHoursRequired: 0,
    active: true,
  },
];

export const DEMO_SHIFTS: Shift[] = [
  { id: 'sh_1', staffId: 'stf_alan', dateIso: '2026-07-01', startHhmm: '08:00', endHhmm: '16:30', workedHours: null },
  { id: 'sh_2', staffId: 'stf_moana', dateIso: '2026-07-01', startHhmm: '08:30', endHhmm: '17:00', workedHours: null },
  { id: 'sh_3', staffId: 'stf_sam', dateIso: '2026-07-01', startHhmm: '09:00', endHhmm: '17:00', workedHours: null },
  { id: 'sh_4', staffId: 'stf_alan', dateIso: '2026-06-30', startHhmm: '08:00', endHhmm: '16:30', workedHours: 8.5 },
  { id: 'sh_5', staffId: 'stf_moana', dateIso: '2026-06-30', startHhmm: '08:30', endHhmm: '17:15', workedHours: 8.75 },
  { id: 'sh_6', staffId: 'stf_becky', dateIso: '2026-07-02', startHhmm: '10:00', endHhmm: '14:00', workedHours: null },
];

// ── Entries (raw inputs → assembled records) ───────────────────────────────

interface DemoEntryDef {
  id: string;
  receiptId: string;
  createdIso: string;
  updatedIso: string;
  goods: string;
  /** Effective duty rate from confirmed classification (0 for these lines). */
  effectiveRatePercent: number;
  /** Whether to attach a captured classification (via classifyGoods). */
  classifyDescription?: string;
  classifyHint?: string;
  input: EntryInput;
}

const ENTRY_DEFS: DemoEntryDef[] = [
  {
    id: 'ent_led_0731',
    receiptId: '11111111-1111-4111-8111-111111111111',
    createdIso: '2026-06-28T02:10:00Z',
    updatedIso: '2026-06-30T21:15:00Z',
    goods: 'LED architectural downlights & panel fittings',
    effectiveRatePercent: 0,
    classifyDescription: 'LED architectural downlights and ceiling panel light fittings',
    input: {
      shipmentRef: 'AIR-2026-0731',
      importerName: 'Lumen Architectural Lighting Ltd',
      importerId: 'imp_lumen',
      supplierName: 'Guangzhou Lumière Co.',
      originCountry: 'CN',
      incoterm: 'FOB',
      currency: 'USD',
      freightNzd: 4200,
      insuranceNzd: 380,
      packages: 96,
      grossWeightKg: 1240,
      etaIso: '2026-07-03T00:00:00+12:00',
      cutoffIso: '2026-07-02T17:00:00+12:00',
      lines: [
        { description: 'LED downlight, 12W, recessed, aluminium body', quantity: 1800, unitValueNzd: 9.4, lineValueNzd: 16920, countryOfOrigin: 'CN', hsCode: '9405.11.00', unclassified: false },
        { description: 'LED ceiling panel light, 40W, 600x600', quantity: 420, unitValueNzd: 22.1, lineValueNzd: 9282, countryOfOrigin: 'CN', hsCode: '9405.11.00', unclassified: false },
      ],
      documentsHeld: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin'],
      flags: {
        hasImporterClientCode: true,
        claimPreference: false,
        hasFoodForSale: false,
        hasWoodPackaging: false,
        hasDangerousGoods: false,
      },
      notes: 'Repeat line for Lumen. Origin CN — no FTA preference claimed this shipment.',
    },
  },
  {
    id: 'ent_wine_0729',
    receiptId: '22222222-2222-4222-8222-222222222222',
    createdIso: '2026-06-29T22:40:00Z',
    updatedIso: '2026-06-30T22:05:00Z',
    goods: 'Italian still wine, bottled (12 x 750ml cases)',
    effectiveRatePercent: 0,
    classifyDescription: 'Still red wine of fresh grapes, bottled in 750ml glass, 14% abv',
    input: {
      shipmentRef: 'AIR-2026-0729',
      importerName: 'Cellar Door Imports Ltd',
      importerId: 'imp_cellardoor',
      supplierName: 'Cantina Toscana SRL',
      originCountry: 'IT',
      incoterm: 'CIF',
      currency: 'EUR',
      freightNzd: 6100,
      insuranceNzd: 540,
      packages: 640,
      grossWeightKg: 9800,
      etaIso: '2026-07-05T00:00:00+12:00',
      cutoffIso: '2026-07-04T17:00:00+12:00',
      lines: [
        { description: 'Chianti Classico DOCG 2022, 750ml x 12/case, 320 cases', quantity: 3840, unitValueNzd: 12.8, lineValueNzd: 49152, countryOfOrigin: 'IT', hsCode: '2204.21.00', unclassified: false },
      ],
      documentsHeld: ['commercial_invoice', 'packing_list', 'bill_of_lading'],
      flags: {
        hasImporterClientCode: true,
        claimPreference: false,
        hasFoodForSale: true,
        hasWoodPackaging: false,
        hasDangerousGoods: false,
        // MPI intended-use not yet recorded → this entry holds for compliance.
      },
      notes: 'Excise-equivalent duty on alcohol applies — broker confirms per the Excise & Excise-equivalent Duties Table. MPI intended-use still to record.',
    },
  },
  {
    id: 'ent_dairy_0725',
    receiptId: '33333333-3333-4333-8333-333333333333',
    createdIso: '2026-06-25T03:20:00Z',
    updatedIso: '2026-06-30T19:50:00Z',
    goods: 'Milking plant — rotary platform components & receiving vat',
    effectiveRatePercent: 0,
    classifyDescription: 'Rotary milking platform components and stainless milk receiving vat',
    classifyHint: '8434.10',
    input: {
      shipmentRef: 'AIR-2026-0725',
      importerName: 'Taranaki Dairy Engineering Ltd',
      importerId: 'imp_taranaki',
      supplierName: 'Southern Cross Dairy Systems Pty',
      originCountry: 'AU',
      incoterm: 'FCA',
      currency: 'AUD',
      freightNzd: 8800,
      insuranceNzd: 720,
      packages: 14,
      grossWeightKg: 6400,
      etaIso: '2026-07-08T00:00:00+12:00',
      cutoffIso: '2026-07-07T17:00:00+12:00',
      lines: [
        { description: 'Rotary milking platform drive & bail components', quantity: 1, unitValueNzd: 58000, lineValueNzd: 58000, countryOfOrigin: 'AU', hsCode: '8434.10.00', unclassified: false },
        { description: 'Stainless milk receiving vat, 6000L', quantity: 1, unitValueNzd: 21000, lineValueNzd: 21000, countryOfOrigin: 'AU', hsCode: '8434.20.00', unclassified: false },
      ],
      documentsHeld: ['commercial_invoice', 'bill_of_lading'],
      flags: {
        hasImporterClientCode: true,
        claimPreference: true, // AANZFTA origin AU
        hasFoodForSale: false,
        hasWoodPackaging: true, // timber crates
        hasDangerousGoods: false,
      },
      notes: 'AANZFTA preference intended (origin AU) — needs certificate of origin. Timber crating → ISPM 15 evidence. Packing list outstanding.',
    },
  },
  {
    id: 'ent_vehicle_0710',
    receiptId: '44444444-4444-4444-8444-444444444444',
    createdIso: '2026-06-30T01:05:00Z',
    updatedIso: '2026-06-30T23:30:00Z',
    goods: 'Vintage motor vehicle — 1972 grand tourer (personal import)',
    effectiveRatePercent: 0,
    classifyDescription: '1972 vintage grand touring motor car, petrol, spark-ignition, personal import',
    input: {
      shipmentRef: 'AIR-2026-0710',
      importerName: 'J. Kerr (private importer)',
      importerId: 'imp_private_kerr',
      supplierName: 'Coppinger Classics (UK)',
      originCountry: 'GB',
      incoterm: 'CIF',
      currency: 'GBP',
      freightNzd: 7400,
      insuranceNzd: 2600,
      packages: 1,
      grossWeightKg: 1450,
      etaIso: '2026-07-11T00:00:00+12:00',
      cutoffIso: '2026-07-10T17:00:00+12:00',
      lines: [
        { description: '1972 grand tourer, petrol, restored — classic vehicle', quantity: 1, unitValueNzd: 148000, lineValueNzd: 148000, countryOfOrigin: 'GB', hsCode: 'to be classified — broker confirms', unclassified: true },
      ],
      documentsHeld: ['commercial_invoice', 'bill_of_lading', 'certificate_of_origin', 'packing_list'],
      flags: {
        hasImporterClientCode: false, // private importer, no client code
        claimPreference: false,
        hasFoodForSale: false,
        hasWoodPackaging: false,
        hasDangerousGoods: false,
      },
      notes: 'Private import. Classification (Ch 87) and Customs valuation need broker judgement; a binding tariff ruling is recommended before importation. Vehicle also needs Customs valuation + LTNZ entry certification downstream.',
    },
  },
];

function assembleEntry(def: DemoEntryDef): CustomsEntryRecord {
  const plan = buildEntryPlan(def.input, def.effectiveRatePercent);
  const classifications = def.classifyDescription
    ? [classifyGoods(def.classifyDescription, def.classifyHint)]
    : [];
  return {
    id: def.id,
    tenantSlug: TENANT_SLUG,
    shipmentRef: def.input.shipmentRef,
    importerId: def.input.importerId,
    importerName: def.input.importerName,
    supplierName: def.input.supplierName,
    originCountry: def.input.originCountry,
    goods: def.goods,
    status: plan.status,
    input: def.input,
    plan,
    classifications,
    receiptId: def.receiptId,
    createdIso: def.createdIso,
    updatedIso: def.updatedIso,
  };
}

export const DEMO_ENTRIES: CustomsEntryRecord[] = ENTRY_DEFS.map(assembleEntry);

// ── Finance / invoicing ────────────────────────────────────────────────────

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'inv_lumen_jun',
    importerId: 'imp_lumen',
    entryId: 'ent_led_0731',
    periodLabel: 'June 2026',
    issuedIso: '2026-06-30',
    dueIso: '2026-07-20',
    status: 'sent',
    lines: [
      { description: 'Customs brokerage — entry AIR-2026-0731', amountNzd: 165, disbursement: false },
      { description: 'Landed-cost report', amountNzd: 45, disbursement: false },
      { description: 'Import Entry Transaction Fee (disbursement)', amountNzd: 33.03, disbursement: true },
      { description: 'MPI biosecurity levy (disbursement)', amountNzd: 30.66, disbursement: true },
    ],
    brokerageFeeNzd: 210,
    disbursementsNzd: 63.69,
    gstNzd: 31.5,
    totalNzd: 305.19,
    xeroInvoiceId: null,
  },
  {
    id: 'inv_cellar_jun',
    importerId: 'imp_cellardoor',
    entryId: 'ent_wine_0729',
    periodLabel: 'June 2026',
    issuedIso: '2026-06-30',
    dueIso: '2026-07-05',
    status: 'awaiting_xero_sync',
    lines: [
      { description: 'Customs brokerage — entry AIR-2026-0729', amountNzd: 185, disbursement: false },
      { description: 'Excise-equivalent duty (alcohol) — paid on behalf', amountNzd: 0, disbursement: true },
    ],
    brokerageFeeNzd: 185,
    disbursementsNzd: 0,
    gstNzd: 27.75,
    totalNzd: 212.75,
    xeroInvoiceId: null,
  },
  {
    id: 'inv_taranaki_jun',
    importerId: 'imp_taranaki',
    entryId: 'ent_dairy_0725',
    periodLabel: 'June 2026',
    issuedIso: '2026-06-28',
    dueIso: '2026-07-28',
    status: 'draft',
    lines: [
      { description: 'Customs brokerage — entry AIR-2026-0725 (over-dimension)', amountNzd: 260, disbursement: false },
      { description: 'FTA origin review (AANZFTA)', amountNzd: 60, disbursement: false },
    ],
    brokerageFeeNzd: 320,
    disbursementsNzd: 0,
    gstNzd: 48,
    totalNzd: 368,
    xeroInvoiceId: null,
  },
  {
    id: 'inv_lumen_may',
    importerId: 'imp_lumen',
    periodLabel: 'May 2026',
    issuedIso: '2026-05-31',
    dueIso: '2026-06-20',
    status: 'paid',
    lines: [{ description: 'Customs brokerage — 3 entries (May)', amountNzd: 495, disbursement: false }],
    brokerageFeeNzd: 495,
    disbursementsNzd: 0,
    gstNzd: 74.25,
    totalNzd: 569.25,
    xeroInvoiceId: 'XRO-INV-4821',
  },
];

// ── Compliance calendar ────────────────────────────────────────────────────

export const DEMO_COMPLIANCE: ComplianceEvent[] = [
  {
    id: 'cmp_gst_jul',
    kind: 'gst_return',
    title: 'GST return — May/Jun period',
    dueIso: '2026-07-28',
    status: 'upcoming',
    owner: 'Becky Ford',
    detail: 'Two-monthly GST return via Xero. Include brokerage income + on-charged disbursements.',
    citation: { source: 'Goods and Services Tax Act 1985', ref: 's.16 (returns)', retrievedAt: '2026-07-01' },
  },
  {
    id: 'cmp_alan_licence',
    kind: 'broker_licence_renewal',
    title: 'Customs broker licence renewal — A. Kerr (CB-1042)',
    dueIso: '2026-07-15',
    status: 'due_soon',
    owner: 'Alan Kerr',
    detail: 'Annual customs broker licence renewal with NZ Customs. Confirm CPD is on track first.',
    citation: { source: 'Customs and Excise Act 2018', ref: 's.180 (customs brokers)', retrievedAt: '2026-07-01' },
  },
  {
    id: 'cmp_tsl',
    kind: 'tsl_renewal',
    title: 'Trade Single Window (TSW) declarant credentials review',
    dueIso: '2026-08-01',
    status: 'upcoming',
    owner: 'Moana Tipene',
    detail: 'Review TSW registration and EDI credentials; confirm all lodging brokers current.',
  },
  {
    id: 'cmp_sam_cpd',
    kind: 'staff_cpd',
    title: 'Entry clerk CPD — S. Whitiora (4 hrs short)',
    dueIso: '2026-06-25',
    status: 'overdue',
    owner: 'Sam Whitiora',
    detail: 'Complete tariff-classification refresher module. 6 of 10 CPD hours logged.',
  },
  {
    id: 'cmp_cellar_profile',
    kind: 'importer_profile_review',
    title: 'Importer profile review — Cellar Door Imports',
    dueIso: '2026-07-10',
    status: 'due_soon',
    owner: 'Moana Tipene',
    detail: 'Annual review: confirm importer details, standing preferences, excise deferral status.',
  },
  {
    id: 'cmp_retention',
    kind: 'record_retention',
    title: 'Record retention sweep — 2019 entries (7-year point)',
    dueIso: '2026-07-31',
    status: 'upcoming',
    owner: 'Becky Ford',
    detail: 'Confirm 2019 entry records retained to the 7-year statutory point before any archival.',
    citation: { source: 'Customs and Excise Act 2018', ref: 's.405 (record keeping)', retrievedAt: '2026-07-01' },
  },
];

// ── Comms drafts ───────────────────────────────────────────────────────────

export const DEMO_COMMS: CommsDraft[] = [
  {
    id: 'cm_wine_mpi',
    channel: 'email',
    entryId: 'ent_wine_0729',
    importerId: 'imp_cellardoor',
    to: 'marco@cellardoorimports.example',
    subject: 'AIR-2026-0729 — MPI intended-use declaration needed before clearance',
    body:
      'Kia ora Marco,\n\nYour Chianti shipment (AIR-2026-0729) is on the water, ETA 5 July. Before we can finalise the entry for lodgement we need the MPI intended-use declaration for the wine — this confirms the goods are for sale and lets us set the right pathway.\n\nCould you confirm the intended use and send through the winery\'s certificate of origin if you\'d like us to review a CPTPP preference position? Excise-equivalent duty on the alcohol will be confirmed by Alan before clearance.\n\nNgā mihi,\nAironaut Customs Brokers',
    status: 'draft',
    createdIso: '2026-06-30T22:10:00Z',
  },
  {
    id: 'cm_dairy_docs',
    channel: 'whatsapp',
    entryId: 'ent_dairy_0725',
    importerId: 'imp_taranaki',
    to: '+64 27 555 0121',
    subject: 'Packing list + ISPM 15 for AIR-2026-0725',
    body:
      'Hi Hemi — milking plant lands 8 July. To keep it moving we need: (1) the packing list, and (2) ISPM 15 / fumigation evidence for the timber crates. Also chasing the AANZFTA certificate of origin so we can claim the AU preference. Can you flick those through today?',
    status: 'approved',
    createdIso: '2026-06-30T20:05:00Z',
  },
  {
    id: 'cm_vehicle_ruling',
    channel: 'email',
    entryId: 'ent_vehicle_0710',
    importerId: 'imp_private_kerr',
    to: 'jkerr@example.com',
    subject: 'AIR-2026-0710 — your classic car: classification & valuation approach',
    body:
      'Kia ora James,\n\nYour 1972 grand tourer is due 11 July. Because it\'s a vintage vehicle imported privately, we want to get the tariff classification and Customs valuation right rather than rushed — so we\'re recommending we seek a binding tariff ruling before importation. That locks the classification and duty treatment and avoids surprises.\n\nWe\'ll also line up the Customs valuation and the downstream entry-certification steps. I\'ll call you Thursday to talk it through.\n\nNgā mihi,\nAironaut Customs Brokers',
    status: 'draft',
    createdIso: '2026-06-30T23:40:00Z',
  },
];

// ── Ops / event calendar ───────────────────────────────────────────────────

export const DEMO_OPS_EVENTS: OpsEvent[] = [
  { id: 'op_led_cut', kind: 'lodgement_cutoff', title: 'Lodgement cut-off — AIR-2026-0731 (Lumen LED)', whenIso: '2026-07-02T17:00:00+12:00', entryId: 'ent_led_0731', status: 'confirmed', detail: 'Entry ready. Broker to lodge before cut-off.' },
  { id: 'op_led_eta', kind: 'vessel_eta', title: 'ETA — AIR-2026-0731', whenIso: '2026-07-03T00:00:00+12:00', entryId: 'ent_led_0731', status: 'confirmed', detail: 'Air freight arrival AKL.' },
  { id: 'op_wine_eta', kind: 'vessel_eta', title: 'ETA — AIR-2026-0729 (Cellar Door wine)', whenIso: '2026-07-05T00:00:00+12:00', entryId: 'ent_wine_0729', status: 'at_risk', detail: 'Entry held for MPI intended-use — at risk of delay at clearance.' },
  { id: 'op_wine_mpi', kind: 'mpi_clearance', title: 'MPI clearance pending — AIR-2026-0729', whenIso: '2026-07-05T09:00:00+12:00', entryId: 'ent_wine_0729', status: 'pending', detail: 'Awaiting intended-use declaration.' },
  { id: 'op_dairy_eta', kind: 'vessel_eta', title: 'ETA — AIR-2026-0725 (Taranaki dairy plant)', whenIso: '2026-07-08T00:00:00+12:00', entryId: 'ent_dairy_0725', status: 'at_risk', detail: 'Packing list + ISPM 15 outstanding.' },
  { id: 'op_veh_eta', kind: 'vessel_eta', title: 'ETA — AIR-2026-0710 (Kerr vintage vehicle)', whenIso: '2026-07-11T00:00:00+12:00', entryId: 'ent_vehicle_0710', status: 'pending', detail: 'Binding ruling recommended before importation.' },
];

// ── Staff incentives ───────────────────────────────────────────────────────

export const DEMO_INCENTIVES: import('./types').IncentiveRow[] = [
  { staffId: 'stf_alan', staffName: 'Alan Kerr', entriesThroughput: 41, errorFreeMonths: 6, cpdOnTrack: false, bonusNzd: 420 },
  { staffId: 'stf_moana', staffName: 'Moana Tipene', entriesThroughput: 37, errorFreeMonths: 5, cpdOnTrack: true, bonusNzd: 380 },
  { staffId: 'stf_sam', staffName: 'Sam Whitiora', entriesThroughput: 22, errorFreeMonths: 3, cpdOnTrack: false, bonusNzd: 150 },
];

// ── Suppliers & carriers register ──────────────────────────────────────────

export const DEMO_PARTIES: import('./types').TradeParty[] = [
  { id: 'prt_gz', kind: 'supplier', name: 'Guangzhou Lumière Co.', country: 'CN', contact: 'Wei Chen', email: 'wei@gzlumiere.example', lanes: ['Guangzhou → Auckland (air)'], notes: 'LED manufacturer for Lumen.' },
  { id: 'prt_toscana', kind: 'supplier', name: 'Cantina Toscana SRL', country: 'IT', contact: 'Giulia Ferri', email: 'export@cantinatoscana.example', lanes: ['Livorno → Auckland (reefer)'], notes: 'Winery — Chianti Classico.' },
  { id: 'prt_scds', kind: 'supplier', name: 'Southern Cross Dairy Systems Pty', country: 'AU', contact: 'Dave Nguyen', email: 'dave@scds.example', lanes: ['Melbourne → Auckland (breakbulk)'], notes: 'Milking plant OEM.' },
  { id: 'prt_reefer', kind: 'shipping_line', name: 'Pacific Reefer Co', country: 'NZ', contact: 'Bookings desk', email: 'bookings@pacificreefer.example', phone: '+64 9 555 0300', lanes: ['Med → Auckland', 'Asia → Auckland'], notes: 'Preferred reefer line for wine.' },
  { id: 'prt_airbridge', kind: 'airline', name: 'AirBridge Express', country: 'NZ', contact: 'Cargo ops', email: 'cargo@airbridge.example', lanes: ['Asia → AKL', 'Europe → AKL'], notes: 'Air freight for time-critical LED.' },
  { id: 'prt_metro', kind: 'transport', name: 'Metro Cartage Ltd', country: 'NZ', contact: 'Dispatch', phone: '+64 9 555 0411', lanes: ['Ports of Auckland → metro'], notes: 'Container cartage + delivery.' },
  { id: 'prt_tf', kind: 'mpi_transitional_facility', name: 'Onehunga Transitional Facility', country: 'NZ', contact: 'Facility operator', phone: '+64 9 555 0522', lanes: ['MPI inspection / devanning'], notes: 'Approved TF for biosecurity inspection.' },
];

// ── Documents register (derived from entries) ──────────────────────────────

const DOC_SIZES = ['180 KB', '64 KB', '1.2 MB', '320 KB', '96 KB'];
export const DEMO_DOCUMENTS: import('./types').DocumentRecord[] = DEMO_ENTRIES.flatMap((e, ei) => {
  const held = e.input.documentsHeld.map((type, i): import('./types').DocumentRecord => ({
    id: `doc_${e.id}_${type}`,
    entryId: e.id,
    importerId: e.importerId,
    type,
    filename: `${e.shipmentRef}-${type}.pdf`,
    status: 'verified',
    addedIso: e.createdIso,
    sizeLabel: DOC_SIZES[(ei + i) % DOC_SIZES.length],
  }));
  const missing = e.plan.missingDocuments.map((type): import('./types').DocumentRecord => ({
    id: `doc_${e.id}_${type}_req`,
    entryId: e.id,
    importerId: e.importerId,
    type,
    filename: `${e.shipmentRef}-${type} (requested)`,
    status: 'requested',
    addedIso: e.updatedIso,
    sizeLabel: '—',
    note: 'Chased with importer',
  }));
  return [...held, ...missing];
});

// ── Tasks / workboard ──────────────────────────────────────────────────────

export const DEMO_TASKS: import('./types').OpsTask[] = [
  { id: 'tsk_1', title: 'Chase MPI intended-use — Cellar Door wine', lane: 'waiting', assigneeId: 'stf_moana', entryId: 'ent_wine_0729', dueIso: '2026-07-02', priority: 'high' },
  { id: 'tsk_2', title: 'Get packing list + ISPM 15 — Taranaki dairy', lane: 'in_progress', assigneeId: 'stf_sam', entryId: 'ent_dairy_0725', dueIso: '2026-07-03', priority: 'high' },
  { id: 'tsk_3', title: 'Lodge LED entry AIR-2026-0731', lane: 'todo', assigneeId: 'stf_alan', entryId: 'ent_led_0731', dueIso: '2026-07-02', priority: 'high' },
  { id: 'tsk_4', title: 'Draft binding-ruling request — Kerr vintage car', lane: 'todo', assigneeId: 'stf_alan', entryId: 'ent_vehicle_0710', dueIso: '2026-07-04', priority: 'normal' },
  { id: 'tsk_5', title: 'Renew broker licence CB-1042', lane: 'todo', assigneeId: 'stf_alan', dueIso: '2026-07-15', priority: 'normal' },
  { id: 'tsk_6', title: 'Sam CPD refresher — tariff classification', lane: 'waiting', assigneeId: 'stf_sam', dueIso: '2026-06-25', priority: 'normal' },
  { id: 'tsk_7', title: 'File June GST return', lane: 'todo', assigneeId: 'stf_becky', dueIso: '2026-07-28', priority: 'normal' },
  { id: 'tsk_8', title: 'Landed-cost report — Lumen June', lane: 'done', assigneeId: 'stf_moana', entryId: 'ent_led_0731', priority: 'low' },
  { id: 'tsk_9', title: 'Confirm reefer booking — next Cellar Door shipment', lane: 'in_progress', assigneeId: 'stf_becky', priority: 'low' },
];

// ── Binding tariff rulings register ────────────────────────────────────────

export const DEMO_RULINGS: import('./types').RulingRecord[] = [
  { id: 'rul_led', reference: 'BTR-2023-0412', goods: 'LED panel light fittings', hsCode: '9405.11.00', status: 'issued', issuedIso: '2023-05-02', expiresIso: '2026-05-02', note: 'Confirms LED panel fittings under 9405.11 (LED-only). Renew before expiry.' },
  { id: 'rul_vehicle', reference: 'BTR-2026-DRAFT', goods: '1972 vintage grand tourer', hsCode: 'Ch 87 — to confirm', status: 'sought', note: 'Ruling being sought for the Kerr private import to lock classification + valuation before importation.' },
];
