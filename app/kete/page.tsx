import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { ketes as keteImagery } from '@/lib/site-config';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteVesselCard } from '@/components/KeteVesselCard';

export const metadata: Metadata = {
  title: 'Kete',
  description:
    'Eight industry kete. Each one bundles specialist agents grounded in the legislation your industry lives under.',
};

export default function KeteIndexPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-24 md:py-32">
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
                <em className="not-italic text-gradient-hero">Eight industries.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each kete bundles specialist agents grounded in the legislation your industry
                lives under — its workflows, its compliance regime, its evidence requirements.
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      <section className="relative bg-[color:var(--assembl-paper)] pb-24 md:pb-32">
        <div className="container">
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
        </div>
      </section>

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
              <p className="mt-8 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each kete contains specialist agents you can subscribe to, pay per output, or
                pay per resolution.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/agents"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Browse the agent marketplace
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
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
