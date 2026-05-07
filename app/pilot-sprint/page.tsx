import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Pilot Sprint',
  description:
    'Two weeks. One workflow. One evidence pack. NZ$5,000 + GST. Money-back if no time saved.',
};

export default function PilotSprintPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-24 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Pilot Sprint
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Two weeks. One workflow.
                <br />
                <em className="not-italic text-gradient-hero">One evidence pack.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                NZ$5,000 + GST. Pick a workflow. We draft it end-to-end with every NZ Act and
                Section cited. If your team has not saved time by week two, you get your money
                back.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <p className="mx-auto mt-10 max-w-md font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Full spec landing in Phase 1B
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Book a pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See how it works
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  );
}
