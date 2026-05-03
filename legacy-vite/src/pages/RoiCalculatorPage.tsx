import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, DollarSign, TrendingUp, Users, Timer, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import LightPageShell from "@/components/LightPageShell";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import GlassKeteSphere from "@/components/kete/GlassKeteSphere";

/* ─── Light brand tokens (matches /how-it-works, /about) ─── */
const C = {
  bg: "#FAFBFC",
  teal: "#3A7D6E",
  tealLight: "#5AADA0",
  tealGlow: "#7ECFC2",
  gold: "#4AA5A8",
  goldLight: "#A8DDDB",
  text: "#3D4250",
  textSec: "#6B7280",
  textMuted: "#9CA3AF",
  divider: "rgba(61,66,80,0.10)",
};

const FONT = {
  heading: "'Inter', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" as const },
  transition: { duration: 0.6, ease },
};

const SCENARIOS = [
  { id: "builder", label: "Christchurch Builder", team: 8, hourlyRate: 55, hoursWasted: 12, industry: "Construction" },
  { id: "cafe", label: "Ponsonby Café", team: 5, hourlyRate: 32, hoursWasted: 8, industry: "Hospitality" },
  { id: "freight", label: "Tauranga Freight Co", team: 12, hourlyRate: 45, hoursWasted: 15, industry: "Freight & Customs" },
  { id: "custom", label: "My Business", team: 5, hourlyRate: 40, hoursWasted: 10, industry: "Custom" },
];

