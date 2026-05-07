import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { StickyScrollNarrative } from '@/components/StickyScrollNarrative';
import { pipelineStages, ketes as keteImagery, reo } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Five stages. Nothing ships until a person says so. Intake, Draft, Review, Evidence, Ship — every workflow assembl runs ends in a sealed evidence pack.',
};

// Stage media — sculptural kete vessels stand in for the pipeline frames
// until AUAHA Phase 2 delivers the proper sequence (estimated 60-75 min
// from brief authoring; placeholder retained for now).
const STAGE_MEDIA = [
  { src: keteImagery.waihanga.wide, alt: 'Intake — workflow handed over' },
  { src: keteImagery.pikau.wide,    alt: 'Draft — agent drafts with citations' },
  { src: keteImagery.auaha.wide,    alt: 'Review — human in the loop' },
  { src: keteImagery.ako.wide,      alt: 'Evidence — pack sealed' },
  { src: keteImagery.toro.wide,     alt: 'Ship — pack delivered' },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%)',
          }}
        />
        <div className="relative container py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                How it works
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                {reo.howItWorksHeadline[0]}
                <br />
                <em className="not-italic text-gradient-hero">{reo.howItWorksHeadline[1]}</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Every workflow assembl runs moves through the same five stages. The pace changes.
                The shape does not. A named human in your team signs off before anything ships.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The 5 stages — sticky-side narrative */}
      <section className="relative py-12 md:py-20">
        <StickyScrollNarrative stages={pipelineStages} media={STAGE_MEDIA} />
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
                Five stages.{' '}
                <em className="not-italic text-gradient-hero">One evidence pack.</em>
              </h2>
              <p className="mt-8 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                See what comes out the other end.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/evidence-pack"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See the evidence pack
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Book a pilot
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
