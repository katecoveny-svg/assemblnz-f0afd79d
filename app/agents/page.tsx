import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KETES } from '@/lib/kete';
import { ketes as keteImagery, reo } from '@/lib/site-config';
import { SectionReveal } from '@/components/SectionReveal';
import { KeteVesselCard } from '@/components/KeteVesselCard';

export const metadata: Metadata = {
  title: 'Agent marketplace',
  description:
    'Browse the kete. Each one bundles specialist agents grounded in NZ legislation. Pilot Sprint is the entry point; once embedded, you can scale specific agents per workflow.',
};

// Visual filter chips — no functionality yet, per Phase 1 brief §3.
const FILTER_CHIPS = [
  'All',
  'Construction',
  'Hospitality',
  'Freight & Customs',
  'Creative',
  'Education',
  'Retail',
  'Whānau',
] as const;

export default function AgentsPage() {
  return (
    <>
      {/* Hero */}
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
                Agent marketplace
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Browse the kete.
                <br />
                <em className="not-italic text-gradient-hero">Hire an agent.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each kete bundles specialist agents grounded in NZ legislation. Pilot Sprint
                is the entry point; once embedded, you can scale specific agents per workflow
                — Subscribe, Pay per output, or Pay per resolution.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[color:var(--text-secondary)] md:text-base">
                {reo.agentsPolicyRuntimeIntro}
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Filter chips — visual only for now */}
      <section className="relative bg-[color:var(--assembl-paper)]">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Filter
              </span>
              {FILTER_CHIPS.map((chip, i) => (
                <span
                  key={chip}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${
                    i === 0
                      ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                      : 'border-[rgba(35,33,31,0.15)] bg-white/40 text-[color:var(--text-secondary)]'
                  }`}
                >
                  {chip}
                </span>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* 8 kete cards */}
      <section className="relative bg-[color:var(--assembl-paper)] py-16 md:py-20">
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

      {/* "Coming soon" provisioning UI note */}
      <section className="relative bg-[color:var(--assembl-paper)] py-16">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl rounded-card border border-[rgba(35,33,31,0.10)] bg-white/40 px-6 py-5 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Phase 1B
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                Coming soon: agent provisioning UI — pick agents per workflow, configure
                them in-browser, and ship to Draft Mode without a Pilot Sprint. For now,
                every assembl deployment starts with a Pilot Sprint so we get the workflow
                right with you.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
              >
                Found a kete?{' '}
                <em className="not-italic text-gradient-hero">Pilot it.</em>
              </h2>
              <p className="mt-8 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Two weeks. One workflow. Evidence by Friday.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/pilot-sprint"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Start a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
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
