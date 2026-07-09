import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { recordLead, clientIpFromHeaders } from '@/lib/lead-capture';

export const dynamic = 'force-dynamic';

/**
 * POST /api/bills/waitlist — capture a NZ household or SME for the assembl
 * Bills waitlist. Three fail-soft legs, mirroring the Alphassembl pattern:
 *   1. durable row in public.assembl_bills_waitlist (unique on lower(email)),
 *   2. the unified lead pipeline (recordLead → notify assembl inbox + persist),
 *   3. a Brevo welcome email DRAFTED into content_approvals (status 'pending')
 *      — NEVER auto-sent. It surfaces at /admin/approvals for a human yes,
 *      keeping outbound off while ACTION_DISPATCH_ENABLED is OFF.
 */
const BodySchema = z.object({
  name: z.string().trim().min(1, 'Please add your name').max(120),
  email: z.string().trim().email('That email looks off').max(254),
  region: z.string().trim().min(1).max(60),
  biggestBillPain: z.string().trim().max(80).optional().or(z.literal('')),
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const name = parsed.data.name;
  const email = parsed.data.email.toLowerCase();
  const region = parsed.data.region;
  const biggestBillPain = parsed.data.biggestBillPain?.trim() || null;
  const sourceUrl = req.headers.get('referer');

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (error) {
    console.error('[bills-waitlist] service client unavailable', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // 1 · Durable waitlist row. A repeat email is a friendly no-op, not an error.
  const { error: insertError } = await service
    .from('assembl_bills_waitlist')
    .insert({ name, email, region, biggest_bill_pain: biggestBillPain, source_url: sourceUrl });

  let alreadyOnList = false;
  if (insertError) {
    if ((insertError as { code?: string }).code === '23505') {
      alreadyOnList = true;
    } else {
      console.error('[bills-waitlist] insert failed', { message: insertError.message });
      return NextResponse.json({ error: 'We could not save that just now — try again shortly.' }, { status: 503 });
    }
  }

  // 2 · Unified lead pipeline (internal notify + durable persist). Fail-soft.
  await recordLead({
    formName: 'assembl bills — waitlist',
    email,
    name,
    fields: {
      region,
      biggestBillPain: biggestBillPain ?? '',
      offering: 'assembl bills — agentic bill OS (beta waitlist)',
    },
    sourceUrl,
    ip: clientIpFromHeaders(req.headers),
  });

  // 3 · Draft the welcome email into the approval queue — never auto-sent.
  if (!alreadyOnList) {
    const welcomeHtml = `<p>Kia ora ${escapeHtml(name)},</p>
<p>Thanks for joining the assembl bills waitlist — the agentic operating system for your household bills.</p>
<p>We're opening the beta to New Zealand households and SMEs region by region. We'll be in touch as ${escapeHtml(region)} comes online. In the meantime, everything assembl bills does is grounded in NZ sources (Powerswitch, Consumer NZ) — it recommends the switch, you approve it.</p>
<p>Ngā mihi,<br/>The assembl bills team · assembl</p>`;
    const { error: draftError } = await service.from('content_approvals').insert({
      surface: 'assembl-bills:waitlist',
      kind: 'email-draft',
      title: `assembl bills welcome — ${email}`,
      summary: `Waitlist welcome for ${name} (${region})${biggestBillPain ? ` · pain: ${biggestBillPain}` : ''}. Draft only — approve to send.`,
      tenant_slug: 'assembl-bills',
      status: 'pending',
      created_by: 'assembl-bills-waitlist',
      payload: {
        provider: 'brevo',
        type: 'transactional',
        to: email,
        subject: 'You’re on the assembl bills waitlist',
        html: welcomeHtml,
        auto_send: false,
      },
    });
    if (draftError) {
      console.error('[bills-waitlist] draft insert failed', { message: draftError.message });
    }
  }

  return NextResponse.json({ ok: true, alreadyOnList }, { status: alreadyOnList ? 200 : 201 });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
