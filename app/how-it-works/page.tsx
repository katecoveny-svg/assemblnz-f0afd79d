import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { StickyScrollNarrative } from '@/components/StickyScrollNarrative';
import { pipelineStages, ketes as keteImagery } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Five stages. Nothing ships until a person says so. Kahu intent capture, Iho routing, Tā execution, Mahara review, Mana sign-off — every workflow assembl runs ends in a sealed evidence pack.',
};

// Stage media — same Waihanga vessel for all five stages. The active stage
// renders at full opacity; the others fade to 30% per Phase 1 brief §11.
// Replace with AUAHA Phase 2 dedicated stage frames when delivered.
const STAGE_MEDIA = pipelineStages.map((s) => ({
  src: keteImagery.waihanga.wide,
  alt: `${s.title} — ${s.subtitle}`,
}));

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
        <div className="relative container py-16 md:py-20 xl:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                02 — How it works
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(3.6rem, 6.5vw, 8rem)' }}
              >
                Five stages.
                <br />
                Nothing ships
                <br />
                <em className="not-italic text-gradient-hero">until a person says so.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-3xl text-base leading-relaxed text-[color:var(--text-body)] md:text-xl">
                Every workflow assembl runs moves through the same five stages.
                <span className="font-display italic text-[color:var(--text-primary)]">
                  {' '}Kahu, Iho, Tā, Mahara, Mana.
                </span>{' '}
                The pace changes. The shape does not. A named human in your team signs off
                before anything ships.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-3">
                {pipelineStages.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="rounded-full border border-[rgba(35,33,31,0.18)] bg-white/40 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                      <span className="text-[color:var(--text-secondary)]">{s.number}</span>{' '}
                      {s.title}
                    </span>
                    {i < pipelineStages.length - 1 && (
                      <span className="text-[color:var(--text-secondary)]" aria-hidden>
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The 5 stages — sticky-side narrative */}
      <section className="relative py-8 md:py-10">
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
                  href="/pilot-sprint"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Book a Pilot Sprint
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