const RoiCalculatorPage = () => {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [teamSize, setTeamSize] = useState(SCENARIOS[0].team);
  const [hourlyRate, setHourlyRate] = useState(SCENARIOS[0].hourlyRate);
  const [hoursWasted, setHoursWasted] = useState(SCENARIOS[0].hoursWasted);

  const roi = useMemo(() => {
    const weeklyWaste = hoursWasted * hourlyRate;
    const monthlyWaste = weeklyWaste * 4.33;
    const annualWaste = monthlyWaste * 12;
    const savingsRate = 0.65;
    const monthlySavings = monthlyWaste * savingsRate;
    const annualSavings = annualWaste * savingsRate;
    const planCost = 590;
    const netMonthlySavings = monthlySavings - planCost;
    const roiPercent = planCost > 0 ? Math.round((netMonthlySavings / planCost) * 100) : 0;
    const hoursSavedWeekly = Math.round(hoursWasted * savingsRate * 10) / 10;
    return { weeklyWaste, monthlyWaste, annualWaste, monthlySavings, annualSavings, netMonthlySavings, roiPercent, hoursSavedWeekly, planCost };
  }, [hoursWasted, hourlyRate]);

  const selectScenario = (s: typeof SCENARIOS[0]) => {
    setScenario(s);
    setTeamSize(s.team);
    setHourlyRate(s.hourlyRate);
    setHoursWasted(s.hoursWasted);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(n);

  return (
    <LightPageShell>
      <SEO
        title="ROI Calculator — assembl"
        description="Calculate how much time and money your NZ business can save with governed workflows. Real NZD figures, real NZ scenarios."
      />
      <BrandNav />

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 pt-28 sm:pt-32 pb-12 z-10">
        {/* soft ambient wash */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${C.teal}10 0%, transparent 65%)` }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
          className="mb-7"
        >
          <GlassKeteSphere accentColor={C.gold} accentLight={C.goldLight} size={150} />
        </motion.div>

        <motion.p
          className="text-[11px] font-bold tracking-[5px] uppercase mb-5"
          style={{ color: C.teal, fontFamily: FONT.mono }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          ROI CALCULATOR
        </motion.p>

        <motion.h1
          className="max-w-3xl"
          style={{ fontFamily: FONT.heading, fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.12, letterSpacing: "1px", color: C.text }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          How much is{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            inconsistent admin
          </span>
          {" "}costing you?
        </motion.h1>

        <motion.p
          className="max-w-xl mt-5 text-base leading-[1.7]"
          style={{ color: C.textSec, fontFamily: FONT.body }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          Real numbers in $NZD. Adjust for your team size, hourly rate, and hours spent on manual admin each week.
        </motion.p>
      </section>

      {/* ═══ SCENARIO SELECTOR ═══ */}
      <section className="px-6 pb-10 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          {SCENARIOS.map((s) => {
            const active = scenario.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => selectScenario(s)}
                className="text-[13px] px-5 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: FONT.body,
                  background: active ? `${C.teal}14` : "rgba(255,255,255,0.7)",
                  border: `1px solid ${active ? `${C.teal}40` : "rgba(255,255,255,0.85)"}`,
                  color: active ? C.teal : C.textSec,
                  backdropFilter: "blur(14px)",
                  boxShadow: active
                    ? `0 4px 14px ${C.teal}22, inset 0 1px 0 rgba(255,255,255,0.9)`
                    : "0 2px 8px rgba(166,166,180,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ CALCULATOR ═══ */}
      <section className="px-6 py-12 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Inputs Card ── */}
          <LiquidGlassCard className="p-8" accentColor={C.teal} glassIntensity="medium">
            <h2 className="text-base font-light uppercase tracking-[3px] mb-7" style={{ color: C.text, fontFamily: FONT.heading }}>
              Your numbers
            </h2>

            <div className="space-y-7">
              {[
                { label: "Team size", value: teamSize, set: setTeamSize, min: 1, max: 100, unit: "people", Icon: Users, color: C.teal },
                { label: "Avg hourly rate", value: hourlyRate, set: setHourlyRate, min: 20, max: 200, unit: "$NZD/hr", Icon: DollarSign, color: C.gold },
                { label: "Hours on manual admin / week", value: hoursWasted, set: setHoursWasted, min: 1, max: 40, unit: "hrs/wk", Icon: Timer, color: C.tealLight },
              ].map((input) => {
                const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
                return (
                  <div key={input.label}>
                    <div className="flex justify-between items-center mb-3">
                      <label className="flex items-center gap-2.5 text-[13px]" style={{ color: C.textSec, fontFamily: FONT.body }}>
                        <input.Icon size={14} style={{ color: input.color }} />
                        {input.label}
                      </label>
                      <span
                        className="text-[14px] font-medium px-3 py-1 rounded-lg"
                        style={{
                          color: C.text,
                          fontFamily: FONT.mono,
                          background: "rgba(255,255,255,0.85)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(166,166,180,0.18)",
                        }}
                      >
                        {input.value} <span style={{ color: C.textMuted, fontSize: "11px" }}>{input.unit}</span>
                      </span>
                    </div>
                    <input
                      type="range" min={input.min} max={input.max} value={input.value}
                      onChange={(e) => input.set(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer roi-slider"
                      style={{
                        background: `linear-gradient(to right, ${input.color} 0%, ${input.color} ${pct}%, rgba(61,66,80,0.10) ${pct}%, rgba(61,66,80,0.10) 100%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>

          {/* ── Results Card ── */}
          <LiquidGlassCard className="p-8" accentColor={C.gold} glassIntensity="strong">
            <h2 className="text-base font-light uppercase tracking-[3px] mb-7" style={{ color: C.text, fontFamily: FONT.heading }}>
              Estimated savings
            </h2>

            <div className="space-y-5">
              <ResultRow icon={<Clock size={16} style={{ color: C.teal }} />} label="Hours saved per week" value={`${roi.hoursSavedWeekly} hrs`} />
              <ResultRow icon={<DollarSign size={16} style={{ color: C.gold }} />} label="Monthly admin cost currently" value={fmt(roi.monthlyWaste)} />
              <ResultRow icon={<TrendingUp size={16} style={{ color: C.teal }} />} label="Monthly savings with assembl" value={fmt(roi.monthlySavings)} highlight />
              <ResultRow icon={<Calculator size={16} style={{ color: C.textMuted }} />} label="Plan cost (from)" value={fmt(roi.planCost)} />

              {/* Summary block */}
              <div className="pt-5 mt-5 space-y-4" style={{ borderTop: `1px solid ${C.divider}` }}>
                <SummaryRow label="Net monthly benefit" value={fmt(roi.netMonthlySavings)} color={roi.netMonthlySavings > 0 ? C.teal : "#C25C5C"} large />
                <SummaryRow label="Annual savings" value={fmt(roi.annualSavings)} color={C.gold} />
                <div className="flex justify-between items-center">
                  <span className="text-[13px]" style={{ color: C.textSec, fontFamily: FONT.body }}>ROI</span>
                  <span
                    className="text-xl font-bold px-3 py-1 rounded-lg"
                    style={{
                      fontFamily: FONT.mono,
                      color: C.teal,
                      background: `${C.teal}14`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px ${C.teal}18`,
                    }}
                  >
                    {roi.roiPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: "#FFFFFF",
                  fontFamily: FONT.body,
                  boxShadow: `0 6px 20px ${C.gold}40, inset 0 1px 0 rgba(255,255,255,0.4)`,
                }}
              >
                See pricing <ArrowRight size={15} />
              </Link>
            </div>
          </LiquidGlassCard>
        </div>

        <motion.p
          {...fade}
          className="text-center mt-8 text-[11px] max-w-lg mx-auto leading-relaxed"
          style={{ color: C.textMuted, fontFamily: FONT.body }}
        >
          Estimates assume 65% reduction in manual admin time based on early pilot data. Actual savings vary by business. All figures in $NZD ex GST.
        </motion.p>
      </section>

      <BrandFooter />
    </LightPageShell>
  );
};

/* ─── Result row ─── */
function ResultRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[13px]" style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>{label}</span>
      </div>
      <span
        className="text-[14px] font-medium"
        style={{ color: highlight ? "#3A7D6E" : "#3D4250", fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Summary row ─── */
function SummaryRow({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px]" style={{ color: "#6B7280", fontFamily: "'Inter', sans-serif" }}>{label}</span>
      <span
        className={large ? "text-2xl font-light" : "text-base font-medium"}
        style={{ fontFamily: "'Inter', sans-serif", color }}
      >
        {value}
      </span>
    </div>
  );
}

export default RoiCalculatorPage;
