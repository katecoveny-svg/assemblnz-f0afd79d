import { NextResponse, after } from 'next/server';
import { storeEnquiry } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { INSTALL_TENANT_RE, installTenantExists } from '@/lib/living-site/install-store';
import { VERTICAL_TENANTS } from '@/lib/living-site/verticals';
import { intakeEnquiry } from '@/lib/os/orchestrator';

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
  // Tenant must be a known sample vertical or a generated install whose
  // genome actually exists — anything else lands on the flagship rather
  // than minting arbitrary tenant rows.
  const rawTenant = str(b.tenant, 60);
  let tenant: string | undefined;
  if (rawTenant && VERTICAL_TENANTS.has(rawTenant)) {
    tenant = rawTenant;
  } else if (rawTenant && INSTALL_TENANT_RE.test(rawTenant)) {
    const exists = await installTenantExists(rawTenant);
    // Couldn't check → 503 rather than silently filing the enquiry under
    // the flagship tenant, where the install's dashboard would never see it.
    if (exists === null) {
      return NextResponse.json(
        { ok: false, error: 'could not store the enquiry — try again shortly' },
        { status: 503 },
      );
    }
    if (exists) tenant = rawTenant;
  }

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

  // The OS intake runs after the response: the enquiry becomes a task, the
  // desk agent drafts a genome-grounded reply, and the draft is filed for
  // approval. Fail-soft — the visitor's enquiry is already stored above.
  after(async () => {
    try {
      await intakeEnquiry({ tenant, name, email, detail: dog, message });
    } catch {
      /* the OS layer must never break the public enquiry flow */
    }
  });

  return NextResponse.json({ ok: true });
}
