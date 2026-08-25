'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VoyagePayload, VoyageStop } from './VoyageItalyTrip';

// Ambient day-planner for the voyage-italy trip board.
//
// Reads the trip payload, figures out which stop you're at today (by ISO
// date match), pulls the hotel context, and lets you ask for a day plan
// in plain English. Renders the result as time-blocks with transit + book
// flags. Saves the last 5 plans to localStorage so you can re-open them.
//
// Falls back to a manual stop picker when stop dates are placeholder
// strings (public template uses "Day 1", "Day 2", etc.).

type BookStatus =
  | 'walk_in'
  | 'book_now'
  | 'call_ahead'
  | 'tickets_online'
  | 'none';

type DayPlanBlock = {
  when: string;
  title: string;
  place: string;
  address: string;
  transit: string;
  why: string;
  book: BookStatus;
  bookNote?: string;
};

type DayPlan = {
  headline: string;
  blocks: DayPlanBlock[];
  caveats: string[];
};

type StoredPlan = {
  savedAt: number;
  stopId: string;
  prompt: string;
  plan: DayPlan;
};

type Props = {
  payload: VoyagePayload;
  /** Stable key used to scope localStorage for last-5 plans. */
  storageScope: string;
};

const BOOK_LABELS: Record<BookStatus, string> = {
  walk_in: 'walk in',
  book_now: 'book now',
  call_ahead: 'call ahead',
  tickets_online: 'tickets online',
  none: '',
};

const BOOK_TONE: Record<BookStatus, string> = {
  walk_in: 'bg-[rgba(35,33,31,0.06)] text-[color:var(--text-secondary)]',
  book_now:
    'bg-[color:var(--assembl-pounamu)]/15 text-[color:var(--assembl-pounamu)]',
  call_ahead: 'bg-[rgba(168,95,44,0.12)] text-[color:var(--assembl-clay,#A85F2C)]',
  tickets_online:
    'bg-[color:var(--assembl-pounamu)]/15 text-[color:var(--assembl-pounamu)]',
  none: '',
};

