import { NextResponse } from 'next/server';
import { storeEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { VERTICAL_TENANTS } from '@/lib/living-site/verticals';

export const maxDuration = 15;

/**
 * Public enquiry intake for Sam's Living Site landing page.
 * Writes to living_site_enquiries via the service client (RLS deny-all).
 * Draft-only downstream: nothing emails Sam's clients from here.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max
      ? v.trim()
      : null;

  // Honeypot — bots fill every field; humans never see this one.
  if (typeof b.website === 'string' && b.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = str(b.name, 120);
  const email = str(b.email, 200);
  const message = str(b.message, 2000);
  const dog = str(b.dog, 200) ?? undefined;
  // Tenant must be one of the known sample verticals — anything else lands
  // on the flagship rather than minting arbitrary tenant rows.
  const rawTenant = str(b.tenant, 60);
  const tenant = rawTenant && VERTICAL_TENANTS.has(rawTenant) ? rawTenant : undefined;

  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'name, valid email, and message are required' },
      { status: 400 },
    );
  }

  const stored = await storeEnquiry({ name, email, dog, message, tenant });
  if (!stored) {
    return NextResponse.json(
      { ok: false, error: 'could not store the enquiry — try again shortly' },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}
