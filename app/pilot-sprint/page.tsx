import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import { PilotSprintCheckout } from '@/components/billing/PilotSprintCheckout';

export const metadata: Metadata = {
  title: 'Founding Pilot Sprint',
  description:
    'Bring one real, messy workflow. In ten working days we turn it into draft-ready output with the evidence pack attached — on your data, not a demo. Founding price: $1,500 + GST.',
};

const HOW_IT_RUNS = [
  'We pick one workflow with you — something your team does often, by hand.',
  'We build the agent for it, wired to your rules and your sources.',
  'You get draft-ready outputs, the evidence pack, and a clear read on the hours it saves.',
] as const;

export default async function PilotSprintPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const checkout = (await searchParams).checkout;
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] py-28 lg:py-36">
        <PatternBackdrop
          className="absolute inset-0 -z-10"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="container relative z-10">
          <SectionReveal>
            <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">Founding Pilot Sprint</p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.03em]">
              See assembl on <em className="not-italic text-[color:var(--assembl-pounamu)]">your own work.</em>
            </h1>
            <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Bring one real, messy workflow. In ten working days we turn it into draft-ready output
              with the evidence pack attached — on your data, not a demo.
            </p>
          </SectionReveal>
        </div>
      </section>

      {checkout === 'success' || checkout === 'cancelled' ? (
        <section className="border-b border-[rgba(35,33,31,0.08)] py-5">
          <div className="container">
            <p className="rounded-xl border border-[rgba(35,33,31,0.12)] bg-white/70 px-5 py-4 text-sm text-[color:var(--text-body)]" role="status">
              {checkout === 'success'
                ? 'Stripe returned successfully. You will receive the Stripe receipt, and assembl will verify payment and confirm the agreed start date by email.'
                : 'Checkout was cancelled. Nothing was charged; the fit-check route remains open.'}
            </p>
          </div>
        </section>
      ) : null}

      <section className="py-24 lg:py-32">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionReveal>
            <h2 className="font-display text-display-lg font-light">How it runs</h2>
          </SectionReveal>
          <SectionReveal delay={0.05}>
            <ol className="grid gap-4">
              {HOW_IT_RUNS.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-5 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-6"
                >
                  <span className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-body-lg text-[color:var(--text-body)]">{step}</p>
                </li>
              ))}
            </ol>
          </SectionReveal>
        </div>
      </section>

      <section className="border-t border-[rgba(199,155,31,0.36)] py-20 lg:py-28">
        <div className="container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <SectionReveal>
            <p className="font-display text-display-md font-light">Founding price: $1,500 + GST · ten working days.</p>
            <p className="mt-5 max-w-xl text-body-lg text-[color:var(--text-body)]">Start with a fit check. Once the workflow, start date and success measure are agreed, the secure checkout creates the payment link and GST invoice.</p>
            <div className="mt-10">
              <Link href="/contact" className="cta-primary inline-flex h-12 items-center px-7">
                Book the fit check
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </SectionReveal>
          <SectionReveal delay={0.05}>
            <PilotSprintCheckout configured={checkoutConfigured} />
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
