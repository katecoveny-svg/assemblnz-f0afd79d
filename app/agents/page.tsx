import { HeroPage } from '@/components/site/HeroPage';
import { FadeUp } from '@/components/motion/FadeUp';
import { KETES, VESSEL_ASSETS } from '@/lib/site-config';
import Link from 'next/link';

/**
 * /agents — Phase 1 placeholder.
 * Full 46-agent index with capability matrix in Phase 1B.
 * For now: hero + kete grouping + link to each kete detail page.
 */

export const metadata = {
  title: 'Specialist agents — assembl',
  description:
    'Forty-six specialist agents across eight industry kete. Every agent grounded in the NZ legislation that governs its domain.',
};

export default function AgentsPage() {
  return (
    <>
      <HeroPage
        eyebrow="SPECIALIST AGENTS"
        headline={['Forty-six specialists.', 'One standard of evidence.']}
        body="Every assembl kete contains specialist agents — each one grounded in the New Zealand legislation that governs its domain. Confident in their lane. Sceptical outside it. Every output signed by a named human before it ships."
        ctaPrimary={{ label: 'See all kete →', href: '/kete' }}
        ctaSecondary={{ label: 'How it works', href: '/how-it-works' }}
        vesselSrc={VESSEL_ASSETS.hero16x9}
        vesselAlt="assembl Evidence Vessel — specialist agents"
      />

      {/* Agent roster by kete */}
      <section className="bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              AGENTS BY KETE · FULL CAPABILITY MATRIX IN PHASE 1B
            </p>
          </FadeUp>

          <div className="space-y-8">
            {KETES.map((kete) => (
              <FadeUp key={kete.slug}>
                <div className="rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                          {kete.industry}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${
                            kete.status === 'pilot'
                              ? 'bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu)]'
                              : kete.status === 'shortly'
                              ? 'bg-[color:var(--assembl-mist)] text-[color:var(--text-secondary)]'
                              : 'text-[color:var(--text-tertiary)]'
                          }`}
                        >
                          {kete.status === 'pilot' ? 'Live' : kete.status === 'shortly' ? 'Shortly' : 'Roadmap'}
                        </span>
                      </div>
                      <h2
                        className="mt-2 font-display leading-tight text-[color:var(--text-primary)]"
                        style={{ fontWeight: 400, fontSize: '1.3rem' }}
                      >
                        {kete.name}
                      </h2>
                      <p className="mt-1 max-w-lg font-body text-sm leading-relaxed text-[color:var(--text-body)]">
                        {kete.tagline}
                      </p>
                    </div>
                    <Link
                      href={`/kete/${kete.slug}`}
                      className="inline-flex h-9 items-center rounded-full border border-[color:var(--assembl-gold-thread)] border-opacity-60 px-5 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)] transition-colors hover:border-opacity-100 hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)]"
                    >
                      View kete →
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-pounamu)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-2xl">
              <h2
                className="font-display leading-[0.96] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
              >
                <span className="block">Start with one agent.</span>
                <span className="block">Two weeks. Evidence Friday.</span>
              </h2>
              <div className="mt-8">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full bg-[#FAF7F2] px-7 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
