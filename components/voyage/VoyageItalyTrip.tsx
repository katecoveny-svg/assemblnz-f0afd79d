import Link from 'next/link';
import { CalendarDays, MapPinned, Plane, Sparkles, WalletCards } from 'lucide-react';
import { VoiceTranslator } from './VoiceTranslator';
import { CostSplitter } from './CostSplitter';
import { DayPlanner } from './DayPlanner';

// Shared trip-render component for /hapai/voyage-italy.
//
// Renders from a typed `payload` so the same layout serves:
//   (a) the public generic template (hard-coded GENERIC_VOYAGE_TEMPLATE) and
//   (b) Kate + Adrian's private share row (loaded from voyage_shared_trips).
//
// No data fetching happens here — fetchers pass the payload in.

export type VoyageStop = {
  id: string;
  label: string;
  order: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  hotel: {
    name: string;
    status?: string;
  };
  highlights?: string[];
  driveFromPrevious?: {
    from: string;
    approxHours: string;
  };
};

export type VoyageActivity = {
  stopId: string;
  date?: string;
  label: string;
  note?: string;
  category?: string;
  costEur?: number;
};

export type VoyageBudget = {
  currency?: string;
  accommodationNzd?: number;
  flightsNzd?: number;
  estimatedTotalNzd?: number;
  activitiesBudgetNzd?: number | null;
};

export type VoyageTraveller = {
  id: string;
  name: string;
};

export type VoyagePayload = {
  title: string;
  travellers: VoyageTraveller[];
  departDate?: string;
  departFrom?: string;
  tripStartDate?: string;
  tripEndDate?: string;
  totalNights?: number;
  budget?: VoyageBudget;
  stops: VoyageStop[];
  sampleActivities?: VoyageActivity[];
  costSplitterPreferences?: {
    currency?: 'EUR' | 'NZD' | 'USD' | 'GBP';
    homeCurrency?: 'EUR' | 'NZD' | 'USD' | 'GBP';
    categories?: string[];
  };
};

type Props = {
  payload: VoyagePayload;
  /** Stable key used to scope cost-splitter localStorage. */
  storageScope: string;
  /** Set to true for the public template — adds "sample" badging + CTA. */
  isTemplate?: boolean;
};

function fmtNzd(amount?: number | null): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `NZ$${amount.toFixed(0)}`;
  }
}

