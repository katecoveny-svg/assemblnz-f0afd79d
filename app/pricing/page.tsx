import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import {
  SUBSCRIBE_PLANS,
  PAY_PER_OUTPUT_RATES,
  PAY_PER_RESOLUTION_RATES,
  OUTPUT_DEFINITION,
  PILOT_SPRINT,
  PRICING_NOTE,
} from '@/lib/pricing';

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
              {PRICING_NOTE} &nbsp;·&nbsp; Source: AI Forum NZ &mdash; AI Blueprint for
              Aotearoa (May 2026)
            </p>
          </div>
        </div>
      </section>

      {/* ── Pilot Sprint banner — above the three options ─────── */}
      <section className="relative">
        <div className="container pb-4">
          <div
            className="glass-card-elevated mx-auto max-w-4xl p-7 md:p-9"
            style={{ borderTop: '3px solid #D4A843' }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="flex-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Pilot Sprint
                </span>
                <h2 className="mt-2 font-display text-2xl text-[color:var(--text-primary)] md:text-3xl">
                  {PILOT_SPRINT.frame}
                </h2>
                <p className="mt-3 font-mono text-sm text-[color:var(--text-body)]">
                  {PILOT_SPRINT.bannerCopy}
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                  {PILOT_SPRINT.creditBack}
                </p>
              </div>
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
              >
                Book a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three options framing ─────────────────────────────── */}
      <section className="relative">
        <div className="container pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Three ways to buy
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Pick the model that matches the way you actually work.
            </h2>
          </div>
        </div>
      </section>

      {/* ── Subscribe — 4 sub-plans ───────────────────────────── */}
      <section className="relative">
        <div className="container pb-8 pt-10">
          <div className="glass-card mx-auto max-w-6xl p-7 md:p-10">
            <div className="flex flex-col items-baseline justify-between gap-3 md:flex-row md:gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Option 1
                </p>
                <h2 className="mt-2 font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
                  Subscribe
                </h2>
              </div>
              <p className="text-sm text-[color:var(--text-body)] md:max-w-md md:text-right">
                Predictable monthly. Plan includes a sensible quota; price flexes on overage.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {SUBSCRIBE_PLANS.map((plan) => (
                <article
                  key={plan.slug}
                  className={
                    plan.highlighted
                      ? 'relative rounded-card border-2 border-[rgba(43,107,87,0.4)] bg-white/60 p-5'
                      : 'relative rounded-card border border-[rgba(35,33,31,0.10)] bg-white/40 p-5'
                  }
                >
                  {plan.highlighted && (
                    <span className="badge-sage absolute right-4 top-4 text-[9px]">
                      Most chosen
                    </span>
                  )}

                  <h3 className="font-display text-2xl text-[color:var(--text-primary)]">
                    {plan.name}
                  </h3>
                  <p className="mt-3 font-display text-xl text-[color:var(--text-primary)]">
                    {plan.monthly}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {plan.setup}
                  </p>

                  <div className="mt-5 space-y-3 text-sm text-[color:var(--text-body)]">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        Included
                      </p>
                      <p className="mt-1">{plan.outputsIncluded}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                        Overage
                      </p>
                      <p className="mt-1">{plan.overage}</p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2 border-t border-[rgba(35,33,31,0.10)] pt-4 text-sm text-[color:var(--text-body)]">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[color:var(--assembl-sage-mist)]"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Start free
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pay per output — 4 rates ──────────────────────────── */}
      <section className="relative">
        <div className="container pb-8 pt-2">
          <div className="glass-card mx-auto max-w-6xl p-7 md:p-10">
            <div className="flex flex-col items-baseline justify-between gap-3 md:flex-row md:gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Option 2
                </p>
                <h2 className="mt-2 font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
                  Pay per output
                </h2>
              </div>
              <p className="text-sm text-[color:var(--text-body)] md:max-w-md md:text-right">
                One-off jobs. No subscription, no monthly minimum. Pay only for what you run.
              </p>
            </div>

            <div className="mt-8 divide-y divide-[rgba(35,33,31,0.10)]">
              {PAY_PER_OUTPUT_RATES.map((rate) => (
                <div
                  key={rate.name}
                  className="flex flex-col items-baseline justify-between gap-2 py-4 md:flex-row md:gap-8"
                >
                  <div className="flex-1">
                    <p className="font-display text-lg text-[color:var(--text-primary)]">
                      {rate.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                      {rate.description}
                    </p>
                  </div>
                  <p className="font-mono text-base text-[color:var(--text-primary)] md:whitespace-nowrap">
                    {rate.rate}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Talk to us
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pay per resolution — 5 rates ──────────────────────── */}
      <section className="relative">
        <div className="container pb-12 pt-2">
          <div className="glass-card mx-auto max-w-6xl p-7 md:p-10">
            <div className="flex flex-col items-baseline justify-between gap-3 md:flex-row md:gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Option 3
                </p>
                <h2 className="mt-2 font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
                  Pay per resolution
                </h2>
              </div>
              <p className="text-sm text-[color:var(--text-body)] md:max-w-md md:text-right">
                Outcome-based. You pay only when a workflow reaches its objective external
                trigger — BCA accept, NZ Customs accept, auditor sign-off.
              </p>
            </div>

            <div className="mt-8 divide-y divide-[rgba(35,33,31,0.10)]">
              {PAY_PER_RESOLUTION_RATES.map((rate) => (
                <div
                  key={rate.name}
                  className="flex flex-col items-baseline justify-between gap-2 py-4 md:flex-row md:gap-8"
                >
                  <div className="flex-1">
                    <p className="font-display text-lg text-[color:var(--text-primary)]">
                      {rate.name}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                      {rate.description}
                    </p>
                  </div>
                  <p className="font-mono text-base text-[color:var(--text-primary)] md:whitespace-nowrap">
                    {rate.rate}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/contact"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Talk to us
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Output definition footnote ─────────────────────────── */}
      <section className="relative">
        <div className="container pb-12">
          <div className="mx-auto max-w-4xl rounded-card border border-[rgba(35,33,31,0.10)] bg-white/40 px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              What counts as an output
            </p>
            <p className="mt-2 text-sm text-[color:var(--text-body)]">{OUTPUT_DEFINITION}</p>
          </div>
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
    </>
  );
}
