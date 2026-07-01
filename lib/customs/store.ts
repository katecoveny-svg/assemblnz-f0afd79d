/**
 * Data-access layer for the Aironaut customs workspace.
 *
 * DB-first, fixture-fallback — the same resilience pattern as
 * lib/evidence/getReceipt.ts. Each getter tries Supabase; if the env isn't
 * configured, the tenant_customs_* tables don't exist yet, RLS returns nothing
 * (a password-gate visitor who isn't an authenticated tenant member), or the
 * result is empty, it falls back to the in-code demo fixtures. That means the
 * pilot renders the moment Kate shares it — the migration is a bonus, not a
 * prerequisite.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { buildEntryPlan } from './entry-planner';
import {
  DEMO_COMMS,
  DEMO_COMPLIANCE,
  DEMO_DOCUMENTS,
  DEMO_ENTRIES,
  DEMO_IMPORTERS,
  DEMO_INCENTIVES,
  DEMO_INVOICES,
  DEMO_OPS_EVENTS,
  DEMO_PARTIES,
  DEMO_RULINGS,
  DEMO_SHIFTS,
  DEMO_STAFF,
  DEMO_TASKS,
} from './demo';
import type {
  CommsDraft,
  ComplianceEvent,
  CustomsEntryRecord,
  DocumentRecord,
  Importer,
  IncentiveRow,
  Invoice,
  OpsEvent,
  OpsTask,
  RulingRecord,
  Shift,
  StaffMember,
  TradeParty,
} from './types';
import { TENANT_SLUG } from './types';

export type DataSource = 'db' | 'demo';

/** Try a Supabase read; return null on any failure so callers fall back. */
async function tryDb<T>(
  run: (sb: Awaited<ReturnType<typeof createClient>>) => PromiseLike<T[] | null>,
): Promise<T[] | null> {
  try {
    const sb = await createClient();
    const rows = await run(sb);
    if (!rows || rows.length === 0) return null;
    return rows;
  } catch {
    return null;
  }
}

// ── Entries ────────────────────────────────────────────────────────────────

interface EntryRow {
  id: string;
  shipment_ref: string;
  importer_id: string;
  importer_name: string;
  supplier_name: string;
  origin_country: string;
  goods: string;
  status: string;
  input: CustomsEntryRecord['input'];
  classifications: CustomsEntryRecord['classifications'];
  effective_rate_percent: number | null;
  receipt_id: string;
  created_at: string;
  updated_at: string;
}

function mapEntryRow(row: EntryRow): CustomsEntryRecord {
  const plan = buildEntryPlan(row.input, row.effective_rate_percent ?? 0);
  return {
    id: row.id,
    tenantSlug: TENANT_SLUG,
    shipmentRef: row.shipment_ref,
    importerId: row.importer_id,
    importerName: row.importer_name,
    supplierName: row.supplier_name,
    originCountry: row.origin_country,
    goods: row.goods,
    status: plan.status,
    input: row.input,
    plan,
    classifications: row.classifications ?? [],
    receiptId: row.receipt_id,
    createdIso: row.created_at,
    updatedIso: row.updated_at,
  };
}

export async function listEntries(): Promise<{ entries: CustomsEntryRecord[]; source: DataSource }> {
  const rows = await tryDb<EntryRow>((sb) =>
    sb
      .from('tenant_customs_entries')
      .select('*')
      .eq('tenant_slug', TENANT_SLUG)
      .order('created_at', { ascending: false })
      .then((r) => (r.error ? null : (r.data as unknown as EntryRow[]))),
  );
  if (rows) return { entries: rows.map(mapEntryRow), source: 'db' };
  return { entries: DEMO_ENTRIES, source: 'demo' };
}

export async function getEntry(id: string): Promise<{ entry: CustomsEntryRecord | null; source: DataSource }> {
  const { entries, source } = await listEntries();
  return { entry: entries.find((e) => e.id === id) ?? null, source };
}

// ── Importers ──────────────────────────────────────────────────────────────

