import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SelfServePlans } from '@/components/billing/SelfServePlans';
import { Eyebrow } from '@/components/site/Eyebrow';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free tools, a Pilot Sprint, a kete pack, and Tōro for whānau. NZD, GST where shown.',
};

// Each tier states a clear price and what the customer gets for it. The Sprint
// is a one-off; the Kete pack is recurring — and a Sprint rolls into month one
// of a pack, so the upsell note appears on both.
const TIERS = [
  {
    name: 'Free tools',
    price: 'Free',
    body: 'Open any HAPAI tool and run one real task. No sign-up.',
    cta: 'Try a free tool',
    href: '/hapai',
  },
  {
    name: 'Pilot Sprint',
    price: '$5,000 + GST · once',
    body: 'Ten working days. One workflow drafted, run on your data, and sealed in an evidence pack.',
    note: 'Continue to a Kete pack and your Sprint covers month one — then $3,500/month.',
    cta: 'Book a Pilot Sprint',
    href: '/pilot-sprint',
    featured: true,
  },
  {
    name: 'Kete pack',
    price: '$3,500 + GST / month',
    body: 'The full specialist pack, live for the team: agents, workflows, live knowledge, and an evidence pack every week. Cancel any month.',
    note: 'Sprint first and your Sprint covers month one — then $3,500/month.',
    cta: 'See kete packs',
    href: '/industry-pack',
  },
  {
    name: 'Tōro (family)',
    price: '$29 + GST / month',
    body: 'The family pack — school notices, weekly plans, and gear lists in one place.',
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
            <Eyebrow label="Pricing" className="justify-center" />
            <h1 className="mt-6 font-display text-display-xl font-light">
              Simple <em className="italic text-[color:var(--assembl-pounamu)]">pricing.</em>
            </h1>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <article
                key={tier.name}
                className={
                  'featured' in tier && tier.featured
                    ? 'glass-card glass-card-hover flex min-h-[340px] flex-col p-8 ring-1 ring-[color:var(--assembl-pounamu)]'
                    : 'glass-card glass-card-hover flex min-h-[340px] flex-col p-8'
                }
              >
                <h2 className="font-display text-display-md font-light">{tier.name}</h2>
                {tier.price ? (
                  <p className="mt-4 font-display text-2xl font-light text-[color:var(--text-primary)]">{tier.price}</p>
                ) : null}
                <p className="mt-5 text-body-md text-[color:var(--text-body)]">{tier.body}</p>
                {'note' in tier && tier.note ? (
                  <p className="mt-4 rounded-[12px] bg-[rgba(43,107,87,0.07)] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] leading-relaxed text-[color:var(--assembl-pounamu)]">
                    {tier.note}
                  </p>
                ) : null}
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
            <Eyebrow label="Self-serve · between the free tools and a kete pack" accent="var(--assembl-gold)" className="justify-center" />
            <h2 className="mt-5 font-display text-display-lg font-light">
              Convert with a card, <em className="italic text-[color:var(--assembl-pounamu)]">no sales call.</em>
            </h2>
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
