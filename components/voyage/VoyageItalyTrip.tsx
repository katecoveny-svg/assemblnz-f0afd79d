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

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <p className="font-mono text-[11px] lowercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            assembl · hāpai · voyage
          </p>
          <h1
            className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(2rem, 6vw, 3rem)' }}
          >
            {payload.title}
          </h1>
          {isTemplate ? (
            <p className="mt-3 inline-block rounded-full bg-[rgba(35,33,31,0.06)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              sample template · no real data
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
            {payload.travellers.map((t) => t.name).join(' + ')}
            {payload.tripStartDate ? (
              <>
                {' · '}
                {payload.tripStartDate} → {payload.tripEndDate}
              </>
            ) : null}
            {payload.totalNights ? <> · {payload.totalNights} nights</> : null}
          </p>
        </header>

        {payload.budget ? (
          <section
            aria-label="Budget summary"
            className="mb-8 rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-5"
          >
            <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Budget rollup
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-[color:var(--text-secondary)]">Accommodation</dt>
              <dd className="text-right font-mono text-[color:var(--text-primary)]">
                {fmtNzd(payload.budget.accommodationNzd)}
              </dd>
              <dt className="text-[color:var(--text-secondary)]">Flights</dt>
              <dd className="text-right font-mono text-[color:var(--text-primary)]">
                {fmtNzd(payload.budget.flightsNzd)}
              </dd>
              <dt className="text-[color:var(--text-primary)]">
                <strong>Estimated total</strong>
              </dt>
              <dd className="text-right font-mono text-[color:var(--text-primary)]">
                <strong>{fmtNzd(payload.budget.estimatedTotalNzd)}</strong>
              </dd>
            </dl>
          </section>
        ) : null}

        <section aria-label="Itinerary" className="mb-10">
          <h2 className="mb-4 font-display text-2xl font-light text-[color:var(--text-primary)]">
            Itinerary
          </h2>
          <ol className="space-y-4">
            {stops.map((stop, idx) => {
              const activities = activitiesByStop.get(stop.id) ?? [];
              const hotelIsTodo = stop.hotel.name.startsWith('TODO');
              return (
                <li key={stop.id}>
                  <article className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
                    <header className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                        {idx + 1}. {stop.label}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        {stop.checkIn} → {stop.checkOut} · {stop.nights}{' '}
                        {stop.nights === 1 ? 'night' : 'nights'}
                      </p>
                    </header>
                    <p className="mt-3 text-sm text-[color:var(--text-primary)]">
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
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {stop.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-full bg-[rgba(35,33,31,0.06)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {activities.length > 0 ? (
                      <ul className="mt-4 space-y-2 border-t border-[rgba(35,33,31,0.06)] pt-3">
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

        <section aria-label="Tools" className="mb-10 space-y-5">
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
        </section>

        {isTemplate ? (
          <section
            aria-label="Template CTA"
            className="rounded-card border border-[rgba(35,33,31,0.10)] bg-[rgba(35,33,31,0.04)] p-5 text-center"
          >
            <h2 className="font-display text-xl font-light text-[color:var(--text-primary)]">
              Want your own trip board?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
              This is a generic template. Talk to voyage in chat to sketch your
              own itinerary, then we'll wire it up to a private share link only
              your travel whānau can see.
            </p>
            <a
              href="/app/chat?kete=toro&amp;agent=VOYAGE"
              className="mt-4 inline-block rounded-card bg-[color:var(--assembl-ink)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-85"
            >
              Open voyage in chat
            </a>
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
