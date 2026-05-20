import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveTenantForUser, type TenantContext } from './loan-cars';

export type ServiceAppointmentRow = {
  id: string;
  tenant_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  vehicle_year: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  km_current: number | null;
  appointment_at: string;
  reason: string | null;
  status: string | null;
  raw_payload?: Record<string, unknown> | null;
  created_at?: string;
};

export type SalesConversationRow = {
  id: string;
  tenant_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  last_conversation_at: string | null;
  vehicle_purchased_year: number | null;
  vehicle_purchased_make: string | null;
  vehicle_purchased_model: string | null;
  finance_provider: string | null;
  finance_term_months: number | null;
  finance_end_at: string | null;
  warranty_end_at: string | null;
  created_at?: string;
};

export type MatchSignal = {
  label: string;
  points: number;
};

export type ServiceSalesMatch = {
  appointment: ServiceAppointmentRow;
  salesConversation: SalesConversationRow | null;
  score: number;
  tier: 'strong' | 'watch' | 'routine';
  signals: MatchSignal[];
  openingLine: string;
  followUpLine: string;
  handoffDraft: string;
};

export type ServiceMatchSummary = {
  strong: number;
  watch: number;
  routine: number;
  total: number;
};

export function scoreServiceSalesMatch(
  appointment: ServiceAppointmentRow,
  sales: SalesConversationRow | null,
  now = new Date(),
): Pick<ServiceSalesMatch, 'score' | 'tier' | 'signals'> {
  const signals: MatchSignal[] = [];
  const vehicleYear = appointment.vehicle_year ?? sales?.vehicle_purchased_year ?? null;
  const vehicleAge = vehicleYear ? now.getUTCFullYear() - vehicleYear : null;

  if (vehicleAge !== null && vehicleAge >= 5) signals.push({ label: 'Vehicle is 5+ years old', points: 25 });
  else if (vehicleAge !== null && vehicleAge >= 3) signals.push({ label: 'Vehicle is 3+ years old', points: 15 });

  if ((appointment.km_current ?? 0) > 100000) signals.push({ label: 'Vehicle km over 100,000', points: 15 });
  if (isWithinDays(sales?.warranty_end_at, 90, now)) signals.push({ label: 'Warranty expires within 90 days', points: 20 });
  if (isWithinDays(sales?.finance_end_at, 60, now)) signals.push({ label: 'Finance maturity within 60 days', points: 25 });

  const monthsSinceSales = monthsSince(sales?.last_conversation_at, now);
  if (monthsSinceSales !== null && monthsSinceSales > 24) signals.push({ label: 'Last sales conversation over 24 months ago', points: 20 });
  else if (monthsSinceSales !== null && monthsSinceSales > 12) signals.push({ label: 'Last sales conversation over 12 months ago', points: 10 });

  const serviceCount = Number(appointment.raw_payload?.service_count ?? appointment.raw_payload?.services_with_us ?? 0);
  if (Number.isFinite(serviceCount) && serviceCount >= 3) signals.push({ label: 'Customer service-loyal with 3+ services', points: 10 });

  const score = Math.min(100, signals.reduce((sum, signal) => sum + signal.points, 0));
  return {
    score,
    tier: score >= 70 ? 'strong' : score >= 40 ? 'watch' : 'routine',
    signals,
  };
}

export function buildServiceSalesMatch(
  appointment: ServiceAppointmentRow,
  sales: SalesConversationRow | null,
  now = new Date(),
): ServiceSalesMatch {
  const scored = scoreServiceSalesMatch(appointment, sales, now);
  return {
    appointment,
    salesConversation: sales,
    ...scored,
    openingLine: buildOpeningLine(appointment, sales),
    followUpLine: buildFollowUpLine(appointment),
    handoffDraft: buildHandoffDraft(appointment, scored.tier),
  };
}

export function summariseMatches(matches: ServiceSalesMatch[]): ServiceMatchSummary {
  return matches.reduce(
    (acc, match) => {
      acc.total += 1;
      acc[match.tier] += 1;
      return acc;
    },
    { strong: 0, watch: 0, routine: 0, total: 0 },
  );
}

export function findSalesConversation(
  appointment: ServiceAppointmentRow,
  conversations: SalesConversationRow[],
): SalesConversationRow | null {
  const email = normaliseContact(appointment.customer_email);
  const phone = normalisePhone(appointment.customer_phone);
  return (
    conversations.find((sales) => {
      const salesEmail = normaliseContact(sales.customer_email);
      const salesPhone = normalisePhone(sales.customer_phone);
      return (email && salesEmail === email) || (phone && salesPhone === phone);
    }) ?? null
  );
}

export async function resolveAratakiTenantForUser(
  service: SupabaseClient,
  userId: string,
  requestedTenantId?: string | null,
): Promise<TenantContext | null> {
  return resolveTenantForUser(service, userId, requestedTenantId);
}

