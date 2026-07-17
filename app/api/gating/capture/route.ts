/**
 * POST /api/gating/capture — email capture at the gating wall.
 *
 * When an anonymous visitor hits a usage limit, the modal posts here with their
 * email and IPP 3A consent. We record the lead in the shared `hapai_leads`
 * table and set the long-lived `assembl_captured` cookie so the visitor is
 * immediately bumped to the email tier (higher limits) on their next request.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { markCaptured } from '@/lib/gating/server';
import { recordLead, clientIpFromHeaders } from '@/lib/lead-capture';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  email: z.string().email('A valid email is required').max(254),
  surface: z.string().min(1).max(64), // e.g. 'chat:waihanga', 'hapai:wishlist'
  consent: z.boolean(),
});

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

  const { email, surface, consent } = parsed.data;
  if (!consent) {
    // IPP 3A: collection requires informed consent at the point of capture.
    return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
  }

  // Best-effort DB insert. A paused/unreachable Supabase must NEVER block the
  // visitor: recordLead below still notifies Kate (so no lead is lost) and
  // markCaptured still lifts the tier — the wall opens either way.
  try {
    const service = getServiceClient();
    const { error } = await service.from('hapai_leads').insert({
      email: email.trim().toLowerCase(),
      tool_slug: surface,
      source: `gate:${surface}`,
      consent,
      payload: { captured_via: 'gating-wall' },
    });
    if (error) {
      console.error('gating/capture insert failed — continuing without DB', {
        surface,
        message: error.message,
      });
    }
  } catch (error) {
    console.error('gating/capture DB unavailable — continuing without DB', {
      surface,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  // Notify Kate + mirror into the unified leads table. Fail-soft.
  await recordLead({
    formName: `Gating wall — ${surface}`,
    email,
    fields: { surface, consent, capturedVia: 'gating-wall' },
    sourceUrl: req.headers.get('referer'),
    ip: clientIpFromHeaders(req.headers),
  });

  // Unlock the email tier for this browser immediately.
  await markCaptured();

  return NextResponse.json({ ok: true }, { status: 201 });
}
