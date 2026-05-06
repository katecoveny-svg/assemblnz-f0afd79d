import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PRICING_PLANS, PRICING_NOTE } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Pay for what your business actually does. Three ways to buy: Subscribe, Pay per output, or Pay per resolution. NZ data residency. Draft Mode review on every output.',
};

export default function PricingPage() {
  return (
    <>
      {/* ── Hero — locked block ────────────────────────────────── */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%)',
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-gold inline-flex">Pricing</span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl">
              Pay for what your business actually does. Not for software you{' '}
              <em className="not-italic text-gradient-hero">forget you bought</em>.
            </h1>
            <p className="mt-8 text-lg text-[color:var(--text-body)] md:text-xl">
              79% of New Zealand businesses don&apos;t know how to use AI safely. Only 2.7%
              of the workforce is trained for it. We&apos;re high-use, low-trust as a country —
              and that gap is what assembl exists to close.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base text-[color:var(--text-body)]">
              Most AI tools charge you a flat fee whether you use them or not. That doesn&apos;t
              work for AI, and it especially doesn&apos;t work for compliance work. You pick
              a plan that includes a sensible amount of work each month — generating compliance
              docs, drafting emails, running checks. If you outgrow it, the price flexes. If
              you don&apos;t, you&apos;re not subsidising someone else&apos;s heavy use.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Talk to us
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>

            <p className="mt-6 font-mono text-xs text-[color:var(--text-secondary)]">
              Source: AI Forum NZ &mdash; AI Blueprint for Aotearoa (May 2026)
            </p>
          </div>
        </div>
      </section>

      {/* ── Three options ─────────────────────────────────────── */}
      <section className="relative">
        <div className="container pb-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Three ways to buy
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Pick the model that matches the way you actually work.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.slug}
                className={
                  plan.highlighted
                    ? 'glass-card-elevated relative p-7'
                    : 'glass-card relative p-7'
                }
              >
                {plan.highlighted && (
                  <span className="badge-gold absolute right-6 top-6">Most chosen</span>
                )}

                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {plan.audience}
                </p>
                <h3 className="mt-2 font-display text-3xl text-[color:var(--text-primary)]">
                  {plan.name}
                </h3>

                <div className="mt-6">
                  <p className="font-display text-3xl text-[color:var(--text-primary)]">
                    {plan.monthly}
                  </p>
                  {plan.monthlyNote && (
                    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                      {plan.monthlyNote}
                    </p>
                  )}
                </div>

                {plan.setup !== '—' && (
                  <div className="mt-5 rounded-card bg-white/40 px-4 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                      Setup
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-primary)]">
                      {plan.setup}
                      {plan.setupNote && (
                        <span className="block text-xs text-[color:var(--text-secondary)]">
                          {plan.setupNote}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <ul className="mt-6 space-y-3 text-sm text-[color:var(--text-body)]">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--assembl-sage-mist)]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={
                    plan.highlighted
                      ? 'cta-primary mt-7 inline-flex h-11 w-full items-center justify-center px-6 text-sm'
                      : 'btn-ghost mt-7 inline-flex h-11 w-full items-center justify-center px-6 text-sm'
                  }
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center font-mono text-xs leading-relaxed text-[color:var(--text-secondary)]">
            {PRICING_NOTE}
          </p>
        </div>
      </section>

      {/* ── Closer — Draft Mode promise ───────────────────────── */}
      <section className="relative">
        <div className="container py-16">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-8 md:p-12"
            style={{ borderLeft: '3px solid #2B6B57' }}
          >
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Draft Mode
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Either way, every output goes through Draft Mode first.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)]">
              Nothing gets sent, filed, or published without your sign-off. The plan you
              pick changes how you pay. It does not change the trust standard.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Read the trust-gap framing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*
        TODO(reo-track-1): Pilot Sprint section, comparison table, and FAQ removed
        in this PR because they were 5-tier-specific and the new three-options model
        supersedes them. Reo's Track 1 per-page copy refresh will decide:
          - whether the Pilot Sprint $5,000 entry point survives the new model,
          - whether to add a 3-option comparison table,
          - which FAQ items to bring back / rewrite.
        Keeping the page clean for now rather than shipping obsolete copy.
      */}
    </>
  );
}
