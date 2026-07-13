import { NextResponse } from 'next/server';
import { storeBooking } from '@/lib/living-site/booking-store';
import { INSTALL_TENANT_RE, installTenantExists } from '@/lib/living-site/install-store';
import { VERTICAL_TENANTS } from '@/lib/living-site/verticals';

export const maxDuration = 15;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
  const serviceLabel = value(body.serviceLabel, 160);
  const name = value(body.name, 120);
  const email = value(body.email, 200);
  const phone = value(body.phone, 40) ?? undefined;
  const preferredDate = value(body.preferredDate, 10);
  const preferredTime = value(body.preferredTime, 40);
  const notes = value(body.notes, 1500) ?? undefined;

  if (
    !tenant || !serviceId || !serviceLabel || !name || !email || !EMAIL_RE.test(email)
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

  const id = await storeBooking({
    tenant,
    serviceId,
    serviceLabel,
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
