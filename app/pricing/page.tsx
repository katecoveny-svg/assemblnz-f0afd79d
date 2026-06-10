import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TeReo } from '@/components/site/TeReo';
import { SelfServePlans } from '@/components/billing/SelfServePlans';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Pilot Sprint, kete pack, HAPAI tools, and Outcome pricing. NZD, GST exclusive.',
};

const OFFERS = [
  {
    eyebrow: 'Hero offer',
    name: 'Kete pack',
    price: '$5,000 / month',
    body: 'Kete means basket or kit. This is one specialist operating pack: agents, tools, live knowledge, human review points, and evidence packs your team can stand behind.',
    cta: 'See kete packs',
    href: '/industry-pack',
    featured: true,
  },
  {
    eyebrow: 'Proof sprint',
    name: 'Pilot Sprint',
    price: '$5,000 once-off',
    body: 'Ten working days. Bring one real workflow; we build it, run it against your data, and leave you with a working proof.',
    cta: 'Book a sprint',
    href: '/pilot-sprint',
    featured: false,
  },
  {
    eyebrow: 'Outcome',
    name: 'Outcome',
    price: 'Custom',
    body: 'For operators who want a commercial model tied to reviewed work delivered, not seats.',
    cta: 'Talk to founder',
    href: '/contact',
    featured: false,
  },
  {
    eyebrow: 'Adoption tools',
    name: 'HAPAI tools',
    price: 'Public tools',
    body: 'HAPAI comes from hāpai: to lift or support. These are public one-task tools for meeting notes, travel planning, 9am Brief, share cards, food records, captions, and more.',
    cta: 'Open HAPAI',
    href: '/hapai',
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
              Start with one real task, open a public HAPAI tool, or switch on a
              specialist kete pack once the workflow has earned its proof.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(35,33,31,0.08)] py-20 lg:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              Self-serve · between the free tools and a kete pack
            </p>
            <h2 className="mt-5 font-display text-display-lg font-light">
              Convert with a card, no sales call.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Liked a HAPAI tool? Turn it on for real work. Solo is one kete for one
              person; Team is every kete for up to five. Cancel any time.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <SelfServePlans />
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
                  {offer.name}
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
