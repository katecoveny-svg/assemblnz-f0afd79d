'use client';

/**
 * dash– wallet — the consumer (earner) side.
 *
 * Shows the balance earned from waits and lets the user send it to a REWARD —
 * Airpoints, a KiwiSaver top-up, or a donation to charity. Never cash-out.
 *
 * This page is presentational and demo-safe: it seeds a sample balance and
 * redeems against local state so the flow is demonstrable with no backend.
 * Live wiring (read `dash_earner_balances`, call the `dash_redeem_earner`
 * RPC added in the earner-wallet migration) is the follow-up — see
 * supabase/migrations/*_dash_earner_wallet.sql.
 */
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PayoutDestinationPicker } from '@/components/dash/PayoutDestinationPicker';
import { CHARITIES, DEFAULT_DESTINATION, type PayoutDestination } from '@/components/dash/types';

const REDEEM_THRESHOLD_CENTS = 500; // NZ$5 minimum

function formatNZD(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

function destinationLabel(d: PayoutDestination): string {
  if (d.kind === 'charity') {
    return CHARITIES.find((c) => c.id === d.charityId)?.name ?? 'a charity';
  }
  const labels = { airpoints: 'Airpoints', kiwisaver: 'your KiwiSaver', prezzy: 'a Prezzy card' };
  return labels[d.method];
}

export default function DashWalletPage() {
  // Demo seed — in live mode this comes from `dash_earner_balances`.
  const [balanceCents, setBalanceCents] = useState(420);
  const [destination, setDestination] = useState<PayoutDestination>(DEFAULT_DESTINATION);
  const [done, setDone] = useState<string | null>(null);

  const canRedeem = balanceCents >= REDEEM_THRESHOLD_CENTS;

  function redeem() {
    if (!canRedeem) return;
    const sent = formatNZD(balanceCents);
    setDone(`${sent} on its way to ${destinationLabel(destination)}.`);
    setBalanceCents(0);
  }

  return (
    <section className="wrap" style={{ paddingBlock: '56px', maxWidth: 720 }}>
      <Link href="/dash" className="eyebrow" style={{ display: 'inline-block', marginBottom: 18 }}>
        ← dash–
      </Link>

      <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', marginBottom: 8 }}>
        your dash<span style={{ color: 'var(--gold)' }}>–</span> wallet
      </h1>
      <p className="lead" style={{ marginBottom: 28 }}>
        Everything you’ve earned waiting. Send it to a reward — never cash.
      </p>

      {/* balance */}
      <div
        className="card"
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--line)',
          borderRadius: 'var(--r-lg)',
          padding: '28px 30px',
          marginBottom: 22,
        }}
      >
        <p className="eyebrow" style={{ marginBottom: 6 }}>
          Balance
        </p>
        <p
          className="display"
          style={{ fontSize: 'clamp(3rem, 9vw, 4.5rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          {formatNZD(balanceCents)}
        </p>
        <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
          Earned from {Math.max(1, Math.round(balanceCents / 4))} waits · accrues a few cents at a time.
        </p>
      </div>

      {done ? (
        <div
          className="card"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--r-lg)',
            padding: '28px 30px',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}
        >
          <Check aria-hidden style={{ color: 'var(--gold)', flex: 'none', marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Sorted.</p>
            <p className="muted">{done}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            Send it to
          </p>
          <PayoutDestinationPicker destination={destination} onChange={setDestination} />

          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={redeem}
            disabled={!canRedeem}
            style={{ marginTop: 24, opacity: canRedeem ? 1 : 0.5, cursor: canRedeem ? 'pointer' : 'not-allowed' }}
          >
            Send {formatNZD(balanceCents)} to {destinationLabel(destination)} <ArrowRight aria-hidden />
          </button>
          {!canRedeem && (
            <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
              You can redeem once you reach {formatNZD(REDEEM_THRESHOLD_CENTS)}. Keep waiting — it adds up.
            </p>
          )}
        </>
      )}
    </section>
  );
}
