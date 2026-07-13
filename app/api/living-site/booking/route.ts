import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin/ensureAdmin';
import { consume, rateKey } from '@/lib/creative/ratelimit';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { storeBooking, updateBookingStatus } from '@/lib/living-site/booking-store';
import { isLivingSiteBookingStatus } from '@/lib/living-site/bookings';
import { getInstall, INSTALL_TENANT_RE, installTenantExists } from '@/lib/living-site/install-store';
import { SAMPLE_VERTICALS, VERTICAL_TENANTS } from '@/lib/living-site/verticals';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 15;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function value(input: unknown, max: number): string | null {
  return typeof input === 'string' && input.trim().length > 0 && input.trim().length <= max
    ? input.trim()
    : null;
}

function nzToday(): string {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

async function allowedTenant(raw: string | null): Promise<string | null | 'unavailable'> {
  if (raw && VERTICAL_TENANTS.has(raw)) return raw;
  if (raw && INSTALL_TENANT_RE.test(raw)) {
    const exists = await installTenantExists(raw);
    if (exists === null) return 'unavailable';
    if (exists) return raw;
  }
  return null;
}

async function serviceForTenant(tenant: string, serviceId: string) {
  const sample = SAMPLE_VERTICALS.find((item) => item.tenant === tenant);
  if (sample) {
    const { facts } = await getGenomeFactsFor(tenant, sample.fallbackFacts);
    return facts.find((fact) => fact.section === 'services' && fact.id === serviceId) ?? null;
  }
  if (INSTALL_TENANT_RE.test(tenant)) {
    const install = await getInstall(tenant.slice('install-'.length));
    return install?.facts.find((fact) => fact.section === 'services' && fact.id === serviceId) ?? null;
  }
  return null;
}

/**
 * Public booking-request intake. This records a preferred time; it never
 * promises or confirms a slot. The owner reviews every request in the CRM.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });

  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const tenant = await allowedTenant(value(body.tenant, 60));
  if (tenant === 'unavailable') {
    return NextResponse.json({ ok: false, error: 'booking desk unavailable — try again shortly' }, { status: 503 });
  }
  const serviceId = value(body.serviceId, 80);
  const name = value(body.name, 120);
  const email = value(body.email, 200);
  const phone = value(body.phone, 40) ?? undefined;
  const preferredDate = value(body.preferredDate, 10);
  const preferredTime = value(body.preferredTime, 40);
  const notes = value(body.notes, 1500) ?? undefined;

  if (
    !tenant || !serviceId || !name || !email || !EMAIL_RE.test(email)
    || !preferredDate || !DATE_RE.test(preferredDate) || !preferredTime
  ) {
    return NextResponse.json(
      { ok: false, error: 'service, name, valid email, preferred date and time are required' },
      { status: 400 },
    );
  }
  if (preferredDate < nzToday()) {
    return NextResponse.json({ ok: false, error: 'preferred date cannot be in the past' }, { status: 400 });
  }
  const service = await serviceForTenant(tenant, serviceId);
  if (!service) {
    return NextResponse.json({ ok: false, error: 'choose a service from this Living Site' }, { status: 400 });
  }
  const rate = await consume(rateKey(request), 'living-site-booking-intake');
  if (!rate.ok) return NextResponse.json({ ok: false, error: 'booking request limit reached — try again in an hour' }, { status: 429 });

  const id = await storeBooking({
    tenant,
    serviceId,
    serviceLabel: service.label,
    name,
    email,
    phone,
    preferredDate,
    preferredTime,
    notes,
  });
  if (!id) {
    return NextResponse.json({ ok: false, error: 'could not save the request — try again shortly' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, id, status: 'requested' });
}

/**
 * Owner-side status change for a saved request. The transition graph prevents
 * a request skipping directly to completed, or a closed request reopening.
 */
export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  const tenant = await allowedTenant(value(body.tenant, 60));
  const id = value(body.id, 40);
  const status = body.status;
  if (tenant === 'unavailable') {
    return NextResponse.json({ ok: false, error: 'booking desk unavailable — try again shortly' }, { status: 503 });
  }
  if (!tenant || !id || !UUID_RE.test(id) || !isLivingSiteBookingStatus(status) || status === 'requested') {
    return NextResponse.json({ ok: false, error: 'valid tenant, booking id and next status are required' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'sign in to update booking requests' }, { status: 401 });
  }
  if (!await isAdminUser(user.id, user.email ?? '')) {
    return NextResponse.json({ ok: false, error: 'operator access is required' }, { status: 403 });
  }
  const rate = await consume(rateKey(request), 'living-site-booking-status');
  if (!rate.ok) return NextResponse.json({ ok: false, error: 'update limit reached — try again in an hour' }, { status: 429 });
  const result = await updateBookingStatus({ tenant, id, status });
  if (!result.ok) {
    if (result.reason === 'not_found') return NextResponse.json({ ok: false, error: 'booking request not found' }, { status: 404 });
    if (result.reason === 'invalid_transition') return NextResponse.json({ ok: false, error: 'that booking status change is not allowed' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'could not update the request — try again shortly' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, booking: result.booking });
}
