import { NextResponse } from 'next/server';
import { buildQuote, CREATE_DISABLED_RESPONSE, type QuoteInput } from '@/lib/hapai/uber-direct';

/**
 * Uber Direct — Auckland-first delivery quote/create surface for the Hearth
 * chat agents (Kai + Helm).
 *
 * SCAFFOLD ONLY (Kai pack 03-uber-direct-spec; Kate 2026-06-29). `quote` runs
 * the local Auckland geofence + NZD cost model — no Uber call, no personal
 * information leaves assembl. `create` is hard-disabled: it NEVER dispatches a
 * real delivery in this PR.
 *
 * The quote is computed here (not via the edge function) so the chat button
 * works the moment this ships, before the edge function is deployed. When the
 * edge function is live and Kate has signed off a supervised test, `create`
 * flips to proxy it — that's a follow-up, gated behind her go-ahead.
 *
 * Privacy Act 2020 (IPP 1): the body carries only a coarse region / optional
 * distance / package description. We never persist addresses or phone numbers.
 */

export const runtime = 'nodejs';

interface Body extends QuoteInput {
  action?: 'quote' | 'create';
  packageDescription?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const action = body.action ?? 'quote';

  if (action === 'create') {
    // Hard stop — no real delivery is dispatched in this PR.
    return NextResponse.json({
      ok: true,
      action,
      quote: buildQuote(body),
      ...CREATE_DISABLED_RESPONSE,
    });
  }

  return NextResponse.json({ ok: true, action: 'quote', quote: buildQuote(body) });
}
