import type { SupabaseClient } from '@supabase/supabase-js';

export type LoanCarStatus = 'available' | 'on_loan' | 'overdue' | 'maintenance';

export type LoanCarRow = {
  id: string;
  user_id: string;
  tenant_id: string | null;
  make: string;
  model: string;
  rego: string;
  status: string;
  borrower_name: string | null;
  borrower_phone: string | null;
  return_date: string | null;
  expected_return_at: string | null;
  loan_started_at: string | null;
  linked_job_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type LoanCarSummary = {
  total: number;
  available: number;
  onLoan: number;
  overdue: number;
  maintenance: number;
  dueToday: number;
  nextReturnLabel: string | null;
  wardenDraft: string;
};

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
};

export function normaliseLoanCarStatus(value: string | null | undefined): LoanCarStatus {
  const status = String(value ?? '').toLowerCase().trim().replace(/\s+/g, '_');
  if (status === 'on_loan' || status === 'overdue' || status === 'maintenance') return status;
  return 'available';
}

export function effectiveReturnAt(car: Pick<LoanCarRow, 'expected_return_at' | 'return_date'>): string | null {
  return car.expected_return_at ?? car.return_date;
}

export function isOverdue(car: Pick<LoanCarRow, 'status' | 'expected_return_at' | 'return_date'>, now = new Date()): boolean {
  const status = normaliseLoanCarStatus(car.status);
  const due = effectiveReturnAt(car);
  if (!due || status === 'available' || status === 'maintenance') return status === 'overdue';
  return new Date(due).getTime() < now.getTime();
}

export function formatNzDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function buildLoanCarSummary(cars: LoanCarRow[], now = new Date()): LoanCarSummary {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(now);
  const byStatus = cars.reduce(
    (acc, car) => {
      const status = normaliseLoanCarStatus(car.status);
      if (status === 'available') acc.available += 1;
      if (status === 'on_loan') acc.onLoan += 1;
      if (status === 'maintenance') acc.maintenance += 1;
      if (status === 'overdue' || isOverdue(car, now)) acc.overdue += 1;
      const due = effectiveReturnAt(car);
      if (due) {
        const dueDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(new Date(due));
        if (dueDay === today) acc.dueToday += 1;
      }
      return acc;
    },
    { available: 0, onLoan: 0, overdue: 0, maintenance: 0, dueToday: 0 },
  );

  const nextReturn = cars
    .map((car) => effectiveReturnAt(car))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= now.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const wardenDraft = buildWardenDraft({
    total: cars.length,
    ...byStatus,
    nextReturnLabel: nextReturn ? formatNzDateTime(nextReturn.toISOString()) : null,
  });

  return {
    total: cars.length,
    ...byStatus,
    nextReturnLabel: nextReturn ? formatNzDateTime(nextReturn.toISOString()) : null,
    wardenDraft,
  };
}

function buildWardenDraft(input: Omit<LoanCarSummary, 'wardenDraft'>): string {
  if (input.total === 0) {
    return 'Loan Car Warden has no fleet rows yet. Paste the dealer export first, then review availability before any customer handoff.';
  }
  if (input.overdue > 0) {
    return `Loan Car Warden flags ${input.overdue} overdue return${input.overdue === 1 ? '' : 's'} for operator review. Check borrower contact details, then decide the next desk action before the morning service rush.`;
  }
  if (input.dueToday > 0) {
    return `Loan Car Warden sees ${input.dueToday} return${input.dueToday === 1 ? '' : 's'} due today and ${input.available} vehicle${input.available === 1 ? '' : 's'} available. Keep one spare clear for workshop overruns.`;
  }
  if (input.onLoan > input.available) {
    return `Loan Car Warden sees more cars out than available. Next expected return: ${input.nextReturnLabel ?? 'not recorded'}. Review bookings before promising another courtesy car.`;
  }
  return `Loan Car Warden sees ${input.available} available and ${input.onLoan} on loan. No overdue returns are showing; keep the desk script draft-only until an operator confirms the booking.`;
}

export async function resolveTenantForUser(
  service: SupabaseClient,
  userId: string,
  requestedTenantId?: string | null,
): Promise<TenantContext | null> {
  let membershipQuery = service
    .from('tenant_members')
    .select('tenant_id,tenants:tenant_id(id,slug,name)')
    .eq('user_id', userId);

  if (requestedTenantId) membershipQuery = membershipQuery.eq('tenant_id', requestedTenantId);

  const { data } = await membershipQuery.order('created_at', { ascending: true }).limit(1).maybeSingle();
  const tenant = (data as { tenants?: TenantContext | TenantContext[] | null } | null)?.tenants;
  if (Array.isArray(tenant)) return tenant[0] ?? null;
  return tenant ?? null;
}

export function parseLoanCarsCsv(csv: string) {
  const rows = parseCsv(csv);
  return rows
    .map((row) => {
      const make = pick(row, ['make', 'vehicle_make']);
      const model = pick(row, ['model', 'vehicle_model']);
      const rego = pick(row, ['rego', 'registration', 'plate', 'vehicle_plate']);
      if (!rego) return null;
      const expectedReturn = pick(row, ['expected_return_at', 'expected_return', 'return_date', 'due_back']);
      return {
        make: make || 'Unknown',
        model: model || 'Loan car',
        rego: rego.toUpperCase(),
        status: normaliseLoanCarStatus(pick(row, ['status', 'availability'])),
        borrower_name: pick(row, ['borrower_name', 'customer_name', 'borrower']) || null,
        borrower_phone: pick(row, ['borrower_phone', 'customer_phone', 'phone']) || null,
        expected_return_at: normaliseDateTime(expectedReturn),
        loan_started_at: normaliseDateTime(pick(row, ['loan_started_at', 'loan_started', 'checkout_at'])) ?? null,
        notes: pick(row, ['notes', 'comment']) || null,
        raw_payload: row,
      };
    })
    .filter(Boolean) as Array<{
      make: string;
      model: string;
      rego: string;
      status: LoanCarStatus;
      borrower_name: string | null;
      borrower_phone: string | null;
      expected_return_at: string | null;
      loan_started_at: string | null;
      notes: string | null;
      raw_payload: Record<string, string>;
    }>;
}

function pick(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value?.trim()) return value.trim();
  }
  return '';
}

function normaliseDateTime(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseCsv(csv: string): Array<Record<string, string>> {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index]?.trim() ?? '';
      return acc;
    }, {});
  });
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}
