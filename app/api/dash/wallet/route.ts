/**
 * Dash earner wallet API.
 *
 *   GET  /api/dash/wallet           → { live, balanceNzd }
 *   POST /api/dash/wallet  { amountNzd, destinationKind, destination }
 *                                   → { ok, payoutId }
 *
 * Authorisation: we read the signed-in user from the cookie session and use
 * THAT user's id as the earner party_id — the client never supplies it. Reads
 * and the redeem RPC then run via the service-role client (the ledger is
 * RLS-locked; the redeem fn is SECURITY DEFINER). If Supabase env or a session
 * is absent we return { live: false } so the page falls back to demo mode
 * instead of erroring.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

const DEMO = NextResponse.json({ live: false });

function hasEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function currentEarnerId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!hasEnv()) return DEMO;
  const earnerId = await currentEarnerId();
  if (!earnerId) return DEMO;

  try {
    const svc = getServiceClient();
    const { data, error } = await svc
      .from('dash_earner_balances')
      .select('balance_nzd')
      .eq('earner_id', earnerId)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ live: true, balanceNzd: Number(data?.balance_nzd ?? 0) });
  } catch (e) {
    console.error('[dash-wallet] balance read failed', e);
    return DEMO;
  }
}

export async function POST(req: Request) {
  if (!hasEnv()) return DEMO;
  const earnerId = await currentEarnerId();
  if (!earnerId) return NextResponse.json({ ok: false, error: 'not signed in' }, { status: 401 });

  let body: { amountNzd?: number; destinationKind?: string; destination?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }

  const amountNzd = Number(body.amountNzd);
  const destinationKind = body.destinationKind === 'charity' ? 'charity' : 'self';
  const destination = String(body.destination ?? '').slice(0, 64);
  if (!Number.isFinite(amountNzd) || amountNzd <= 0) {
    return NextResponse.json({ ok: false, error: 'invalid amount' }, { status: 400 });
  }

  try {
    const svc = getServiceClient();
    const { data, error } = await svc.rpc('dash_redeem_earner', {
      p_party_id: earnerId,
      p_amount: amountNzd,
      p_destination_kind: destinationKind,
      p_destination: destination,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, payoutId: data });
  } catch (e) {
    console.error('[dash-wallet] redeem failed', e);
    return NextResponse.json({ ok: false, error: 'redeem failed' }, { status: 500 });
  }
}
