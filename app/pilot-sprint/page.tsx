import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, FileCheck2, Workflow } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { HeroVideo } from '@/components/HeroVideo';
import { PILOT_SPRINT, PRICING_NOTE } from '@/lib/pricing';
import { heroVideos } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Pilot Sprint',
  description:
    'One painful workflow. Two weeks. Evidence by Friday. NZ$5,000 + GST. Money-back if no time saved by week two.',
};

const PHASES = [
  {
    icon: CalendarDays,
    label: 'Week 1',
    title: 'Discovery + scoping',
    body:
      'We sit with the team that runs the workflow. Map the inputs, the steps, the people who sign things off. Pick the agent or pair of agents that will draft the work — and the kete it lives in.',
    deliverables: [
      'Workflow audit — what currently takes hours, where the friction lives',
      'Agent scoping doc — which assembl agents will draft, which legislation they cite',
      'Dummy evidence pack — a worked example on de-identified inputs',
    ],
  },
  {
    icon: Workflow,
    label: 'Week 2',
    title: 'Build + test',
    body:
      'A live agent runs the workflow on real inputs. Side-by-side review with your named reviewer. Tune the prompts, the tone, the citations. Every output stays in Draft Mode — nothing ships without your sign-off.',
    deliverables: [
      'Live agent on your workflow — production data, Draft Mode',
      'Side-by-side review — your team accepts, edits, or rejects each paragraph',
      'Prompt + tone calibration to your house voice',
    ],
  },
  {
    icon: FileCheck2,
    label: 'Friday',
    title: 'Handover',
    body:
      'A full evidence trail for the work the agent did over the two weeks. Time-saved measurement against your baseline. From here you can renew at the regular Subscribe tier, switch to Pay per output, or walk away — your call.',
    deliverables: [
      'Full evidence pack across the sprint — every draft, edit, citation, reviewer',
      'Time-saved measurement — agent hours vs. team hours',
      'Optional rollover to Subscribe — Pilot Sprint fee credited to first 3 months',
    ],
  },
] as const;

const KETE_USE_CASES = [
  {
    kete: 'Waihanga',
    industry: 'Construction',
    accent: '#2B6B57',
    workflow: 'Building consent precheck',
    body:
      'Pick one consent application that has been bouncing back from the BCA. assembl drafts the s 14B precheck with every cited Acceptable Solution and producer statement, side-by-side with your designer. By Friday: a precheck pack that the BCA has acknowledged.',
  },
  {
    kete: 'Manaaki',
    industry: 'Hospitality',
    accent: '#AC5838',
    workflow: 'Food Control Plan + alcohol licence renewal',
    body:
      'Pick the FCP verification that is due, or the on-licence that is up for renewal. assembl produces the diary, corrective actions, host responsibility logs, and license-pack — DLC-ready. Your verifier sees a clean trail; your manager spends an hour, not a week.',
  },
  {
    kete: 'Pīkau',
    industry: 'Freight & Customs',
    accent: '#3B7CB5',
    workflow: 'Customs lodgement + IHS declaration',
    body:
      'Pick a recurring import line your broker manages by hand. assembl drafts the entry against the Working Tariff Document, the IHS biosecurity declaration, and the dangerous-goods classification — lodged via Trade Single Window. Your audit trail is one click away from the moment of release.',
  },
] as const;

