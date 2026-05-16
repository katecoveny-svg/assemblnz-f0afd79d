import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TeReo } from '@/components/site/TeReo';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Tōro, Industry Pack, Pilot Sprint, and Outcome pricing. NZD, GST exclusive.',
};

const OFFERS = [
  {
    eyebrow: 'Whānau',
    name: 'Tōro',
    price: '$29 / month',
    body: 'Per whānau. School, money, routines, handovers, and the week ahead.',
    cta: 'Install Tōro',
    href: '/toro',
    featured: false,
  },
  {
    eyebrow: 'Hero offer',
    name: 'Industry Pack',
    price: '$5,000 / month',
    body: 'Per kete. 6-8 specialist agents. Iho governance. Signal monitoring. Unlimited evidence packs.',
    cta: 'See Industry Pack',
    href: '/industry-pack',
    featured: true,
  },
  {
    eyebrow: 'Proof sprint',
    name: 'Pilot Sprint',
    price: '$5,000 once-off',
    body: 'Two weeks. We run one workflow end-to-end against your own data and ship the evidence pack.',
    cta: 'Book a sprint',
    href: '/pilot-sprint',
    featured: false,
  },
  {
    eyebrow: 'Outcome',
    name: 'Outcome',
    price: 'Custom',
    body: 'For operators who want us paid on signed evidence packs delivered, not seats.',
    cta: 'Talk to founder',
    href: '/contact',
    featured: false,
  },
] as const;

const ADD_ONS = [
  ['Extra compliance review', '$750/mo'],
  ['Gamified adoption', '$500/mo'],
  ['Custom voice', '$500/mo'],
  ['Multi-site', '$900/site'],
  ['Dedicated support', '$1,200/mo'],
  ['On-call response', '$2,000/mo'],
] as const;

export default function PricingPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              Pricing · NZD, GST exclusive
            </p>
            <h1 className="mt-6 font-display text-display-xl font-light">
              <TeReo title="work">Mahi</TeReo> that earns its proof.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Four clean ways in: family, flat-rate industry fleet, two-week proof sprint, or outcome-based work.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="grid gap-4 lg:grid-cols-4">
            {OFFERS.map((offer) => (
              <article
                key={offer.name}
                className={
                  offer.featured
                    ? 'flex min-h-[460px] flex-col rounded-[8px] border border-[color:var(--assembl-pounamu)] bg-white/70 p-8 shadow-card-hover'
                    : 'flex min-h-[460px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/45 p-8'
                }
              >
                <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
                  {offer.eyebrow}
                </p>
                <h2 className="mt-5 font-display text-display-md font-light">
                  {offer.name === 'Tōro' ? <TeReo>Tōro</TeReo> : offer.name}
                </h2>
                <p className="mt-8 font-display text-display-md font-light">{offer.price}</p>
                <p className="mt-6 text-body-md text-[color:var(--text-body)]">{offer.body}</p>
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

          <div className="mt-12">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              Add-ons
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ADD_ONS.map(([label, price]) => (
                <span
                  key={label}
                  className="group relative rounded-full border border-[rgba(43,107,87,0.34)] bg-white/55 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--text-primary)]"
                >
                  {label}
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-[6px] bg-[color:var(--text-primary)] px-3 py-1.5 text-[11px] text-[color:var(--assembl-paper)] opacity-0 shadow-card transition group-hover:opacity-100">
                    {price}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

