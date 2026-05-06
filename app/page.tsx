import Link from 'next/link';
import { ArrowRight, FileCheck2, CheckCircle, Workflow } from 'lucide-react';
import { INDUSTRY_KETES, WHANAU_KETE } from '@/lib/kete';
import { KeteCard } from '@/components/site/kete-card';

const STEPS = [
  {
    icon: CheckCircle,
    title: 'Agents draft',
    body:
      'Specialist agents — each grounded in NZ legislation for your industry — produce compliance documentation, consent applications, and audit reports. They draft. You do not start from a blank page.',
  },
  {
    icon: Workflow,
    title: 'The pipeline checks',
    body:
      'Every draft passes through a five-stage compliance pipeline: policy detection, intelligent routing, citation verification, source checking, and human approval. Nothing skips a stage.',
  },
  {
    icon: FileCheck2,
    title: 'You decide',
    body:
      'Nothing ships without your sign-off. Every output comes with an Evidence Pack — a tamper-evident audit trail showing every Act and Section that was checked, and when. The agent drafted. You approved. That is the record.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
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
            className="absolute inset-0 h-full w-full object-cover opacity-20 motion-reduce:hidden"
          >
            <source src="/video/hero-kete-push-in.mp4" type="video/mp4" />
          </video>
          <img
            src="/images/hero-kete-totem.png"
            alt=""
            className="absolute inset-0 z-10 h-full w-full object-cover opacity-60"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(43, 107, 87, 0.10) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(184, 178, 168, 0.15) 0%, transparent 55%)',
          }}
        />

        <div className="container py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-up">
            <span className="badge-gold inline-flex">
              Built in Aotearoa · Mārama Whenua
            </span>

            <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              Less noise. More{' '}
              <em className="not-italic text-gradient-hero">time</em>.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--text-body)] md:text-xl">
              Quiet intelligence for the businesses that build Aotearoa.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base text-[color:var(--text-body)]">
              assembl works alongside your team — purpose-built AI agents that draft compliance
              documentation, cite every NZ Act and Section, and hand it to you for sign-off. Your
              people keep doing what they do best. They just get the Friday afternoon back.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Start your pilot
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                See pricing
              </Link>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              NZ-hosted data · GST-exclusive · Cancel any time
            </p>
          </div>
        </div>
      </section>

      {/* ── Industry kete grid ───────────────────────────────── */}
      <section id="kete" className="relative scroll-mt-20">
        <div className="container py-16 md:py-24">
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

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_KETES.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tōro — whānau ──────────────────────────────────────── */}
      <section className="relative">
        <div className="container py-12 md:py-16">
          <div
            className="glass-card-elevated relative overflow-hidden p-8 md:p-12"
            style={{ ['--kete-accent' as string]: WHANAU_KETE.accent }}
          >
            <div className="relative grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  For whānau · Family tier
                </span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl">
                  Tōro
                </h2>
                <p className="mt-4 text-base text-[color:var(--text-body)] md:text-lg">
                  Tōro is assembl\'s family agent — a personal assistant for household admin,
                  school communications, appointment management, and family scheduling.
                  Available self-serve at the Family tier.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: WHANAU_KETE.accent }}
                    aria-hidden
                  />
                  <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">
                    {WHANAU_KETE.accentName}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <div className="text-left md:text-right">
                  <p className="font-display text-5xl text-[color:var(--text-primary)]">
                    NZ$29
                    <span className="ml-1 text-lg font-normal text-[color:var(--text-secondary)]">
                      /month
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    No setup · GST excl.
                  </p>
                </div>
                <Link
                  href="/kete/toro"
                  className="cta-primary inline-flex h-11 items-center px-6 text-sm"
                >
                  Get started for NZ$29/month
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              How it works
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Three steps. Time returned.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="glass-card relative p-8">
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Waihanga + Pikau spotlight ─────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Active kete
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Every agent cites current NZ legislation.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="glass-card p-8">
              <p
                className="font-mono text-xs uppercase tracking-[0.22em]"
                style={{ color: '#2B6B57' }}
              >
                Waihanga · Construction
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                Six specialist agents covering health and safety (HSWA 2015), building consents
                (Building Act 2004), BIM analysis, materials compliance, and quality assurance.
                Every consent application leaves with an Evidence Pack your team can stand
                behind with a BCA.
              </p>
              <Link
                href="/kete/waihanga"
                className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                Learn more <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>

            <div className="glass-card p-8">
              <p
                className="font-mono text-xs uppercase tracking-[0.22em]"
                style={{ color: '#3B7CB5' }}
              >
                Pikau · Freight & Customs
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                Specialist agents for customs declarations (Customs and Excise Act 2018), tariff
                classification, trade compliance, and freight documentation. The audit trail your
                broker needs.
              </p>
              <Link
                href="/kete/pikau"
                className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              >
                Learn more <ArrowRight className="h-3 w-3" aria-hidden />
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[color:var(--text-secondary)]">
            More industries coming — Manaaki (Hospitality), Auaha (Creative), Arataki (Automotive),
            Hoko (Retail), Ako (Early Childhood).
          </p>
        </div>
      </section>

      {/* ── Pilot Sprint ──────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
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
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book your pilot
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
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

            <div className="mt-12 grid gap-8 text-left sm:grid-cols-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Cited
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Outputs reference the exact section of the Building Act, Food Act, Customs
                  and Excise Act, or relevant regulation.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Watermarked
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Provenance signature on every document — auditor-defensible trail of who,
                  what, when.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  NZ-hosted
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Data sovereignty by default. Your records stay in Aotearoa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