export async function listImporters(): Promise<{ importers: Importer[]; source: DataSource }> {
  const rows = await tryDb<Importer>((sb) =>
    sb
      .from('tenant_customs_importers')
      .select('*')
      .eq('tenant_slug', TENANT_SLUG)
      .then((r) => (r.error ? null : (r.data as unknown as Importer[]))),
  );
  if (rows) return { importers: rows, source: 'db' };
  return { importers: DEMO_IMPORTERS, source: 'demo' };
}

export async function getImporter(id: string): Promise<Importer | null> {
  const { importers } = await listImporters();
  return importers.find((i) => i.id === id) ?? null;
}

// ── Ops modules (fixture-backed for the pilot) ─────────────────────────────

export async function listStaff(): Promise<StaffMember[]> {
  return DEMO_STAFF;
}
export async function listShifts(): Promise<Shift[]> {
  return DEMO_SHIFTS;
}
export async function listInvoices(): Promise<Invoice[]> {
  return DEMO_INVOICES;
}
export async function listCompliance(): Promise<ComplianceEvent[]> {
  return DEMO_COMPLIANCE;
}
export async function listComms(): Promise<CommsDraft[]> {
  return DEMO_COMMS;
}
export async function listOpsEvents(): Promise<OpsEvent[]> {
  return DEMO_OPS_EVENTS;
}
export async function listIncentives(): Promise<IncentiveRow[]> {
  return DEMO_INCENTIVES;
}
export async function listParties(): Promise<TradeParty[]> {
  return DEMO_PARTIES;
}
export async function listDocuments(): Promise<DocumentRecord[]> {
  return DEMO_DOCUMENTS;
}
export async function listTasks(): Promise<OpsTask[]> {
  return DEMO_TASKS;
}
export async function listRulings(): Promise<RulingRecord[]> {
  return DEMO_RULINGS;
}

// ── Dashboard aggregation ──────────────────────────────────────────────────

export interface DashboardSnapshot {
  source: DataSource;
  entries: CustomsEntryRecord[];
  openEntries: number;
  readyToLodge: number;
  heldForCompliance: number;
  missingInfo: number;
  todaysCutoffs: OpsEvent[];
  overdueCompliance: ComplianceEvent[];
  dueSoonCompliance: ComplianceEvent[];
  staffOnShiftToday: { staff: StaffMember; shift: Shift }[];
  financePulse: {
    draftInvoices: number;
    awaitingSync: number;
    overdue: number;
    outstandingNzd: number;
  };
}

export async function getDashboard(nowIso: string): Promise<DashboardSnapshot> {
  const today = nowIso.slice(0, 10);
  const { entries, source } = await listEntries();
  const [staff, shifts, invoices, compliance, ops] = await Promise.all([
    listStaff(),
    listShifts(),
    listInvoices(),
    listCompliance(),
    listOpsEvents(),
  ]);

  const staffById = new Map(staff.map((s) => [s.id, s]));
  const staffOnShiftToday = shifts
    .filter((sh) => sh.dateIso === today)
    .map((sh) => ({ staff: staffById.get(sh.staffId)!, shift: sh }))
    .filter((x) => x.staff);

  const outstandingNzd = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((sum, i) => sum + i.totalNzd, 0);

  return {
    source,
    entries,
    openEntries: entries.filter((e) => !['cleared'].includes(e.status)).length,
    readyToLodge: entries.filter((e) => e.status === 'ready_for_broker_review').length,
    heldForCompliance: entries.filter((e) => e.status === 'hold_for_compliance').length,
    missingInfo: entries.filter((e) => e.status === 'missing_information').length,
    todaysCutoffs: ops.filter((o) => o.kind === 'lodgement_cutoff' && o.whenIso.slice(0, 10) === today),
    overdueCompliance: compliance.filter((c) => c.status === 'overdue'),
    dueSoonCompliance: compliance.filter((c) => c.status === 'due_soon'),
    staffOnShiftToday,
    financePulse: {
      draftInvoices: invoices.filter((i) => i.status === 'draft').length,
      awaitingSync: invoices.filter((i) => i.status === 'awaiting_xero_sync').length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
      outstandingNzd: Math.round(outstandingNzd * 100) / 100,
    },
  };
}