const STORAGE_PREFIX = 'voyage:dayplans:';
const MAX_STORED = 5;

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function todayIso(): string {
  // Use the user's local clock — they're physically at the trip stop.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

function dayLabel(): string {
  return new Date().toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function findCurrentStop(stops: VoyageStop[]): VoyageStop | null {
  const today = todayIso();
  for (const s of stops) {
    if (!isIsoDate(s.checkIn) || !isIsoDate(s.checkOut)) continue;
    if (today >= s.checkIn && today < s.checkOut) return s;
  }
  // If date is exactly the last checkout date, anchor to the final stop.
  const finalCheckoutMatch = stops.find(
    (s) => isIsoDate(s.checkOut) && s.checkOut === today,
  );
  return finalCheckoutMatch ?? null;
}

function loadStoredPlans(scope: string): StoredPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + scope);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPlan[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveStoredPlans(scope: string, plans: StoredPlan[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + scope,
      JSON.stringify(plans.slice(0, MAX_STORED)),
    );
  } catch {
    // Quota / private mode — silently drop.
  }
}

export function DayPlanner({ payload, storageScope }: Props) {
  const stops = useMemo(
    () => [...payload.stops].sort((a, b) => a.order - b.order),
    [payload.stops],
  );

  const autoStop = useMemo(() => findCurrentStop(stops), [stops]);
  const [selectedStopId, setSelectedStopId] = useState<string>(
    autoStop?.id ?? stops[0]?.id ?? '',
  );
  const stop = useMemo(
    () => stops.find((s) => s.id === selectedStopId) ?? null,
    [stops, selectedStopId],
  );

  const [prompt, setPrompt] = useState(
    'Plan today. Locals-leaning, mobile-friendly. Tell me transit between each step.',
  );
  const [pending, setPending] = useState(false);
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stored, setStored] = useState<StoredPlan[]>([]);

  useEffect(() => {
    setStored(loadStoredPlans(storageScope));
  }, [storageScope]);

  const submit = useCallback(
    async (overrides?: { promptOverride?: string; lastBlock?: DayPlanBlock | null }) => {
      const finalPrompt = (overrides?.promptOverride ?? prompt).trim();
      if (!finalPrompt) return;
      if (!stop) return;
      setPending(true);
      setError(null);
      try {
        const res = await fetch('/api/hapai/voyage-italy/day-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stopLabel: stop.label,
            hotelName: stop.hotel?.name?.startsWith('TODO')
              ? undefined
              : stop.hotel?.name,
            travellers: payload.travellers.map((t) => t.name),
            dateIso: todayIso(),
            localTime: nowHHMM(),
            prompt: finalPrompt,
            lastBlock: overrides?.lastBlock
              ? {
                  place: overrides.lastBlock.place,
                  address: overrides.lastBlock.address,
                }
              : undefined,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as
          | DayPlan
          | { error?: string };
        if (!res.ok || !('blocks' in data)) {
          setError(
            ('error' in data && data.error) || 'Planner failed. Try again.',
          );
          setPending(false);
          return;
        }
        const next: DayPlan = data;
        setPlan(next);
        setPending(false);
        const newStored: StoredPlan = {
          savedAt: Date.now(),
          stopId: stop.id,
          prompt: finalPrompt,
          plan: next,
        };
        const merged = [newStored, ...stored].slice(0, MAX_STORED);
        setStored(merged);
        saveStoredPlans(storageScope, merged);
      } catch {
        setError('Network hiccup. Try again.');
        setPending(false);
      }
    },
    [prompt, stop, payload.travellers, storageScope, stored],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void submit();
    },
    [submit],
  );

  const onWhatsNext = useCallback(() => {
    if (!plan || plan.blocks.length === 0) return;
    // Find the upcoming block based on now's time. We don't have structured
    // times — the model returns "12:30–2:30pm" type strings. Best-effort:
    // ask the model fresh with current time context.
    const lastBlock = plan.blocks[plan.blocks.length - 1];
    void submit({
      promptOverride: `It is now ${nowHHMM()}. What's the best next move from here? Keep it tight — 2–4 blocks forward.`,
      lastBlock,
    });
  }, [plan, submit]);

  const reopenStored = useCallback((s: StoredPlan) => {
    setPlan(s.plan);
    setPrompt(s.prompt);
    setSelectedStopId(s.stopId);
    setError(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const clearStored = useCallback(() => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm('Clear saved day plans for this trip?');
    if (!ok) return;
    setStored([]);
    saveStoredPlans(storageScope, []);
  }, [storageScope]);

  return (
    <section
      aria-label="Day planner"
      className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-5"
    >
      <header className="mb-4">
        <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
          Day planner
        </h3>
        <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          {dayLabel()}
          {stop ? (
            <>
              {' · '}
              {autoStop?.id === stop.id ? 'you’re in' : 'planning'} {stop.label}
            </>
          ) : null}
        </p>
      </header>

      {!autoStop ? (
        <label className="mb-3 flex flex-col gap-1 text-sm">
          <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Pick a stop
          </span>
          <select
            value={selectedStopId}
            onChange={(e) => setSelectedStopId(e.target.value)}
            className="rounded-card border border-[rgba(35,33,31,0.15)] bg-white px-2 py-1.5"
          >
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.order}. {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="e.g. Brera for lunch, basics shopping (Sambas, shorts, tops), non-touristy nice dinner"
          className="w-full rounded-card border border-[rgba(35,33,31,0.15)] bg-white/85 px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:border-[color:var(--assembl-pounamu)] focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending || !prompt.trim() || !stop}
            className="rounded-card bg-[color:var(--assembl-ink)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-85 disabled:opacity-50"
          >
            {pending ? 'planning…' : 'plan my day'}
          </button>
          {plan ? (
            <button
              type="button"
              onClick={onWhatsNext}
              disabled={pending}
              className="rounded-card border border-[rgba(35,33,31,0.15)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-primary)] transition hover:bg-white disabled:opacity-50"
            >
              what’s next?
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <p className="mt-3 rounded-card bg-[rgba(193,68,68,0.08)] px-3 py-2 text-sm text-[color:var(--text-primary)]">
          {error}
        </p>
      ) : null}

      {plan ? (
        <article aria-label="Today's plan" className="mt-5 space-y-4">
          <h4 className="font-display text-lg font-light text-[color:var(--text-primary)]">
            {plan.headline}
          </h4>
          <ol className="space-y-3">
            {plan.blocks.map((b, i) => (
              <li
                key={`${b.when}-${i}`}
                className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-4"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    {b.when} · {b.title}
                  </p>
                  {b.book !== 'none' ? (
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[12px] uppercase tracking-[0.18em] ${BOOK_TONE[b.book]}`}
                    >
                      {BOOK_LABELS[b.book]}
                    </span>
                  ) : null}
                </header>
                <p className="mt-1 font-display text-base font-light text-[color:var(--text-primary)]">
                  {b.place}
                </p>
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                  {b.address}
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-primary)]">
                  {b.why}
                </p>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                  ↳ {b.transit}
                </p>
                {b.bookNote ? (
                  <p className="mt-1 text-xs text-[color:var(--text-body)]">
                    {b.bookNote}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${b.place}, ${b.address}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] transition hover:bg-white"
                  >
                    open in maps
                  </a>
                </div>
              </li>
            ))}
          </ol>
          {plan.caveats.length > 0 ? (
            <section
              aria-label="Verify on the day"
              className="rounded-card border border-[rgba(35,33,31,0.10)] bg-[rgba(35,33,31,0.04)] p-4"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Verify on the day
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--text-body)]">
                {plan.caveats.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      ) : null}

      {stored.length > 0 ? (
        <section aria-label="Saved plans" className="mt-6">
          <header className="mb-2 flex items-center justify-between">
            <h4 className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Recent plans ({stored.length})
            </h4>
            <button
              type="button"
              onClick={clearStored}
              className="rounded-full border border-[rgba(35,33,31,0.12)] px-2 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition hover:bg-white"
            >
              clear
            </button>
          </header>
          <ul className="space-y-2">
            {stored.map((s) => {
              const stopLabel =
                stops.find((x) => x.id === s.stopId)?.label ?? s.stopId;
              const when = new Date(s.savedAt).toLocaleString('en-NZ', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <li key={s.savedAt}>
                  <button
                    type="button"
                    onClick={() => reopenStored(s)}
                    className="w-full rounded-card border border-[rgba(35,33,31,0.10)] bg-white/85 p-3 text-left transition hover:bg-white"
                  >
                    <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                      {when} · {stopLabel}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-[color:var(--text-primary)]">
                      {s.plan.headline}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
