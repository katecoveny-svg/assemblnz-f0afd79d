import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, DollarSign, Hammer } from "lucide-react";
import {
  annualRoiNzd,
  recommendProjects,
  type HapaiFunction,
  type HapaiTeamSize,
  type HapaiTier,
} from "@/lib/hapai/project-recommender";

export const metadata: Metadata = {
  title: "hapai project recommendations · assembl",
  description: "Three ranked candidate projects for your team’s next HAPAI build.",
};

const VALID_TIERS = new Set(["akoranga", "kaimahi", "tohunga", "rangatira", "pou"]);
const VALID_FUNCTIONS = new Set(["ops", "hr", "marketing", "finance", "sales", "support", "other"]);
const VALID_SIZES = new Set(["solo", "small", "medium", "large"]);

function fmtNzd(value: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function HapaiProjectResultsPage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tier = String(params.tier ?? "kaimahi") as HapaiTier;
  const primaryFunction = String(params.primaryFunction ?? "ops") as HapaiFunction;
  const teamSize = String(params.teamSize ?? "small") as HapaiTeamSize;
  const focus = String(params.focus ?? "").slice(0, 500);

  const safeTier = VALID_TIERS.has(tier) ? tier : "kaimahi";
  const safeFunction = VALID_FUNCTIONS.has(primaryFunction) ? primaryFunction : "ops";
  const safeSize = VALID_SIZES.has(teamSize) ? teamSize : "small";
  const candidates = recommendProjects({
    tier: safeTier as HapaiTier,
    primaryFunction: safeFunction as HapaiFunction,
    teamSize: safeSize as HapaiTeamSize,
  });

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
            hapai · project picker
          </p>
          <h1
            className="mt-5 max-w-4xl font-display leading-[0.9] text-[color:var(--assembl-pounamu)]"
            style={{ fontWeight: 300, fontSize: "clamp(3.2rem, 7vw, 6.4rem)" }}
          >
            Three projects to build first.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            Calibrated for a {safeSize} {safeFunction} team at {safeTier}. Each
            project is small enough to start, useful enough to prove, and concrete
            enough to hand to a builder.
          </p>
          {focus ? (
            <p className="mt-4 max-w-2xl rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/50 p-4 text-sm leading-relaxed text-[color:var(--text-body)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                Your context:
              </span>{" "}
              {focus}
            </p>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {candidates.map((candidate, index) => (
            <article
              key={candidate.slug}
              className="flex flex-col rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-6 shadow-[0_18px_56px_rgba(35,33,31,0.06)]"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
                Candidate {index + 1}
              </p>
              <h2 className="mt-4 font-display text-4xl leading-none text-[color:var(--assembl-pounamu)]">
                {candidate.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                {candidate.summary}
              </p>

              <div className="mt-6 grid gap-3 text-sm">
                <Metric icon={Clock} label="Effort" value={`${candidate.effortHours} hrs`} />
                <Metric icon={Hammer} label="Time back" value={`${candidate.hoursSavedPerWeek} hrs/wk`} />
                <Metric icon={DollarSign} label="Annual value" value={fmtNzd(annualRoiNzd(candidate))} />
              </div>

              <div className="mt-6 rounded-[8px] bg-pounamu-50 p-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                <span className="font-medium text-pounamu-900">Build hint:</span>{" "}
                {candidate.buildHint}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <Link
                  href={`/hapai/recipes/${candidate.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-pounamu-300 px-5 text-sm font-medium text-pounamu-900 hover:bg-pounamu-50"
                >
                  Open recipe <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-pounamu-900 px-5 text-sm font-medium text-mist-50 hover:bg-pounamu-800"
                >
                  Build with assembl
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[8px] border border-[rgba(212,168,83,0.42)] bg-white/50 p-6">
          <h2 className="font-display text-3xl text-[color:var(--assembl-pounamu)]">
            Pilot Sprint fit.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
            Want assembl to build one of these with you? A Pilot Sprint is
            $5,000 + GST: one workflow, one team, one proof. The project stays
            yours, with named human review and an evidence pack.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center px-6">
              Book a pilot
            </Link>
            <Link href="/hapai/projects" className="btn-ghost inline-flex h-12 items-center px-6">
              Run again
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[6px] border border-[rgba(35,33,31,0.08)] bg-white/55 p-3">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
        <Icon className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
        {label}
      </span>
      <span className="font-medium text-[color:var(--text-primary)]">{value}</span>
    </div>
  );
}
