import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Subscribe, pay per output, or pay per resolution. Pilot Sprint comes first.',
};

// Locked numbers per PRICING-LOCKED.md (2026-04-08).
// Numbers are not to be changed. Bullets are short editorial summaries.
const TIERS = [
  {
    slug: 'operator',
    name: 'Operator',
    differentiator: 'Single team. One workflow.',
    monthly: '$1,490',
    bullets: [
      '1 kete',
      'Up to 5 seats',
      '50 outputs included',
      '$12 per extra output',
    ],
    cta: 'Start with Operator',
  },
  {
    slug: 'leader',
    name: 'Leader',
    differentiator: 'Multiple teams. Multiple kete.',
    monthly: '$1,990',
    bullets: [
      'All 5 kete',
      'Up to 15 seats',
      '150 outputs included',
      '$8 per extra output',
      'Weekly evidence pack',
    ],
    cta: 'Choose Leader',
    featured: true,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    differentiator: 'Mid-market NZ. Compliance-grade.',
    monthly: 'from $2,990',
    bullets: [
      'All kete',
      'Unlimited seats',
      '200 evidence packs / month',
      '99.9% SLA · NZ data residency',
      'Named kaitiaki contact',
    ],
    cta: 'Talk to Enterprise',
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative py-32 md:py-48"
        style={{ backgroundColor: 'var(--assembl-paper)' }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-start-2 lg:col-span-7">
              <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
                05 — Pricing
              </p>
              <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl">
                Three ways to{' '}
                <em className="not-italic text-gradient-hero">start</em>.
              </h1>
              <p className="mt-10 text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
                Subscribe, pay per output, or pay per resolution. Pilot Sprint
                comes first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pilot Sprint — the entry point ──────────────────────── */}
      <section
        className="relative py-32 md:py-48"
        style={{ backgroundColor: 'var(--assembl-paper)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
        >
          <div
            className="h-px w-full"
            style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-20 md:pt-28">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-start-2 lg:col-span-7">
              <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
                The entry point
              </p>
              <h2 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl">
                Pilot Sprint{' '}
                <em className="not-italic text-gradient-hero">— $5,000</em>.
              </h2>
              <p className="mt-6 font-display text-xl italic text-[color:var(--text-body)] md:text-2xl">
                Two weeks. One workflow. Evidence by Friday.
              </p>
              <ul className="mt-12 space-y-5">
                <li className="flex items-baseline gap-6">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)] w-20 flex-none">
                    Week 1
                  </span>
                  <span className="font-display text-xl text-[color:var(--text-primary)] md:text-2xl">
                    Scope and draft.
                  </span>
                </li>
                <li className="flex items-baseline gap-6">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)] w-20 flex-none">
                    Week 2
                  </span>
                  <span className="font-display text-xl text-[color:var(--text-primary)] md:text-2xl">
                    Review and ship.
                  </span>
                </li>
                <li className="flex items-baseline gap-6">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)] w-20 flex-none">
                    Friday
                  </span>
                  <span className="font-display text-xl text-[color:var(--text-primary)] md:text-2xl">
                    Evidence pack delivered.
                  </span>
                </li>
              </ul>
              <div className="mt-12">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex items-center px-8 py-4 text-base transition-transform hover:-translate-y-0.5 md:text-lg"
                >
                  Book a Pilot Sprint
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Subscribe — three tier cards ────────────────────────── */}
      <section
        className="relative py-32 md:py-48"
        style={{ backgroundColor: 'var(--assembl-paper)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
        >
          <div
            className="h-px w-full"
            style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-20 md:pt-28">
          <div className="mb-16 grid grid-cols-1 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-start-2 lg:col-span-7">
              <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
                Subscribe — three tiers
              </p>
              <h2 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl">
                Predictable monthly.{' '}
                <em className="not-italic text-gradient-hero">Quota included.</em>
              </h2>
            </div>
          </div>

          {/* Three cards. gap-px + container-bg renders 1px gold-thread
              hairlines: horizontal between rows on mobile, vertical between
              cols on desktop. */}
          <div
            className="grid grid-cols-1 gap-px lg:grid-cols-3"
            style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
          >
            {TIERS.map((tier) => (
              <article
                key={tier.slug}
                className="relative p-10 md:p-12"
                style={{ backgroundColor: 'var(--assembl-paper)' }}
              >
                {tier.featured && (
                  <span
                    className="absolute right-8 top-8 font-mono text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: 'var(--assembl-pounamu)' }}
                  >
                    Most chosen
                  </span>
                )}
                <h3 className="font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                  {tier.name}
                </h3>
                <p className="mt-3 font-display text-base italic text-[color:var(--text-body)] md:text-lg">
                  {tier.differentiator}
                </p>
                <p className="mt-12 font-display text-5xl font-light leading-none text-[color:var(--text-primary)] md:text-6xl">
                  {tier.monthly}
                </p>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  / month · NZD ex GST
                </p>
                <ul className="mt-10 space-y-3 text-base text-[color:var(--text-body)]">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-2.5 h-px w-3 flex-none"
                        style={{
                          backgroundColor: 'var(--assembl-gold-thread)',
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-12">
                  <Link
                    href="/contact"
                    className={`${tier.featured ? 'cta-primary' : 'btn-ghost'} inline-flex items-center px-7 py-3 text-base transition-transform hover:-translate-y-0.5`}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other ways to buy — quieter ─────────────────────────── */}
      <section
        className="relative py-32 md:py-48"
        style={{ backgroundColor: 'var(--assembl-paper)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
        >
          <div
            className="h-px w-full"
            style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-20 md:pt-28">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-start-2 lg:col-span-7">
              <p className="mb-6 font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:mb-8">
                Other ways to buy
              </p>
              <h2 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-[color:var(--text-primary)] md:text-6xl lg:text-7xl">
                One-off, or{' '}
                <em className="not-italic text-gradient-hero">outcome-based</em>.
              </h2>
              <ul className="mt-12 space-y-6 text-lg leading-relaxed text-[color:var(--text-body)] md:text-xl">
                <li>
                  <span className="font-display italic text-[color:var(--text-primary)]">
                    Pay per output
                  </span>{' '}
                  — from $19. One-off jobs, no subscription.
                </li>
                <li>
                  <span className="font-display italic text-[color:var(--text-primary)]">
                    Pay per resolution
                  </span>{' '}
                  — from $190. You pay only when the workflow lands: BCA accept,
                  Customs accept, auditor sign-off.
                </li>
              </ul>
              <div className="mt-12">
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex items-center px-8 py-4 text-base transition-transform hover:-translate-y-0.5 md:text-lg"
                >
                  Talk to us
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer line + single CTA ────────────────────────────── */}
      <section
        className="relative py-24 md:py-32"
        style={{ backgroundColor: 'var(--assembl-paper)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none mx-auto max-w-7xl px-6 md:px-12"
        >
          <div
            className="h-px w-full"
            style={{ backgroundColor: 'rgba(212,168,83,0.20)' }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-16 md:pt-20">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-start-2 lg:col-span-10">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                All prices NZD, GST excl. Setup splits across the first 3
                invoices. Cancel any time.
              </p>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex items-center px-8 py-4 text-base transition-transform hover:-translate-y-0.5 md:text-lg"
                >
                  Book a Pilot Sprint
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
