import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/site/Eyebrow';
import { SectionReveal } from '@/components/SectionReveal';
import { HowAPackWorks } from '@/components/site/HowAPackWorks';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'A Pilot Sprint to start, Starter and Pack to run, and Outcome for bespoke work. NZD, GST exclusive.',
};

// A Pilot Sprint is the once-off way in. Starter and Pack are the two monthly
// ways to run. Outcome is bespoke. A Sprint covers month one of Starter or Pack,
// so that credit is stated on the Sprint and on both monthly tiers.
const CREDIT_NOTE = 'Your Sprint covers your first month of Starter or Pack.';

const MONTHLY = [
  {
    name: 'Starter',
    price: '$799 + GST / month',
    body: 'One agent live for your team — say, the food-safety draft for a single café, or the WoF readiness check for a three-vehicle fleet. All HAPAI tools, and a reply from us within a working day.',
    note: 'A Pilot Sprint covers your first month.',
    cta: 'Book a Pilot Sprint',
    href: '/pilot-sprint',
  },
  {
    name: 'Pack',
    price: '$3,500 + GST / month',
    body: 'The whole kete for your industry. For Manaaki that is the eight hospitality agents — allergens, licensing, rostering, incident log, supplier compare, guest reply, food safety, manager certificates. Live NZ source feeds. All HAPAI tools. A named human on the assembl side.',
    note: 'A Pilot Sprint covers your first month.',
    cta: 'See the pack',
    href: '/industry-pack',
    featured: true,
  },
  {
    name: 'Outcome',
    price: 'Custom',
    body: 'Pay per signed-off output — a set price for each allergen report, RFI pack, or submission. A known cost on every piece of compliance you hand over.',
    cta: 'Talk to us',
    href: '/contact',
  },
] as const;

export default function PricingPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      {/* Hero */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow label="Pricing" className="justify-center" />
            <h1 className="mt-6 font-display text-display-xl font-light">
              Simple <em className="not-italic text-[color:var(--assembl-pounamu)]">pricing.</em>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              One way in, two ways to run, and a custom path for bespoke work. All prices NZD, GST
              exclusive.
            </p>
          </div>
        </div>
      </section>

      {/* The way in — Pilot Sprint */}
      <section className="border-t border-[rgba(35,33,31,0.08)] py-16 lg:py-20">
        <div className="container">
          <SectionReveal>
            <article className="glass-card glass-card-hover mx-auto flex max-w-4xl flex-col gap-8 p-8 ring-1 ring-[color:var(--assembl-pounamu)] lg:flex-row lg:items-center lg:p-10">
              <div className="lg:flex-1">
                <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                  Start here
                </p>
                <h2 className="mt-4 font-display text-display-lg font-light">Pilot Sprint</h2>
                <p className="mt-3 font-display text-2xl font-light">$5,000 + GST · once</p>
                <p className="mt-5 max-w-xl text-body-md text-[color:var(--text-body)]">
                  Ten working days. One workflow your team already does by hand, drafted from your
                  data, sealed in an evidence pack.
                </p>
                <p className="mt-4 inline-block rounded-[12px] bg-[rgba(43,107,87,0.07)] px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] leading-relaxed text-[color:var(--assembl-pounamu)]">
                  {CREDIT_NOTE}
                </p>
              </div>
              <div className="lg:w-auto">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 items-center justify-center px-7"
                >
                  Book a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </article>
          </SectionReveal>
        </div>
      </section>

      {/* How a pack works in your business — sits between the Sprint and the Pack */}
      <HowAPackWorks />

      {/* The two monthly ways to run + Outcome */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow label="Run it month to month" accent="var(--assembl-gold)" className="justify-center" />
            <h2 className="mt-5 font-display text-display-lg font-light">
              Two ways to run, <em className="not-italic text-[color:var(--assembl-pounamu)]">cancel any month.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {MONTHLY.map((tier) => (
              <article
                key={tier.name}
                className={
                  'featured' in tier && tier.featured
                    ? 'glass-card glass-card-hover flex min-h-[340px] flex-col p-8 ring-1 ring-[color:var(--assembl-pounamu)]'
                    : 'glass-card glass-card-hover flex min-h-[340px] flex-col p-8'
                }
              >
                <h3 className="font-display text-display-md font-light">{tier.name}</h3>
                <p className="mt-4 font-display text-2xl font-light text-[color:var(--text-primary)]">
                  {tier.price}
                </p>
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

      {/* Looking for whānau life? — Tōro lives on its own page */}
      <section className="border-t border-[rgba(35,33,31,0.08)] py-14">
        <div className="container">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <p className="text-body-md text-[color:var(--text-body)]">Looking for whānau life?</p>
            <Link
              href="/toro"
              className="inline-flex items-center gap-2 rounded-sm font-medium text-[color:var(--assembl-pounamu)] underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            >
              Meet Tōro — the family assistant, $29/month
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
