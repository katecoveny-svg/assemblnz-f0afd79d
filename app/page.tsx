import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { ketes as keteImagery, reo, heroVessel } from '@/lib/site-config';
import { CinematicHero } from '@/components/CinematicHero';
import { HeroWordReveal } from '@/components/HeroWordReveal';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteVesselCard } from '@/components/KeteVesselCard';
import { DestinationCard } from '@/components/DestinationCard';
import { ScrollEvidenceStory } from '@/components/site/ScrollEvidenceStory';
import { HeroAssembl } from '@/components/site/HeroAssembl';
import { FounderSection } from '@/components/site/FounderSection';
import { VesselTile } from '@/components/site/VesselTile';

const AGENT_TOTAL = AGENTS.length;
const ACTIVE_KETE_COUNT = INDUSTRY_KETES.filter((k) => k.status === 'active').length;
const TOTAL_KETE_COUNT = INDUSTRY_KETES.length + 1; // +1 for Tōro

export default function HomePage() {
  return (
    <>
      {/* ── HERO — cinematic vessel video, scroll-bound ─────────────── */}
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

        <SectionReveal delay={0.75}>
          <ul className="mt-16 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            {reo.trustStrip.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-[color:var(--assembl-pounamu)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </SectionReveal>
      </CinematicHero>

      {/* ── PULL QUOTE — single Cormorant line ──────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] py-32 md:py-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(43, 107, 87, 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="container">
          <SectionReveal>
            <p
              className="mx-auto max-w-5xl text-center font-display leading-[1.1] text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
            >
              <em className="not-italic text-gradient-hero">{reo.pullQuote}</em>
            </p>
          </SectionReveal>
        </div>
      </section>
      {/* ── HERO — sculptural-vessels direction ─────────────────────── */}
      <HeroAssembl />

      {/* ── SCROLL EVIDENCE STORY — five-scene Waihanga PM through-line ─ */}
      <div id="scroll-story">
        <ScrollEvidenceStory />
      </div>

      {/* ── KETE GRID — 8 vessel cards ───────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-mist)]/30 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionReveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Eight kete · One canon
              </p>
              <h2
                className="mt-5 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Pick the kete that matches{' '}
                <em className="not-italic text-gradient-hero">your industry</em>.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base text-[color:var(--text-body)] md:text-lg">
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
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                See the full lineup
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {/* Kete */}
            <DestinationCard
              href="/kete"
              eyebrow={`${TOTAL_KETE_COUNT} kete · ${ACTIVE_KETE_COUNT} live`}
              title="Industry kete"
              description="Each kete bundles specialist agents grounded in the legislation your industry lives under. Scroll through the lineup."
              accent="#2B6B57"
              index={0}
              bg="paper"
              visual={
                <div className="mx-auto w-full max-w-md">
                  <VesselTile
                    slug="waihanga"
                    name="Waihanga"
                    accent="#2B6B57"
                    aspect="4/5"
                    sizes="(min-width: 768px) 36vw, 80vw"
                  />
                </div>
              }
            />

            {/* Agents */}
            <DestinationCard
              href="/agents"
              eyebrow={`${AGENT_TOTAL} specialist agents`}
              title="Agent marketplace"
              description="Pick the agents you need. Subscribe, pay per output, or pay per resolution. Every output reviewed in Draft Mode before it ships."
              accent="#2B6B57"
              index={1}
              bg="mist"
              visual={
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {INDUSTRY_KETES.slice(0, 4).map((k) => (
                    <VesselTile
                      key={k.slug}
                      slug={k.slug}
                      name={k.name}
                      accent={k.accent}
                      aspect="1/1"
                      sizes="(min-width: 768px) 18vw, 40vw"
                    />
                  ))}
                </div>
              }
            />

      {/* ── BRAND FILM — Variant A locked ────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] py-32 md:py-44">
        <div className="container">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <SectionReveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-brand-soft">
                <img
                  src={heroVessel.portrait}
                  alt="assembl vessel — cream paper, breathing"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Play brand film"
                  className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(250,247,242,0.92)] backdrop-blur-md transition-transform hover:scale-105"
                >
                  <span
                    aria-hidden
                    className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[color:var(--assembl-pounamu)]"
                  />
                </button>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.15}>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Brand film · {reo.brandFilm.duration}
              </p>
              <h2
                className="mt-5 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
              >
                <em className="not-italic text-gradient-hero">{reo.brandFilm.eyebrow}</em>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                {reo.brandFilm.body}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                ▶ Play · {reo.brandFilm.cta}
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA — Pilot Sprint ───────────────────────────────── */}
      {/* ── STAT BAND — manifesto line ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] py-32 md:py-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(43, 107, 87, 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionReveal>
            <p
              className="mx-auto max-w-5xl text-center font-display leading-[1.05] text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4.5vw, 4rem)' }}
            >
              79% of Kiwi businesses don&apos;t know how to use AI safely.
              <br />
              <span className="text-[color:var(--text-secondary)]">
                97% of the workforce isn&apos;t trained for it.
              </span>
              <br />
              <em className="not-italic text-gradient-hero">
                The trust gap is what assembl exists to close.
              </em>
            </p>
            <p className="mt-12 text-center font-mono text-xs uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Source: AI Forum NZ · AI Blueprint for Aotearoa (May 2026)
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── FOUNDER SECTION — Kate's note + portraits ──────────────── */}
      <FounderSection />

      {/* ── FOOTER CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)] py-32 md:py-44">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(43, 107, 87, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <SectionReveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Pilot Sprint
              </p>
              <h2
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
              >
                Two weeks. One workflow.
                <br />
                <em className="not-italic text-gradient-hero">One evidence pack.</em>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                NZ$5,000 + GST. Pick a workflow. We draft it end-to-end with every NZ Act and
                Section cited. If your team has not saved time by week two, you get your money
                back.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Book your pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pilot-sprint"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Read the spec
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
