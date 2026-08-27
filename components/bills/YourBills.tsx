'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ReceiptText } from 'lucide-react';
import { Card, CategoryTag, SectionLabel, money } from '@/components/bills/kit';
import { LiveState } from '@/components/bills/LiveState';
import { useBillsSession } from '@/components/bills/useSession';
import type { SessionBill } from '@/lib/bills/session-summary';
import { ThreeNumbers } from '@/components/bills/ThreeNumbers';

/**
 * The household's own bills, once they have uploaded any.
 *
 * The console below this is a sample household, and says so. This block is the
 * real one: every figure is added up from bills this browser actually dropped
 * in, parsed by /api/bills/parse and read back by /api/bills/session. Nothing
 * is estimated and nothing is filled in — a bill whose total the parser could
 * not read is listed and left out of the sum, with the count of what was
 * countable shown beside it.
 *
 * With no uploads it renders a prompt instead of pretending, because an empty
 * dashboard that looks populated is the exact thing this product is arguing
 * against.
 */

type SessionData = {
  bills: SessionBill[];
  count: number;
  pricedCount: number;
  monthly: number;
  annual: number;
  byCategory: { category: string; amount: number }[];
  unavailable?: boolean;
};

export function YourBills() {
  const sessionId = useBillsSession();
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    fetch(`/api/bills/session?sessionId=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [sessionId]);

  if (loading || !data) return null;

  // Nothing uploaded yet — invite the real thing rather than dress up the demo.
  if (data.count === 0) {
    return (
      <Card className="mb-4 !p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg"
              style={{ background: 'var(--b-brand-soft)', color: 'var(--b-brand)' }}
            >
              <ReceiptText size={16} />
            </span>
            <div>
              <p className="font-semibold" style={{ color: 'var(--b-ink)' }}>
                Everything below is a sample household.
              </p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--b-muted)' }}>
                Drop in one of your own bills and this console reads it and shows your figures
                instead. It is read-only — nothing is switched, cancelled or paid.
              </p>
            </div>
          </div>
          <Link
            href="/bills/app/bills"
            className="inline-flex flex-none items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'var(--b-brand)' }}
          >
            Add a bill <ArrowRight size={14} />
          </Link>
        </div>
      </Card>
    );
  }

  const unpriced = data.count - data.pricedCount;

  return (
    <>
      {/* The three numbers first — everything else is detail behind them. */}
      <ThreeNumbers bills={data.bills} />
      <Card className="mb-4 !p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionLabel>Your bills</SectionLabel>
          <p className="text-sm" style={{ color: 'var(--b-muted)' }}>
            Added up from {data.pricedCount} {data.pricedCount === 1 ? 'bill' : 'bills'} you
            uploaded{unpriced > 0 ? `, with ${unpriced} the parser could not read a total from` : ''}.
          </p>
        </div>
        <LiveState state="live" note="parsed from your uploads" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl p-4" style={{ background: 'var(--b-surface-alt)' }}>
          <p className="text-xs" style={{ color: 'var(--b-faint)' }}>
            Total on these bills
          </p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--b-ink)' }}>
            {money(data.monthly)}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--b-surface-alt)' }}>
          <p className="text-xs" style={{ color: 'var(--b-faint)' }}>
            Bills read
          </p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--b-ink)' }}>
            {data.count}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'var(--b-surface-alt)' }}>
          <p className="text-xs" style={{ color: 'var(--b-faint)' }}>
            Biggest category
          </p>
          <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--b-ink)' }}>
            {data.byCategory[0]?.category ?? '—'}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.bills.slice(0, 6).map((b, i) => (
          <li
            key={`${b.provider}-${i}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5"
            style={{ background: 'var(--b-surface-alt)' }}
          >
            <span className="flex min-w-0 items-center gap-2">
              <CategoryTag category={b.category} />
              <b className="truncate font-semibold" style={{ color: 'var(--b-ink)' }}>
                {b.provider}
              </b>
              {b.confidence && b.confidence !== 'high' && (
                <span className="text-xs" style={{ color: 'var(--b-faint)' }}>
                  {b.confidence} confidence — worth checking
                </span>
              )}
            </span>
            <span className="font-semibold" style={{ color: 'var(--b-ink)' }}>
              {typeof b.amount === 'number' ? money(b.amount) : 'no total read'}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[12px]" style={{ color: 'var(--b-faint)' }}>
        Read-only. assembl bills extracts what your bill says; it never switches, cancels or pays
        anything. Savings and hidden costs below are still the sample household.
      </p>
      </Card>
    </>
  );
}
