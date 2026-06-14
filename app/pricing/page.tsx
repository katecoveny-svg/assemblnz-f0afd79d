import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SelfServePlans } from '@/components/billing/SelfServePlans';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free tools, a Pilot Sprint, a kete pack, and Tōro for whānau. NZD, GST where shown.',
};

const TIERS = [
  {
    name: 'Free tools',
    price: '',
    body: 'Try the work, no sign-up.',
    cta: 'Try a free tool',
    href: '/hapai',
  },
  {
    name: 'Pilot Sprint',
    price: '$5,000 + GST',
    body: 'One workflow, proven on your data in ten working days.',
    cta: 'Book a Pilot Sprint',
    href: '/pilot-sprint',
    featured: true,
  },
  {
    name: 'Kete pack',
    price: '$5,000 / month',
    body: 'A full pack of agents for your industry, live and maintained.',
    cta: 'See kete packs',
    href: '/industry-pack',
  },
  {
    name: 'Tōro (family)',
    price: '$29 / month',
    body: 'The family organiser — school notices, weekly plans, gear lists.',
    cta: 'See Tōro',
    href: '/kete/toro',
  },
] as const;

export default function PricingPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Pricing</p>
            <h1 className="mt-6 font-display text-display-xl font-light">Simple pricing.</h1>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={
                  'featured' in tier && tier.featured
                    ? 'flex min-h-[340px] flex-col rounded-[8px] border border-[color:var(--assembl-pounamu)] bg-white/70 p-8 shadow-card-hover'
                    : 'flex min-h-[340px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/45 p-8'
                }
              >
                <h2 className="font-display text-display-md font-light">{tier.name}</h2>
                {tier.price ? (
                  <p className="mt-4 font-display text-2xl font-light text-[color:var(--text-primary)]">{tier.price}</p>
                ) : null}
                <p className="mt-5 text-body-md text-[color:var(--text-body)]">{tier.body}</p>
                <Link
                  href={tier.href}
                  className={
                    'featured' in tier && tier.featured
                      ? 'cta-primary mt-auto inline-flex h-12 items-center justify-center px-6'
                      : 'btn-ghost mt-auto inline-flex h-12 items-center justify-center px-6'
                  }
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Self-serve — kept alongside the four lines. */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              Self-serve · between the free tools and a kete pack
            </p>
            <h2 className="mt-5 font-display text-display-lg font-light">Convert with a card, no sales call.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Liked a HAPAI tool? Turn it on for real work. Solo is one kete for one person; Team is
              every kete for up to five. Cancel any time.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <SelfServePlans />
          </div>
        </div>
      </section>
    </main>
  );
}
