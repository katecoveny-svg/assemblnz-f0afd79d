import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Fuel, MapPin, Clock, TrendingDown } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { RoutePlanner } from './RoutePlanner';

export const metadata: Metadata = {
  title: 'Tōro · Route + fuel',
  description:
    'The route + fuel agent. Plain-language plan for the next trip — distance, time, real fuel cost against this week\'s MBIE prices, and the cheaper station nearby.',
};

export default function ToroRoutePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(74, 165, 168, 0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Tōro · Whānau · Route + fuel
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}
              >
                The drive,
                <br />
                <em className="not-italic text-gradient-hero">in plain language.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Type where you're going. Get one calm sentence — how far, how long,
                roughly how much fuel — and the cheaper station nearby. Priced
                against this week's MBIE national-average fuel monitoring. Routed
                by MapBox.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The planner */}
      <section className="relative bg-[color:var(--assembl-paper)] pb-16">
        <div className="container">
          <SectionReveal>
            <RoutePlanner />
          </SectionReveal>
        </div>
      </section>

      {/* What it's pulling from */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                What it's pulling from
              </p>
              <h2
                className="mt-4 font-display leading-[0.98] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                Real sources. No vibes.
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3 md:gap-8">
            <SourceCard
              icon={<Fuel className="h-5 w-5" />}
              label="Fuel prices"
              title="MBIE Weekly Fuel Price Monitoring"
              body="The national-average retail prices for 91, 95, diesel, and EV residential overnight tariff. Published weekly by the Ministry of Business, Innovation and Employment. Scraped live; falls back to last-known-good values when MBIE is unreachable."
              url="mbie.govt.nz/.../weekly-fuel-price-monitoring/"
            />
            <SourceCard
              icon={<MapPin className="h-5 w-5" />}
              label="Routing"
              title="MapBox Directions API"
              body="NZ road network routing with traffic-aware durations. 100k free requests / month covers a tenant of 30 families running 15 trips a week each. Falls back to haversine straight-line × 1.35 NZ road factor when MapBox is unreachable."
              url="mapbox.com/directions"
            />
            <SourceCard
              icon={<TrendingDown className="h-5 w-5" />}
              label="Stations"
              title="Estimated · partnership in progress"
              body="Cheaper-station detection currently uses brand-typical price spreads (Gull / Waitomo discount band, Z / BP / Mobil premium band) around the MBIE average. Live per-station prices require a partnership with Gaspy or direct retailer feeds — both achievable, both unblocked."
              url="voyage-toro-features.md §A.1 — data partnerships"
            />
          </div>
        </div>
      </section>

      {/* Other whānau features on the roadmap */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                On the roadmap
              </p>
              <h2
                className="mt-4 font-display leading-[0.98] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                Eight more whānau agents.{' '}
                <em className="not-italic text-gradient-hero">All quiet, all useful.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each one wires to a real NZ data source — no vibes, no scrapes,
                no hallucinations. Full detail in <code className="font-mono text-sm">voyage-toro-features.md</code>.
              </p>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {ROADMAP.map((r) => (
              <article
                key={r.id}
                className="rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-white/40 p-6"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                  {r.id}
                </p>
                <h3
                  className="mt-3 font-display"
                  style={{ fontWeight: 400, fontSize: '1.4rem', lineHeight: 1.2 }}
                >
                  {r.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {r.body}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                  Source: {r.source}
                </p>
              </article>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <div className="mt-12 text-center">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Tell us which one to ship first
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}

function SourceCard({
  icon,
  label,
  title,
  body,
  url,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  body: string;
  url: string;
}) {
  return (
    <article className="rounded-[6px] border border-[rgba(35,33,31,0.10)] bg-white/40 p-7">
      <div className="flex items-center gap-2 text-[color:var(--assembl-pounamu)]">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">{label}</span>
      </div>
      <h3
        className="mt-5 font-display"
        style={{ fontWeight: 400, fontSize: '1.4rem', lineHeight: 1.2 }}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
      <p
        className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-tertiary,#8E8A82)]"
        style={{ wordBreak: 'break-all' }}
      >
        {url}
      </p>
    </article>
  );
}

const ROADMAP = [
  {
    id: 'A.2',
    name: 'Pātaka Kai · Meal + shop',
    body:
      'Reads what is in the fridge (from a photo), checks PaknSave / Countdown / New World specials, plans the week\'s meals around what is on sale and what the kids eat, generates the shopping list split by store for cheapest total.',
    source: 'Foodstuffs and Woolworths NZ public data + supermarket leaflet feeds',
  },
  {
    id: 'A.3',
    name: 'Wā Kuihi · Homework companion',
    body:
      'Personalised study plan per child, aligned to the NZ Curriculum and Te Marautanga o Aotearoa. Voice-mode for younger kids; written brief for parents on Sunday evening.',
    source: 'NZC + TMoA published curriculum + the child\'s own work record',
  },
  {
    id: 'A.4',
    name: 'Hauora Whānau · Wellness cadence',
    body:
      'Coordinates GP visits, vaccinations, dental, optometry across the household. Plays nicely with My Health Account. Surfaces overdue appointments before the school medical form is due.',
    source: 'Te Whatu Ora — My Health Account + Health NZ booking partners',
  },
  {
    id: 'A.5',
    name: 'Pūtea Whānau · Household finance coach',
    body:
      'Akahu-powered bank-feed, Working-for-Families reconciliation, KiwiSaver projection, debt trajectory. Monthly Financial-Life statement (sealed pack).',
    source: 'Akahu Open Finance, IRD MyIR, MSD MyMSD',
  },
  {
    id: 'A.6',
    name: 'Manaaki Tāone · Community connector',
    body:
      'Finds local kai-share, te reo classes, kura kaupapa, library events, free school-holiday programmes near you. Cross-references the weather and what the kids actually like doing.',
    source: 'Council event APIs (AT, Wellington, Christchurch), Eventfinda, RNZ events',
  },
  {
    id: 'A.7',
    name: 'Whakapapa Keeper · Family memory',
    body:
      'Helps the whānau gather, store, and pass on whakapapa. Birthday and anniversary reminders, bedtime story mode that reads ancestor stories aloud to the kids. Consent-gated; never used to train models.',
    source: 'Iwi-authored content, the whānau\'s own uploads, Papers Past for context',
  },
  {
    id: 'A.8',
    name: 'Tōkihi · Calendar conductor',
    body:
      'The smart family calendar. Two parents, three kids, four schools, six clubs. Detects clashes and pings the person whose turn it actually is. Auto-blocks NZ school terms and public holidays.',
    source: 'Google Calendar + iCloud + MoE term-date publications',
  },
  {
    id: 'A.9',
    name: 'Whakaata Whānau · The Sunday brief',
    body:
      'One restrained note at 7pm Sunday: three things the household needs to know for the week. Who is on the school run, who is paying for what, what the weather looks like, what is in the fridge.',
    source: 'All of the above, composed into a single SMS or email.',
  },
];
