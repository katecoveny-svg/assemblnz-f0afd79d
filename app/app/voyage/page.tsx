import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VoyageNewTripForm } from './VoyageNewTripForm';

export const metadata: Metadata = {
  title: 'voyage · assembl',
  description:
    'Multi-destination trip planning with day-by-day itineraries, bookable activities, and FX-aware budgets.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session + the user's trip_plans per request.
export const dynamic = 'force-dynamic';

type TripSummary = {
  id: string;
  name: string;
  departure_date: string;
  return_date: string;
  status: string;
  currency: string;
  destinationCount: number;
  dayCount: number;
};

export default async function VoyagePage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/app/voyage');
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect('/login?redirect=/app/voyage');
  }

  // RLS narrows trip_plans to rows where the user is a trip_members row.
  // Two passes (one count per trip) is acceptable at this scale — Kate's
  // trip count is single digits.
  const { data: trips, error } = await supabase
    .from('trip_plans')
    .select('id, name, departure_date, return_date, status, currency')
    .order('departure_date', { ascending: true });

  const summaries: TripSummary[] = [];
  if (trips && !error) {
    for (const t of trips) {
      const [{ count: destCount }, { count: dayCount }] = await Promise.all([
        supabase
          .from('trip_destinations')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', t.id),
        supabase
          .from('trip_days')
          .select('id', { count: 'exact', head: true })
          .eq('trip_id', t.id),
      ]);
      summaries.push({
        id: t.id,
        name: t.name,
        departure_date: t.departure_date,
        return_date: t.return_date,
        status: t.status,
        currency: t.currency,
        destinationCount: destCount ?? 0,
        dayCount: dayCount ?? 0,
      });
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <p className="font-mono text-[12px] lowercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            assembl · tōro · whānau
          </p>
          <h1
            className="mt-4 font-display leading-[0.95] tracking-tight text-[color:var(--text-primary)]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 6vw, 3.75rem)' }}
          >
            voyage.
          </h1>
          <p className="mt-4 text-base text-[color:var(--text-body)]">
            Multi-destination trip planning. Talk to <em>voyage</em> in chat to
            draft an itinerary, then save it here to keep the days, activities,
            and budget in one place.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-light text-[color:var(--text-primary)]">
            Your trips
          </h2>
          {summaries.length === 0 ? (
            <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6">
              <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
                No trips yet. Plan one below, or open{' '}
                <Link
                  href="/app/chat?kete=toro&agent=VOYAGE"
                  className="underline decoration-[color:var(--assembl-pounamu)] underline-offset-2"
                >
                  voyage in chat
                </Link>{' '}
                first to sketch an itinerary.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {summaries.map((trip) => (
                <li key={trip.id}>
                  <article className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6 transition hover:bg-white/75">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                          {trip.name}
                        </h3>
                        <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                          {trip.departure_date} → {trip.return_date} ·{' '}
                          {trip.dayCount} days · {trip.destinationCount}{' '}
                          destinations · {trip.status} · {trip.currency}
                        </p>
                      </div>
                      <Link
                        href={`/app/chat?kete=toro&agent=VOYAGE&trip=${trip.id}`}
                        className="shrink-0 rounded-full bg-[color:var(--assembl-ink)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--assembl-paper)] transition hover:opacity-80"
                      >
                        Open in chat
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-light text-[color:var(--text-primary)]">
            Plan a new trip
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-[color:var(--text-body)]">
            Describe your trip in plain English — destinations, dates,
            travellers, must-dos, budget. Voyage will draft the structured
            plan: days, activities, costs in EUR, must-book-ahead flags.
            You can refine it in chat before booking anything.
          </p>
          <VoyageNewTripForm ownerId={user.id} />
        </section>

        <footer className="mt-16 border-t border-[rgba(35,33,31,0.08)] pt-6 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            voyage · part of the tōro whānau kete · every plan is a draft
          </p>
        </footer>
      </div>
    </main>
  );
}
