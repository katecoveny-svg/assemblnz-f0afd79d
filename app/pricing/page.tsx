import { HeroPage } from '@/components/site/HeroPage';
import { FadeUp } from '@/components/motion/FadeUp';
import { VESSEL_ASSETS } from '@/lib/site-config';
import Link from 'next/link';

/**
 * /pricing — Phase 1 placeholder.
 * Full Stripe checkout integration in Phase 1B (post-demo).
 * For now: hero + three tiers + Pilot Sprint as entry point.
 */

export const metadata = {
  title: 'Pricing — assembl',
  description:
    'Three ways to start. Subscribe. Pay per output. Pay per resolution. The Pilot Sprint is the right entry point for every new business.',
};

export default function PricingPage() {
  return (
    <>
      <HeroPage
        eyebrow="05 — PRICING"
        headline={['Three ways to start.']}
        body="Subscribe. Pay per output. Pay per resolution. The Pilot Sprint is the right entry point for every new business — fixed scope, fixed price, evidence in two weeks."
        ctaPrimary={{ label: 'Start a Pilot Sprint →', href: '/pilot-sprint' }}
        ctaSecondary={{ label: 'See how it works', href: '/how-it-works' }}
        vesselSrc={VESSEL_ASSETS.portrait4x5}
        vesselAlt="assembl Evidence Vessel — pricing"
        noImage
      />

      {/* Pricing tiers */}
      <section className="bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              THREE TIERS · PHASE 1B FULL CHECKOUT COMING SHORTLY
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Pilot Sprint */}
            <FadeUp>
              <article className="relative flex flex-col rounded-xl border-2 border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-paper)] p-8">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[color:var(--assembl-pounamu-paper)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--assembl-pounamu)]">
                    Start here
                  </span>
                </div>
                <h2
                  className="mt-4 font-display leading-tight text-[color:var(--text-primary)]"
                  style={{ fontWeight: 400, fontSize: '1.5rem' }}
                >
                  Pilot Sprint
                </h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-tertiary)]">
                  Fixed scope · fixed price
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-[color:var(--text-body)]">
                  One workflow. Two weeks. A custom kete build grounded in your industry legislation. Evidence pack on day fourteen. No ongoing commitment.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    'Discovery session with Kate',
                    'Custom kete build',
                    'Five-stage pipeline',
                    'Evidence pack output',
                    'Handoff documentation',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-[color:var(--text-body)]">
                      <span className="text-[color:var(--assembl-pounamu)]">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    href="/pilot-sprint"
                    className="inline-flex w-full h-12 items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)]"
                  >
                    Book a Pilot Sprint →
                  </Link>
                </div>
              </article>
            </FadeUp>

            {/* Subscribe */}
            <FadeUp delay={0.05}>
              <article className="flex flex-col rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-40 bg-[color:var(--assembl-paper)] p-8">
                <h2
                  className="mt-4 font-display leading-tight text-[color:var(--text-primary)]"
                  style={{ fontWeight: 400, fontSize: '1.5rem' }}
                >
                  Subscription
                </h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-tertiary)]">
                  Monthly · kete access
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-[color:var(--text-body)]">
                  Ongoing access to your kete. Run workflows on demand. Every output an evidence pack. Full audit trail maintained.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    'Unlimited workflow runs',
                    'Full kete specialist access',
                    'Evidence pack per output',
                    'Seven-year audit trail',
                    'Monthly compliance scan',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-[color:var(--text-body)]">
                      <span className="text-[color:var(--assembl-pounamu)]">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    href="/contact"
                    className="inline-flex w-full h-12 items-center justify-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)]"
                  >
                    Get in touch →
                  </Link>
                </div>
              </article>
            </FadeUp>

            {/* Resolution */}
            <FadeUp delay={0.1}>
              <article className="flex flex-col rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-40 bg-[color:var(--assembl-paper)] p-8">
                <h2
                  className="mt-4 font-display leading-tight text-[color:var(--text-primary)]"
                  style={{ fontWeight: 400, fontSize: '1.5rem' }}
                >
                  Per resolution
                </h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-tertiary)]">
                  Pay when it ships
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-[color:var(--text-body)]">
                  Pay per signed evidence pack. No subscription, no monthly commitment. Right for businesses with occasional but high-stakes workflows.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    'Per signed output',
                    'No subscription',
                    'All five pipeline stages',
                    'Evidence pack included',
                    'Audit trail maintained',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-[color:var(--text-body)]">
                      <span className="text-[color:var(--assembl-pounamu)]">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <Link
                    href="/contact"
                    className="inline-flex w-full h-12 items-center justify-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)]"
                  >
                    Get in touch →
                  </Link>
                </div>
              </article>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <p className="max-w-3xl font-mono text-[11px] leading-relaxed text-[color:var(--text-tertiary)]">
              Full pricing, including NZD amounts, appears at checkout. Stripe payment processing. No credit card required to start a Pilot Sprint discovery session. Stripe checkout integration coming Phase 1B.
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
