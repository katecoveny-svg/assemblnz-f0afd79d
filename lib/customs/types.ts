/**
 * Aironaut × Pīkau — customs-brokerage operations platform.
 *
 * Type surface for the whole workspace: the Pīkau intelligence layer
 * (entries, HS classification, FTA preference, landed cost, compliance) plus
 * the operations layer (importers CRM, staff + roster + pay, finance, the
 * compliance calendar, comms, and the ops/event calendar).
 *
 * Draft-only, always. Nothing here lodges an entry with the New Zealand
 * Customs Service. HS codes are either drawn from a real reference lookup or
 * carried as an explicit broker-review suggestion — never invented silently.
 *
 * Ported and generalised from the Pīkau prior art:
 *   - legacy-vite/src/lib/pikau/pikauEntryPlanner.ts (entry planner)
 *   - lib/hapai/customs-entry.ts (multi-line drafter, TARIFF_PLACEHOLDER)
 *   - supabase/functions/_shared/kete/pikau/ta-rules.ts (statute-cited gates)
 *   - plugins/managed-agent-cookbooks/pikau-customs-broker/** (GRI classifier)
 */

// ── Shared primitives ──────────────────────────────────────────────────────

export const TENANT_SLUG = 'aeronaut' as const;
export const NZ_GST_RATE = 0.15;
/** NZCS de minimis: duty/GST generally not collected at or below this value. */
export const DE_MINIMIS_NZD = 1000;
/** Customs and Excise Act 2018 s.405 — 7-year record retention. */
export const RETENTION_YEARS = 7;

export type Incoterm2020 =
  | 'EXW'
  | 'FCA'
  | 'CPT'
  | 'CIP'
  | 'DAP'
  | 'DPU'
  | 'DDP'
  | 'FAS'
  | 'FOB'
  | 'CFR'
  | 'CIF';

export const INCOTERMS_2020: Incoterm2020[] = [
  'EXW',
  'FCA',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'FAS',
  'FOB',
  'CFR',
  'CIF',
];

export type CustomsDocumentType =
  | 'commercial_invoice'
  | 'packing_list'
  | 'bill_of_lading'
  | 'air_waybill'
  | 'certificate_of_origin'
  | 'dangerous_goods_declaration'
  | 'mpi_certificate'
  | 'fumigation_certificate';

export const DOCUMENT_LABELS: Record<CustomsDocumentType, string> = {
  commercial_invoice: 'Commercial invoice',
  packing_list: 'Packing list',
  bill_of_lading: 'Bill of lading',
  air_waybill: 'Air waybill',
  certificate_of_origin: 'Certificate of origin',
  dangerous_goods_declaration: 'Dangerous goods declaration',
  mpi_certificate: 'MPI certificate',
  fumigation_certificate: 'Fumigation / ISPM 15 certificate',
};

/**
 * A statute / rule citation attached to a decision. Every classification and
 * every compliance flag carries one so the audit pack can show its working.
 */
export interface CustomsCitation {
  /** Human label, e.g. "Customs and Excise Act 2018". */
  source: string;
  /** Section / clause / rule, e.g. "s.180" or "GRI 3(b)". */
  ref?: string;
  /** Short note on why it applies. */
  note?: string;
  /** Where it was read from, for the retrieval trail. */
  url?: string;
  /** ISO date the source was retrieved / last verified. */
  retrievedAt?: string;
}

// ── HS classification ──────────────────────────────────────────────────────

export type ClassificationConfidence = 'high' | 'medium' | 'low';

/**
 * One candidate HS classification. The classifier always returns three,
 * ranked, each naming the General Rule of Interpretation that drove it. A
 * licensed broker selects and confirms before anything is lodged.
 */
export interface HsCandidate {
  /** e.g. "9405.11.00" — real heading from the reference, or a marked suggestion. */
  hsCode: string;
  headingText: string;
  /** Which GRIs were applied, in order, e.g. ["GRI 1", "GRI 6"]. */
  griApplied: string[];
  griReasoning: string;
  confidence: ClassificationConfidence;
  /** Indicative General (MFN) duty rate %, from the reference. */
  dutyRatePercent: number;
  /** True when the code is a suggestion pending broker/ruling confirmation. */
  suggestion: boolean;
  brokerNote: string;
}

export interface ClassificationResult {
  goodsDescription: string;
  candidates: HsCandidate[];
  /** Whether we recommend seeking a binding tariff ruling (s.135 C&E Act). */
  recommendRuling: boolean;
  rulingReason: string;
  citations: CustomsCitation[];
  signOffLine: string;
}

