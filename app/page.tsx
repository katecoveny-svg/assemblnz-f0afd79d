import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INDUSTRY_KETES } from '@/lib/kete';
import { AGENTS } from '@/lib/agents';
import { SectionReveal } from '@/components/SectionReveal';
import { DestinationCard } from '@/components/DestinationCard';
import { KeteIllustration } from '@/components/KeteIllustration';
import { ScrollEvidenceStory } from '@/components/site/ScrollEvidenceStory';
import { HeroAssembl } from '@/components/site/HeroAssembl';
import { FounderSection } from '@/components/site/FounderSection';

const AGENT_TOTAL = AGENTS.length;
const ACTIVE_KETE_COUNT = INDUSTRY_KETES.filter((k) => k.status === 'active').length;
const TOTAL_KETE_COUNT = INDUSTRY_KETES.length + 1; // +1 for Tōro

export default function HomePage() {
  return (
    <>
      {/* ── HERO — sculptural-vessels direction ─────────────────────── */}
      <HeroAssembl />

      {/* ── SCROLL EVIDENCE STORY — five-scene Waihanga PM through-line ─ */}
      <div id="scroll-story">
        <ScrollEvidenceStory />
      </div>

      {/* ── DESTINATION CARDS — 4 doors into the rest of the site ─── */}
      <section className="relative bg-[color:var(--assembl-mist)]/30 py-24 md:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Where to go next
              </p>
              <h2
                className="mt-5 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Four doors into{' '}
                <em className="not-italic text-gradient-hero">assembl</em>.
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 md:gap-8">
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
                <div className="flex justify-center">
                  <KeteIllustration accent="#2B6B57" className="h-44 w-auto md:h-52" />
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
              bg="ink"
              visual={
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                  {INDUSTRY_KETES.slice(0, 7).map((k) => (
                    <KeteIllustration
                      key={k.slug}
                      slug={k.slug}
                      accent={k.accent}
                      className="h-20 w-auto opacity-90 md:h-24"
                    />
                  ))}
                </div>
              }
            />

            {/* Pricing */}
            <DestinationCard
              href="/pricing"
              eyebrow="Three ways to buy"
              title="Pricing"
              description="Subscribe, pay per output, pay per resolution. Plus the Pilot Sprint — NZ$5,000 + GST, two weeks, money-back if no time saved."
              accent="#AC5838"
              index={2}
              bg="mist"
              visual={
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-3">
                    {['Subscribe', 'Per output', 'Per resolution'].map((t, i) => (
                      <span
                        key={t}
                        className="rounded-full border border-[rgba(35,33,31,0.18)] bg-white/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p
                    className="font-display leading-none text-[color:var(--text-primary)]"
                    style={{ fontWeight: 300, fontSize: 'clamp(3rem, 5vw, 5rem)' }}
                  >
                    NZ$<span className="text-gradient-hero">29</span>
                    <span className="font-mono text-base font-normal text-[color:var(--text-secondary)]">
                      {' '}
                      · NZ$1,490 · NZ$1,990 · NZ$2,990+
                    </span>
                  </p>
                </div>
              }
            />

            {/* About */}
            <DestinationCard
              href="/about"
              eyebrow="Why we exist"
              title="The trust gap"
              description="Built in Aotearoa. For Aotearoa. Grounded in four pou. We do not generate AI karakia, whaikōrero, or waiata. That is a hard boundary."
              accent="#6B5843"
              index={3}
              bg="paper"
              visual={
                <div className="flex flex-col items-center gap-2">
                  {['Rangatiratanga', 'Kaitiakitanga', 'Manaakitanga', 'Whanaungatanga'].map(
                    (pou) => (
                      <span
                        key={pou}
                        className="font-display text-2xl text-[color:var(--text-primary)] md:text-3xl"
                        style={{ fontWeight: 300 }}
                      >
                        {pou}
                      </span>
                    ),
                  )}
                </div>
              }
            />
          </div>
        </div>
      </section>

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
        <div className="container">
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
        <div className="container">
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
                <em className="not-italic text-gradient-hero">One Evidence Pack.</em>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                NZ$5,000 + GST. Pick a workflow. We draft it end-to-end with every NZ Act and
                Section cited. If your team has not saved time by week two, you get your money
                back.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Book your pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
