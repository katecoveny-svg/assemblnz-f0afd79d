"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  formatNzd,
  projectKiwiSaver,
  type KiwiSaverInput,
} from "@/lib/kiwisaver-kids";

type Scenario = "newborn" | "child" | "teen" | "custom";

export function KiwiSaverKidsCalculator() {
  const [scenario, setScenario] = useState<Scenario>("newborn");
  const [currentAge, setCurrentAge] = useState(0);
  const [startingBalance, setStartingBalance] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [contributionStartAge, setContributionStartAge] = useState(16);
  const [annualReturnPercent, setAnnualReturnPercent] = useState(6.3);
  const [retirementAge, setRetirementAge] = useState(65);

  const input: KiwiSaverInput = useMemo(
    () => ({
      currentAge,
      startingBalance,
      monthlyContribution,
      contributionStartAge,
      annualReturnPercent,
      retirementAge,
    }),
    [
      currentAge,
      startingBalance,
      monthlyContribution,
      contributionStartAge,
      annualReturnPercent,
      retirementAge,
    ],
  );

  const projection = useMemo(() => projectKiwiSaver(input), [input]);

  // Comparison projection — just the $1,000 starting balance, no top-ups
  const baselineProjection = useMemo(
    () =>
      projectKiwiSaver({
        ...input,
        monthlyContribution: 0,
      }),
    [input],
  );

  function applyScenario(s: Scenario) {
    setScenario(s);
    if (s === "newborn") {
      setCurrentAge(0);
      setStartingBalance(1000);
      setMonthlyContribution(0);
      setContributionStartAge(16);
    } else if (s === "child") {
      setCurrentAge(5);
      setStartingBalance(1000);
      setMonthlyContribution(25);
      setContributionStartAge(16);
    } else if (s === "teen") {
      setCurrentAge(16);
      setStartingBalance(1000);
      setMonthlyContribution(100);
      setContributionStartAge(16);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(184, 150, 79,0.18),transparent_42%),radial-gradient(ellipse_at_80%_10%,rgba(58,56,50,0.12),transparent_40%),var(--assembl-paper)] px-6 py-12 text-[#313c42] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1120px]">
        <Link
          href="/hapai"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661] hover:text-[#B8956A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> SPARK library
        </Link>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* ── LEFT — eyebrow + headline + context ─────────────────── */}
          <header>
            <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[#B8956A]">
              SPARK · kiwisaver for kids
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(3rem,7vw,5.5rem)] font-light leading-[0.92]">
              $1,000 at birth becomes $53,000 at 65.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#2A2825]">
              NZ is talking about a KiwiSaver kick-start for every newborn.
              From age 16 a young person can add to it themselves. See what
              that looks like for your tamariki — including the difference
              between just the kick-start and a wee top-up alongside it.
            </p>

            <div className="mt-8 rounded-[14px] border border-[rgba(184, 150, 79,0.32)] bg-white/64 p-5 text-sm leading-relaxed text-[#2A2825]">
              <p className="font-medium text-[#313c42]">
                The maths behind the headline
              </p>
              <p className="mt-2">
                $1,000 invested at birth, compounding at 6.3% nominal for 65
                years, reaches about $53,000 — the figure being cited in the
                policy debate. Long-run KiwiSaver growth-fund returns sit
                between 5–8% before tax and fees. This calculator uses 6.3%
                by default so the visible result matches the news. Adjust it
                if you'd rather be more conservative.
              </p>
              <p className="mt-3 text-[12px] text-[#5A5550]">
                Indicative only. Not financial advice. Real returns vary by
                fund, fees, and inflation. Talk to a registered financial
                adviser before making decisions.
              </p>
            </div>

            <div className="mt-6 grid gap-2 text-sm">
              <button
                type="button"
                onClick={() => applyScenario("newborn")}
                className={[
                  "rounded-[10px] border px-4 py-3 text-left transition",
                  scenario === "newborn"
                    ? "border-[#B8956A] bg-white"
                    : "border-[rgba(35,33,31,0.10)] bg-white/56 hover:border-[#B8956A]/40",
                ].join(" ")}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#B8956A]">
                  Scenario 1
                </p>
                <p className="mt-1 font-display text-xl leading-tight">
                  Newborn · policy only
                </p>
                <p className="mt-1 text-[12px] text-[#5A5550]">
                  Just the $1,000 at birth. No further top-ups.
                </p>
              </button>
              <button
                type="button"
                onClick={() => applyScenario("child")}
                className={[
                  "rounded-[10px] border px-4 py-3 text-left transition",
                  scenario === "child"
                    ? "border-[#B8956A] bg-white"
                    : "border-[rgba(35,33,31,0.10)] bg-white/56 hover:border-[#B8956A]/40",
                ].join(" ")}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#B8956A]">
                  Scenario 2
                </p>
                <p className="mt-1 font-display text-xl leading-tight">
                  5-year-old · $25/mo from 16
                </p>
                <p className="mt-1 text-[12px] text-[#5A5550]">
                  The kick-start plus part-time-job-sized contributions later.
                </p>
              </button>
              <button
                type="button"
                onClick={() => applyScenario("teen")}
                className={[
                  "rounded-[10px] border px-4 py-3 text-left transition",
                  scenario === "teen"
                    ? "border-[#B8956A] bg-white"
                    : "border-[rgba(35,33,31,0.10)] bg-white/56 hover:border-[#B8956A]/40",
                ].join(" ")}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#B8956A]">
                  Scenario 3
                </p>
                <p className="mt-1 font-display text-xl leading-tight">
                  16-year-old · $100/mo
                </p>
                <p className="mt-1 text-[12px] text-[#5A5550]">
                  Starting now, age 16, with the $1k policy floor.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setScenario("custom")}
                className={[
                  "rounded-[10px] border px-4 py-3 text-left transition",
                  scenario === "custom"
                    ? "border-[#B8956A] bg-white"
                    : "border-[rgba(35,33,31,0.10)] bg-white/56 hover:border-[#B8956A]/40",
                ].join(" ")}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#B8956A]">
                  Scenario 4
                </p>
                <p className="mt-1 font-display text-xl leading-tight">
                  Custom — set your own
                </p>
                <p className="mt-1 text-[12px] text-[#5A5550]">
                  Tune any field on the right.
                </p>
              </button>
            </div>
          </header>

          {/* ── RIGHT — controls + result ──────────────────────────── */}
          <section className="rounded-[14px] border border-[rgba(35,33,31,0.10)] bg-white/78 p-5 shadow-[0_24px_80px_rgba(35,33,31,0.08)] backdrop-blur md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Child's current age">
                <input
                  type="number"
                  min={0}
                  max={18}
                  value={currentAge}
                  onChange={(e) => {
                    setScenario("custom");
                    setCurrentAge(Number(e.target.value) || 0);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Starting balance (NZ$)">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={startingBalance}
                  onChange={(e) => {
                    setScenario("custom");
                    setStartingBalance(Number(e.target.value) || 0);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Monthly contribution (NZ$)">
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={monthlyContribution}
                  onChange={(e) => {
                    setScenario("custom");
                    setMonthlyContribution(Number(e.target.value) || 0);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Contributions start at age">
                <input
                  type="number"
                  min={0}
                  max={65}
                  value={contributionStartAge}
                  onChange={(e) => {
                    setScenario("custom");
                    setContributionStartAge(Number(e.target.value) || 16);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Assumed annual return (%)">
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.1}
                  value={annualReturnPercent}
                  onChange={(e) => {
                    setScenario("custom");
                    setAnnualReturnPercent(Number(e.target.value) || 6.3);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Retirement age">
                <input
                  type="number"
                  min={currentAge + 1}
                  max={80}
                  value={retirementAge}
                  onChange={(e) => {
                    setScenario("custom");
                    setRetirementAge(Number(e.target.value) || 65);
                  }}
                  className={inputClass}
                />
              </Field>
            </div>

            {/* ── HERO RESULT ───────────────────────────────────── */}
            <div className="mt-7 rounded-[14px] border border-[rgba(184, 150, 79,0.32)] bg-gradient-to-br from-[#ffffff] to-[#f3f5f3] p-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#B8956A]">
                Projected balance at age {retirementAge}
              </p>
              <p className="mt-2 font-display text-[clamp(2.8rem,5.5vw,4.6rem)] font-light leading-[1] text-[#313c42]">
                {formatNzd(projection.finalBalance)}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5A5550]">
                After {projection.yearsCompounding} years of compounding at{" "}
                {projection.assumptions.annualReturnPercent}%.{" "}
                {projection.totalContributions > 0 ? (
                  <>
                    Contributions add{" "}
                    <strong>{formatNzd(projection.totalContributions)}</strong>{" "}
                    over {projection.yearsContributing} years. Growth adds{" "}
                    <strong>{formatNzd(projection.totalGrowth)}</strong>.
                  </>
                ) : (
                  <>
                    All of it comes from the starting balance compounding —
                    no contributions added.
                  </>
                )}
              </p>
            </div>

            {/* ── BREAKDOWN ────────────────────────────────────── */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Stat
                label="Starting balance alone"
                value={formatNzd(projection.startingBalanceOnlyAtRetirement)}
                sub={`Just the ${formatNzd(startingBalance)} compounding`}
              />
              <Stat
                label="Total contributions"
                value={formatNzd(projection.totalContributions)}
                sub={`${projection.yearsContributing} years × ${formatNzd(
                  monthlyContribution * 12,
                )}/yr`}
              />
              <Stat
                label="Total growth"
                value={formatNzd(projection.totalGrowth)}
                sub={`${projection.assumptions.annualReturnPercent}% annually`}
              />
            </div>

            {/* ── COMPARE ──────────────────────────────────────── */}
            {monthlyContribution > 0 && (
              <div className="mt-5 rounded-[12px] border border-[rgba(58,56,50,0.22)] bg-[#F0F5F1] p-4">
                <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#313c42]">
                  <Sparkles className="-mt-1 mr-1 inline h-3.5 w-3.5" aria-hidden />
                  Top-ups vs policy alone
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#2A2825]">
                  Adding{" "}
                  <strong>{formatNzd(monthlyContribution)}/month</strong> from
                  age {contributionStartAge} grows the pot to{" "}
                  <strong>{formatNzd(projection.finalBalance)}</strong> by age{" "}
                  {retirementAge} —{" "}
                  <strong>
                    {formatNzd(
                      projection.finalBalance - baselineProjection.finalBalance,
                    )}{" "}
                    more
                  </strong>{" "}
                  than the {formatNzd(baselineProjection.finalBalance)} you'd
                  get from the kick-start on its own.
                </p>
              </div>
            )}

            {/* ── SCHEDULE ─────────────────────────────────────── */}
            <details className="mt-5 rounded-[12px] border border-[rgba(35,33,31,0.10)] bg-white/56">
              <summary className="cursor-pointer p-4 font-mono text-[12px] uppercase tracking-[0.22em] text-[#5A5550]">
                Year-by-year schedule ({projection.schedule.length} years)
              </summary>
              <div className="max-h-[360px] overflow-y-auto px-4 pb-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#5A5550]">
                      <th className="py-2">Age</th>
                      <th className="py-2 text-right">Added this year</th>
                      <th className="py-2 text-right">Growth this year</th>
                      <th className="py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.schedule.map((row) => (
                      <tr key={row.age} className="border-t border-[rgba(35,33,31,0.06)]">
                        <td className="py-1.5">{row.age}</td>
                        <td className="py-1.5 text-right tabular-nums">
                          {row.contributionsThisYear > 0
                            ? formatNzd(row.contributionsThisYear)
                            : "—"}
                        </td>
                        <td className="py-1.5 text-right tabular-nums text-[#313c42]">
                          {formatNzd(row.growthThisYear)}
                        </td>
                        <td className="py-1.5 text-right tabular-nums font-medium">
                          {formatNzd(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661]">
              Built in Aotearoa · Indicative only · Not financial advice ·
              Privacy Act 2020 compliant. assembl.co.nz
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "mt-2 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-[#f7f9f8] px-3 text-sm text-[#313c42] outline-none transition focus:border-[#B8956A] focus:bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-[#6B6661]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.10)] bg-[#f7f9f8] p-3">
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[#6B6661]">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-normal tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] text-[#5A5550]">{sub}</p>
    </div>
  );
}
