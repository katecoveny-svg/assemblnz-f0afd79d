import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/bills/action — the ONLY "action" endpoint in assembl bills.
 *
 * ACTION_DISPATCH_ENABLED is OFF. Nothing is ever switched, cancelled, refunded
 * or paid here. Every "Switch", "Cancel", "Refund", "Dispute" or "Apply" click
 * drops a DRAFT into content_approvals (status 'pending') so it surfaces at
 * /admin/approvals for a human yes. This is the SPARK "empower, don't replace"
 * rule made literal: assembl bills prepares the action; the household approves.
 */
const BodySchema = z.object({
  kind: z.enum(['switch', 'cancel', 'refund', 'dispute', 'apply', 'notify', 'partner']),
  label: z.string().trim().min(1).max(120),
  target: z.string().trim().min(1).max(160),
  detail: z.string().trim().max(600).optional().or(z.literal('')),
  amount: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
});

const KIND_VERB: Record<string, string> = {
  switch: 'Switch provider',
  cancel: 'Cancel subscription',
  refund: 'Claim refund',
  dispute: 'Dispute a bill',
  apply: 'Apply for scheme',
  notify: 'Notify when live',
  partner: 'Partnership outreach',
};

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
  const { kind, label, target, detail, amount, email } = parsed.data;

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const verb = KIND_VERB[kind] ?? 'Action';
  const { error } = await service.from('content_approvals').insert({
    surface: `assembl-bills:${kind}`,
    kind: 'bill-action',
    title: `${verb} — ${target}`,
    summary: `${label}${amount ? ` (${amount})` : ''}${email ? ` · ${email}` : ''}. ${detail || ''} Draft only — no switch or cancellation happens until approved.`.trim(),
    tenant_slug: 'assembl-bills',
    status: 'pending',
    created_by: 'assembl-bills-console',
    payload: {
      action: kind,
      target,
      label,
      detail: detail || null,
      amount: amount || null,
      email: email || null,
      auto_dispatch: false,
    },
  });

  if (error) {
    console.error('[bills-action] draft insert failed', { message: error.message });
    return NextResponse.json({ error: 'Could not queue that just now — try again shortly.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true, queued: true }, { status: 201 });
}
