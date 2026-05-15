import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  INDUSTRY_PACK_PLAN,
  OUTCOME_OFFER,
  PILOT_SPRINT,
  PRICING_NOTE,
  SUBSCRIBE_PLANS,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Tōro Family, Industry Pack, Pilot Sprint, and Outcome pricing. NZD, GST exclusive.',
};

const OFFERS = [
  {
    eyebrow: 'Whānau',
    name: SUBSCRIBE_PLANS[0].name,
    price: SUBSCRIBE_PLANS[0].monthly,
    setup: SUBSCRIBE_PLANS[0].setup,
    body: SUBSCRIBE_PLANS[0].summary,
    features: SUBSCRIBE_PLANS[0].features,
    cta: 'Start Tōro',
    href: '/toro',
    featured: false,
  },
  {
    eyebrow: 'Try before you buy',
    name: 'Pilot Sprint',
    price: 'NZ$5,000 once-off',
    setup: 'No subscription required',
    body: PILOT_SPRINT.bannerCopy,
    features: ['Two weeks', 'One workflow', 'One evidence pack', 'Refund if no time saved'],
    cta: 'Book a Pilot Sprint',
    href: '/pilot-sprint',
    featured: false,
  },
  {
    eyebrow: 'Flat-rate operations',
    name: INDUSTRY_PACK_PLAN.name,
    price: INDUSTRY_PACK_PLAN.monthly,
    setup: INDUSTRY_PACK_PLAN.setup,
    body: INDUSTRY_PACK_PLAN.summary,
    features: INDUSTRY_PACK_PLAN.features,
    cta: 'See Industry Pack',
    href: '/industry-pack',
    featured: true,
  },
  {
    eyebrow: 'Bespoke',
    name: OUTCOME_OFFER.name,
    price: OUTCOME_OFFER.price,
    setup: 'Scoped engagement',
    body: OUTCOME_OFFER.summary,
    features: ['Custom workflow map', 'Named engagement team', 'Evidence-pack contract'],
    cta: 'Talk to us',
    href: '/contact',
    featured: false,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] py-24 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-secondary)]">
              Pricing · NZD, GST exclusive
            </p>
            <h1 className="mt-6 font-display text-6xl font-light leading-[0.92] md:text-7xl">
              One flat industry pack. One pilot to prove it.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[color:var(--text-body)]">
              {PRICING_NOTE} Use code ANNUAL12 for 12% off annual. Start with a Pilot Sprint, then
              decide whether the monthly Industry Pack is right for your team.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <Link
            href="/industry-pack"
            className="group grid gap-6 border border-[rgba(212,168,83,0.45)] bg-white/50 p-8 transition duration-200 hover:-translate-y-0.5 md:grid-cols-[1fr_auto] md:items-center md:p-10"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--assembl-pounamu)]">
                Industry Pack
              </p>
              <h2 className="mt-3 font-display text-4xl font-light leading-[0.98] md:text-5xl">
                NZ$5,000 a month. Pick one kete, switch any time.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)]">
                Six to eight specialist agents sequenced into one operating loop: find work, quote
                it, run it, close the books.
              </p>
            </div>
            <span className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 text-sm font-semibold text-white">
              See what&apos;s inside
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="grid gap-px border border-[rgba(212,168,83,0.32)] bg-[rgba(212,168,83,0.32)] md:grid-cols-2 lg:grid-cols-4">
            {OFFERS.map((offer) => (
              <article key={offer.name} className="flex min-h-[430px] flex-col bg-[color:var(--assembl-paper)] p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                  {offer.eyebrow}
                </p>
                <h2 className="mt-5 font-display text-4xl font-light leading-none">{offer.name}</h2>
                <p className="mt-8 font-display text-4xl font-light leading-none">{offer.price}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {offer.setup}
                </p>
                <p className="mt-6 text-sm leading-relaxed text-[color:var(--text-body)]">{offer.body}</p>
                <ul className="mt-8 space-y-3 text-sm text-[color:var(--text-body)]">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-2 h-px w-4 bg-[color:var(--assembl-gold-thread)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={offer.href}
                  className={offer.featured ? 'cta-primary mt-auto inline-flex h-12 items-center justify-center px-6' : 'btn-ghost mt-auto inline-flex h-12 items-center justify-center px-6'}
                >
                  {offer.cta}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(212,168,83,0.36)] py-20 md:py-28">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
              The clean path
            </p>
            <h2 className="mt-5 font-display text-5xl font-light leading-[0.96] md:text-6xl">
              Try it for two weeks. Keep it if the time comes back.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-[color:var(--text-body)]">
              Pilot Sprint proves one workflow with one evidence pack. Industry Pack turns the
              whole operator&apos;s loop into a monthly fleet. Outcome stays available when the work
              is bespoke.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center justify-center px-8">
                Book a Pilot Sprint
              </Link>
              <Link href="/industry-pack" className="btn-ghost inline-flex h-12 items-center justify-center px-8">
                See Industry Pack
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
