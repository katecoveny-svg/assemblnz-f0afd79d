import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin/ensureAdmin';
import { consume, rateKey } from '@/lib/creative/ratelimit';
import { storeDocument, type LivingSiteDocumentKind } from '@/lib/living-site/document-store';
import { INSTALL_TENANT_RE, installTenantExists } from '@/lib/living-site/install-store';
import { VERTICAL_TENANTS } from '@/lib/living-site/verticals';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 15;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function field(input: unknown, max: number): string | null {
  return typeof input === 'string' && input.trim().length > 0 && input.trim().length <= max
    ? input.trim()
    : null;
}

function amount(input: unknown, min: number, max: number): number | null {
  const value = typeof input === 'number' ? input : Number.NaN;
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
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

/** Save a new immutable commercial draft. Sending and status changes remain owner actions. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });

  const tenant = await allowedTenant(field(body.tenant, 60));
  if (tenant === 'unavailable') {
    return NextResponse.json({ ok: false, error: 'document store unavailable — try again shortly' }, { status: 503 });
  }
  const kind = body.kind === 'proposal' || body.kind === 'invoice'
    ? body.kind as LivingSiteDocumentKind
    : null;
  const clientName = field(body.clientName, 160);
  const clientEmail = field(body.clientEmail, 200);
  const serviceId = field(body.serviceId, 100);
  const description = field(body.description, 500);
  const quantity = amount(body.quantity, 0.01, 100_000);
  const unitPriceNzd = amount(body.unitPriceNzd, 0, 10_000_000);
  const notes = field(body.notes, 4000) ?? undefined;

  if (
    !tenant || !kind || !clientName || !clientEmail || !EMAIL_RE.test(clientEmail)
    || !serviceId || !description || quantity === null || unitPriceNzd === null
  ) {
    return NextResponse.json({
      ok: false,
      error: 'tenant, document type, customer, valid email, service, description, quantity and rate are required',
    }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'sign in to save commercial drafts' }, { status: 401 });
  }
  if (!await isAdminUser(user.id, user.email ?? '')) {
    return NextResponse.json({ ok: false, error: 'operator access is required' }, { status: 403 });
  }

  const rate = await consume(rateKey(request), 'living-site-documents');
  if (!rate.ok) return NextResponse.json({ ok: false, error: 'draft limit reached — try again in an hour' }, { status: 429 });

  const document = await storeDocument({
    tenant,
    kind,
    clientName,
    clientEmail,
    serviceId,
    description,
    quantity,
    unitPriceNzd,
    notes,
  });
  if (!document) {
    return NextResponse.json({ ok: false, error: 'could not save the draft — try again shortly' }, { status: 503 });
  }
  return NextResponse.json({ ok: true, document }, { status: 201 });
}