// ── FTA / preference ───────────────────────────────────────────────────────

export interface FtaAgreement {
  /** ISO-2 partner country. */
  country: string;
  countryName: string;
  agreement: string;
  preferentialRatePercent: number;
  ruleOfOrigin: string;
  originEvidence: string;
  citation: CustomsCitation;
}

export interface FtaCheckResult {
  hsCode: string;
  originCountry: string;
  eligible: boolean;
  agreement: FtaAgreement | null;
  generalRatePercent: number;
  preferentialRatePercent: number;
  /** Duty saved per NZ$ of customs value, expressed as a percentage. */
  savingPercent: number;
  requirement: string;
  note: string;
}

// ── Entry planner (the readiness engine) ───────────────────────────────────

export type EntryStatus =
  | 'draft'
  | 'missing_information'
  | 'hold_for_compliance'
  | 'ready_for_broker_review'
  | 'lodged_by_broker'
  | 'assessed'
  | 'cleared';

export interface EntryIssue {
  code: string;
  title: string;
  detail: string;
  /** Statute / rule behind the flag, when there is one. */
  citation?: CustomsCitation;
}

/** One classified line on an entry. */
export interface EntryLine {
  description: string;
  quantity: number;
  unitValueNzd: number;
  lineValueNzd: number;
  countryOfOrigin: string;
  /** Confirmed HS code, or the placeholder until a broker classifies it. */
  hsCode: string;
  /** True when hsCode is still the "to be classified" placeholder. */
  unclassified: boolean;
}

export interface EntryFlags {
  hasImporterClientCode: boolean;
  claimPreference: boolean;
  hasFoodForSale: boolean;
  hasWoodPackaging: boolean;
  hasDangerousGoods: boolean;
  intendedUseCode?: string;
}

export interface EntryInput {
  shipmentRef: string;
  importerName: string;
  importerId: string;
  supplierName: string;
  originCountry: string;
  incoterm: Incoterm2020;
  currency: string;
  freightNzd: number;
  insuranceNzd: number;
  packages?: number;
  grossWeightKg?: number;
  etaIso?: string;
  /** Customs cut-off / lodgement deadline. */
  cutoffIso?: string;
  lines: EntryLine[];
  documentsHeld: CustomsDocumentType[];
  flags: EntryFlags;
  notes?: string;
}

export interface DutyCalc {
  goodsValueNzd: number;
  freightNzd: number;
  insuranceNzd: number;
  /** CIF-style assembly: goods + freight + insurance. */
  customsValueNzd: number;
  dutyRatePercent: number;
  estimatedDutyNzd: number;
  estimatedGstNzd: number;
  /** Import Entry Transaction Fee + biosecurity levy (indicative). */
  transactionFeesNzd: number;
  estimatedBorderChargesNzd: number;
  estimatedLandedCostNzd: number;
  belowDeMinimis: boolean;
}

export interface EntryPlan {
  readinessScore: number;
  status: EntryStatus;
  duty: DutyCalc;
  requiredDocuments: CustomsDocumentType[];
  missingDocuments: CustomsDocumentType[];
  blockers: EntryIssue[];
  warnings: EntryIssue[];
  nextActions: string[];
  citations: CustomsCitation[];
  summary: string;
}

// ── Importer CRM ───────────────────────────────────────────────────────────

export interface ImporterContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Importer {
  id: string;
  name: string;
  /** NZCS importer client code / declarant code. */
  clientCode: string;
  /** NZ Business Number. */
  nzbn?: string;
  gstRegistered: boolean;
  contacts: ImporterContact[];
  /** Free-form credit terms, e.g. "20th month following". */
  creditTerms: string;
  standingPreferences: string[];
  commonHsCodes: string[];
  /** Rolling count of entries in the current calendar year. */
  entriesThisYear: number;
  since: string;
  notes?: string;
}

// ── Staff, roster, pay ─────────────────────────────────────────────────────

export type StaffRole = 'broker' | 'senior_broker' | 'entry_clerk' | 'admin' | 'driver';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  /** NZCS customs broker licence number, where the role holds one. */
  brokerLicence?: string;
  email: string;
  /** Hourly wage or salary-equivalent hourly, NZD. */
  wageRateNzd: number;
  employmentType: 'permanent' | 'casual' | 'contractor';
  /** CPD hours logged in the current year (brokers need ongoing CPD). */
  cpdHoursYtd: number;
  cpdHoursRequired: number;
  active: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  dateIso: string;
  startHhmm: string;
  endHhmm: string;
  /** Recorded worked hours (timesheet). Null until the shift is closed. */
  workedHours: number | null;
  notes?: string;
}

