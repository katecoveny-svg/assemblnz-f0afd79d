/**
 * POST /api/beat/lead — "Become a publisher" / "Become an advertiser" capture
 * for the /beat landing page.
 *
 * Routes through the shared recordLead() pipeline (emails assembl@assembl.co.nz
 * AND writes a durable public.lead_inquiries row). NOTE: the brief said
 * "→ public.leads", but `public.leads` is an unrelated owner-scoped CRM table
 * (see the leads_unified migration); recordLead → lead_inquiries is the site's
 * canonical, fail-soft lead path, so every Beat inquiry lands beside every
 * other site lead. Fail-soft: 200 on a captured lead, 503 only if BOTH legs fail.
 *
 * Body: { role: 'publisher' | 'advertiser', email, name?, organisation?, message? }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { recordLead, clientIpFromHeaders } from '@/lib/lead-capture';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  role: z.enum(['publisher', 'advertiser']),
  email: z.string().email('A valid email is required').max(254),
  name: z.string().max(120).optional(),
  organisation: z.string().max(160).optional(),
  message: z.string().max(2000).optional(),
});

const ROLE_LABEL = {
  publisher: 'Beat — become a publisher',
  advertiser: 'Beat — become an advertiser',
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

  const result = await recordLead({
    formName: ROLE_LABEL[role],
    email,
    name: name || null,
    fields: {
      role,
      organisation: organisation ?? '',
      message: message ?? '',
      product: 'Beat by assembl (NZ in-product ad network)',
    },
    sourceUrl: req.headers.get('referer'),
    ip: clientIpFromHeaders(req.headers),
  });

  if (!result.notified && !result.persisted) {
    console.error('[beat/lead] both legs failed', { role, email });
    return NextResponse.json(
      { error: "We couldn't record that just now. Please email assembl@assembl.co.nz." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
