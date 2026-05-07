import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { StickyScrollNarrative } from '@/components/StickyScrollNarrative';
import { evidencePackContents, ketes as keteImagery, reo } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Evidence pack',
  description:
    'Not an output. A record. Source citations, reasoning trace, reviewer record, and a cryptographic seal — everything assembl ships comes with the audit trail in the box.',
};

// Stage media — kete vessels stand in for the evidence pack frames until
// AUAHA Phase 2 delivers the proper sequence.
const FRAME_MEDIA = [
  { src: keteImagery.waihanga.wide, alt: 'Source citations — Acts and Sections' },
  { src: keteImagery.manaaki.wide,  alt: 'Reasoning trace — prompt, model, reasoning' },
  { src: keteImagery.arataki.wide,  alt: 'Reviewer record — named human in the loop' },
  { src: keteImagery.hoko.wide,     alt: 'Cryptographic seal — SHA-256 hash, tamper-evident' },
];

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
                Evidence pack
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                {reo.evidencePackHeadline[0]}
                <br />
                <em className="not-italic text-gradient-hero">{reo.evidencePackHeadline[1]}</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Every workflow assembl runs ends with an evidence pack — a sealed, tamper-evident
                record of what was drafted, what it cited, who reviewed it, and what they changed.
                File it. Forward it. Footnote it.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* What's in the box — sticky-side narrative */}
      <section className="relative py-12 md:py-20">
        <StickyScrollNarrative stages={evidencePackContents} media={FRAME_MEDIA} accent="#D4A853" />
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