// ── Finance / invoicing ────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'awaiting_xero_sync' | 'sent' | 'paid' | 'overdue';

export interface InvoiceLine {
  description: string;
  amountNzd: number;
  /** True for pass-through disbursements (duty/GST/levies paid on behalf). */
  disbursement: boolean;
}

export interface Invoice {
  id: string;
  importerId: string;
  entryId?: string;
  periodLabel: string;
  issuedIso: string;
  dueIso: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  brokerageFeeNzd: number;
  disbursementsNzd: number;
  gstNzd: number;
  totalNzd: number;
  /** Xero invoice id once synced; null while local-only. */
  xeroInvoiceId: string | null;
}

// ── Compliance calendar ────────────────────────────────────────────────────

export type ComplianceKind =
  | 'tsl_renewal'
  | 'gst_return'
  | 'broker_licence_renewal'
  | 'importer_profile_review'
  | 'staff_cpd'
  | 'record_retention';

export type ComplianceStatus = 'upcoming' | 'due_soon' | 'overdue' | 'done';

export interface ComplianceEvent {
  id: string;
  kind: ComplianceKind;
  title: string;
  dueIso: string;
  status: ComplianceStatus;
  owner: string;
  citation?: CustomsCitation;
  detail: string;
}

// ── Comms drafting ─────────────────────────────────────────────────────────

export type CommsChannel = 'email' | 'whatsapp' | 'carrier_update';

export interface CommsDraft {
  id: string;
  channel: CommsChannel;
  entryId?: string;
  importerId?: string;
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'approved' | 'sent';
  createdIso: string;
}

// ── Ops / event calendar ───────────────────────────────────────────────────

export type OpsEventKind =
  | 'vessel_eta'
  | 'lodgement_cutoff'
  | 'mpi_clearance'
  | 'container_release'
  | 'delivery';

export interface OpsEvent {
  id: string;
  kind: OpsEventKind;
  title: string;
  whenIso: string;
  entryId?: string;
  status: 'pending' | 'confirmed' | 'at_risk' | 'done';
  detail: string;
}

// ── Staff incentives ───────────────────────────────────────────────────────

export interface IncentiveRow {
  staffId: string;
  staffName: string;
  entriesThroughput: number;
  errorFreeMonths: number;
  cpdOnTrack: boolean;
  bonusNzd: number;
}

// ── The stored entry record (what the DB row / fixture holds) ───────────────

export interface CustomsEntryRecord {
  id: string;
  tenantSlug: string;
  shipmentRef: string;
  importerId: string;
  importerName: string;
  supplierName: string;
  originCountry: string;
  goods: string;
  status: EntryStatus;
  input: EntryInput;
  /** Cached plan so lists render without recomputing. Recomputed on open. */
  plan: EntryPlan;
  /** Classification decisions captured against this entry (audit trail). */
  classifications: ClassificationResult[];
  receiptId: string;
  createdIso: string;
  updatedIso: string;
}

// ── Suppliers & carriers register ──────────────────────────────────────────

export type PartyKind = 'supplier' | 'shipping_line' | 'airline' | 'freight_forwarder' | 'transport' | 'mpi_transitional_facility';

export interface TradeParty {
  id: string;
  kind: PartyKind;
  name: string;
  country: string;
  contact?: string;
  email?: string;
  phone?: string;
  /** Trade lanes / routes served, e.g. "Shanghai → Auckland". */
  lanes: string[];
  notes?: string;
}

// ── Documents register ─────────────────────────────────────────────────────

export interface DocumentRecord {
  id: string;
  entryId?: string;
  importerId?: string;
  type: CustomsDocumentType;
  filename: string;
  /** Held / requested / verified. */
  status: 'held' | 'requested' | 'verified';
  addedIso: string;
  sizeLabel: string;
  note?: string;
}

// ── Tasks / workboard ──────────────────────────────────────────────────────

export type TaskLane = 'todo' | 'in_progress' | 'waiting' | 'done';

export interface OpsTask {
  id: string;
  title: string;
  lane: TaskLane;
  assigneeId?: string;
  entryId?: string;
  dueIso?: string;
  priority: 'low' | 'normal' | 'high';
}

// ── Binding tariff rulings register ────────────────────────────────────────

export interface RulingRecord {
  id: string;
  reference: string;
  goods: string;
  hsCode: string;
  status: 'sought' | 'issued' | 'expired';
  issuedIso?: string;
  expiresIso?: string;
  note: string;
}
