import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PRICING_TIERS, PRICING_NOTE } from "@/lib/pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Five tiers, NZD, GST exclusive. From a $29/mo whānau agent to bespoke outcome engagements. NZ-hosted data, evidence packs included.",
};

const FAQ = [
  {
    q: "What's included in setup?",
    a: "Onboarding for your team, custom prompts shaped to your business, knowledge base ingestion of your existing SOPs and templates, kete-specific workflow configuration, and the first month of evidence-pack audits to make sure outputs are auditor-ready before you rely on them. Setup fees can be split across the first three invoices on request — just ask.",
  },
  {
    q: "Can I add modules later?",
    a: "Yes. Tiers are designed to scale: start on Operator with one industry kete, move to Leader when you need a second, step up to Enterprise for all five plus unlimited seats and a 99.9% SLA. We pro-rate the upgrade and roll any unused setup credit forward.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — a 14-day evaluation on Operator with no card required. You'll get the full kete and up to three evidence packs to test against your real workflows. We help you set it up and review the outputs with you at the end so you can make a fair call.",
  },
  {
    q: "What's an evidence pack?",
    a: "Every meaningful output from an Assembl kete — a quote, a roster decision, a customs lodgement, a creative brief — bundles the source data, the legislation cited, the agent reasoning, and a provenance watermark into a single auditor-defensible document. Tier limits are monthly caps on how many of these your team produces; most teams use far fewer than they think.",
  },
  {
    q: "Are prices GST-inclusive?",
    a: "No — all prices on this page are NZD, GST exclusive. We add 15% GST at invoice. International customers are billed without GST.",
  },
  {
    q: "Where is data hosted?",
    a: "NZ data residency is the default for Enterprise. Operator and Leader are NZ-hosted by request. Family tier (Tōroa) is hosted in Australia with NZ-only routing for SMS. Full details on the About page and in our security documentation.",
  },
  {
    q: "Can I cancel any time?",
    a: "Monthly contracts cancel at the end of the current billing month with no exit fee. Annual contracts (15% discount) are committed for 12 months but you can pause for up to 60 days within a year if seasonal.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(217, 188, 122, 0.15) 0%, transparent 60%)",
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-gold inline-flex">Pricing</span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">
              <span className="text-gradient-hero">Five tiers.</span>
              <br />
              <span className="text-[color:var(--text-primary)]">
                One quiet ladder.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--text-body)]">
              From a $29/mo whānau agent to bespoke outcome engagements tied to
              measured savings. All prices NZD, GST exclusive.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tier ladder (cards) ──────────────────────────────── */}
      <section className="relative">
        <div className="container pb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <article
                key={tier.slug}
                className={
                  tier.highlighted
                    ? "glass-card-elevated relative p-7"
                    : "glass-card relative p-7"
                }
              >
                {tier.highlighted && (
                  <span className="badge-gold absolute right-6 top-6">
                    Most chosen
                  </span>
                )}

                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {tier.audience}
                </p>
                <h2 className="mt-2 font-display text-3xl text-[color:var(--text-primary)]">
                  {tier.name}
                </h2>

                <div className="mt-6">
                  <p className="font-display text-4xl text-[color:var(--text-primary)]">
                    {tier.monthly}
                    {tier.monthly !== "—" &&
                      !tier.monthly.startsWith("from") && (
                        <span className="ml-1 text-base font-normal text-[color:var(--text-secondary)]">
                          /month
                        </span>
                      )}
                  </p>
                  {tier.monthlyNote && (
                    <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                      {tier.monthlyNote}
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-card bg-white/40 px-4 py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Setup
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--text-primary)]">
                    {tier.setup}
                    {tier.setupNote && (
                      <span className="block text-xs text-[color:var(--text-secondary)]">
                        {tier.setupNote}
                      </span>
                    )}
                  </p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[color:var(--text-body)]">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--assembl-soft-gold)]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={
                    tier.slug === "outcome" || tier.slug === "enterprise"
                      ? "/contact"
                      : "/contact"
                  }
                  className={
                    tier.highlighted
                      ? "cta-primary mt-7 inline-flex h-11 w-full items-center justify-center px-6 text-sm"
                      : "btn-ghost mt-7 inline-flex h-11 w-full items-center justify-center px-6 text-sm"
                  }
                >
                  {tier.slug === "family"
                    ? "Get Tōroa"
                    : tier.slug === "outcome"
                      ? "Discuss an engagement"
                      : "Talk to us"}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center font-mono text-xs leading-relaxed text-[color:var(--text-secondary)]">
            {PRICING_NOTE}
          </p>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Compare tiers
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              At a glance
            </h2>
          </div>

          <div className="glass-card mt-10 overflow-x-auto p-2 md:p-4">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Tier
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Monthly
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Setup
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Kete
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Seats
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    Evidence packs / mo
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[rgba(157,140,125,0.18)]">
                  <td className="px-4 py-4 font-display text-lg text-[color:var(--text-primary)]">
                    Family
                  </td>
                  <td className="px-4 py-4">$29</td>
                  <td className="px-4 py-4">—</td>
                  <td className="px-4 py-4">Tōroa whānau agent</td>
                  <td className="px-4 py-4">Household</td>
                  <td className="px-4 py-4">—</td>
                </tr>
                <tr className="border-t border-[rgba(157,140,125,0.18)]">
                  <td className="px-4 py-4 font-display text-lg text-[color:var(--text-primary)]">
                    Operator
                  </td>
                  <td className="px-4 py-4">$1,490</td>
                  <td className="px-4 py-4">$590</td>
                  <td className="px-4 py-4">1 kete</td>
                  <td className="px-4 py-4">Up to 5</td>
                  <td className="px-4 py-4">20</td>
                </tr>
                <tr className="border-t border-[rgba(157,140,125,0.18)]">
                  <td className="px-4 py-4 font-display text-lg text-[color:var(--text-primary)]">
                    Leader
                  </td>
                  <td className="px-4 py-4">$1,990</td>
                  <td className="px-4 py-4">$1,290</td>
                  <td className="px-4 py-4">2 kete</td>
                  <td className="px-4 py-4">Up to 15</td>
                  <td className="px-4 py-4">60</td>
                </tr>
                <tr className="border-t border-[rgba(157,140,125,0.18)]">
                  <td className="px-4 py-4 font-display text-lg text-[color:var(--text-primary)]">
                    Enterprise
                  </td>
                  <td className="px-4 py-4">$2,990</td>
                  <td className="px-4 py-4">$2,890</td>
                  <td className="px-4 py-4">All 5 kete</td>
                  <td className="px-4 py-4">Unlimited</td>
                  <td className="px-4 py-4">200</td>
                </tr>
                <tr className="border-t border-[rgba(157,140,125,0.18)]">
                  <td className="px-4 py-4 font-display text-lg text-[color:var(--text-primary)]">
                    Outcome
                  </td>
                  <td className="px-4 py-4">from $5,000</td>
                  <td className="px-4 py-4">Per engagement</td>
                  <td className="px-4 py-4">Bespoke</td>
                  <td className="px-4 py-4">By scope</td>
                  <td className="px-4 py-4">By scope</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Frequently asked
              </span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">
                Pricing questions
              </h2>
            </div>

            <Accordion
              type="single"
              collapsible
              className="glass-card mt-10 px-6 md:px-8"
            >
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12">
            <h2 className="font-display text-3xl md:text-4xl">
              Not sure which tier fits?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              Tell us about your business in one short conversation. We'll
              recommend a starting tier and help you map your existing workflows
              to a kete before you commit.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Learn how it works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
