'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// Cost splitter — localStorage-only by default. Never persists to the server
// unless an explicit (future) sync toggle is added. No PII written anywhere.

type Currency = 'EUR' | 'NZD' | 'USD' | 'GBP';

type Traveller = { id: string; name: string };

type Expense = {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number;
  currency: Currency;
  payerId: string;
  sharedWith: string[]; // traveller ids
};

type SplitterProps = {
  storageKey: string; // e.g. voyage:costs:kate-italy-2026 or voyage:costs:demo
  travellers: Traveller[];
  defaultCurrency?: Currency;
  homeCurrency?: Currency;
  defaultBudgetNzd?: number;
  categories?: string[];
};

const DEFAULT_CATEGORIES = [
  'food',
  'transport',
  'lodging',
  'tickets',
  'shopping',
  'other',
];

type State = {
  budget: number; // in home currency
  budgetCurrency: Currency;
  tripCurrency: Currency;
  homeCurrency: Currency;
  exchangeRate: number; // 1 trip currency = X home currency. Manual override.
  expenses: Expense[];
};

function uid() {
  // Avoid `crypto.randomUUID()` to keep older mobile Safari happy.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadState(key: string, fallback: State): State {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<State>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function saveState(key: string, state: State) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Quota / private mode — silently drop.
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function fmtMoney(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function CostSplitter({
  storageKey,
  travellers,
  defaultCurrency = 'EUR',
  homeCurrency = 'NZD',
  defaultBudgetNzd = 0,
  categories = DEFAULT_CATEGORIES,
}: SplitterProps) {
  const initial: State = useMemo(
    () => ({
      budget: defaultBudgetNzd,
      budgetCurrency: homeCurrency,
      tripCurrency: defaultCurrency,
      homeCurrency,
      exchangeRate: 1.85, // EUR → NZD rough default; user overrides
      expenses: [],
    }),
    [defaultCurrency, homeCurrency, defaultBudgetNzd],
  );

  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState<Expense>(() => ({
    id: '',
    date: todayIso(),
    description: '',
    category: categories[0] ?? 'other',
    amount: 0,
    currency: defaultCurrency,
    payerId: travellers[0]?.id ?? '',
    sharedWith: travellers.map((t) => t.id),
  }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fxFetched, setFxFetched] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setState(loadState(storageKey, initial));
    setHydrated(true);
  }, [storageKey, initial]);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    saveState(storageKey, state);
  }, [storageKey, state, hydrated]);

  // Best-effort FX bootstrap. Never blocks the UI. Manual override always wins.
  useEffect(() => {
    if (fxFetched) return;
    if (state.tripCurrency === state.homeCurrency) return;
    const ctrl = new AbortController();
    fetch(
      `https://api.exchangerate.host/latest?base=${encodeURIComponent(
        state.tripCurrency,
      )}&symbols=${encodeURIComponent(state.homeCurrency)}`,
      { signal: ctrl.signal },
    )
      .then((r) => r.json())
      .then((data: { rates?: Record<string, number> }) => {
        const rate = data.rates?.[state.homeCurrency];
        if (typeof rate === 'number' && rate > 0) {
          setState((s) => ({ ...s, exchangeRate: Number(rate.toFixed(4)) }));
        }
        setFxFetched(true);
      })
      .catch(() => {
        setFxFetched(true);
      });
    return () => ctrl.abort();
  }, [state.tripCurrency, state.homeCurrency, fxFetched]);

  const totals = useMemo(() => {
    // Convert every expense into trip currency for comparison. Simple model:
    // if expense.currency === tripCurrency, use amount as-is.
    // if expense.currency === homeCurrency, divide by exchangeRate.
    // Other currencies are stored as entered with no conversion (manual).
    const inTrip = (e: Expense) => {
      if (e.currency === state.tripCurrency) return e.amount;
      if (e.currency === state.homeCurrency && state.exchangeRate > 0) {
        return e.amount / state.exchangeRate;
      }
      return e.amount;
    };

    let spent = 0;
    const paidBy = new Map<string, number>();
    const oweShare = new Map<string, number>();
    travellers.forEach((t) => {
      paidBy.set(t.id, 0);
      oweShare.set(t.id, 0);
    });

    for (const e of state.expenses) {
      const amount = inTrip(e);
      spent += amount;
      paidBy.set(e.payerId, (paidBy.get(e.payerId) ?? 0) + amount);
      if (e.sharedWith.length === 0) continue;
      const share = amount / e.sharedWith.length;
      for (const id of e.sharedWith) {
        oweShare.set(id, (oweShare.get(id) ?? 0) + share);
      }
    }

    // Net = paid - owed share. Positive → others owe them. Negative → they owe.
    const net = new Map<string, number>();
    travellers.forEach((t) => {
      const paid = paidBy.get(t.id) ?? 0;
      const owed = oweShare.get(t.id) ?? 0;
      net.set(t.id, paid - owed);
    });

    return {
      spent,
      paidBy,
      oweShare,
      net,
    };
  }, [state.expenses, state.tripCurrency, state.homeCurrency, state.exchangeRate, travellers]);

  const budgetInTrip = useMemo(() => {
    if (state.budgetCurrency === state.tripCurrency) return state.budget;
    if (state.budgetCurrency === state.homeCurrency && state.exchangeRate > 0) {
      return state.budget / state.exchangeRate;
    }
    return state.budget;
  }, [state.budget, state.budgetCurrency, state.tripCurrency, state.homeCurrency, state.exchangeRate]);

  const remaining = budgetInTrip > 0 ? budgetInTrip - totals.spent : 0;

  const balances = useMemo(() => {
    // Resolve simple pairwise balances. With 2 travellers this is exact;
    // with N>2 we still report each person's net.
    const rows: Array<{
      from: Traveller;
      to: Traveller;
      tripAmount: number;
      homeAmount: number;
    }> = [];

    const debtors = travellers
      .map((t) => ({ t, net: totals.net.get(t.id) ?? 0 }))
      .filter((r) => r.net < -0.01)
      .sort((a, b) => a.net - b.net); // most negative first
    const creditors = travellers
      .map((t) => ({ t, net: totals.net.get(t.id) ?? 0 }))
      .filter((r) => r.net > 0.01)
      .sort((a, b) => b.net - a.net);

    let di = 0;
    let ci = 0;
    while (di < debtors.length && ci < creditors.length) {
      const debtor = debtors[di];
      const creditor = creditors[ci];
      const amount = Math.min(-debtor.net, creditor.net);
      const homeAmount =
        state.tripCurrency === state.homeCurrency
          ? amount
          : amount * state.exchangeRate;
      rows.push({ from: debtor.t, to: creditor.t, tripAmount: amount, homeAmount });
      debtor.net += amount;
      creditor.net -= amount;
      if (Math.abs(debtor.net) < 0.01) di += 1;
      if (Math.abs(creditor.net) < 0.01) ci += 1;
    }

    return rows;
  }, [totals.net, state.tripCurrency, state.homeCurrency, state.exchangeRate, travellers]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!draft.amount || draft.amount <= 0) return;
      if (!draft.payerId) return;
      if (editingId) {
        setState((s) => ({
          ...s,
          expenses: s.expenses.map((x) =>
            x.id === editingId ? { ...draft, id: editingId } : x,
          ),
        }));
        setEditingId(null);
      } else {
        setState((s) => ({
          ...s,
          expenses: [{ ...draft, id: uid() }, ...s.expenses],
        }));
      }
      setDraft({
        id: '',
        date: todayIso(),
        description: '',
        category: categories[0] ?? 'other',
        amount: 0,
        currency: state.tripCurrency,
        payerId: travellers[0]?.id ?? '',
        sharedWith: travellers.map((t) => t.id),
      });
    },
    [draft, editingId, state.tripCurrency, travellers, categories],
  );

  const startEdit = useCallback((e: Expense) => {
    setDraft({ ...e });
    setEditingId(e.id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const removeExpense = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      expenses: s.expenses.filter((e) => e.id !== id),
    }));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const toggleSharedWith = useCallback((travellerId: string) => {
    setDraft((d) => {
      const has = d.sharedWith.includes(travellerId);
      return {
        ...d,
        sharedWith: has
          ? d.sharedWith.filter((id) => id !== travellerId)
          : [...d.sharedWith, travellerId],
      };
    });
  }, []);

  const exportCsv = useCallback(() => {
    const header = [
      'date',
      'description',
      'category',
      'amount',
      'currency',
      'payer',
      'shared_with',
    ];
    const rows = state.expenses.map((e) => [
      e.date,
      e.description,
      e.category,
      e.amount.toFixed(2),
      e.currency,
      travellers.find((t) => t.id === e.payerId)?.name ?? '',
      e.sharedWith
        .map((id) => travellers.find((t) => t.id === id)?.name ?? '')
        .filter(Boolean)
        .join('|'),
    ]);
    const balanceRows = balances.map((b) => [
      '',
      `${b.from.name} owes ${b.to.name}`,
      'balance',
      b.tripAmount.toFixed(2),
      state.tripCurrency,
      '',
      '',
    ]);
    const csv = [header, ...rows, [], ...balanceRows]
      .map((row) => row.map((v) => csvEscape(String(v ?? ''))).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-costs-${todayIso()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state.expenses, state.tripCurrency, travellers, balances]);

  const clearAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm(
      'Delete all expenses for this trip? This cannot be undone.',
    );
    if (!confirmed) return;
    setState((s) => ({ ...s, expenses: [] }));
  }, []);

  return (
    <section
      aria-label="Cost splitter"
      className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-5"
    >
      <header className="mb-4">
        <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
          Cost splitter
        </h3>
        <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          local only · nothing leaves this device
        </p>
      </header>

      {/* Setup */}
      <details className="mb-4 rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 px-3 py-2">
        <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
          Setup · {state.tripCurrency} → {state.homeCurrency} @ {state.exchangeRate}
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Trip currency
            </span>
            <select
              value={state.tripCurrency}
              onChange={(e) =>
                setState((s) => ({ ...s, tripCurrency: e.target.value as Currency }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            >
              {['EUR', 'NZD', 'USD', 'GBP'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Home currency
            </span>
            <select
              value={state.homeCurrency}
              onChange={(e) =>
                setState((s) => ({ ...s, homeCurrency: e.target.value as Currency }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            >
              {['NZD', 'EUR', 'USD', 'GBP'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              FX rate (1 {state.tripCurrency} → {state.homeCurrency})
            </span>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={state.exchangeRate}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  exchangeRate: Number(e.target.value) || 0,
                }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Budget ({state.budgetCurrency})
            </span>
            <input
              type="number"
              step="1"
              min="0"
              value={state.budget}
              onChange={(e) =>
                setState((s) => ({ ...s, budget: Number(e.target.value) || 0 }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-[color:var(--text-body)]">
          FX rate is a manual override. We try to bootstrap from a free API on
          first load — best-effort, not live.
        </p>
      </details>

      {/* Totals */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Spent
          </p>
          <p className="mt-1 font-display text-lg font-light text-[color:var(--text-primary)]">
            {fmtMoney(totals.spent, state.tripCurrency)}
          </p>
        </div>
        <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Remaining
          </p>
          <p
            className={`mt-1 font-display text-lg font-light ${
              remaining < 0
                ? 'text-[color:var(--assembl-clay,#A85F2C)]'
                : 'text-[color:var(--text-primary)]'
            }`}
          >
            {budgetInTrip > 0 ? fmtMoney(remaining, state.tripCurrency) : '—'}
          </p>
        </div>
      </div>

      {balances.length > 0 ? (
        <div className="mb-4 rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Balances
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {balances.map((b, i) => (
              <li key={i} className="text-[color:var(--text-primary)]">
                {b.from.name} owes {b.to.name}{' '}
                <strong>{fmtMoney(b.tripAmount, state.tripCurrency)}</strong>
                {state.tripCurrency !== state.homeCurrency ? (
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    {' '}
                    · ≈ {fmtMoney(b.homeAmount, state.homeCurrency)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Add / edit form */}
      <form onSubmit={submit} className="mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Date
            </span>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Category
            </span>
            <select
              value={draft.category}
              onChange={(e) =>
                setDraft((d) => ({ ...d, category: e.target.value }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Description
          </span>
          <input
            type="text"
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="e.g. Dinner at Trattoria Milano"
            className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Amount
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={draft.amount || ''}
              onChange={(e) =>
                setDraft((d) => ({ ...d, amount: Number(e.target.value) || 0 }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              Currency
            </span>
            <select
              value={draft.currency}
              onChange={(e) =>
                setDraft((d) => ({ ...d, currency: e.target.value as Currency }))
              }
              className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
            >
              {['EUR', 'NZD', 'USD', 'GBP'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Paid by
          </span>
          <select
            value={draft.payerId}
            onChange={(e) => setDraft((d) => ({ ...d, payerId: e.target.value }))}
            className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
          >
            {travellers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Shared with
          </legend>
          <div className="flex flex-wrap gap-2">
            {travellers.map((t) => {
              const checked = draft.sharedWith.includes(t.id);
              return (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 ${
                    checked
                      ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)]/10 text-[color:var(--text-primary)]'
                      : 'border-[rgba(35,33,31,0.15)] bg-white/55 text-[color:var(--text-secondary)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSharedWith(t.id)}
                    className="h-3 w-3"
                  />
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em]">
                    {t.name}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-card bg-[color:var(--assembl-ink)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-85"
          >
            {editingId ? 'save changes' : 'add expense'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setDraft({
                  id: '',
                  date: todayIso(),
                  description: '',
                  category: categories[0] ?? 'other',
                  amount: 0,
                  currency: state.tripCurrency,
                  payerId: travellers[0]?.id ?? '',
                  sharedWith: travellers.map((t) => t.id),
                });
              }}
              className="rounded-card border border-[rgba(35,33,31,0.15)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-primary)] transition hover:bg-white"
            >
              cancel
            </button>
          ) : null}
        </div>
      </form>

      {/* Expense list */}
      <section aria-label="Expenses">
        <header className="mb-2 flex items-center justify-between">
          <h4 className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            Expenses ({state.expenses.length})
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={state.expenses.length === 0}
              className="rounded-full border border-[rgba(35,33,31,0.15)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)] transition hover:bg-white disabled:opacity-50"
            >
              export csv
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={state.expenses.length === 0}
              className="rounded-full border border-[rgba(35,33,31,0.15)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition hover:bg-white disabled:opacity-50"
            >
              clear all
            </button>
          </div>
        </header>
        {state.expenses.length === 0 ? (
          <p className="text-sm text-[color:var(--text-body)]">
            No expenses yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {state.expenses.map((e) => {
              const payer = travellers.find((t) => t.id === e.payerId);
              return (
                <li
                  key={e.id}
                  className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-[color:var(--text-primary)]">
                        {e.description || '(no description)'}
                      </p>
                      <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        {e.date} · {e.category} · paid by {payer?.name ?? '?'}
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-lg font-light text-[color:var(--text-primary)]">
                      {fmtMoney(e.amount, e.currency)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(e)}
                      className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] transition hover:bg-white"
                    >
                      edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExpense(e.id)}
                      className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition hover:bg-white"
                    >
                      delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
