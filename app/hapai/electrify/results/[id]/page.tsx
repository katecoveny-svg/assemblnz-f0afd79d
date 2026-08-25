/**
 * /hapai/electrify/results/[id] — results display for a saved electrify_leads row
 *
 * Reads the snapshot from Supabase (RLS allows update-within-60min, no SELECT
 * for anon, so we use server-side query with anon key + cookie that came from
 * the form submit). Renders: headline savings, payback, CO2e, switch sequence,
 * solar block, soft CTA to the right kete agent, email-capture for PDF.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BatteryCharging, Leaf, PlugZap, Route, SunMedium } from "lucide-react";
import ElectrifyShareButtons from "@/components/electrify/ElectrifyShareButtons";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type SwitchStep = {
  order: number;
  machine: string;
  estimatedCapexNzd: number;
  estimatedAnnualSavingNzd: number;
  paybackYears: number | null;
  rationale: string;
  priorityScore: number;
};

type ElectrifyLead = {
  id: string;
  route_type?: "business" | "household" | "landlord" | "new-build";
  business_type: string;
  region: string;
  annual_savings_current_nzd: number;
  annual_savings_cheap_finance_nzd: number;
  payback_years: number | null;
  ten_year_savings_nzd: number;
  co2e_avoided_tonnes: number;
  upfront_capex_estimate_nzd: number;
  recommended_sequence: SwitchStep[];
  solar_recommendation: {
    recommended: boolean;
    estimatedKwSize: number;
    estimatedCapexNzd: number;
    estimatedAnnualSavingNzd: number;
    paybackYears: number | null;
    reason: string;
  } | null;
  result_confidence: "high" | "medium" | "low";
  assumptions_version: string;
};

const ROUTE_FRAMING: Record<string, { eyebrow: string; headlineLine2: string; subhead: string; ctaKete: string; ctaLabel: string; ctaHref: string }> = {
  business: {
    eyebrow: "Electrify · your machine count",
    headlineLine2: "a year back from the machines.",
    subhead: "Ranked switches by savings and payback for your operation.",
    ctaKete: "Manaaki",
    ctaLabel: "Talk to Manaaki about kitchen-level electrification",
    ctaHref: "/kete/manaaki",
  },
  household: {
    eyebrow: "Electrify · your home energy path",
    headlineLine2: "a year back, off your home bills.",
    subhead: "Ranked switches by savings and payback for your whānau.",
    ctaKete: "Tōro",
    ctaLabel: "Talk to Tōro about your home plan",
    ctaHref: "/kete/toro",
  },
  landlord: {
    eyebrow: "Electrify · your portfolio path",
    headlineLine2: "a year saved across the portfolio.",
    subhead: "Tenants save the bill. You hold the capex. Split-incentive view of the switch sequence below.",
    ctaKete: "Manaaki",
    ctaLabel: "Talk to Manaaki about portfolio-level retrofits",
    ctaHref: "/kete/manaaki",
  },
  "new-build": {
    eyebrow: "Electrify · avoided cost",
    headlineLine2: "a year avoided by not connecting gas.",
    subhead: "Design-stage choices that save the gas connection, the diesel boiler, and the gen-set.",
    ctaKete: "Waihanga",
    ctaLabel: "Talk to Waihanga about all-electric design",
    ctaHref: "/kete/waihanga",
  },
};

const RESULT_COOKIE_PREFIX = "assembl_electrify_result_";

// Map business type → relevant kete CTA
const KETE_CTA: Record<string, { kete: string; label: string; href: string }> = {
  hospitality:        { kete: "Manaaki",  label: "Talk to Manaaki about kitchen-level electrification",        href: "/kete/manaaki" },
  construction:       { kete: "Waihanga", label: "Talk to Waihanga about site-level electrification",          href: "/kete/waihanga" },
  freight:            { kete: "Pīkau",    label: "Talk to Pīkau about fleet + freight electrification",        href: "/kete/pikau" },
  automotive_fleet:   { kete: "Arataki",  label: "Talk to Arataki about workshop + fleet electrification",     href: "/kete/arataki" },
  retail:             { kete: "Hoko",     label: "Talk to Hoko about retail electrification",                  href: "/kete/hoko" },
  creative:           { kete: "Auaha",    label: "Talk to Auaha about studio + workshop electrification",      href: "/kete/auaha" },
  ece:                { kete: "Ako",      label: "Talk to Ako about centre electrification",                   href: "/kete/ako" },
  professional_other: { kete: "Tōro",     label: "Or — see how Tōro works for family electrification",         href: "/kete/toro" },
};

function fmtNzd(n: number): string {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);
}

export default async function ElectrifyResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  let lead: ElectrifyLead | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = getServiceClient();

    const { data } = await supabase
      .from("electrify_leads")
      .select("*")
      .eq("id", id)
      .single();

    if (data) lead = data as ElectrifyLead;
  } else if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const { data } = await supabase
      .from("electrify_leads")
      .select("*")
      .eq("id", id)
      .single();

    if (data) lead = data as ElectrifyLead;
  }

  if (!lead) {
    const snapshot = cookieStore.get(`${RESULT_COOKIE_PREFIX}${id}`)?.value;
    if (snapshot) {
      try {
        lead = JSON.parse(decodeURIComponent(snapshot)) as ElectrifyLead;
      } catch {
        lead = null;
      }
    }
  }

  if (!lead) notFound();

  const routeFraming = ROUTE_FRAMING[lead.route_type ?? "business"] ?? ROUTE_FRAMING.business;
  const cta = lead.route_type && lead.route_type !== "business"
    ? { kete: routeFraming.ctaKete, label: routeFraming.ctaLabel, href: routeFraming.ctaHref }
    : (KETE_CTA[lead.business_type] ?? KETE_CTA.professional_other);
  const heroStep = lead.recommended_sequence[0];
  const resultUrl = `https://www.assembl.co.nz/hapai/electrify/results/${lead.id}`;
  const shareText = `My Electrify Machine Count estimates ${fmtNzd(
    lead.annual_savings_current_nzd,
  )} a year back from fossil machines. Run your own NZ estimate from assembl.`;

  return (
    <main className="overflow-hidden bg-[radial-gradient(ellipse_at_18%_0%,rgba(217,188,122,0.22),transparent_48%),radial-gradient(ellipse_at_82%_8%,rgba(58,56,50,0.18),transparent_50%),var(--assembl-paper)] font-inter text-taupe-900">
      {/* HERO — full-bleed, share-worthy, centred */}
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] px-6 pt-14 pb-12 lg:px-10 lg:pt-20 lg:pb-16">
        <div className="pointer-events-none absolute inset-y-0 right-[-6%] top-[-8%] hidden w-[46%] lg:block">
          <Image
            src="/img/hapai/tools/electrify-vessel.jpg"
            alt=""
            fill
            sizes="46vw"
            className="object-contain object-right opacity-[0.18]"
            priority
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-taupe-600">
            {routeFraming.eyebrow}
          </p>
          <h1 className="mt-6 font-cormorant text-[clamp(3rem,9vw,7rem)] leading-[0.92] text-pounamu-900">
            {fmtNzd(lead.annual_savings_current_nzd)}<br />
            <span className="text-taupe-800">{routeFraming.headlineLine2}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-taupe-700">
            {routeFraming.subhead}
          </p>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-taupe-700">
            {lead.annual_savings_cheap_finance_nzd > lead.annual_savings_current_nzd ? (
              <>
                With a 1% green-loan scenario, that rises to{" "}
                <span className="font-medium text-pounamu-900">
                  {fmtNzd(lead.annual_savings_cheap_finance_nzd)}
                </span>
                .{" "}
              </>
            ) : null}
            Confidence: <ConfidenceBadge level={lead.result_confidence} />
          </p>

          {heroStep ? (
            <div className="mx-auto mt-8 inline-flex max-w-3xl items-center gap-3 rounded-full border border-pounamu-200 bg-white/65 px-5 py-3 text-sm backdrop-blur">
              <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-pounamu-700">First switch</span>
              <span className="font-medium text-taupe-900">{heroStep.machine}</span>
            </div>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={cta.href} className="cta-primary inline-flex h-12 items-center gap-2 px-7">
              {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/hapai/electrify" className="btn-ghost inline-flex h-12 items-center px-6">
              Run another estimate
            </Link>
          </div>

          <div className="mt-6 flex justify-center">
            <ElectrifyShareButtons
              title="My Electrify Machine Count"
              text={shareText}
              url={resultUrl}
            />
          </div>
        </div>
      </section>

      {/* HEADLINE METRICS — full-width glass strip */}
      <section className="relative border-b border-[rgba(35,33,31,0.06)] px-6 py-10 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric icon={PlugZap} label="Annual savings" value={fmtNzd(lead.annual_savings_current_nzd)} />
          <Metric
            icon={BatteryCharging}
            label="Payback period"
            value={lead.payback_years ? `${lead.payback_years} years` : "—"}
          />
          <Metric icon={Route} label="10-year savings" value={fmtNzd(lead.ten_year_savings_nzd)} />
          <Metric
            icon={Leaf}
            label="CO₂e avoided"
            value={`${lead.co2e_avoided_tonnes} t/yr`}
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
      <section className="mb-12">
        <h2 className="font-cormorant text-4xl text-pounamu-900 mb-5">
          Your Machine Count.
        </h2>
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-taupe-700">
          Rewiring Aotearoa's machine-count frame is simple: count the fossil
          machines first, then replace the ones with the strongest savings and
          fastest payback. This sequence ranks the practical switches from your
          inputs.
        </p>
        <ol className="grid gap-4 lg:grid-cols-3">
          {lead.recommended_sequence.map((step) => (
            <li
              key={step.order}
              className="flex gap-4 rounded-[18px] border border-white/45 bg-white/58 p-5 shadow-[0_18px_52px_rgba(35,33,31,0.08)] backdrop-blur-xl"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pounamu-100 text-sm font-medium text-pounamu-900">
                {step.order}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-taupe-900">{step.machine}</p>
                <p className="text-sm text-taupe-600 mt-1">{step.rationale}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-taupe-500">
                  <span>Capex: {fmtNzd(step.estimatedCapexNzd)}</span>
                  <span>Annual saving: {fmtNzd(step.estimatedAnnualSavingNzd)}</span>
                  <span>Payback: {step.paybackYears ? `${step.paybackYears}y` : "—"}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {lead.solar_recommendation && lead.solar_recommendation.recommended && (
        <section className="glass-card-elevated mb-10 overflow-hidden border-karaka-300 bg-karaka-50/78">
          <div className="grid lg:grid-cols-[0.72fr_1fr]">
            <div className="relative min-h-56">
              <Image
                src="/images/golden-nodes-square.webp"
                alt="Golden network pattern representing rooftop solar generation"
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <SunMedium className="h-7 w-7 text-karaka-900" aria-hidden />
              <h3 className="mt-4 font-cormorant text-3xl text-karaka-900">
                Rooftop solar is worth investigating.
              </h3>
              <p className="mt-2 text-sm text-taupe-700">{lead.solar_recommendation.reason}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="block text-xs text-taupe-600">System size</span>
              <span className="font-medium">{lead.solar_recommendation.estimatedKwSize} kW</span>
            </div>
            <div>
              <span className="block text-xs text-taupe-600">Capex</span>
              <span className="font-medium">{fmtNzd(lead.solar_recommendation.estimatedCapexNzd)}</span>
            </div>
            <div>
              <span className="block text-xs text-taupe-600">Payback</span>
              <span className="font-medium">
                {lead.solar_recommendation.paybackYears ? `${lead.solar_recommendation.paybackYears}y` : "—"}
              </span>
            </div>
          </div>
            </div>
          </div>
        </section>
      )}

      <section className="glass-card-elevated mb-10 border-pounamu-300 bg-pounamu-50/72 p-6">
        <h3 className="font-cormorant text-3xl text-pounamu-900 mb-2">
          Want help making it happen?
        </h3>
        <p className="text-sm text-taupe-700 mb-4">
          assembl's {cta.kete} kete drafts the paperwork, compliance, and supplier conversations.
          Same maths, scaled to your actual operation.
        </p>
        <Link
          href={cta.href}
          className="inline-flex items-center rounded-md bg-pounamu-900 px-5 py-2.5 text-sm font-medium text-mist-50 transition-colors hover:bg-pounamu-800"
        >
          {cta.label} →
        </Link>
      </section>

      <section className="glass-card mb-10 p-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-center">
          <div>
            <h3 className="font-cormorant text-3xl text-pounamu-900">
              Share this Machine Count.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-taupe-700">
              Send the result to a partner, landlord, finance person, or builder.
              The link opens this saved estimate, so the next person sees the same
              Machine Count.
            </p>
          </div>
          <ElectrifyShareButtons
            title="My Electrify Machine Count"
            text={shareText}
            url={resultUrl}
          />
        </div>
      </section>

      <section className="glass-card mb-10 p-6">
        <h3 className="font-medium text-taupe-900 mb-2">Email me the PDF</h3>
        <p className="text-sm text-taupe-600 mb-3">
          Branded PDF with the full breakdown + sources. We don't sell or share emails.
        </p>
        <form action="/api/capture-lead" method="POST" className="flex flex-col sm:flex-row gap-2">
          <input type="hidden" name="lead_id" value={lead.id} />
          <input
            type="email"
            name="email"
            required
            placeholder="you@yourbusiness.co.nz"
            className="flex-1 px-3 py-2.5 border border-taupe-300 rounded-md bg-mist-50 focus:outline-none focus:ring-2 focus:ring-pounamu-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-pounamu-900 text-mist-50 text-sm font-medium hover:bg-pounamu-800 transition-colors"
          >
            Send PDF
          </button>
        </form>
      </section>

      <footer className="text-xs text-taupe-500 space-y-2 pt-8 border-t border-taupe-200">
        <p>
          Assumptions version: <code className="bg-mist-100 px-1.5 py-0.5 rounded">{lead.assumptions_version}</code>.
          This is an estimate, not a quote. Numbers within ±15% of a professional fleet/energy audit.
        </p>
        <p>
          Sources: MBIE Energy Prices Q1 2026 · EECA Light Vehicle Fuel Economy
          Database 2026 · MfE NZ Greenhouse Gas Inventory 2024 · Rewiring Aotearoa
          Machine Count Report 2025 · NZTA Vehicle Fleet Statistics 2025 · ANZ
          Business Banking commercial rates May 2026.
        </p>
      </footer>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof PlugZap; label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/55 bg-white/65 p-5 shadow-[0_18px_52px_rgba(35,33,31,0.08)] backdrop-blur-xl lg:p-6">
      <Icon className="mb-4 h-6 w-6 text-pounamu-700" aria-hidden />
      <span className="block font-mono text-[12px] uppercase tracking-[0.22em] text-taupe-600 mb-2">
        {label}
      </span>
      <span className="block font-cormorant text-[clamp(2rem,4vw,2.75rem)] leading-none text-pounamu-900">{value}</span>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const bg = level === "high" ? "bg-pounamu-100 text-pounamu-900" : level === "medium" ? "bg-karaka-100 text-karaka-900" : "bg-kokowai-100 text-kokowai-900";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${bg}`}>
      {level}
    </span>
  );
}
