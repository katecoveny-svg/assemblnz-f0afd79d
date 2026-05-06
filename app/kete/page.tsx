import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { KeteScrollSnap } from '@/components/KeteScrollSnap';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Kete',
  description:
    'Eight industry kete. Each one bundles specialist agents grounded in the legislation your industry lives under. Scroll through the full lineup.',
};

export default function KeteIndexPage() {
  return (
    <>
      {/* Intro hero — short, sets up what's about to scroll past */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="container py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Industry kete
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Eight kete.
                <br />
                <em className="not-italic text-gradient-hero">
                  Eight industries.
                </em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each kete bundles specialist agents grounded in the legislation your industry
                lives under — its workflows, its compliance regime, its evidence requirements.
                Scroll through the full lineup.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-12 flex flex-col items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  Scroll
                </p>
                <ArrowDown className="h-5 w-5 animate-bounce text-[color:var(--text-secondary)]" aria-hidden />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The 8 kete scenes — scroll-snap, one per viewport */}
      <KeteScrollSnap />

      {/* Closing — back to homepage / on to agents */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-44">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
              >
                Found yours?{' '}
                <em className="not-italic text-gradient-hero">Pick your agents.</em>
              </h2>
              <p className="mt-8 text-base text-[color:var(--text-body)] md:text-lg">
                Each kete contains specialist agents you can subscribe to, pay per output, or
                pay per resolution. Browse the full marketplace.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/agents"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Browse the agent marketplace
                </Link>
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm transition-transform hover:-translate-y-0.5 md:text-base"
                >
                  Talk to us
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  );
}
