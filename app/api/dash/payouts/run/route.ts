/**
 * GET /api/dash/payouts/run — threshold payout cron (publishers, Phase A).
 *
 * For each publisher with a payouts-enabled Connect account whose ledger balance
 * clears the threshold, transfer the whole accrued balance to their Stripe
 * Connect account, record a dash_payouts row, and write the matching ledger
 * debit (zeroing the balance). Earner/charity payouts come in Phase B.
 *
 * Auth: Vercel cron injects `Authorization: Bearer $CRON_SECRET`. We require it.
 * `?dryRun=1` logs intended transfers and writes nothing.
 *
 * Idempotency: the Stripe transfer uses idempotencyKey = the dash_payouts row id,
 * so a retry of the SAME row never double-pays; cross-run safety comes from the
 * ledger debit, which drops the balance below threshold for the next run.
 *
 * Money is NZD. Stripe's payout fee is absorbed in assembl's margin, never the
 * publisher's share. GST is handled at invoice, not here.
 */
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createServiceClient } from '@/lib/stripe/supabase-service';
import { computeBalance, isPayable, toCents, PAYOUT_THRESHOLD_NZD, type LedgerRow } from '@/lib/dash/payouts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorised(req: Request): boolean {
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const token = process.env.CRON_SECRET || process.env.DASH_PAYOUTS_RUN_TOKEN;
  return Boolean(token && auth === token);
}

interface PayoutAttempt {
  publisherId: string;
  balanceNzd: number;
  status: 'paid' | 'failed' | 'skipped' | 'would-pay';
  detail?: string;
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: 'Cron authorisation required' }, { status: 401 });
  }
  const dryRun = new URL(req.url).searchParams.get('dryRun') === '1';

  const service = createServiceClient();
  const stripe = getStripe();

  // Payouts-enabled publisher connect accounts.
  const { data: accounts, error: accErr } = await service
    .from('dash_connect_accounts')
    .select('publisher_id, stripe_account_id, payouts_enabled')
    .eq('party_type', 'publisher')
    .eq('payouts_enabled', true);
  if (accErr) {
    console.error('[dash-payouts] accounts query failed', accErr.message);
    return NextResponse.json({ error: 'Accounts query failed' }, { status: 503 });
  }

  const attempts: PayoutAttempt[] = [];

  for (const acct of accounts ?? []) {
    const publisherId = acct.publisher_id as string | null;
    if (!publisherId) continue;

    const { data: ledger, error: ledErr } = await service
      .from('dash_payout_ledger')
      .select('direction, amount_nzd')
      .eq('party_type', 'publisher')
      .eq('party_id', publisherId);
    if (ledErr) {
      attempts.push({ publisherId, balanceNzd: 0, status: 'skipped', detail: 'ledger query failed' });
      continue;
    }

    const balance = computeBalance((ledger ?? []) as LedgerRow[]);
    if (!isPayable(balance, true, PAYOUT_THRESHOLD_NZD)) {
      attempts.push({ publisherId, balanceNzd: balance, status: 'skipped', detail: 'below threshold' });
      continue;
    }

    if (dryRun) {
      attempts.push({ publisherId, balanceNzd: balance, status: 'would-pay' });
      continue;
    }

    // 1) Record the intent (pending) so we have a stable id = idempotency key.
    const { data: payoutRow, error: payErr } = await service
      .from('dash_payouts')
      .insert({
        party_type: 'publisher',
        party_id: publisherId,
        amount_nzd: balance,
        method: 'stripe_connect',
        destination: acct.stripe_account_id,
        threshold_nzd: PAYOUT_THRESHOLD_NZD,
        status: 'pending',
      })
      .select('id')
      .single();
    if (payErr || !payoutRow) {
      attempts.push({ publisherId, balanceNzd: balance, status: 'failed', detail: 'could not record payout' });
      continue;
    }
    const payoutId = payoutRow.id as string;

    // 2) Transfer, idempotent on the payout row id.
    try {
      const transfer: Stripe.Transfer = await stripe.transfers.create(
        {
          amount: toCents(balance),
          currency: 'nzd',
          destination: acct.stripe_account_id as string,
          metadata: { dash_payout_id: payoutId, dash_publisher_id: publisherId },
        },
        { idempotencyKey: payoutId },
      );

      // 3) Mark paid + write the ledger debit (zeroes the balance).
      await service.from('dash_payouts').update({ status: 'paid', stripe_transfer_id: transfer.id }).eq('id', payoutId);
      await service.from('dash_payout_ledger').insert({
        party_type: 'publisher',
        party_id: publisherId,
        direction: 'debit',
        amount_nzd: balance,
        reason: 'payout',
        payout_id: payoutId,
      });
      attempts.push({ publisherId, balanceNzd: balance, status: 'paid', detail: transfer.id });
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'transfer failed';
      await service.from('dash_payouts').update({ status: 'failed', failure_reason: detail }).eq('id', payoutId);
      attempts.push({ publisherId, balanceNzd: balance, status: 'failed', detail });
    }
  }

  const paid = attempts.filter((a) => a.status === 'paid');
  const total = paid.reduce((s, a) => s + a.balanceNzd, 0);
  return NextResponse.json({
    dryRun,
    considered: attempts.length,
    paidCount: paid.length,
    paidTotalNzd: Math.round(total * 100) / 100,
    attempts,
  });
}
