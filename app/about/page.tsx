import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { painterlyAnchor, footerDisclaimer, reo } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Built in Aotearoa. For Aotearoa. assembl exists because compliance should not cost your team their Friday afternoons.',
};

// /about — Painterly canon. Warm olive gradient, painterly anchor as hero.
export default function AboutPage() {
  return (
    <div className="painterly-page relative">
      {/* Painterly canon — warm olive gradient runs the length of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, #6B5843 0%, #4F4234 18%, #3A3128 45%, #2A241D 100%)',
        }}
      />

      {/* Hero — painterly anchor */}
      <section className="relative overflow-hidden">
        <div className="container py-24 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionReveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-brand-soft">
                <img
                  src={painterlyAnchor}
                  alt="assembl — painterly anchor, Waihanga"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 60%, rgba(42, 36, 29, 0.45) 100%)',
                  }}
                />
              </div>
            </SectionReveal>

            <SectionReveal delay={0.15}>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                About assembl
              </p>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Built in Aotearoa.
                <br />
                <em className="not-italic" style={{ color: '#D4A853' }}>
                  For Aotearoa.
                </em>
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                assembl exists because compliance should not cost your team their Friday
                afternoons. Quiet intelligence, with the trail attached. Every workflow we run
                ends with an evidence pack you can file, forward, or footnote.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Trust gap framing — strategic positioning anchor */}
      <section className="relative">
        <div className="container py-16">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                Why we exist
              </p>
              <blockquote
                className="mt-6 font-display leading-[1.1] text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3.6vw, 3rem)' }}
              >
                79% of Kiwi businesses don&apos;t know how to use intelligent agents safely. 97% of the
                workforce isn&apos;t trained for them. We&apos;re high-use and low-trust as a country.
                <em className="not-italic" style={{ color: '#D4A853' }}>
                  {' '}The trust gap is what we&apos;re here to close.
                </em>
              </blockquote>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#E8E4DE]">
                Every output assembl produces is reviewed in Draft Mode before anything is sent,
                filed, or published. The agent drafts. You decide. That is the trust standard, and
                it does not flex with the plan you pick.
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#B8B2A8]">
                Source — Blueprint for Aotearoa, NZ industry forum (May 2026)
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Strategic positioning — vertical-AI strategy memo, 2026-05-09 */}
      <section className="relative">
        <div className="container py-12 md:py-16">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                Where assembl sits
              </p>
              <p
                className="mt-6 font-display leading-[1.15] text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)' }}
              >
                {reo.aboutPositioning}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#E8E4DE]">
                Three things sit underneath every workflow we run: an evidence ledger and a
                work diary of every agent action (so you can prove what happened), a NZ
                policy runtime (so Privacy Act, tikanga, and Te Tiriti governance are wired
                into the substrate), and an agent-to-agent collection loop (so chasing
                missing documents stops being your team’s afternoon).
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* What assembl is */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                What assembl is
              </p>
              <h2
                className="mt-4 font-display leading-[0.98] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
              >
                Purpose-built agents.{' '}
                <em className="not-italic" style={{ color: '#D4A853' }}>
                  Governed outputs.
                </em>
              </h2>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                <p>
                  assembl is a governed platform for New Zealand businesses. Purpose-built agents
                  — organised into industry kete — draft compliance documentation, cite NZ
                  legislation, and produce tamper-evident evidence packs that show exactly what
                  was checked, by whom, and when.
                </p>
                <p>
                  Every piece of work passes through a five-stage compliance pipeline before it
                  reaches you. Every agent operates in draft-only mode — nothing publishes, sends,
                  or executes without a human sign-off.
                </p>
                <p>We work alongside your team. We do not replace anyone.</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Founder voice */}
      <section className="relative">
        <div className="container py-16">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                From the founder
              </p>
              <h2 className="mt-4 font-display text-3xl text-[#FAF7F2] md:text-4xl">
                Kate Hudson
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                <p>
                  I built assembl because compliance work in Aotearoa still costs teams their
                  Friday afternoons. The intelligent automation tools available today are
                  capable; the trust scaffolding around them is not. Every workflow that runs
                  through assembl ends in a signed evidence pack — what was checked, by whom,
                  against which Act, on what date.
                </p>
                <p>
                  Quiet intelligence with the trail attached. That is the standard, and it
                  does not flex with the plan you pick.
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#B8B2A8]">
                  — Kate Hudson, founder
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Tikanga posture */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                Our approach to tikanga
              </p>
              <h2
                className="mt-4 font-display leading-[0.98] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
              >
                Principles in the system,{' '}
                <em className="not-italic" style={{ color: '#D4A853' }}>
                  not the brochure.
                </em>
              </h2>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                <p>
                  assembl&apos;s governance is grounded in four pou: rangatiratanga (authority and
                  self-determination over data), kaitiakitanga (stewardship and care), manaakitanga
                  (hospitality and respect), and whanaungatanga (relationships and reciprocity).
                </p>
                <p>
                  We cite these frameworks because we believe in them, not because we have earned
                  the right to perform them. Te reo Māori lives in our architecture — in the names
                  of our kete, our agents, our compliance pipeline stages — because those names
                  carry meaning we respect. English leads our public voice because we serve
                  builders, brokers, and council officers who need to engage without translating.
                </p>
                <p>
                  We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata. That is a
                  hard boundary.
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Where we are */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <SectionReveal>
            <div className="mx-auto max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#D4A853]/70">
                Where we are
              </p>
              <h2 className="mt-4 font-display text-3xl text-[#FAF7F2] md:text-5xl">
                Sole-founder. Aotearoa-built.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                assembl is based in Aotearoa New Zealand. Our infrastructure runs on servers in
                Sydney (ap-southeast-2), the closest AWS/Supabase region to New Zealand. We are a
                sole-founder company built by Kate Hudson.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="container pb-24 pt-8 md:pb-32">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.98] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
              >
                See it work on{' '}
                <em className="not-italic" style={{ color: '#D4A853' }}>
                  your own data.
                </em>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#E8E4DE] md:text-lg">
                The fastest way to understand assembl is to watch it produce a real evidence pack
                on a real workflow you already have.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Book a conversation
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center rounded-full border border-[#D4A853]/40 px-7 text-sm font-medium text-[#FAF7F2] transition-colors hover:border-[#D4A853] md:text-base"
                >
                  See pricing
                </Link>
              </div>
              <p className="mt-12 max-w-2xl text-xs text-[#B8B2A8] md:mx-auto">
                {footerDisclaimer}
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
