import { HeroPage } from '@/components/site/HeroPage';
import { StickyScrollNarrative } from '@/components/site/StickyScrollNarrative';
import { FadeUp } from '@/components/motion/FadeUp';
import { EVIDENCE_PACK, VESSEL_ASSETS } from '@/lib/site-config';
import Link from 'next/link';

/**
 * /evidence-pack — sticky-side narrative, 4 pack reveal frames.
 * Left panel: schematic pack preview (watermark, hash, sign-off visual).
 * Right column: 4 NarrativeCards from EVIDENCE_PACK.frames.
 * Per Interactive Web Canon §4.
 */

function PackPreview() {
  return (
    <div className="relative flex h-full flex-col justify-center">
      {/* Schematic evidence pack document */}
      <div
        className="relative overflow-hidden rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-40 bg-[color:var(--assembl-paper)] p-6 shadow-xl"
        style={{ maxWidth: '340px' }}
        aria-hidden="true"
      >
        {/* Header bar */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-6 w-6 rounded-sm bg-[color:var(--assembl-pounamu)] opacity-80" />
          <div className="flex flex-col gap-1">
            <div className="h-2 w-24 rounded-sm bg-[color:var(--text-primary)] opacity-70" />
            <div className="h-1.5 w-16 rounded-sm bg-[color:var(--text-tertiary)] opacity-50" />
          </div>
        </div>

        {/* Body lines */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <div
              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--assembl-pounamu)] opacity-60"
            />
            <div
              className="h-1.5 rounded-sm bg-[color:var(--text-tertiary)] opacity-30"
              style={{ width: `${[85, 72, 90, 65][i]}%` }}
            />
          </div>
        ))}

        {/* Citation chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['Building Act 2004', 'HSWA 2015 §36', 'MBIE Code'].map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full bg-[color:var(--assembl-pounamu-paper)] px-2 py-0.5 font-mono text-[9px] text-[color:var(--assembl-pounamu)]"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Sign-off block */}
        <div className="mt-5 rounded-lg border border-[color:var(--assembl-gold-thread)] border-opacity-50 bg-[color:var(--assembl-mist)] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--text-tertiary)]">
            Reviewed and approved
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-[color:var(--assembl-pounamu)] opacity-70" />
            <div>
              <div className="h-1.5 w-20 rounded-sm bg-[color:var(--text-primary)] opacity-60" />
              <div className="mt-1 h-1.5 w-28 rounded-sm bg-[color:var(--text-tertiary)] opacity-30" />
            </div>
          </div>
        </div>

        {/* Hash footer */}
        <div className="mt-3 border-t border-[color:var(--assembl-gold-thread)] border-opacity-20 pt-3">
          <p className="font-mono text-[8px] text-[color:var(--text-tertiary)] opacity-60 break-all">
            SHA-256: 3a7f9c…e4b12d
          </p>
        </div>

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p
            className="font-mono text-[9px] uppercase tracking-[0.5em] text-[color:var(--assembl-pounamu)] opacity-[0.06] rotate-[-35deg] select-none"
            style={{ fontSize: '1.4rem' }}
          >
            assembl
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EvidencePackPage() {
  const { hero, frames } = EVIDENCE_PACK;

  const cards = frames.map((frame) => ({
    eyebrow: frame.eyebrow,
    body: frame.body,
  }));

  return (
    <>
      {/* Hero */}
      <HeroPage
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        body={hero.lede}
        ctaPrimary={hero.ctaPrimary}
        vesselSrc={VESSEL_ASSETS.hero16x9}
        vesselAlt="assembl Evidence Vessel — audit-ready outputs"
      />

      {/* Sticky pack reveal narrative */}
      <section className="bg-[color:var(--assembl-paper)]">
        <StickyScrollNarrative
          cards={cards}
          stickyContent={<PackPreview />}
          label="assembl evidence pack structure walkthrough"
        />
      </section>

      {/* Closing pull-quote */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-3xl">
              <blockquote>
                <p
                  className="font-display italic leading-snug text-[color:var(--text-primary)]"
                  style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}
                >
                  &ldquo;Evidence not drama.&rdquo;
                </p>
                <footer className="mt-4 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                  assembl · core design principle
                </footer>
              </blockquote>

              <div className="mt-10">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
                >
                  See a pack from your industry →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
