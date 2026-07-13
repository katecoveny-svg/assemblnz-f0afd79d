import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { canTransitionBooking, type LivingSiteBooking, type LivingSiteBookingStatus } from '@/lib/living-site/bookings';

export type { LivingSiteBooking } from '@/lib/living-site/bookings';

type BookingRow = {
  id: string;
  tenant: string;
  service_id: string;
  service_label: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: LivingSiteBooking['status'];
  source: string;
  created_at: string;
};

function fromRow(row: BookingRow): LivingSiteBooking {
  return {
    id: row.id,
    tenant: row.tenant,
    serviceId: row.service_id,
    serviceLabel: row.service_label,
    name: row.name,
    email: row.email,
    phone: row.phone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    notes: row.notes,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function storeBooking(input: {
  tenant: string;
  serviceId: string;
  serviceLabel: string;
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_bookings')
      .insert({
        tenant: input.tenant,
        service_id: input.serviceId,
        service_label: input.serviceLabel,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        preferred_date: input.preferredDate,
        preferred_time: input.preferredTime,
        notes: input.notes ?? null,
        status: 'requested',
        source: 'website',
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return String(data.id);
  } catch {
    return null;
  }
}

export async function getRecentBookings(
  tenant: string,
  limit = 20,
): Promise<LivingSiteBooking[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_bookings')
      .select('id, tenant, service_id, service_label, name, email, phone, preferred_date, preferred_time, notes, status, source, created_at')
      .eq('tenant', tenant)
      .order('preferred_date', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as BookingRow[]).map(fromRow);
  } catch {
    return [];
  }
}

export type BookingStatusUpdate =
  | { ok: true; booking: LivingSiteBooking }
  | { ok: false; reason: 'not_found' | 'invalid_transition' | 'unavailable' };

export async function updateBookingStatus(input: {
  tenant: string;
  id: string;
  status: LivingSiteBookingStatus;
}): Promise<BookingStatusUpdate> {
  try {
    const supabase = getServiceClient();
    const { data: current, error: readError } = await supabase
      .from('living_site_bookings')
      .select('id, status')
      .eq('tenant', input.tenant)
      .eq('id', input.id)
      .maybeSingle();
    if (readError) return { ok: false, reason: 'unavailable' };
    if (!current) return { ok: false, reason: 'not_found' };
    const currentStatus = current.status as LivingSiteBookingStatus;
    if (!canTransitionBooking(currentStatus, input.status)) {
      return { ok: false, reason: 'invalid_transition' };
    }
    const { data, error } = await supabase
      .from('living_site_bookings')
      .update({ status: input.status })
      .eq('tenant', input.tenant)
      .eq('id', input.id)
      .select('id, tenant, service_id, service_label, name, email, phone, preferred_date, preferred_time, notes, status, source, created_at')
      .single();
    if (error || !data) return { ok: false, reason: 'unavailable' };
    return { ok: true, booking: fromRow(data as BookingRow) };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
