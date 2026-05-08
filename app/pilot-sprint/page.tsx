import { HeroPage } from '@/components/site/HeroPage';
import { FadeUp } from '@/components/motion/FadeUp';
import { VESSEL_ASSETS } from '@/lib/site-config';
import Link from 'next/link';

/**
 * /pilot-sprint — Phase 1 placeholder.
 * Full detail with pricing + booking form in Phase 1B (post-demo).
 * For now: hero + what's included + CTA to contact.
 */

export const metadata = {
  title: 'Pilot Sprint — assembl',
  description:
    'One workflow. Two weeks. Evidence by Friday. The Pilot Sprint is the fastest way to see what assembl can do for your business.',
};

export default function PilotSprintPage() {
  return (
    <>
      <HeroPage
        eyebrow="01 — PILOT SPRINT"
        headline={['One workflow.', 'Two weeks.', 'Evidence by Friday.']}
        body="You pick the workflow that's eating your team's time. Two weeks later, you hold the receipts — or you don't, and fourteen days was a cheap way to find out. Fixed scope. Fixed price. No ongoing commitment required."
        ctaPrimary={{ label: 'Book your sprint →', href: '/contact' }}
        ctaSecondary={{ label: 'How it works', href: '/how-it-works' }}
        vesselSrc={VESSEL_ASSETS.portrait4x5}
        vesselAlt="assembl Evidence Vessel — pilot sprint"
      />

      {/* What's included */}
      <section className="bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <p className="mb-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              WHAT'S INCLUDED
            </p>
          </FadeUp>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Discovery session',
                body: 'One hour with Kate. You describe the workflow. We scope what\'s achievable in two weeks and which NZ legislation it touches.',
              },
              {
                num: '02',
                title: 'Custom kete build',
                body: 'A specialist agent workflow built for your industry and your specific problem. Grounded in the legislation that governs it.',
              },
              {
                num: '03',
                title: 'Five-stage pipeline',
                body: 'Every output runs through Kahu → Iho → Tā → Mahara → Mana. Nothing ships without your sign-off.',
              },
              {
                num: '04',
                title: 'Evidence pack output',
                body: 'A watermarked, hashed, signed evidence pack for every output. Audit-ready. Cites the legislation relied on.',
              },
              {
                num: '05',
                title: 'Handoff documentation',
                body: 'Full documentation of what was built, how it works, and how your team continues using it after the sprint.',
              },
              {
                num: '06',
                title: 'Evaluation on day 14',
                body: 'A structured review of what worked, what the evidence showed, and what the right next step is for your business.',
              },
            ].map((item) => (
              <FadeUp key={item.num}>
                <article className="rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] p-6 md:p-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                    {item.num}
                  </p>
                  <h3
                    className="mt-3 font-display leading-tight text-[color:var(--text-primary)]"
                    style={{ fontWeight: 400, fontSize: '1.15rem' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-[color:var(--text-body)]">
                    {item.body}
                  </p>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                WHO IT'S FOR
              </p>
              <h2
                className="mt-6 font-display leading-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 3rem)' }}
              >
                Any NZ business with a workflow that has regulatory weight.
              </h2>
              <p className="mt-4 font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
                Active pilots are running in construction (Waihanga) and freight customs (Pikau). The Pilot Sprint is open to any industry — if your workflow involves NZ legislation, we can ground the agent in it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  'Construction', 'Freight & customs', 'Hospitality', 'Automotive',
                  'Creative', 'Early childhood', 'Retail', 'Your industry',
                ].map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center rounded-full bg-[color:var(--assembl-mist)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Booking CTA — Phase 1B: replace with embedded booking form */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-pounamu)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu-paper)]">
                BOOK YOUR SPRINT
              </p>
              <h2
                className="mt-6 font-display leading-[0.96] tracking-tight text-[#FAF7F2]"
                style={{ fontWeight: 300, fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
              >
                <span className="block">Two weeks from now</span>
                <span className="block">you could hold the evidence.</span>
              </h2>
              <p className="mt-6 font-body text-[1.05rem] leading-relaxed text-[color:var(--assembl-pounamu-paper)]">
                Fixed scope. Fixed price. No ongoing commitment required. Book a discovery session and we'll scope the sprint together.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center rounded-full bg-[#FAF7F2] px-7 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
                >
                  Book a discovery session →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