export function parseServiceAppointmentsCsv(csv: string) {
  return parseCsv(csv)
    .map((row) => {
      const customerName = pick(row, ['customer_name', 'name', 'customer']);
      const appointmentAt = normaliseDateTime(pick(row, ['appointment_at', 'appointment', 'booking_time', 'service_date']));
      if (!customerName || !appointmentAt) return null;
      return {
        customer_name: customerName,
        customer_email: pick(row, ['customer_email', 'email']) || null,
        customer_phone: pick(row, ['customer_phone', 'phone', 'mobile']) || null,
        vehicle_year: normaliseInteger(pick(row, ['vehicle_year', 'year'])),
        vehicle_make: pick(row, ['vehicle_make', 'make']) || null,
        vehicle_model: pick(row, ['vehicle_model', 'model']) || null,
        vehicle_plate: pick(row, ['vehicle_plate', 'plate', 'rego', 'registration']) || null,
        km_current: normaliseInteger(pick(row, ['km_current', 'odometer', 'km'])),
        appointment_at: appointmentAt,
        reason: pick(row, ['reason', 'service_reason', 'job_type']) || null,
        status: pick(row, ['status']) || 'scheduled',
        raw_payload: row,
      };
    })
    .filter(Boolean) as Array<Omit<ServiceAppointmentRow, 'id' | 'tenant_id'>>;
}

export function parseSalesConversationsCsv(csv: string) {
  return parseCsv(csv)
    .map((row) => {
      const customerName = pick(row, ['customer_name', 'name', 'customer']);
      if (!customerName) return null;
      return {
        customer_name: customerName,
        customer_email: pick(row, ['customer_email', 'email']) || null,
        customer_phone: pick(row, ['customer_phone', 'phone', 'mobile']) || null,
        last_conversation_at: normaliseDateTime(pick(row, ['last_conversation_at', 'last_sales_conversation', 'last_contact_at'])),
        vehicle_purchased_year: normaliseInteger(pick(row, ['vehicle_purchased_year', 'purchase_year', 'vehicle_year'])),
        vehicle_purchased_make: pick(row, ['vehicle_purchased_make', 'make']) || null,
        vehicle_purchased_model: pick(row, ['vehicle_purchased_model', 'model']) || null,
        finance_provider: pick(row, ['finance_provider', 'lender']) || null,
        finance_term_months: normaliseInteger(pick(row, ['finance_term_months', 'term_months'])),
        finance_end_at: normaliseDateTime(pick(row, ['finance_end_at', 'finance_end', 'maturity_date'])),
        warranty_end_at: normaliseDateTime(pick(row, ['warranty_end_at', 'warranty_end', 'warranty_expiry'])),
      };
    })
    .filter(Boolean) as Array<Omit<SalesConversationRow, 'id' | 'tenant_id'>>;
}

function buildOpeningLine(appointment: ServiceAppointmentRow, sales: SalesConversationRow | null) {
  const vehicle = [appointment.vehicle_year, appointment.vehicle_make, appointment.vehicle_model].filter(Boolean).join(' ') || 'vehicle';
  const reason = appointment.reason ? ` for ${appointment.reason}` : '';
  const warrantyCue = sales?.warranty_end_at ? ' before the warranty window closes' : '';
  return `How's the ${vehicle} going${reason}? It feels like a good moment to check whether it is still suiting you${warrantyCue}.`;
}

function buildFollowUpLine(appointment: ServiceAppointmentRow) {
  const vehicle = [appointment.vehicle_make, appointment.vehicle_model].filter(Boolean).join(' ') || 'current vehicle';
  return `If they engage, ask what they would change about the ${vehicle}, then offer to have the sales floor look at options while the service is underway.`;
}

function buildHandoffDraft(appointment: ServiceAppointmentRow, tier: ServiceSalesMatch['tier']) {
  return `Draft handoff for sales review: ${appointment.customer_name} is in for service and is a ${tier} service-to-sales opportunity. Please review before any customer contact.`;
}

function isWithinDays(value: string | null | undefined, days: number, now: Date) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diff = date.getTime() - now.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function monthsSince(value: string | null | undefined, now: Date) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + now.getUTCMonth() - date.getUTCMonth();
}

function normaliseContact(value: string | null | undefined) {
  return value?.trim().toLowerCase() || '';
}

function normalisePhone(value: string | null | undefined) {
  return value?.replace(/\D/g, '') || '';
}

function pick(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value?.trim()) return value.trim();
  }
  return '';
}

function normaliseInteger(value: string) {
  if (!value) return null;
  const number = Number(value.replace(/,/g, ''));
  return Number.isInteger(number) ? number : null;
}

function normaliseDateTime(value: string) {
  if (!value) return null;
  const nzDate = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (nzDate) {
    const [, day, month, year, hour = '0', minute = '0'] = nzDate;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
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
