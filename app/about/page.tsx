import { AboutHero } from '@/components/site/AboutHero';
import { FadeUp } from '@/components/motion/FadeUp';
import Link from 'next/link';

/**
 * /about — PAINTERLY canon page.
 * Uses AboutHero (warm olive gradient, not cream paper).
 * Per Interactive Web Canon §3: softer, more atmospheric, emotional register.
 * No sticky-side narrative — scrolling editorial sections.
 */

export const metadata = {
  title: 'About assembl',
  description:
    'assembl is an intelligent automation platform built for New Zealand businesses. Quiet intelligence for the work that keeps Aotearoa moving.',
};

export default function AboutPage() {
  return (
    <>
      {/* PAINTERLY hero */}
      <AboutHero
        eyebrow="assembl · Aotearoa"
        headline={['Quiet intelligence', 'for the work that keeps', 'Aotearoa moving.']}
        body="assembl builds intelligent agent workflows for New Zealand industries. Every workflow ends with a signed evidence pack. Every claim cites the Act that governs it. Nothing ships before a person says so."
      />

      {/* Origin section */}
      <section className="bg-[color:var(--assembl-paper)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-24">
            <FadeUp>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                WHY ASSEMBL EXISTS
              </p>
              <h2
                className="mt-6 font-display leading-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 3rem)' }}
              >
                New Zealand businesses shouldn't have to trust a black box.
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="space-y-6 font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
                <p>
                  Intelligent agents are transforming how work gets done. But adoption in New Zealand
                  has been slow — not because of a lack of willingness, but because of a lack of
                  trust. Outputs without citations. Decisions without audit trails. Automation
                  without oversight.
                </p>
                <p>
                  assembl was built to solve that. Every workflow runs through a fixed five-stage
                  compliance pipeline. Every output is a watermarked evidence pack with a hash-chain
                  audit trail. Every consequential action requires a named human to sign off.
                </p>
                <p>
                  We built it for the industries that hold Aotearoa together — construction,
                  freight, hospitality, retail, early childhood. The businesses that have real
                  regulatory obligations and real consequences for getting it wrong.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              HOW WE WORK
            </p>
          </FadeUp>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Draft-only posture',
                body: 'No agent may autonomously publish, sign, send, or execute any material action. All consequential outputs require explicit approval from a named human operator. This is not a courtesy feature. It is the architecture.',
              },
              {
                num: '02',
                title: 'Evidence not drama',
                body: 'Every output is a watermarked document — citations, attribution, sign-off block, hash-chain provenance. Audit-ready by default. Not because we expect you to be audited, but because you might be.',
              },
              {
                num: '03',
                title: 'Grounded in NZ law',
                body: 'Every claim in every output cites a New Zealand statute — Act, section, and year. Agents do not generate legislation. They read it, cite it, and flag when it has changed. You hold the expertise. We hold the receipts.',
              },
              {
                num: '04',
                title: 'Tikanga Māori alignment',
                body: 'assembl is designed to respect Te Mana Raraunga — Māori data sovereignty principles. Iwi and hapū retain authority over their data. The platform never generates karakia, whaikōrero, or sacred content. Cultural authority stays with rights holders.',
              },
              {
                num: '05',
                title: 'Transparent by default',
                body: 'Every agent interaction is logged with a session ID, a model attribution, and a per-stage verdict. You can inspect what data an agent accessed and how a decision was reached. Opacity is not a feature we offer.',
              },
              {
                num: '06',
                title: 'Built for adoption',
                body: 'New Zealand has a cautious relationship with intelligent automation — and rightly so. assembl is designed to be the most accessible, affordable, and simple-to-implement option in the market. Trusted advisor before scale.',
              },
            ].map((p) => (
              <FadeUp key={p.num}>
                <article>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                    {p.num}
                  </p>
                  <h3
                    className="mt-3 font-display leading-tight text-[color:var(--text-primary)]"
                    style={{ fontWeight: 400, fontSize: '1.2rem' }}
                  >
                    {p.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
                    {p.body}
                  </p>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* NZ compliance stamps */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="flex flex-wrap items-center gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                Compliance posture:
              </p>
              {[
                'NZ Privacy Act 2020',
                'MBIE Responsible Automation Guidance',
                'NZ Algorithm Charter',
                'Te Mana Raraunga',
                'Sydney data hosting',
              ].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-[color:var(--assembl-mist)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)] ring-1 ring-[color:var(--assembl-gold-thread)] ring-opacity-30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeUp>
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
                <span className="block">One workflow.</span>
                <span className="block">Two weeks.</span>
                <span className="block">Evidence Friday.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full bg-[#FAF7F2] px-7 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
                <Link
                  href="/kete"
                  className="inline-flex h-12 items-center rounded-full border border-[#FAF7F2] border-opacity-60 px-7 text-sm text-[#FAF7F2] transition-all hover:border-opacity-100 hover:bg-[#FAF7F2] hover:text-[color:var(--assembl-pounamu)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
                >
                  See all kete →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
