import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Built in Aotearoa. For Aotearoa. assembl exists because compliance should not cost your team their Friday afternoons.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Hero imagery layer — kete totem sits in front of ambient video */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-kete-totem.png"
            className="absolute inset-0 h-full w-full object-cover opacity-15 motion-reduce:hidden"
          >
            <source src="/video/about-hero.mp4" type="video/mp4" />
          </video>
          <img
            src="/images/hero-kete-totem.png"
            alt=""
            className="absolute inset-0 z-10 h-full w-full object-cover opacity-35"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(184, 178, 168, 0.15) 0%, transparent 50%)',
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-sage inline-flex">About assembl</span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">
              Built in Aotearoa. For{' '}
              <em className="not-italic text-gradient-hero">Aotearoa</em>.
            </h1>
            <p className="mt-6 text-lg text-[color:var(--text-body)]">
              assembl exists because compliance should not cost your team their Friday afternoons.
            </p>
          </div>
        </div>
      </section>

      {/* What assembl is */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              What assembl is
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Purpose-built agents. Governed outputs.
            </h2>
            <div className="mt-6 space-y-4 text-[color:var(--text-body)]">
              <p>
                assembl is a governed AI platform for New Zealand businesses. Purpose-built agents
                — organised into industry ketes — draft compliance documentation, cite NZ
                legislation, and produce tamper-evident Evidence Packs that show exactly what was
                checked, by whom, and when.
              </p>
              <p>
                Every piece of work passes through a five-stage compliance pipeline before it
                reaches you. Every agent operates in draft-only mode — nothing publishes, sends, or
                executes without a human sign-off.
              </p>
              <p>We work alongside your team. We do not replace anyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="relative">
        <div className="container py-8 md:py-12">
          <div className="glass-card-elevated mx-auto max-w-3xl p-8 md:p-12">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              From the founder
            </span>
            <h2 className="mt-3 font-display text-2xl md:text-3xl">
              Kate Hudson
            </h2>
            <div className="mt-4 space-y-3 text-[color:var(--text-body)]">
              <p className="italic text-[color:var(--text-secondary)]">
                [Kate — this section is yours. 3–5 sentences in your own voice about why you built
                assembl, what you saw in NZ businesses, and what drives the company.]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Atmospheric break — soft warm interlude between founder voice and tikanga framework */}
      <div aria-hidden className="relative h-32 overflow-hidden md:h-48">
        <img
          src="/images/ambient-warmth.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.25] motion-reduce:opacity-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-transparent to-[#FAF7F2]" />
      </div>

      {/* Tikanga posture */}
      <section className="relative">
        <div className="container py-16">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 md:p-12">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Our approach to tikanga
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Principles in the system, not the brochure.
            </h2>

            <p className="mt-6 text-[color:var(--text-body)]">
              assembl\'s governance is grounded in four pou: rangatiratanga (authority and
              self-determination over data), kaitiakitanga (stewardship and care), manaakitanga
              (hospitality and respect), and whanaungatanga (relationships and reciprocity).
            </p>
            <p className="mt-4 text-[color:var(--text-body)]">
              We cite these frameworks because we believe in them, not because we have earned the
              right to perform them. Te reo Māori lives in our architecture — in the names of our
              ketes, our agents, our compliance pipeline stages — because those names carry meaning
              we respect. English leads our public voice because we serve builders, brokers, and
              council officers who need to engage without translating.
            </p>
            <p className="mt-4 text-[color:var(--text-body)]">
              We do not generate AI karakia, whaikōrero, or waiata. That is a hard boundary.
            </p>
          </div>
        </div>
      </section>

      {/* Where we are */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Where we are
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Sole-founder. Aotearoa-built.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)]">
              assembl is based in Aotearoa New Zealand. Our infrastructure runs on servers in
              Sydney (ap-southeast-2), the closest AWS/Supabase region to New Zealand. We are a
              sole-founder company built by Kate Hudson.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12">
            <h2 className="font-display text-3xl md:text-4xl">
              See it work in your own data.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              The fastest way to understand assembl is to watch it produce a real evidence pack
              on a real workflow you already have.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a conversation
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
