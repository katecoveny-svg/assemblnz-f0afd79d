import Link from "next/link";
import { ArrowRight, FileCheck2, Sparkles, Workflow } from "lucide-react";
import { INDUSTRY_KETES, WHANAU_KETE } from "@/lib/kete";
import { PRICING_TIERS } from "@/lib/pricing";
import { KeteCard } from "@/components/site/kete-card";

const STEPS = [
  {
    icon: Sparkles,
    title: "Pick your kete",
    body:
      "Choose the industry kete that fits — Waihanga for construction, Manaaki for hospitality, five in total. Modular, swap any time.",
  },
  {
    icon: Workflow,
    title: "Agents go to work",
    body:
      "Autonomous workflows handle quotes, rosters, manifests, briefs — citing the latest NZ legislation as they go.",
  },
  {
    icon: FileCheck2,
    title: "Get evidence packs",
    body:
      "Every output is auditor-ready: cited, timestamped, watermarked for provenance. Defensible by default.",
  },
];

const PRICING_PREVIEW_SLUGS = ["family", "operator", "enterprise"] as const;

export default function HomePage() {
  const pricingPreview = PRICING_PREVIEW_SLUGS.map(
    (slug) => PRICING_TIERS.find((t) => t.slug === slug)!
  );

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(217, 188, 122, 0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(201, 216, 208, 0.20) 0%, transparent 55%)",
          }}
        />

        <div className="container py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-up">
            <span className="badge-gold inline-flex">
              Built in Aotearoa · Mārama Whenua v1.0
            </span>

            <h1 className="mt-8 font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              <span className="text-gradient-hero">Autonomous AI agents</span>
              <br />
              <span className="text-[color:var(--text-primary)]">
                for New&nbsp;Zealand business
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-[color:var(--text-body)] md:text-xl">
              Industry-specific kete that cite legislation, produce evidence
              packs, and pass auditor scrutiny.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#kete"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Explore the five kete
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a demo
              </Link>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              NZ-hosted data · GST-exclusive · Cancel any time
            </p>
          </div>
        </div>
      </section>

      {/* ── Industry kete grid (5) ────────────────────────────── */}
      <section id="kete" className="relative scroll-mt-20">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              The five industry kete
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Five kete. One quiet platform.
            </h2>
            <p className="mt-5 text-base text-[color:var(--text-body)] md:text-lg">
              Each kete is purpose-built for an industry — its workflows, its
              compliance regime, its evidence requirements. Modular, so you
              start with what you need and add as you grow.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRY_KETES.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tōroa — whānau ─────────────────────────────────────── */}
      <section className="relative">
        <div className="container py-12 md:py-16">
          <div
            className="glass-card-elevated relative overflow-hidden p-8 md:p-12"
            style={{ ["--kete-accent" as string]: WHANAU_KETE.accent }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-50"
              style={{
                background: `radial-gradient(circle, ${WHANAU_KETE.accent} 0%, transparent 70%)`,
              }}
            />

            <div className="relative grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  For whānau · Family tier
                </span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl">
                  Tōroa
                </h2>
                <p className="mt-4 text-base text-[color:var(--text-body)] md:text-lg">
                  An SMS-first whānau agent for households. Routines, school
                  logistics, and the quiet admin of family life — without
                  another app to open.
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
                    $29
                    <span className="ml-1 text-lg font-normal text-[color:var(--text-secondary)]">
                      /month
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    No setup · NZD, GST excl.
                  </p>
                </div>
                <Link
                  href="/kete/toroa"
                  className="cta-primary inline-flex h-11 items-center px-6 text-sm"
                >
                  Meet Tōroa
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
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
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <step.icon
                    className="h-5 w-5 text-[color:var(--assembl-soft-gold)]"
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

      {/* ── Pricing summary ──────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="glass-card-elevated mx-auto max-w-5xl p-8 md:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Pricing
                </span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl">
                  Transparent, NZD, no surprises.
                </h2>
                <p className="mt-4 text-[color:var(--text-body)]">
                  Five tiers, one ladder — from a $29/mo whānau agent to bespoke
                  outcome engagements. GST exclusive, cancel any time.
                </p>
              </div>
              <Link
                href="/pricing"
                className="cta-primary inline-flex h-11 items-center self-start px-6 text-sm md:self-auto"
              >
                See full pricing
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {pricingPreview.map((tier) => (
                <div
                  key={tier.slug}
                  className="rounded-card border border-[rgba(157,140,125,0.18)] bg-white/50 p-6"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    {tier.name} · {tier.audience}
                  </p>
                  <p className="mt-3 font-display text-3xl text-[color:var(--text-primary)]">
                    {tier.monthly}
                    {tier.monthly !== "—" && (
                      <span className="ml-1 text-sm font-normal text-[color:var(--text-secondary)]">
                        /mo
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--text-secondary)]">
                    Setup: {tier.setup}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ─────────────────────────────────────────────── */}
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
                  Outputs reference the exact section of the Building Act, Food
                  Act, Customs Act, or relevant regulation.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Watermarked
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Provenance signature on every document — auditor-defensible
                  trail of who, what, when.
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
