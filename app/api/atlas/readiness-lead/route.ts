/**
 * POST /api/atlas/readiness-lead — save an Atlas readiness report + follow-up.
 *
 * Fired from the report's "Want this saved + a follow-up in a week?" field. Runs
 * the standard fail-soft lead pipeline (email the assembl inbox + persist a
 * durable row) and subscribes the contact to the dedicated `atlas-readiness`
 * Brevo list so the weekly follow-up can go out.
 *
 * The Brevo leg targets BREVO_ATLAS_READINESS_LIST_ID when set, falling back to
 * the single default list (BREVO_LIST_ID). It is a silent no-op until a key +
 * list id are present — the lead still lands via the email + persist legs. We
 * NEVER touch Brevo's "Authorised IPs" allowlist (that stays off by policy).
 *
 * Body: { email, name?, stage?, archetype?, band?, role?, timeLoss?, consent? }
 *   stage 'signup' = captured before Q1 (soft signup); 'report' = at the end.
 */
import { NextResponse } from 'next/server';
import { recordLead, clientIpFromHeaders, subscribeToBrevoList } from '@/lib/lead-capture';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    email?: string;
    name?: string;
    stage?: string;
    archetype?: string;
    band?: string;
    role?: string;
    timeLoss?: string;
    consent?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const stage = body.stage === 'signup' ? 'signup' : 'report';

  // Email + persist legs (each independently fail-soft).
  await recordLead({
    formName: stage === 'signup' ? 'Atlas — readiness signup' : 'Atlas — readiness report',
    email,
    name: body.name?.trim() || undefined,
    fields: {
      stage,
      name: body.name ?? '',
      archetype: body.archetype ?? '',
      band: body.band ?? '',
      role: body.role ?? '',
      timeLoss: body.timeLoss ?? '',
      consent: body.consent !== false,
    },
    sourceUrl: req.headers.get('referer'),
    ip: clientIpFromHeaders(req.headers),
  });

  // Dedicated atlas-readiness list leg (falls back to the default list).
  const readinessListId = Number(process.env.BREVO_ATLAS_READINESS_LIST_ID);
  await subscribeToBrevoList({
    email,
    consent: body.consent !== false,
    listId: Number.isFinite(readinessListId) ? readinessListId : null,
  });

  return NextResponse.json({ ok: true });
}
