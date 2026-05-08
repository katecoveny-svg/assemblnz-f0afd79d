import { HeroPage } from '@/components/site/HeroPage';
import { StickyScrollNarrative } from '@/components/site/StickyScrollNarrative';
import { FadeUp } from '@/components/motion/FadeUp';
import { HOW_IT_WORKS, VESSEL_ASSETS } from '@/lib/site-config';
import Link from 'next/link';

/**
 * /how-it-works — sticky-side narrative, 5 pipeline stages.
 * Left panel: stage indicator (static list, scroll-reactive highlighting Phase 1.5).
 * Right column: 5 NarrativeCards from HOW_IT_WORKS.stages.
 * Per Interactive Web Canon §4: GSAP ScrollTrigger pinning on desktop.
 */

function PipelinePanel({
  stages,
}: {
  stages: typeof HOW_IT_WORKS.stages;
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-5">
      {/* Label */}
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
        Five stages · every request
      </p>

      {stages.map((stage, i) => (
        <div key={i} className="flex items-start gap-4">
          {/* Step circle */}
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--assembl-gold-thread)] border-opacity-60 font-mono text-[10px] text-[color:var(--text-tertiary)]">
            {String(i + 1).padStart(2, '0')}
          </div>
          {/* Stage name */}
          <div className="min-w-0">
            <p
              className="font-display leading-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 400, fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
            >
              {stage.name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
              {stage.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Connector line visual */}
      <div
        className="pointer-events-none absolute left-[calc(1.75rem - 1px)] top-[5.5rem] h-[calc(100%-8rem)] w-px"
        style={{
          background:
            'linear-gradient(to bottom, var(--assembl-gold-thread) 0%, transparent 100%)',
          opacity: 0.25,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function HowItWorksPage() {
  const { hero, stages } = HOW_IT_WORKS;

  const cards = stages.map((stage) => ({
    eyebrow: stage.eyebrow,
    name: stage.name,
    subtitle: stage.subtitle,
    body: stage.body,
    example: stage.example,
  }));

  return (
    <>
      {/* Hero */}
      <HeroPage
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        body={hero.lede}
        ctaPrimary={hero.ctaPrimary}
        ctaSecondary={hero.ctaSecondary}
        vesselSrc={VESSEL_ASSETS.portrait4x5}
        vesselAlt="assembl Evidence Vessel — five stage pipeline"
      />

      {/* Sticky-side pipeline narrative */}
      <section className="bg-[color:var(--assembl-paper)]">
        <StickyScrollNarrative
          cards={cards}
          stickyContent={<PipelinePanel stages={stages} />}
          label="assembl five-stage pipeline walkthrough"
        />
      </section>

      {/* Closing CTA */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-pounamu)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu-paper)]">
                READY TO SEE IT LIVE
              </p>
              <h2
                className="mt-6 font-display leading-[0.96] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
              >
                <span className="block">Start with one workflow.</span>
                <span className="block">Two weeks. Evidence Friday.</span>
              </h2>
              <div className="mt-8">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full bg-[#FAF7F2] px-7 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
