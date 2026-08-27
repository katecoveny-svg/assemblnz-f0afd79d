'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Wallet } from 'lucide-react';
import { money } from '@/components/bills/kit';
import { threeNumbers, type SessionBill } from '@/lib/bills/session-summary';

/**
 * The three numbers, the way a lockscreen would show them.
 *
 * A budget app can work all of this out. The problem is that it works it out
 * inside a dashboard nobody opens at the moment the money is being spent. So
 * this is the first thing on the console and it is only three figures: what is
 * due this week, what is next, and what is left once the bills are out.
 *
 * Two of the three come from bills the parser actually read. The third needs a
 * balance, which the app has no way to know — so it asks once, keeps it in this
 * browser only, and until it is told, shows nothing rather than a guess. That
 * is the whole reason to trust the other two.
 */

const BALANCE_KEY = 'assembl_bills_balance';

export function ThreeNumbers({ bills }: { bills: SessionBill[] }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BALANCE_KEY);
      if (raw !== null && raw !== '') {
        const n = Number(raw);
        if (Number.isFinite(n)) setBalance(n);
      }
    } catch {
      // A browser with storage blocked simply never gets the third number.
    }
  }, []);

  const saveBalance = (value: number | null) => {
    setBalance(value);
    setEditing(false);
    try {
      if (value === null) localStorage.removeItem(BALANCE_KEY);
      else localStorage.setItem(BALANCE_KEY, String(value));
    } catch {
      // Ignored — the figure still shows for this visit.
    }
  };

  // `today` is read once per mount rather than per render, so the numbers do
  // not shift underneath someone reading them.
  const today = useMemo(() => new Date(), []);
  const n = useMemo(() => threeNumbers(bills, today, balance), [bills, today, balance]);

  const dueLabel =
    n.dueThisWeekCount === 0
      ? 'nothing due in the next 7 days'
      : `${n.dueThisWeekCount} ${n.dueThisWeekCount === 1 ? 'bill' : 'bills'} in the next 7 days`;

  const whenNext = (days: number) =>
    days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;

  return (
    <section
      className="mb-4 overflow-hidden rounded-3xl"
      style={{ background: 'var(--b-brand)', color: '#FFF7EC' }}
      aria-label="Your three numbers"
    >
      <div className="grid gap-px sm:grid-cols-3" style={{ background: 'rgba(255,247,236,0.16)' }}>
        {/* 1 — what is coming out */}
        <div className="p-6" style={{ background: 'var(--b-brand)' }}>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--b-hivis)' }}
          >
            Due this week
          </p>
          <p className="mt-2 text-5xl font-bold leading-none" style={{ color: '#FFF7EC' }}>
            {money(n.dueThisWeek)}
          </p>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,247,236,0.7)' }}>
            {dueLabel}
          </p>
        </div>

        {/* 2 — what is next */}
        <div className="p-6" style={{ background: 'var(--b-brand)' }}>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--b-hivis)' }}
          >
            Next bill
          </p>
          {n.next ? (
            <>
              <p className="mt-2 text-5xl font-bold leading-none" style={{ color: '#FFF7EC' }}>
                {money(n.next.amount)}
              </p>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,247,236,0.7)' }}>
                {n.next.provider} · {whenNext(n.next.inDays)}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-5xl font-bold leading-none" style={{ color: 'rgba(255,247,236,0.4)' }}>
                —
              </p>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,247,236,0.7)' }}>
                No bill ahead with a due date on it
              </p>
            </>
          )}
        </div>

        {/* 3 — what is left. The only one that needs telling. */}
        <div className="p-6" style={{ background: 'var(--b-brand)' }}>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--b-hivis)' }}
          >
            Left after bills
          </p>

          {editing || balance === null ? (
            <form
              className="mt-2 flex flex-wrap items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = Number(draft.replace(/[^0-9.-]/g, ''));
                saveBalance(Number.isFinite(v) && draft.trim() !== '' ? v : null);
              }}
            >
              <label className="sr-only" htmlFor="bills-balance">
                What is in your account right now
              </label>
              <input
                id="bills-balance"
                inputMode="decimal"
                autoComplete="off"
                placeholder="$ in your account"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-36 rounded-xl px-3 py-2 text-sm"
                style={{
                  background: 'rgba(255,247,236,0.1)',
                  color: '#FFF7EC',
                  border: '1px solid rgba(255,247,236,0.3)',
                }}
              />
              <button
                type="submit"
                className="rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ background: 'var(--b-hivis)', color: 'var(--b-brand)' }}
              >
                Show me
              </button>
            </form>
          ) : (
            <>
              <p
                className="mt-2 text-5xl font-bold leading-none"
                style={{ color: (n.leftAfterBills ?? 0) < 0 ? 'var(--b-coral)' : '#FFF7EC' }}
              >
                {money(n.leftAfterBills ?? 0)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setDraft(String(balance));
                  setEditing(true);
                }}
                className="mt-2 text-sm underline"
                style={{ color: 'rgba(255,247,236,0.7)' }}
              >
                from {money(balance)} in your account — change
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 text-[12px]"
        style={{ background: 'rgba(255,247,236,0.07)', color: 'rgba(255,247,236,0.68)' }}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock size={13} /> From {bills.length} {bills.length === 1 ? 'bill' : 'bills'} you
          uploaded
        </span>
        {n.undated > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={13} /> {n.undated} with no due date the parser could read, so not counted
            here
          </span>
        )}
        <span>Balance stays in this browser. Nothing is switched, cancelled or paid.</span>
      </div>
    </section>
  );
}
