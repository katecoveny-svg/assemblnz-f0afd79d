/**
 * /electrify/results/[id] — results display for a saved electrify_leads row
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
  professional_other: { kete: "Tōro",     label: "Or — see how Tōro works for whānau electrification",         href: "/kete/toro" },
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

  const cta = KETE_CTA[lead.business_type] ?? KETE_CTA.professional_other;
  const heroStep = lead.recommended_sequence[0];

  return (
    <main className="bg-[color:var(--assembl-paper)] font-inter text-taupe-900">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.10)] px-6 py-12 lg:px-10 lg:py-18">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <Image
            src="/images/lattice-macro.webp"
            alt=""
            fill
            sizes="50vw"
            className="object-cover opacity-25 mix-blend-multiply"
            priority
          />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-taupe-600">
              Electrify · your result
            </p>
            <h1 className="mt-5 font-cormorant text-[clamp(3.4rem,8vw,7rem)] leading-[0.88] text-pounamu-900">
              {fmtNzd(lead.annual_savings_current_nzd)} a year back from the machines.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-taupe-700">
              {lead.annual_savings_cheap_finance_nzd > lead.annual_savings_current_nzd ? (
                <>
                  With a 1% green loan scenario, that rises to{" "}
                  <span className="font-medium text-pounamu-900">
                    {fmtNzd(lead.annual_savings_cheap_finance_nzd)}
                  </span>
                  .{" "}
                </>
              ) : null}
              Confidence: <ConfidenceBadge level={lead.result_confidence} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={cta.href} className="cta-primary inline-flex h-12 items-center gap-2 px-6">
                {cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/electrify" className="btn-ghost inline-flex h-12 items-center px-6">
                Run another estimate
              </Link>
            </div>
          </header>

          <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/70 p-4 shadow-[0_20px_70px_rgba(35,33,31,0.10)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-pounamu-900">
              <Image
                src="/img/kete/arataki-vessel-amber.jpg"
                alt="Sculptural vessel representing an electrification plan"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23211F]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-mist-50">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist-50/75">First switch</p>
                <p className="mt-2 text-xl font-medium leading-tight">{heroStep?.machine ?? "Start with the highest-confidence switch"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </section>

      <section className="mb-10">
        <h2 className="font-cormorant text-4xl text-pounamu-900 mb-5">
          Where to start — your switch sequence
        </h2>
        <ol className="grid gap-4 lg:grid-cols-3">
          {lead.recommended_sequence.map((step) => (
            <li
              key={step.order}
              className="flex gap-4 rounded-[8px] border border-taupe-200 bg-white/65 p-5 shadow-[0_10px_34px_rgba(35,33,31,0.05)]"
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
        <section className="mb-10 overflow-hidden rounded-[8px] border border-karaka-300 bg-karaka-50">
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

      <section className="mb-10 rounded-[8px] border border-pounamu-300 bg-pounamu-50 p-6">
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

      <section className="mb-10 rounded-[8px] border border-taupe-200 bg-white/55 p-6">
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
    <div className="rounded-[8px] border border-taupe-200 bg-white/65 p-4">
      <Icon className="mb-4 h-5 w-5 text-pounamu-700" aria-hidden />
      <span className="block text-xs uppercase tracking-wider text-taupe-600 mb-1">
        {label}
      </span>
      <span className="block font-cormorant text-3xl text-pounamu-900">{value}</span>
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
