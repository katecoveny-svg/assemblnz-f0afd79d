import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Webhook, FileJson, MapPin } from 'lucide-react';
import { Eyebrow } from '@/components/site/Eyebrow';
import { LandscapeBand } from '@/components/site/LandscapeBand';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import { DataLiveCounter } from '@/components/site/data/DataLiveCounter';
import { DataWaitlistForm } from '@/components/site/data/DataWaitlistForm';
import { getRegulatoryPulse } from '@/lib/regulatory-pulse';
import { WATCHED_SOURCE_COUNT } from '@/lib/watched-sources';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NZ regulatory data as an API',
  description:
    'Subscribe to changes from New Zealand’s government and authority sources — NZ Gazette, GETS tenders, MFAT Sanctions, WorkSafe, MPI recalls, NZ Customs tariff, Commerce Commission, and more. JSON in, alerts out. Built and run from Aotearoa.',
  alternates: { canonical: '/data' },
};

const USE_CASES = [
  {
    icon: FileJson,
    who: 'A law firm watching Commerce Commission decisions',
    what:
      'A webhook fires the moment a merger clearance or enforcement decision lands. No one on the team refreshes comcom.govt.nz again.',
  },
  {
    icon: MapPin,
    who: 'An export broker watching MFAT sanctions',
    what:
      'Screen counterparties against the current NZ sanctions list automatically, inside your own onboarding flow — not a quarterly PDF check.',
  },
  {
    icon: Webhook,
    who: 'A hospo SaaS tool watching MPI food recalls',
    what:
      'Every Food Act recall is pushed to your venues the day it is published. Your customers hear it from you first.',
  },
] as const;

interface Tier {
  name: string;
  price: string;
  cadence?: string;
  blurb: string;
  features: string[];
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Pulse',
    price: 'Free',
    blurb: 'Kick the tyres. Build a prototype. See if the data fits.',
    features: ['100 queries / month', '1-hour data freshness', 'Single source', 'No SLA'],
  },
  {
    name: 'Watcher',
    price: 'NZ$199',
    cadence: '/ month',
    blurb: 'One source, watched in real time, wired into your product.',
    features: ['10,000 queries / month', 'Real-time webhooks', 'One source of your choice', 'Email support'],
  },
  {
    name: 'Practice',
    price: 'NZ$799',
    cadence: '/ month',
    blurb: 'Every source, every change, the whole regulatory surface.',
    features: ['100,000 queries / month', 'Real-time webhooks', 'All sources', 'Email change alerts'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'Your sources, your SLA, your own index. Talk to Kate.',
    features: ['Volume pricing', 'Written SLA', 'Dedicated indexes', 'Custom & private sources'],
  },
];

export default async function DataApiPage() {
  const pulse = await getRegulatoryPulse();

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <PatternBackdrop
          className="absolute inset-0 -z-10"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="container relative z-10">
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Eyebrow label="Data · API" />
              <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.6rem,6vw,4.6rem)] font-light leading-[1.02] text-[color:var(--text-primary)]">
                NZ regulatory data{' '}
                <span className="text-[color:var(--assembl-pounamu)]">as an API.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[color:var(--text-body)] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed">
                Subscribe to changes from {WATCHED_SOURCE_COUNT} New Zealand government and
                authority sources — NZ Gazette, GETS tenders, MFAT Sanctions, WorkSafe, MPI
                recalls, NZ Customs tariff, Commerce Commission, and more.
              </p>
              <p className="mt-4 max-w-xl text-[color:var(--text-body)] text-base leading-relaxed">
                JSON in, alerts out. Built and run from Aotearoa — the same live feeds behind
                assembl’s evidence packs, now an endpoint your own tools can call.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="#get-access"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu)] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Get a free API key
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(35,33,31,0.18)] px-7 py-3.5 text-sm font-medium text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)]"
                >
                  See pricing
                </Link>
              </div>
            </div>

            <div className="lg:pt-10">
              <DataLiveCounter initial={pulse} />
            </div>
          </div>
        </div>
      </section>

      {/* Canonical landscape band */}
      <LandscapeBand />

      {/* Use cases */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="max-w-2xl">
            <Eyebrow label="Who it is for" />
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight">
              One feed. Many watchers.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)] leading-relaxed">
              If a New Zealand regulator publishes it, you can subscribe to it. Three of the
              tools already asking:
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {USE_CASES.map(({ icon: Icon, who, what }) => (
              <article
                key={who}
                className="flex flex-col rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--assembl-pounamu-paper)]">
                  <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-normal leading-snug text-[color:var(--text-primary)]">
                  {who}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {what}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-[rgba(35,33,31,0.08)] bg-white/40 py-20 lg:py-28">
        <div className="container">
          <div className="max-w-2xl">
            <Eyebrow label="Pricing" />
            <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-tight">
              Start free. Scale when it earns its keep.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)] leading-relaxed">
              Indicative tiers below. We are talking to first users now — tell us what you watch
              and we will size it with you.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-[12px] border p-6 ${
                  tier.featured
                    ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] shadow-[0_24px_70px_rgba(35,33,31,0.12)]'
                    : 'border-[rgba(35,33,31,0.12)] bg-[#FFF7EC]'
                }`}
              >
                {tier.featured ? (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white">
                    Most watched
                  </span>
                ) : null}
                <h3 className="font-display text-2xl font-normal text-[color:var(--text-primary)]">
                  {tier.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-light text-[color:var(--text-primary)]">
                    {tier.price}
                  </span>
                  {tier.cadence ? (
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
                      {tier.cadence}
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {tier.blurb}
                </p>
                <ul className="mt-5 space-y-2.5 border-t border-[rgba(35,33,31,0.10)] pt-5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[color:var(--text-body)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--text-secondary)]">
            All prices NZD, GST exclusive · webhooks deliver as changes land
          </p>
        </div>
      </section>

      {/* Get access — lead capture */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="max-w-md">
              <Eyebrow label="Get started" />
              <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-light leading-tight">
                Two ways in.
              </h2>
              <p className="mt-4 text-[color:var(--text-body)] leading-relaxed">
                Grab a free Pulse key and start building, or tell Kate what you need and we will
                wire a feed to fit. Either way, a named human in Aotearoa reads it.
              </p>
              <dl className="mt-8 space-y-5">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                    Where your data lives
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                    Indexed and served from Australia today, with a New Zealand region on the
                    roadmap. No US hop.
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                    What you can build on it
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[color:var(--text-body)]">
                    Compliance dashboards, screening steps, change alerts — anything that needs
                    to know the moment a NZ rule moves.
                  </dd>
                </div>
              </dl>
            </div>

            <DataWaitlistForm />
          </div>
        </div>
      </section>
    </main>
  );
}
