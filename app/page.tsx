import { HeroSignature } from '@/components/site/HeroSignature';
import { TrustStrip } from '@/components/site/TrustStrip';
import { HomeSectionTeaser } from '@/components/site/HomeSectionTeaser';
import { KeteCard } from '@/components/site/KeteCard';
import { FadeUp } from '@/components/motion/FadeUp';
import { KETES, BRAND_FILM } from '@/lib/site-config';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* 00 — CINEMATIC VESSEL HERO */}
      <HeroSignature />

      {/* Trust strip */}
      <TrustStrip />

      {/* 01 — PILOT SPRINT */}
      <HomeSectionTeaser
        eyebrow="01 — PILOT SPRINT"
        headline={['One painful workflow.', 'Two weeks.', 'Evidence by Friday.']}
        body="You pick the workflow eating your team's time. Two weeks later, you hold the receipts — or you don't, and fourteen days was a cheap way to find out."
        ctaLabel="See the Pilot Sprint →"
        ctaHref="/pilot-sprint"
      />

      {/* 02 — HOW IT WORKS */}
      <HomeSectionTeaser
        eyebrow="02 — HOW IT WORKS"
        headline={['Five stages.', 'Every draft checked.', 'Every output evidenced.']}
        body="From the moment a question arrives to the moment a named human signs off — five stages run in sequence. Nothing ships before Mana approves it."
        ctaLabel="See how it works →"
        ctaHref="/how-it-works"
      />

      {/* 03 — 8 KETE GRID */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="mb-16 max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                03 — INDUSTRY KETE
              </p>
              <h2
                className="mt-6 font-display leading-[0.96] tracking-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
              >
                <span className="block">Built the way</span>
                <span className="block">Aotearoa works.</span>
              </h2>
              <p className="mt-6 font-body text-[1.125rem] leading-relaxed text-[color:var(--text-body)]">
                Eight industry kete — construction, freight, hospitality, retail, creative, early childhood, automotive, and whānau — each grounded in the NZ legislation that governs it.
              </p>
            </div>
          </FadeUp>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KETES.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} variant="home" />
            ))}
          </div>

          <FadeUp className="mt-12 text-center">
            <Link
              href="/kete"
              className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-8 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
            >
              See all kete →
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* 04 — EVIDENCE PACK */}
      <HomeSectionTeaser
        eyebrow="04 — EVIDENCE PACK"
        headline="Evidence not drama."
        body="Every output assembl produces is a watermarked evidence pack — citations, attribution, sign-off block, hash-chain provenance. Audit-ready by default."
        ctaLabel="See a sample evidence pack →"
        ctaHref="/evidence-pack"
      />

      {/* BRAND FILM — between evidence pack and pricing */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp className="max-w-3xl">
            <h2
              className="font-display leading-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 3rem)' }}
            >
              {BRAND_FILM.headline}
            </h2>
            <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
              {BRAND_FILM.body}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                className="inline-flex h-10 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 text-sm font-medium text-[#FAF7F2] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)]"
                aria-label="Play brand film"
              >
                {BRAND_FILM.ctaLabel}
              </button>
              <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                {BRAND_FILM.ctaMeta}
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 05 — PRICING */}
      <HomeSectionTeaser
        eyebrow="05 — PRICING"
        headline="Three ways to start."
        body="Subscribe. Pay per output. Pay per resolution. The Pilot Sprint is the right entry point for every new business — fixed scope, fixed price, evidence in two weeks."
        ctaLabel="See pricing →"
        ctaHref="/pricing"
      />

      {/* 06 — GET STARTED */}
      <HomeSectionTeaser
        eyebrow="06 — GET STARTED"
        headline="Let's get your time back."
        ctaLabel="Start a Pilot Sprint →"
        ctaHref="/pilot-sprint"
        primary
      />
    </>
  );
}