export function VoyageItalyTrip({ payload, storageScope, isTemplate }: Props) {
  const stops = [...payload.stops].sort((a, b) => a.order - b.order);
  const activitiesByStop = new Map<string, VoyageActivity[]>();
  for (const a of payload.sampleActivities ?? []) {
    const list = activitiesByStop.get(a.stopId) ?? [];
    list.push(a);
    activitiesByStop.set(a.stopId, list);
  }

  const homeCurrency = payload.costSplitterPreferences?.homeCurrency ?? 'NZD';
  const tripCurrency = payload.costSplitterPreferences?.currency ?? 'EUR';
  const categories = payload.costSplitterPreferences?.categories;
  const heroSubtitle = [
    payload.travellers.map((t) => t.name).join(' + '),
    payload.tripStartDate && payload.tripEndDate
      ? `${payload.tripStartDate} to ${payload.tripEndDate}`
      : null,
    payload.totalNights ? `${payload.totalNights} nights` : null,
  ].filter(Boolean).join(' · ');

  return (
    <main className="min-h-screen overflow-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative border-b border-[rgba(35,33,31,0.08)] px-5 py-16 md:px-10 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(58,56,50,0.12),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(217,168,90,0.18),transparent_34%),linear-gradient(180deg,rgba(250,247,242,0.96),rgba(247,241,233,0.76))]"
        />
        <div className="relative mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              HAPAI travel tool · Voyage
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.4rem,7vw,7.4rem)] font-light leading-[0.88] tracking-tight text-[#103F35]">
              {isTemplate ? 'Plan the trip before you land.' : payload.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#2F3440] md:text-xl">
              {isTemplate
                ? 'A shareable travel board for flights, hotels, city plans, daily questions, translation, and shared costs. This public page uses sample data only.'
                : 'Your shared travel board: bookings, city plans, translation, day planning, notes, and shared costs in one place.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {isTemplate ? (
                <span className="rounded-full border border-[rgba(35,33,31,0.10)] bg-white/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] shadow-sm backdrop-blur">
                  sample template · no real traveller data
                </span>
              ) : null}
              <span className="rounded-full border border-[rgba(58,56,50,0.18)] bg-white/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#3A3832] shadow-sm backdrop-blur">
                draft travel assistant
              </span>
            </div>
          </header>

          <aside className="rounded-[28px] border border-white/60 bg-white/42 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_28px_90px_rgba(35,33,31,0.10)] backdrop-blur-2xl md:p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
              Trip snapshot
            </p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.5rem)] font-light leading-none">
              {payload.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
              {heroSubtitle}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <TripFact icon={Plane} label="Depart" value={payload.departFrom ?? 'TBD'} />
              <TripFact icon={CalendarDays} label="Dates" value={`${payload.tripStartDate ?? 'TBD'} to ${payload.tripEndDate ?? 'TBD'}`} />
              <TripFact icon={MapPinned} label="Stops" value={`${stops.length} cities`} />
              <TripFact icon={WalletCards} label="Estimate" value={fmtNzd(payload.budget?.estimatedTotalNzd)} />
            </div>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
        {payload.budget ? (
          <section
            aria-label="Budget summary"
            className="mb-10 grid overflow-hidden rounded-[24px] border border-[rgba(35,33,31,0.10)] bg-white/52 shadow-[0_20px_70px_rgba(35,33,31,0.06)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="border-b border-[rgba(35,33,31,0.08)] p-6 md:border-b-0 md:border-r">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Budget rollup
              </p>
              <h2 className="mt-3 font-display text-4xl font-light leading-none text-[#103F35]">
                Costs in one view.
              </h2>
            </div>
            <dl className="grid gap-px bg-[rgba(35,33,31,0.08)] text-sm sm:grid-cols-3">
              <BudgetItem label="Accommodation" value={fmtNzd(payload.budget.accommodationNzd)} />
              <BudgetItem label="Flights" value={fmtNzd(payload.budget.flightsNzd)} />
              <BudgetItem label="Estimated total" value={fmtNzd(payload.budget.estimatedTotalNzd)} strong />
            </dl>
          </section>
        ) : null}

        <section aria-label="Itinerary" className="mb-12">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
                Itinerary
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.8rem,6vw,5rem)] font-light leading-none">
                The route at a glance.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-[color:var(--text-body)]">
              Tap a city card before each leg. Use the planner below for what to
              do today, what to book, what to pack, and what to ask in Italian.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stops.map((stop, idx) => {
              const activities = activitiesByStop.get(stop.id) ?? [];
              const hotelIsTodo = stop.hotel.name.startsWith('TODO');
              return (
                <li key={stop.id}>
                  <article className="group flex h-full flex-col rounded-[22px] border border-white/62 bg-white/50 p-5 shadow-[0_18px_60px_rgba(35,33,31,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-[0_26px_90px_rgba(58,56,50,0.11)]">
                    <header className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-3xl font-light leading-none text-[#103F35]">
                        {idx + 1}. {stop.label}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        {stop.checkIn} → {stop.checkOut} · {stop.nights}{' '}
                        {stop.nights === 1 ? 'night' : 'nights'}
                      </p>
                    </header>
                    <p className="mt-5 text-sm text-[color:var(--text-primary)]">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        Hotel ·{' '}
                      </span>
                      {hotelIsTodo ? (
                        <em className="text-[color:var(--text-secondary)]">
                          to confirm
                        </em>
                      ) : (
                        stop.hotel.name
                      )}
                    </p>
                    {stop.driveFromPrevious ? (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        Drive from {stop.driveFromPrevious.from} ·{' '}
                        {stop.driveFromPrevious.approxHours}h
                      </p>
                    ) : null}
                    {stop.highlights && stop.highlights.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {stop.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-full border border-[rgba(58,56,50,0.12)] bg-[#E8EFE9]/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#103F35]"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {activities.length > 0 ? (
                      <ul className="mt-auto space-y-2 border-t border-[rgba(35,33,31,0.06)] pt-4">
                        {activities.map((a, i) => (
                          <li key={`${a.label}-${i}`} className="text-sm">
                            <p className="text-[color:var(--text-primary)]">
                              {a.label}
                            </p>
                            {a.note ? (
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                                {a.note}
                                {typeof a.costEur === 'number'
                                  ? ` · €${a.costEur}`
                                  : ''}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Travel tools" className="mb-12">
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
              Travel tools
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.6rem)] font-light leading-none">
              Ask, split, translate, decide.
            </h2>
          </div>
          <div className="grid gap-5 xl:grid-cols-3 xl:items-start">
          <DayPlanner payload={payload} storageScope={storageScope} />
          <VoiceTranslator />
          <CostSplitter
            storageKey={`voyage:costs:${storageScope}`}
            travellers={payload.travellers}
            defaultCurrency={tripCurrency}
            homeCurrency={homeCurrency}
            defaultBudgetNzd={payload.budget?.estimatedTotalNzd ?? 0}
            categories={categories}
          />
          </div>
        </section>

        {isTemplate ? (
          <section
            aria-label="Template CTA"
            className="rounded-[28px] border border-[rgba(58,56,50,0.16)] bg-[linear-gradient(135deg,rgba(255,255,255,0.74),rgba(232,239,233,0.58))] p-8 text-center shadow-[0_22px_80px_rgba(35,33,31,0.08)] backdrop-blur-xl"
          >
            <Sparkles className="mx-auto h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
            <h2 className="mt-4 font-display text-4xl font-light leading-none text-[color:var(--text-primary)]">
              Want your own trip board?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
              This is a generic template. Talk to voyage in chat to sketch your
              own itinerary, then we&apos;ll wire it up to a private share link only
              your travel whānau can see.
            </p>
            <Link
              href="/app/chat?kete=toro&amp;agent=VOYAGE"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(232,239,233,0.64))] px-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#103F35] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_16px_42px_rgba(58,56,50,0.13)] backdrop-blur-xl transition hover:-translate-y-0.5"
            >
              Open voyage in chat
            </Link>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-[rgba(35,33,31,0.08)] pt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            assembl · hāpai · every plan is a draft
          </p>
        </footer>
      </div>
    </main>
  );
}

function TripFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Plane;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/62 bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.74)]">
      <Icon className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[color:var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function BudgetItem({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="bg-white/54 p-5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {label}
      </dt>
      <dd className={strong ? 'mt-3 font-mono text-2xl font-medium text-[#103F35]' : 'mt-3 font-mono text-xl text-[color:var(--text-primary)]'}>
        {value}
      </dd>
    </div>
  );
}
