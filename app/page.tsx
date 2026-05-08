import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { ketes as keteImagery, reo } from '@/lib/site-config';
import { CinematicHero } from '@/components/CinematicHero';
import { HeroWordReveal } from '@/components/HeroWordReveal';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteVesselCard } from '@/components/KeteVesselCard';
import { TrustStrip } from '@/components/site/TrustStrip';
import { HomeSectionTeaser } from '@/components/site/HomeSectionTeaser';

export default function HomePage() {
  return (
    <>
      {/* ── HERO — full-bleed cinematic vessel, scroll-bound video scrub ────── */}
      <CinematicHero>
        <SectionReveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            Built in Aotearoa · Quiet intelligence
          </p>
        </SectionReveal>

        <div className="mt-8">
          <HeroWordReveal lines={reo.heroHeadlineLines} />
        </div>

        <SectionReveal delay={0.45}>
          <p className="mt-10 max-w-2xl font-display text-xl leading-snug text-[color:var(--text-body)] md:text-2xl">
            {reo.heroLede}
          </p>
        </SectionReveal>

        <SectionReveal delay={0.6}>
          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href="/pilot-sprint"
              className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
            >
              Book a pilot
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/how-it-works"
              className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
            >
              See how it works
            </Link>
          </div>
        </SectionReveal>
      </CinematicHero>

      {/* ── TRUST STRIP — locked Reo proof points ───────────────────────────── */}
      <TrustStrip items={reo.trustStrip} />

      {/* ── 01 — PILOT SPRINT ────────────────────────────────────────────────── */}
      <HomeSectionTeaser
        eyebrow="01 — Pilot Sprint"
        headline={['Two weeks. One workflow.', 'One evidence pack.']}
        body="NZ$5,000 + GST. Pick a workflow your team runs every week. We draft it end-to-end with every NZ Act and Section cited. If your team has not saved time by week two, you get your money back."
        cta={{ href: '/pilot-sprint', label: 'Read the spec' }}
        background="paper"
      />

      {/* ── 02 — HOW IT WORKS ────────────────────────────────────────────────── */}
      <HomeSectionTeaser
        eyebrow="02 — How it works"
        headline={reo.howItWorksHeadline}
        body="Five stages, sequenced. Kahu intent capture, Iho routing, Tā execution, Mahara review, Mana sign-off. Every paragraph is reviewed by a named human in your team before anything leaves your account."
        cta={{ href: '/how-it-works', label: 'Walk the pipeline' }}
        background="mist"
      />

      {/* ── 03 — KETE GRID — eight vessel cards ────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionReveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                03 — Eight kete · One canon
              </p>
              <h2
                className="mt-6 font-display leading-[0.98] tracking-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.6vw, 4rem)' }}
              >
                Pick the kete that matches{ ' '}
                <em className="not-italic text-gradient-hero">your industry</em>.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each kete bundles specialist agents grounded in the legislation your industry
                lives under. Click in to see what each one handles.
              </p>
            </div>
          </SectionReveal>

          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KETES.map((kete, i) => (
              <KeteVesselCard
                key={kete.slug}
                kete={kete}
                vesselSrc={keteImagery[kete.slug].square}
                index={i}
              />
            ))}
          </div>

          <SectionReveal>
            <div className="mt-16 text-center">
              <Link
                href="/kete"
                className="btn-ghost inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                See the full lineup
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── 04 — EVIDENCE PACK ────────────────────────────────────────────────── */}
      <HomeSectionTeaser
        eyebrow="04 — Evidence pack"
        headline={reo.evidencePackHeadline}
        body="SOurce citations. Reasoning trace. Reviewer record. Cryptographic seal. The audit trail comes in the box  — file it, forward it, footnote it."
        cta={{ href: '/evidence-pack', label: 'See what is in the box' }}
        background="mist"
      />

      {/* ── 05 — PRICING ────────────────────────────────────────────────────── */}
      <HomeSectionTeaser
        eyebrow="05 — Pricing"
        headline={['Three ways to pay.', 'No surprises.']}
        body="Subscribe by the seat, pay per output, or pay per resolution. The Pilot Sprint at NZ$5,000 + GST gets you running before you commit to anything else."
        cta={{ href: '/pricing', label: 'See the tiers' }}
        background="paper"
      />

      {/* ── 06 — GET STARTED — final CTA ─────────────────────────────────────── */}
      <HomeSectionTeaser
        eyebrow="06 — Get started"
        headline={['Book a pilot.', 'Keep your evidence.']}
        body="Two weeks. One workflow. One evidence pack. Money back if your team has not saved time by week two."
        cta={{ href: '/pilot-sprint', label: 'Book a pilot' }}
        background="paper"
        primary
      />
    </>
  );
}