export default function PilotSprintPage() {
  return (
    <>
      {/* Hero — HeroVideo background; honours prefers-reduced-motion +
          drops to poster-only on mobile (no MP4 bytes < 768px).
          TODO: replace with /pilot-sprint-specific video once Kate generates
          one via vessel-studio; today this reuses the Waihanga placeholder. */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        {heroVideos['pilot-sprint'].src && (
          <HeroVideo
            src={heroVideos['pilot-sprint'].src}
            posterSrc={heroVideos['pilot-sprint'].poster}
            label="Cream stoneware vessel — assembl signature motion"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(43, 107, 87, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                01 — Pilot Sprint
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                One painful workflow.
                <br />
                Two weeks.
                <br />
                <em className="not-italic text-gradient-hero">Evidence by Friday.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Pick the workflow your team dreads — the consent that bounces, the licence
                that drifts, the customs entry that gets reworked. We draft it end-to-end
                with every NZ Act and Section cited. If your team has not saved time by
                week two, you get your money back.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Start a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/how-it-works"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  See how it works
                </Link>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.4}>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                {PILOT_SPRINT.bannerCopy}
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* The offer — three phases */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                The offer
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Two weeks.{' '}
                <em className="not-italic text-gradient-hero">Three milestones.</em>
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-3 md:gap-8">
            {PHASES.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <SectionReveal key={phase.label} delay={i * 0.1}>
                  <article className="glass-card-elevated h-full p-7 md:p-8">
                    <div className="flex items-center gap-3">
                      <Icon
                        className="h-5 w-5 text-[color:var(--assembl-pounamu)]"
                        aria-hidden
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
                        {phase.label}
                      </span>
                    </div>
                    <h3
                      className="mt-5 font-display leading-tight"
                      style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}
                    >
                      {phase.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                      {phase.body}
                    </p>

                    <div className="mt-6 border-t border-[rgba(35,33,31,0.10)] pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        Deliverables
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-body)]">
                        {phase.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2">
                            <span
                              className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--assembl-pounamu)]"
                              aria-hidden
                            />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing block */}
      <section className="relative bg-[color:var(--assembl-paper)] py-12 md:py-20">
        <div className="container">
          <SectionReveal>
            <div
              className="glass-card-elevated mx-auto max-w-4xl p-8 md:p-10"
              style={{ borderTop: '3px solid #D4A853' }}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
                <div className="flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    What it costs
                  </p>
                  <p
                    className="mt-2 font-display leading-none text-[color:var(--text-primary)]"
                    style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}
                  >
                    NZ$5,000{' '}
                    <span className="font-mono text-base text-[color:var(--text-secondary)]">
                      + GST · one-off
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {PILOT_SPRINT.creditBack}
                  </p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    {PRICING_NOTE} · Money-back if no time saved by week 2.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center justify-center px-7 text-sm md:text-base"
                >
                  Start a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Three kete use cases */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                What a Sprint looks like
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Three industries.{' '}
                <em className="not-italic text-gradient-hero">Three workflows.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                A Pilot Sprint shapes itself around the kete you live in. Below — three
                worked examples from the live kete.
              </p>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-14 grid max-w-7xl gap-6 md:grid-cols-3 md:gap-8">
            {KETE_USE_CASES.map((uc, i) => (
              <SectionReveal key={uc.kete} delay={i * 0.1}>
                <article
                  className="glass-card relative h-full overflow-hidden p-7 md:p-8"
                  style={{ ['--kete-accent' as string]: uc.accent }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: uc.accent }}
                      aria-hidden
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      {uc.kete} · {uc.industry}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl leading-tight md:text-3xl">
                    {uc.workflow}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {uc.body}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* From the founder — credibility anchor before the CTA */}
      <section className="relative border-y border-[rgba(35,33,31,0.08)] bg-[#F4EFE7] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-14 xl:gap-20">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] shadow-[0_18px_56px_rgba(35,33,31,0.10)]">
                <Image
                  src="/img/pilot-sprint/kate-hudson-portrait-desk-workspace.webp"
                  alt="Kate Hudson, founder of assembl"
                  fill
                  sizes="(min-width: 1024px) 540px, 100vw"
                  quality={82}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                  From the founder
                </p>
                <h2
                  className="mt-5 font-display leading-[0.98] tracking-tight"
                  style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  One workflow becomes a HAPAI tool.
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                  <p>
                    A Pilot Sprint is hands-on. Your reviewer and I take one real
                    workflow and turn it into a single-purpose HAPAI tool: branded to
                    your team, draft-only, and built around named human review. By Friday
                    of week two, your team has something they can open, use, and share
                    internally — not a slide deck, not a sandbox.
                  </p>
                  <p>
                    The point is adoption without theatre. Your people do not have to
                    learn prompting or switch platforms first. They open the tool, run the
                    workflow in their own language, and leave with an evidence pack that
                    shows what happened.
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    Kate Hudson, founder
                  </p>
                </div>
              </div>
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
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
              >
                Pick the workflow.{' '}
                <em className="not-italic text-gradient-hero">We do the rest.</em>
              </h2>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Start a Pilot Sprint
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  See full pricing
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
