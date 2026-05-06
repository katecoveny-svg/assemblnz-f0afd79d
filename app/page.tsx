import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INDUSTRY_KETES } from '@/lib/kete';
import { AGENTS } from '@/lib/agents';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteSpotlight } from '@/components/KeteSpotlight';
import { KeteIllustration } from '@/components/KeteIllustration';
import { PipelineStickyScroll } from '@/components/PipelineStickyScroll';

const AGENT_TOTAL = AGENTS.length;
const FEATURED_KETES = INDUSTRY_KETES.filter((k) => k.status === 'active');
const SECONDARY_KETES = INDUSTRY_KETES.filter((k) => k.status !== 'active');

// Per-kete description for the spotlight section. Used only on featured (active) kete.
const SPOTLIGHT_COPY: Record<string, string> = {
  waihanga:
    'Six specialist agents covering health and safety (HSWA 2015), building consents (Building Act 2004 s 14B), BIM analysis, materials compliance, and quality assurance. Every consent application leaves with an Evidence Pack your team can stand behind with a BCA.',
  pikau:
    'Specialist agents for customs declarations (Customs and Excise Act 2018), tariff classification, trade compliance, and freight documentation. The audit trail your broker needs — drafted, cited, and signed off before anything hits the EDI.',
};

export default function HomePage() {
  return (
    <>
      {/* ── HERO — full-bleed lattice video, Joby-style cinematic ─────── */}
      <section className="relative min-h-[88vh] overflow-hidden bg-[color:var(--assembl-paper)]">
        {/* Background video — kete lattice loop */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/lattice-texture.jpg"
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          >
            <source src="/video/kete-hero-lattice.mp4" type="video/mp4" />
          </video>
          {/* Static fallback for reduced motion */}
          <img
            src="/images/lattice-texture.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover motion-reduce:block hidden"
          />
        </div>

        {/* Cream scrim — soft fade from transparent at top to paper at bottom for text legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,247,242,0.55) 0%, rgba(250,247,242,0.35) 35%, rgba(250,247,242,0.85) 80%, rgba(250,247,242,1) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-6 py-32 md:px-10">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Built in Aotearoa · Mārama Whenua
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h1
              className="mt-8 max-w-5xl font-display uppercase leading-[0.92] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 8vw, 7.5rem)' }}
            >
              Automate the mundane.
              <br />
              <em className="not-italic text-gradient-hero">Accelerate the remarkable.</em>
            </h1>
          </SectionReveal>

          <SectionReveal delay={0.25}>
            <p className="mt-10 max-w-2xl font-display text-2xl leading-snug text-[color:var(--text-body)] md:text-3xl" style={{ fontWeight: 300 }}>
              We are quietly rewiring New Zealand businesses for a calmer, more compliant
              tomorrow.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.4}>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              <em className="font-display text-xl not-italic md:text-2xl">assembl drafts.</em>{' '}
              Specialist AI agents grounded in current NZ legislation. We draft the compliance
              documentation your team would otherwise spend the week on — every output reviewed
              in Draft Mode before anything ships.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.55}>
            <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                Start your pilot
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/agents"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
              >
                Browse agents
              </Link>
            </div>
          </SectionReveal>

          {/* Scroll cue */}
          <div
            aria-hidden
            className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Scroll
            </span>
            <span className="h-8 w-px animate-pulse bg-[color:var(--text-secondary)]" />
          </div>
        </div>
      </section>

      {/* ── STAT BAND — single sentence, manifesto weight ───────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-32">
        <div className="container">
          <SectionReveal>
            <p
              className="mx-auto max-w-5xl font-display leading-[1.1] text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 4vw, 3.5rem)' }}
            >
              79% of Kiwi businesses don&apos;t know how to use AI safely.
              <br />
              <span className="text-[color:var(--text-secondary)]">
                97% of the workforce isn&apos;t trained for it. We&apos;re high-use, low-trust.
              </span>
              <br />
              <em className="not-italic text-gradient-hero">
                The trust gap is what assembl exists to close.
              </em>
            </p>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Source: AI Forum NZ · AI Blueprint for Aotearoa (May 2026)
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── PER-KETE SPOTLIGHTS — Joby-style alternating full-width ────── */}
      <section
        id="kete"
        className="relative scroll-mt-20 bg-[color:var(--assembl-mist)]/30 py-20 md:py-32"
      >
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Industry kete
              </p>
              <h2
                className="mt-5 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Purpose-built for{' '}
                <em className="not-italic text-gradient-hero">your industry</em>.
              </h2>
              <p className="mt-6 text-base text-[color:var(--text-body)] md:text-lg">
                Each kete is grounded in the legislation your industry lives under — its
                workflows, its compliance regime, its evidence requirements.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Featured (live) kete spotlights — alternating left/right, alternating bg */}
      {FEATURED_KETES.map((kete, i) => (
        <KeteSpotlight
          key={kete.slug}
          kete={kete}
          description={SPOTLIGHT_COPY[kete.slug] ?? kete.tagline}
          flip={i % 2 === 1}
          bg={i % 2 === 0 ? 'paper' : 'mist'}
        />
      ))}

      {/* Secondary (coming-soon) kete — tighter inline grid */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                More kete coming
              </p>
              <h2
                className="mt-5 font-display leading-tight tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
              >
                Five more industries on the way.
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-3">
            {SECONDARY_KETES.map((kete, i) => (
              <SectionReveal key={kete.slug} delay={i * 0.08}>
                <Link
                  href={`/kete/${kete.slug}`}
                  className="group flex h-full flex-col items-center text-center transition-transform hover:-translate-y-1"
                  style={{ ['--kete-accent' as string]: kete.accent }}
                >
                  <KeteIllustration
                    slug={kete.slug}
                    accent={kete.accent}
                    className="h-40 w-auto transition-transform duration-500 group-hover:scale-105 md:h-48"
                  />
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                    {kete.industry}
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-[color:var(--text-primary)] md:text-4xl">
                    {kete.name}
                  </h3>
                  <p className="mt-3 text-sm text-[color:var(--text-body)]">{kete.tagline}</p>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — sticky scroll-pinned narrative ─────────────── */}
      <PipelineStickyScroll />

      {/* ── AGENT MARKETPLACE CTA — Ink dark band for contrast ─────── */}
      <section className="relative bg-[color:var(--assembl-taupe-deep)] py-32 text-[color:var(--assembl-paper)] md:py-48">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[rgba(250,247,242,0.5)]">
                Agent marketplace
              </p>
              <h2
                className="mt-6 font-display leading-[0.92] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                {AGENT_TOTAL} agents.
                <br />
                <em className="not-italic text-[color:var(--assembl-soft-gold)]">
                  Pick the ones you need.
                </em>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base text-[rgba(250,247,242,0.75)] md:text-lg">
                Every agent grounded in current NZ legislation. Subscribe, pay per output, or
                pay per resolution. assembl bills based on what your team actually uses — not
                on seats you forget you bought.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/agents"
                  className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-soft-gold)] px-7 text-sm font-medium text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Browse agents
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center rounded-full border border-[rgba(250,247,242,0.3)] px-7 text-sm font-medium text-[color:var(--assembl-paper)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--assembl-paper)] md:text-base"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── PILOT SPRINT ────────────────────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-32">
        <div className="container">
          <SectionReveal>
            <div
              className="mx-auto max-w-4xl border-l-4 p-8 md:p-12"
              style={{ borderColor: '#2B6B57' }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Pilot Sprint
              </p>
              <h2
                className="mt-4 font-display leading-tight tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
              >
                NZ$5,000 + GST. Two weeks. One workflow. One Evidence Pack.
              </h2>
              <p className="mt-6 max-w-2xl text-[color:var(--text-body)]">
                The fastest way to see what assembl does for your business. Pick one workflow —
                a consent application, a customs declaration, a safety plan — and your agents
                draft it end-to-end, with every NZ Act and Section cited.
              </p>
              <p className="mt-3 max-w-2xl text-[color:var(--text-body)]">
                If your team has not saved time by week two, you get your money back.
              </p>
              <div className="mt-10">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Book your pilot
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── TRUST CLOSE ────────────────────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-4xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Provenance · Compliance · Aotearoa
              </p>
              <h2
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Every agent cites current NZ legislation.
                <br />
                Every output is an evidence pack.
                <br />
                <em className="not-italic text-gradient-hero">Built in Aotearoa.</em>
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-16 grid max-w-4xl gap-10 text-left sm:grid-cols-3">
            {[
              {
                title: 'Cited',
                body: 'Outputs reference the exact section of the Building Act, Food Act, Customs and Excise Act, or relevant regulation.',
              },
              {
                title: 'Watermarked',
                body: 'Provenance signature on every document — auditor-defensible trail of who, what, when.',
              },
              {
                title: 'NZ-hosted',
                body: 'Data sovereignty by default. Your records stay in Aotearoa.',
              },
            ].map((pillar, i) => (
              <SectionReveal key={pillar.title} delay={i * 0.12}>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.32em] text-[color:var(--assembl-soft-gold)]">
                    {pillar.title}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-[color:var(--text-body)]">
                    {pillar.body}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
