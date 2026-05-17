import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import InsuranceShareCard from "@/components/insurance/InsuranceShareCard";
import { calculateInsuranceGap, type InsuranceInput } from "@/lib/insurance/coverage-rules";

export const metadata: Metadata = {
  title: "Insurance gap result · assembl",
  description: "Five traffic lights for an indicative NZ insurance cover check.",
};

function num(value: string | string[] | undefined, fallback = 0): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(value: string | string[] | undefined, fallback: string): string {
  return String((Array.isArray(value) ? value[0] : value) ?? fallback);
}

function fmtNzd(value: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function InsuranceResultsPage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const input: InsuranceInput = {
    tenure: str(p.tenure, "own") === "rent" ? "rent" : "own",
    region: str(p.region, "auckland"),
    floorAreaSqm: num(p.floorAreaSqm, 160),
    houseSumInsured: num(p.houseSumInsured, 0),
    contentsSumInsured: num(p.contentsSumInsured, 0),
    dependants: num(p.dependants, 0),
    workFromHome: str(p.workFromHome, "") === "yes",
    vehicleCount: num(p.vehicleCount, 0),
    vehicleValue: num(p.vehicleValue, 0),
    vehicleCover: ["none", "third_party", "third_party_fire_theft", "comprehensive"].includes(str(p.vehicleCover, "none"))
      ? (str(p.vehicleCover, "none") as InsuranceInput["vehicleCover"])
      : "none",
    annualIncome: num(p.annualIncome, 0),
    mortgageBalance: num(p.mortgageBalance, 0),
    lifeCover: num(p.lifeCover, 0),
    soleEarner: str(p.soleEarner, "") === "yes",
    savings: num(p.savings, 0),
    kiwiSaverBalance: num(p.kiwiSaverBalance, 0),
    incomeProtectionMonthly: num(p.incomeProtectionMonthly, 0),
  };
  const result = calculateInsuranceGap(input);

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
            insurance gap analysis
          </p>
          <h1
            className="mt-5 max-w-4xl font-display italic leading-[0.9] text-[color:var(--assembl-pounamu)]"
            style={{ fontWeight: 300, fontSize: "clamp(3.2rem, 7vw, 6.4rem)" }}
          >
            Your largest visible gap is {fmtNzd(result.largestGapNzd)}.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            Indicative only. This is a conversation starter, not financial
            advice, and not a replacement for a formal policy review.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.36fr]">
          <div className="grid gap-4">
            {result.categories.map((category) => (
              <article
                key={category.key}
                className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      {category.label}
                    </p>
                    <h2 className="mt-2 font-display text-4xl italic text-[color:var(--assembl-pounamu)]">
                      {category.gapNzd > 0 ? `${fmtNzd(category.gapNzd)} gap` : "Looks covered"}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] ${
                      category.status === "green"
                        ? "bg-pounamu-100 text-pounamu-900"
                        : category.status === "amber"
                          ? "bg-karaka-100 text-karaka-900"
                          : "bg-kokowai-100 text-kokowai-900"
                    }`}
                  >
                    {category.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <MiniMetric label="Suggested" value={fmtNzd(category.recommendedCoverNzd)} />
                  <MiniMetric label="Current" value={fmtNzd(category.currentCoverNzd)} />
                  <MiniMetric label="Gap" value={fmtNzd(category.gapNzd)} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {category.rationale}
                </p>
              </article>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <InsuranceShareCard categories={result.categories} />
            <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
              <ShieldAlert className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
              <h2 className="mt-4 font-display text-3xl italic text-[color:var(--assembl-pounamu)]">
                Take this to an adviser.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                No partner is recommended here. If a category is amber or red,
                talk to an independent insurance adviser before changing cover.
              </p>
              <Link href="/contact" className="mt-5 inline-flex text-sm font-medium text-[color:var(--assembl-pounamu)]">
                Talk to assembl <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </section>
          </aside>
        </div>

        <section className="mx-auto mt-10 max-w-7xl border-t border-taupe-200 pt-8">
          <h2 className="font-display text-3xl italic text-[color:var(--assembl-pounamu)]">
            Sources and assumptions.
          </h2>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            Version {result.assumptionsVersion}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {result.sources.map((source) => (
              <article key={source.url} className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/45 p-4">
                <h3 className="font-medium text-[color:var(--text-primary)]">{source.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-body)]">{source.note}</p>
                <a href={source.url} className="mt-3 block break-words font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
                  Source
                </a>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-mist-50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
