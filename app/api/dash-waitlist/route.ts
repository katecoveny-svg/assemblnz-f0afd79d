/**
 * POST /api/dash-waitlist — "I'm a publisher" / "I want to advertise" capture
 * for the /dash (Dash by assembl) landing page.
 *
 * Persists to the dedicated public.dash_waitlist table (the Dash-specific store),
 * AND emails assembl@assembl.co.nz via the proven notifyLead → send-contact-email
 * (Brevo) path, AND adds the email to the assembl Brevo mailing list. This
 * REPLACES the old /api/dash/lead route, which wrote to the shared lead_inquiries
 * table — Dash now owns its own waitlist store (Kate's call, 2026-06-19).
 *
 * Fail-soft: 200 once EITHER the durable row OR the email succeeds; 503 only if
 * BOTH fail. A waitlist form must never break because one leg was down.
 *
 * ⚠️ Never re-enable the Brevo "Authorised IPs" allowlist — Supabase functions
 * egress from rotating IPs and the allowlist silently breaks every send (the
 * 17 Jun outage). notifyLead retries as a stopgap.
 *
 * Body: { role: 'publisher' | 'advertiser', email, name?, organisation?, message? }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notifyLead, subscribeToBrevoList, clientIpFromHeaders } from '@/lib/lead-capture';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  role: z.enum(['publisher', 'advertiser']),
  email: z.string().email('A valid email is required').max(254),
  name: z.string().max(120).optional(),
  organisation: z.string().max(160).optional(),
  message: z.string().max(2000).optional(),
});

const ROLE_LABEL = {
  publisher: 'Dash by assembl — become a publisher',
  advertiser: 'Dash by assembl — become an advertiser',
} as const;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const { role, email, name, organisation, message } = parsed.data;
  const sourceUrl = req.headers.get('referer');
  const ip = clientIpFromHeaders(req.headers);

  // Email leg first so the durable row can record whether it landed.
  const notified = await notifyLead({
    formName: ROLE_LABEL[role],
    email,
    name: name ?? null,
    fields: {
      role,
      organisation: organisation ?? '',
      message: message ?? '',
      product: 'Dash by assembl (NZ in-product ad network)',
    },
    sourceUrl,
    ip,
  });

  // Durable row in the Dash-specific waitlist store. Fail-soft.
  let persisted = false;
  try {
    const service = getServiceClient();
    const { error } = await service.from('dash_waitlist').insert({
      persona: role,
      email,
      name: name ?? null,
      company: organisation ?? null,
      surface: message ?? null,
      source_url: sourceUrl,
      ip,
      notified,
    });
    if (error) {
      console.error('[dash-waitlist] insert failed', error.message);
    } else {
      persisted = true;
    }
  } catch (err) {
    console.error('[dash-waitlist] insert threw', err instanceof Error ? err.message : err);
  }

  // Mailing list (newsletter) — orthogonal, best-effort, never blocks the 200.
  void subscribeToBrevoList({
    email,
    consent: true,
    attributes: { source: 'dash-waitlist', persona: role, name: name ?? '' },
  }).catch(() => false);

  if (!notified && !persisted) {
    console.error('[dash-waitlist] both legs failed', { role, email });
    return NextResponse.json(
      { error: "We couldn't record that just now. Please email assembl@assembl.co.nz." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, notified, persisted });
}
