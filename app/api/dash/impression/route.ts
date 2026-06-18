/**
 * POST /api/dash/impression  (consumer + publisher modes)
 *
 * Phase 0 STUB: logs the impression and returns the mocked micro-revenue. The
 * body carries duration + advertiser + the user's own settings — NEVER page
 * content, prompts, files or code.
 *
 * Real implementation wires both consumer and publisher payouts to Stripe
 * Connect (account acct_1TCqv7PXAX9ohARR) and, for charity destinations, the
 * relevant charity payout API.
 *
 * TODO(stripe-connect): settle consumer "keep it" + publisher rev-share.
 * TODO(spca-api) / TODO(trees-that-count-api) / TODO(foodbank-nz-api): donate.
 *
 * Body: { mode, publisherId?, userId?, settings?, durationMs, advertiserId, sponsorLine }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { REVENUE_PER_WAIT } from '@/components/dash/logic';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  mode: z.enum(['consumer', 'publisher']),
  publisherId: z.string().max(120).optional(),
  userId: z.string().max(120).optional(),
  revShareTier: z.enum(['standard', 'anchor']).optional(),
  settings: z.unknown().optional(),
  durationMs: z.number().nonnegative().max(86_400_000).optional(),
  advertiserId: z.string().max(120).optional(),
  sponsorLine: z.string().max(280).optional(),
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
  const { mode, advertiserId, durationMs, publisherId } = parsed.data;
  // eslint-disable-next-line no-console
  console.log('[dash/impression]', { mode, advertiserId, durationMs, publisherId });
  return NextResponse.json({ revenueGenerated: REVENUE_PER_WAIT });
}
