import Link from 'next/link';
import { ArrowRight, FileCheck2, CheckCircle, Workflow } from 'lucide-react';
import { INDUSTRY_KETES } from '@/lib/kete';
import { AGENTS } from '@/lib/agents';
import { KeteCard } from '@/components/site/kete-card';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteHeroMount } from '@/components/KeteHeroMount';
import { KeteIllustration } from '@/components/KeteIllustration';

const AGENT_TOTAL = AGENTS.length;
const FEATURED_KETES = INDUSTRY_KETES.filter((k) => k.status === 'active');
const SECONDARY_KETES = INDUSTRY_KETES.filter((k) => k.status !== 'active');

const STEPS = [
  {
    icon: CheckCircle,
    title: 'Agents draft',
    body: 'Specialist agents — each grounded in NZ legislation for your industry — produce compliance documentation, consent applications, and audit reports. They draft. You do not start from a blank page.',
  },
  {
    icon: Workflow,
    title: 'The pipeline checks',
    body: 'Every draft passes through a five-stage compliance pipeline: policy detection, intelligent routing, citation verification, source checking, and human approval. Nothing skips a stage.',
  },
  {
    icon: FileCheck2,
    title: 'You decide',
    body: 'Nothing ships without your sign-off. Every output comes with an Evidence Pack — a tamper-evident audit trail showing every Act and Section that was checked, and when. The agent drafted. You approved. That is the record.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero — interactive 3D KeteHero behind locked block ──── */}
      <section className="relative overflow-hidden">
        {/* Interactive 3D layer (Three.js); reduced-motion swaps to static poster) */}
        <div className="absolute inset-0 -z-20">
          <KeteHeroMount />
        </div>

        {/* Soft radial glow over the kete */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(43, 107, 87, 0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(184, 178, 168, 0.15) 0%, transparent 55%)',
          }}
        />

        <div className="container py-24 md:py-32 lg:py-40">
          {/* Asymmetric: text on left, kete on right — no more text-on-top-of-kete */}
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <SectionReveal>
                <span className="badge-gold inline-flex">Built in Aotearoa · Mārama Whenua</span>
              </SectionReveal>

              <SectionReveal delay={0.1}>
                <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
                  Less noise. More{' '}
                  <em className="not-italic text-gradient-hero">time</em>.
                </h1>
              </SectionReveal>

              <SectionReveal delay={0.2}>
                <p className="mt-6 text-lg text-[color:var(--text-body)] md:text-xl">
                  Quiet intelligence for the businesses that build Aotearoa.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.3}>
                <p className="mt-6 max-w-xl text-base text-[color:var(--text-body)] lg:mx-0 mx-auto">
                  79% of Kiwi businesses don&apos;t know how to use AI safely. 97% of the workforce
                  isn&apos;t trained for it. assembl fixes the trust gap — every output is reviewed
                  in Draft Mode before anything goes out.
                </p>
              </SectionReveal>

              <SectionReveal delay={0.4}>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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

              <SectionReveal delay={0.5}>
                <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  NZ-hosted data · GST-exclusive · Cancel any time
                </p>
              </SectionReveal>
            </div>

            {/* Kete totem — crisp SVG, sits in its own column. No more text on top of kete. */}
            <SectionReveal delay={0.2}>
              <div className="flex justify-center lg:justify-end">
                <KeteIllustration className="h-72 w-auto md:h-96 lg:h-[28rem]" />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ── Industry kete grid (Paper) ──────────────────────────── */}
      <section
        id="kete"
        className="relative scroll-mt-20 bg-[color:var(--assembl-paper)] py-32 md:py-48"
      >
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Industry kete
              </span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Purpose-built for your industry.
              </h2>
              <p className="mt-5 text-base text-[color:var(--text-body)] md:text-lg">
                Each kete is grounded in the legislation your industry lives under — its workflows,
                its compliance regime, its evidence requirements.
              </p>
            </div>
          </SectionReveal>

          {/* Asymmetric layout: featured (live) kete full-width on top, secondary in 3-cols below */}
          <div className="mx-auto mt-16 grid max-w-6xl gap-8">
            {FEATURED_KETES.map((kete, i) => (
              <KeteCard key={kete.slug} kete={kete} index={i} featured />
            ))}
            {SECONDARY_KETES.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                {SECONDARY_KETES.map((kete, i) => (
                  <KeteCard
                    key={kete.slug}
                    kete={kete}
                    index={FEATURED_KETES.length + i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Agent marketplace CTA (Mist tint) — replaces the Tōro card ──── */}
      <section className="relative bg-[color:var(--assembl-mist)]/40 py-32 md:py-48">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Agent marketplace
              </span>
              <h2 className="mt-3 font-display text-5xl md:text-6xl">
                {AGENT_TOTAL} agents.{' '}
                <em className="not-italic text-gradient-hero">Pick the ones you need.</em>
              </h2>
              <p className="mt-6 text-base text-[color:var(--text-body)] md:text-lg">
                Every agent grounded in current NZ legislation. Subscribe, pay per output, or pay
                per resolution. assembl bills based on what your team actually uses — not on seats
                you forget you bought.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/agents"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Browse agents
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  See pricing
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── How it works (Paper) ────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-48">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                How it works
              </span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Three steps. Time returned.
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <SectionReveal key={step.title} delay={i * 0.15}>
                <div className="glass-card relative h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(43,107,87,0.10)]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[color:var(--text-secondary)]">
                      Step {String(i + 1).padStart(2, '0')}
                    </span>
                    <step.icon
                      className="h-5 w-5 text-[color:var(--assembl-sage-mist)]"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-[color:var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {step.body}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilot Sprint (Mist tint) ─────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-mist)]/40 py-24 md:py-32">
        <div className="container">
          <SectionReveal>
            <div
              className="glass-card-elevated mx-auto max-w-4xl p-8 md:p-12"
              style={{ borderLeft: '3px solid #2B6B57' }}
            >
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Pilot Sprint
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">
                NZ$5,000 + GST. Two weeks. One workflow. One Evidence Pack.
              </h2>
              <p className="mt-4 text-[color:var(--text-body)]">
                The fastest way to see what assembl does for your business. Pick one workflow — a
                consent application, a customs declaration, a safety plan — and your agents draft it
                end-to-end, with every NZ Act and Section cited.
              </p>
              <p className="mt-3 text-[color:var(--text-body)]">
                If your team has not saved time by week two, you get your money back.
              </p>
              <div className="mt-8">
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

      {/* Brand film section removed from homepage 2026-05-06 — videos didn't match
          the original Opening/Dashboard/Pipeline/Close narrative and labels were confusing.
          Binaries still in public/video/brand-film-scene-{1-4}-narrated.mp4 — can be
          surfaced on a dedicated /brand-film route in a follow-up if needed. */}


      {/* ── Trust strip (Paper) ─────────────────────────────── */}
      <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-32">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="badge-sage inline-flex">
                Provenance · Compliance · Aotearoa
              </span>
              <h2 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
                Every agent cites current NZ legislation.
                <br />
                Every output is an evidence pack.
                <br />
                <span className="text-gradient-hero">Built in Aotearoa.</span>
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-12 grid max-w-3xl gap-8 text-left sm:grid-cols-3">
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
              <SectionReveal key={pillar.title} delay={i * 0.15}>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                    {pillar.title}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--text-body)]">{pillar.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
