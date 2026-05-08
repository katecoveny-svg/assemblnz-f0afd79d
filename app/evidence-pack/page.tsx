import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { EvidencePackNarrative } from '@/components/EvidencePackNarrative';

export const metadata: Metadata = {
  title: 'Evidence pack',
  description:
    'Not an output. A record. From Blank to Attribution to Citations to Sealed — every workflow assembl runs ends in a tamper-evident evidence pack.',
};

export default function EvidencePackPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(212, 168, 83, 0.06) 0%, transparent 50%)',
          }}
        />
        <div className="relative container py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                04 — Evidence pack
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Not an output.
                <br />
                <em className="not-italic text-gradient-hero">A record.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Every workflow assembl runs ends with an evidence pack. Watch one build itself
                up — from a blank page to attribution, citations, and a tamper-evident seal.
                File it. Forward it. Footnote it.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Four reveals — sticky-side narrative with custom evidence pack frame */}
      <section className="relative py-12 md:py-20">
        <EvidencePackNarrative />
      </section>

      {/* CTA */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Want one for{' '}
                <em className="not-italic text-gradient-hero">a workflow you actually ship</em>?
              </h2>
              <p className="mt-8 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                The Pilot Sprint produces one in two weeks for NZ$5,000 + GST.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Start a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See the five stages
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
