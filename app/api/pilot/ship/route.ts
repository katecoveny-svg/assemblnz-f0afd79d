/**
 * Pilot step-7 — ship.
 *
 * POST { draft, mode } where mode is 'mine' (save to My Agents, personal use)
 * or 'submit' (submit for marketplace review). Flow:
 *
 *   1. Auth required.
 *   2. Free-first gate: the first agent a user ships is free. After that, Pilot
 *      is $9.99/mo — without that subscription, return { paywall: true } and do
 *      not ship. (The subscription product is staged separately; v0.1 surfaces
 *      the paywall rather than charging.)
 *   3. Persist the draft (status: saved-as-draft for 'mine', 'submitted' for
 *      review).
 *   4. Stage an inactive Stripe product for paid tiers (never live until
 *      published through review).
 *   5. Sign a hash-chained Mana Receipt over the WHOLE 19-item pack.
 *   6. Award game points via the shared award_points() RPC (build-first-agent +
 *      ship-personal, or submit-marketplace) and mark first_pilot_agent_free_used.
 *
 * Every output stays a DRAFT until a human signs off — 'submit' only flags it
 * for review; it does not publish.
 */
import { createClient } from '@/lib/supabase/server';
import { getOwner, saveDraft, attachShipMetadata } from '@/lib/pilot/store';
import { stageStripeProduct } from '@/lib/pilot/stripe-staging';
import { signPilotReceipt } from '@/lib/pilot/receipts';
import type { PilotDraft } from '@/lib/pilot/types';

export const maxDuration = 30;

async function freeFirstUsed(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('first_pilot_agent_free_used')
    .maybeSingle();
  return Boolean(data?.first_pilot_agent_free_used);
}

async function markFreeFirstUsed(): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const id = userData.user?.id;
  if (!id) return;
  await supabase.from('profiles').update({ first_pilot_agent_free_used: true }).eq('id', id);
}

/**
 * Award a game action through the shared award_points() RPC (Atlas's game
 * layer). Fail-open: gamification never blocks a ship. Returns the awarded
 * points for the client to surface, or 0.
 */
async function award(action: string, meta: Record<string, unknown>): Promise<number> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc('award_points', { _action: action, _meta: meta });
    const r = (data ?? {}) as Record<string, unknown>;
    return Number(r.awarded ?? 0);
  } catch {
    return 0;
  }
}

export async function POST(req: Request): Promise<Response> {
  const owner = await getOwner();
  if (!owner) return Response.json({ error: 'Sign in to ship your agent.' }, { status: 401 });

  let body: { draft?: PilotDraft; mode?: 'mine' | 'submit' };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const draft = body.draft;
  const mode = body.mode === 'submit' ? 'submit' : 'mine';
  if (!draft) return Response.json({ error: 'No draft supplied.' }, { status: 400 });
  if (!draft.name?.trim()) return Response.json({ error: 'Give your agent a name first.' }, { status: 400 });
  if (!draft.pack?.systemPrompt?.trim())
    return Response.json({ error: 'Draft the agent pack before shipping.' }, { status: 400 });

  // Free-first gate. The first ship is free; after that Pilot is $9.99/mo.
  const alreadyUsed = await freeFirstUsed();
  // TODO(go-live): once the Pilot $9.99 subscription product exists, check it
  // here and let subscribers through. For v0.1 we surface the paywall.
  const hasPilotSubscription = false;
  if (alreadyUsed && !hasPilotSubscription) {
    return Response.json(
      {
        paywall: true,
        message:
          'Your first agent is free. To keep building unlimited agents, Pilot is $9.99 a month.',
      },
      { status: 402 },
    );
  }

  // Persist the draft.
  const status = mode === 'submit' ? 'submitted' : 'draft';
  const stored = await saveDraft(owner, draft, status);
  if (!stored) return Response.json({ error: 'Could not save the agent.' }, { status: 500 });

  // Stage Stripe (paid tiers only; no-op for free; fail-open).
  const staged = await stageStripeProduct({ ...draft, id: stored.id, status });

  // Sign the Mana Receipt.
  const action = mode === 'submit' ? 'submitted' : 'saved';
  const signedAt = new Date().toISOString();
  let receiptId: string | undefined;
  let receiptNumber: number | undefined;
  let chainHashOut: string | undefined;
  try {
    const receipt = await signPilotReceipt({
      ownerId: owner,
      pilotAgentId: stored.id,
      draft: { ...stored, status },
      action,
      signedAt,
    });
    receiptId = receipt.id;
    receiptNumber = receipt.receipt_number;
    chainHashOut = receipt.chain_hash;
  } catch {
    // Receipt signing needs the service-role key; if absent locally, don't block
    // the ship — the draft still saves. Surface that the receipt is pending.
    receiptId = undefined;
  }

  await attachShipMetadata(stored.id, {
    status,
    stripeProductId: staged.stripeProductId,
    stripePriceId: staged.stripePriceId,
    manaReceiptId: receiptId,
  });

  // Award game points via the shared layer. "build-first-agent" is once-ever
  // (500 + first-build badge); ship/submit award each time.
  const wasFirstBuild = !alreadyUsed;
  let pointsAwarded = 0;
  if (wasFirstBuild) pointsAwarded += await award('build-first-agent', { agent: stored.id });
  if (mode === 'submit') {
    pointsAwarded += await award('submit-marketplace', { agent: stored.id });
  } else {
    pointsAwarded += await award('ship-personal', { agent: stored.id });
  }

  // First free agent now consumed.
  await markFreeFirstUsed();

  return Response.json({
    ok: true,
    mode,
    agentId: stored.id,
    pointsAwarded,
    receipt: receiptId
      ? { id: receiptId, number: receiptNumber, chainHash: chainHashOut, signedAt }
      : null,
    stripe: { staged: staged.staged, reason: staged.reason },
    message:
      mode === 'submit'
        ? 'Submitted for marketplace review. It stays a draft until a human signs off.'
        : 'Saved to My Agents. It is yours to use — still a draft until you decide otherwise.',
  });
}
