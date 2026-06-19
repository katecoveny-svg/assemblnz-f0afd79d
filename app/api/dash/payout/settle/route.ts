/**
 * POST /api/dash/payout/settle
 *
 * Phase 0 STUB: returns a mocked total + split for a payee's settlement period.
 *   - publisher: rev-share split (55% standard / 60% anchor) vs assembl.
 *   - consumer:  user share (kept or donated) vs assembl platform cut.
 *   - whitelabel: no per-impression split (billed on subscription).
 *
 * TODO(stripe-connect): replace the mocked totals with the real ledger and
 * trigger Stripe Connect transfers / charity payouts on the monthly cycle.
 *
 * Body: { mode, payeeId, period }
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { settleSplit } from '@/components/dash/logic';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  mode: z.enum(['consumer', 'publisher', 'whitelabel']),
  payeeId: z.string().max(120),
  period: z.string().max(40), // e.g. "2026-06"
  revShareTier: z.enum(['standard', 'anchor']).optional(),
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
  const { mode, payeeId, period, revShareTier } = parsed.data;
  // Mocked gross for the period (deterministic placeholder).
  const mockGross = mode === 'whitelabel' ? 0 : 42.5;
  const { totalRevenue, splitByDestination } = settleSplit(mode, mockGross, revShareTier);
  return NextResponse.json({ payeeId, period, totalRevenue, splitByDestination });
}
