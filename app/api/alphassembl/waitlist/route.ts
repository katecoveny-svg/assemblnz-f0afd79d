import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { recordLead, clientIpFromHeaders } from '@/lib/lead-capture';

export const dynamic = 'force-dynamic';

/**
 * POST /api/alphassembl/waitlist — capture a dog owner for the Alphassembl
 * waitlist. Three fail-soft legs:
 *   1. durable row in public.alphassembl_waitlist (unique on lower(email)),
 *   2. the unified lead pipeline (recordLead → notify assembl inbox + persist),
 *   3. a Brevo welcome email DRAFTED into content_approvals (status 'pending')
 *      — NEVER auto-sent. It surfaces at /admin/approvals for a human yes,
 *      keeping outbound off while ACTION_DISPATCH_ENABLED is OFF.
 */
const BodySchema = z.object({
  name: z.string().trim().min(1, 'Please add your name').max(120),
  email: z.string().trim().email('That email looks off').max(254),
  suburb: z.string().trim().max(120).optional().or(z.literal('')),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const name = parsed.data.name;
  const email = parsed.data.email.toLowerCase();
  const suburb = parsed.data.suburb?.trim() || null;
  const sourceUrl = req.headers.get('referer');

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (error) {
    console.error('[alphassembl-waitlist] service client unavailable', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // 1 · Durable waitlist row. A repeat email is a friendly no-op, not an error.
  const { error: insertError } = await service
    .from('alphassembl_waitlist')
    .insert({ name, email, suburb, source_url: sourceUrl });

  let alreadyOnList = false;
  if (insertError) {
    // 23505 = unique_violation on lower(email) → they're already on the list.
    if ((insertError as { code?: string }).code === '23505') {
      alreadyOnList = true;
    } else {
      console.error('[alphassembl-waitlist] insert failed', { message: insertError.message });
      return NextResponse.json({ error: 'We could not save that just now — try again shortly.' }, { status: 503 });
    }
  }

  // 2 · Unified lead pipeline (internal notify + durable persist). Fail-soft.
  await recordLead({
    formName: 'Alphassembl — waitlist',
    email,
    name,
    fields: { suburb: suburb ?? '', offering: 'Alphassembl dog-owner OS (beta waitlist)' },
    sourceUrl,
    ip: clientIpFromHeaders(req.headers),
  });

  // 3 · Draft the welcome email into the approval queue — never auto-sent.
  if (!alreadyOnList) {
    const welcomeHtml = `<p>Kia ora ${escapeHtml(name)},</p>
<p>Thanks for joining the Alphassembl waitlist — one system for every part of your dog's life.</p>
<p>We'll be in touch as we open the beta to more New Zealand dog owners. In the meantime, everything Kaiako (your Alphassembl trainer) suggests is force-free and grounded in NZ advice.</p>
<p>Ngā mihi,<br/>The Alphassembl team · assembl</p>`;
    const { error: draftError } = await service.from('content_approvals').insert({
      surface: 'alphassembl:waitlist',
      kind: 'email-draft',
      title: `Alphassembl welcome — ${email}`,
      summary: `Waitlist welcome for ${name}${suburb ? ` (${suburb})` : ''}. Draft only — approve to send.`,
      tenant_slug: 'alphassembl',
      status: 'pending',
      created_by: 'alphassembl-waitlist',
      payload: {
        provider: 'brevo',
        type: 'transactional',
        to: email,
        subject: 'You’re on the Alphassembl waitlist',
        html: welcomeHtml,
        auto_send: false,
      },
    });
    if (draftError) {
      // Non-fatal: the owner is on the list; the draft is a nicety.
      console.error('[alphassembl-waitlist] draft insert failed', { message: draftError.message });
    }
  }

  return NextResponse.json({ ok: true, alreadyOnList }, { status: alreadyOnList ? 200 : 201 });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}
