/**
 * POST /api/dash/whitelabel/impression  (whitelabel mode)
 *
 * Phase 0 STUB: logs the impression for subscription-tier usage billing and
 * returns { ok: true }. Whitelabel carries NO external ads and NO payout flow —
 * the customer is billed on their monthly SaaS subscription, so usage volume is
 * all we record. No page content is read.
 *
 * Body: { publisherId, durationMs }
 * TODO(billing): aggregate usage → subscription-tier metering.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  publisherId: z.string().max(120),
  durationMs: z.number().nonnegative().max(86_400_000).optional(),
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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // eslint-disable-next-line no-console
  console.log('[dash/whitelabel/impression]', parsed.data);
  return NextResponse.json({ ok: true });
}
