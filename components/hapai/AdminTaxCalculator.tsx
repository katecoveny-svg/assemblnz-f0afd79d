"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Clock, TrendingDown } from "lucide-react";
import { HapaiToolShell } from "@/components/hapai/HapaiToolShell";
import { ToolLeadCapture } from "@/components/hapai/ToolLeadCapture";
import { INDUSTRY_KETES, type KeteSlug } from "@/lib/kete";
import {
  calculateAdminTax,
  formatNzd,
  WORKING_WEEKS_PER_YEAR,
  type AdminTaxInput,
} from "@/lib/hapai/admin-tax";

export function AdminTaxCalculator() {
  const [people, setPeople] = useState(4);
  const [hours, setHours] = useState(6);
  const [rate, setRate] = useState(45);
  const [keteSlug, setKeteSlug] = useState<KeteSlug>("waihanga");

  const input: AdminTaxInput = useMemo(
    () => ({ people, hoursPerPersonPerWeek: hours, hourlyRateNzd: rate }),
    [people, hours, rate],
  );
  const result = useMemo(() => calculateAdminTax(input), [input]);

  const kete = INDUSTRY_KETES.find((k) => k.slug === keteSlug) ?? INDUSTRY_KETES[0];

  return (
    <HapaiToolShell
      kicker="HAPAI · the admin tax"
      title="The admin tax"
      description="Add up the unbilled hours your team loses every week to compliance paperwork and double entry, then see the annual cost — and how much a kete pack could claw back."
      toolPath="/hapai/admin-tax"
      shareTitle="The admin tax calculator — a free assembl HAPAI tool"
      shareText="See what unbilled admin hours cost your team each year — and how much you could claw back."
      posture="Indicative calculator only. Confirm your own rates and hours before acting on the numbers. assembl outputs stay draft-only and reviewed by a named person."
      highlights={[
        { title: "Count the hours", body: "People × hours × loaded rate, across a 48-week NZ working year.", icon: <Clock className="h-5 w-5" aria-hidden /> },
        { title: "See the annual cost", body: "The number rarely shows up on an invoice — but it is real money.", icon: <Calculator className="h-5 w-5" aria-hidden /> },
        { title: "Claw it back", body: "A draft-first workflow reclaims a conservative share of that time.", icon: <TrendingDown className="h-5 w-5" aria-hidden /> },
      ]}
    >
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ── INPUTS ───────────────────────────────────────────── */}
        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/70 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2B6B57]">Your team</p>
          <div className="mt-4 grid gap-4">
            <Field label="People doing admin / compliance">
              <input className={inputClass} type="number" min={0} step={1} value={people} onChange={(e) => setPeople(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Hours each loses to admin per week">
              <input className={inputClass} type="number" min={0} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Loaded hourly cost (NZ$)">
              <input className={inputClass} type="number" min={0} step={1} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Your industry">
              <select className={inputClass} value={keteSlug} onChange={(e) => setKeteSlug(e.target.value as KeteSlug)}>
                {INDUSTRY_KETES.map((k) => (
                  <option key={k.slug} value={k.slug}>
                    {k.name} · {k.industry}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">
            Across {WORKING_WEEKS_PER_YEAR} working weeks · indicative only · not financial advice
          </p>
        </div>

        {/* ── RESULT ───────────────────────────────────────────── */}
        <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-white/78 p-5">
          <div className="rounded-[12px] border border-[rgba(43,107,87,0.24)] bg-gradient-to-br from-[#FAF7F2] to-[#EDF3EE] p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2B6B57]">Your admin tax, per year</p>
            <p className="mt-2 font-display text-[clamp(2.6rem,5.5vw,4.2rem)] font-light leading-none text-[#103F35]">
              {formatNzd(result.annualCostNzd)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5550]">
              That’s <strong>{result.weeklyHours.toLocaleString("en-NZ")} hours a week</strong> ({result.annualHours.toLocaleString("en-NZ")} hours a year) at {formatNzd(rate)}/hour — money that rarely shows on an invoice.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Weekly cost" value={formatNzd(result.weeklyCostNzd)} sub={`${result.weeklyHours.toLocaleString("en-NZ")} hrs/week`} />
            <Stat
              label={`Reclaimable (~${Math.round(result.reclaimRate * 100)}%)`}
              value={formatNzd(result.reclaimableAnnualCostNzd)}
              sub={`${result.reclaimableAnnualHours.toLocaleString("en-NZ")} hrs/year back`}
            />
          </div>

          {/* Link the result to the matching kete chat. */}
          <div className="mt-5 rounded-[10px] border border-[rgba(35,33,31,0.1)] p-4" style={{ backgroundColor: `${kete.accent}10` }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: kete.accent }}>
              {kete.name} · {kete.industry}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#3D4250]">
              Most of that admin tax is the {kete.industry.toLowerCase()} paperwork {kete.name} drafts for review. See what it would take off your team’s plate.
            </p>
            <Link
              href={`/c/${kete.slug}`}
              className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: kete.accent }}
            >
              Open the {kete.name} draft desk
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-5">
            <ToolLeadCapture
              toolSlug="admin-tax"
              title="Email me these numbers"
              blurb="Optional. We’ll send your admin-tax breakdown. The calculator works either way."
              payload={{
                people,
                hoursPerPersonPerWeek: hours,
                hourlyRateNzd: rate,
                kete: kete.slug,
                annualCostNzd: result.annualCostNzd,
                reclaimableAnnualCostNzd: result.reclaimableAnnualCostNzd,
                assumptionsVersion: result.assumptionsVersion,
              }}
            />
          </div>
        </div>
      </div>
    </HapaiToolShell>
  );
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white px-3 text-sm text-[#23211F] outline-none transition focus:border-[#2B6B57]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[10px] border border-[rgba(35,33,31,0.1)] bg-[#F7F4EE] p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6661]">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-[#5A5550]">{sub}</p>
    </div>
  );
}
