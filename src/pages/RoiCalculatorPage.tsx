import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, DollarSign, TrendingUp, Users, Timer, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteMiniIcon from "@/components/kete/KeteMiniIcon";

/* ─── Tokens ─── */
const C = {
  bg: "#060610",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  goldLight: "#F0D078",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.6)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
  glass: "rgba(255,255,255,0.03)",
  glassBorder: "rgba(255,255,255,0.06)",
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
    <div className="min-h-screen" style={{ background: C.bg, color: C.white }}>
      <SEO
        title="ROI Calculator — assembl"
        description="Calculate how much time and money your NZ business can save with governed workflows. Real NZD figures, real NZ scenarios."
      />
      <BrandNav />

      {/* ═══ Ambient glow ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(ellipse at center, ${C.pounamu}, transparent 70%)` }} />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="flex flex-col items-center text-center px-6 pt-28 pb-14">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mb-6">
          <KeteMiniIcon glyph="bolt" size={32} />
        </motion.div>

        <motion.p
          className="text-[11px] font-bold tracking-[5px] uppercase mb-5"
          style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          ROI CALCULATOR
        </motion.p>

        <motion.h1
          className="max-w-3xl"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.12 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}
        >
          How much is{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.goldLight}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            inconsistent admin
          </span>
          {" "}costing you?
        </motion.h1>

        <motion.p
          className="max-w-xl mt-5 text-base leading-[1.7]"
          style={{ color: C.t2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          Real numbers in $NZD. Adjust for your team size, hourly rate, and hours spent on manual admin each week.
        </motion.p>
      </section>

      {/* ═══ SCENARIO SELECTOR ═══ */}
      <section className="px-6 pb-10">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          {SCENARIOS.map((s) => {
            const active = scenario.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => selectScenario(s)}
                className="text-[13px] px-5 py-2.5 rounded-xl transition-all duration-300"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: active ? `${C.pounamu}18` : C.glass,
                  border: `1px solid ${active ? `${C.pounamu}40` : C.glassBorder}`,
                  color: active ? C.pounamuGlow : C.t3,
                  backdropFilter: "blur(14px)",
                  boxShadow: active ? `0 0 20px ${C.pounamu}15, inset 0 1px 0 ${C.pounamu}15` : "none",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ CALCULATOR ═══ */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Inputs Card ── */}
          <motion.div
            {...fade}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: C.glass,
              border: `1px solid ${C.glassBorder}`,
              backdropFilter: "blur(14px)",
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.pounamu}40, transparent)` }} />

            <h2 className="text-base font-light uppercase tracking-[3px] mb-7" style={{ color: C.t1, fontFamily: "'Lato', sans-serif" }}>
              Your numbers
            </h2>

            <div className="space-y-7">
              {[
                { label: "Team size", value: teamSize, set: setTeamSize, min: 1, max: 100, unit: "people", Icon: Users, color: C.pounamuLight },
                { label: "Avg hourly rate", value: hourlyRate, set: setHourlyRate, min: 20, max: 200, unit: "$NZD/hr", Icon: DollarSign, color: C.gold },
                { label: "Hours on manual admin / week", value: hoursWasted, set: setHoursWasted, min: 1, max: 40, unit: "hrs/wk", Icon: Timer, color: C.pounamuGlow },
              ].map((input) => (
                <div key={input.label}>
                  <div className="flex justify-between items-center mb-3">
                    <label className="flex items-center gap-2.5 text-[13px]" style={{ color: C.t2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <input.Icon size={14} style={{ color: input.color, opacity: 0.8 }} />
                      {input.label}
                    </label>
                    <span
                      className="text-[14px] font-medium px-3 py-1 rounded-lg"
                      style={{ color: C.t1, fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.65)" }}
                    >
                      {input.value} <span style={{ color: C.t3, fontSize: "11px" }}>{input.unit}</span>
                    </span>
                  </div>
                  <input
                    type="range" min={input.min} max={input.max} value={input.value}
                    onChange={(e) => input.set(Number(e.target.value))}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer roi-slider"
                    style={{
                      background: `linear-gradient(to right, ${input.color} ${((input.value - input.min) / (input.max - input.min)) * 100}%, rgba(255,255,255,0.06) 0%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Results Card ── */}
          <motion.div
            {...fade}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: `${C.pounamu}06`,
              border: `1px solid ${C.pounamu}18`,
              backdropFilter: "blur(14px)",
            }}
          >
            {/* Top accent line — gold */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}50, transparent)` }} />

            <h2 className="text-base font-light uppercase tracking-[3px] mb-7" style={{ color: C.t1, fontFamily: "'Lato', sans-serif" }}>
              Estimated savings
            </h2>

            <div className="space-y-5">
              <ResultRow icon={<Clock size={16} style={{ color: C.pounamuGlow }} />} label="Hours saved per week" value={`${roi.hoursSavedWeekly} hrs`} />
              <ResultRow icon={<DollarSign size={16} style={{ color: C.gold }} />} label="Monthly admin cost currently" value={fmt(roi.monthlyWaste)} />
              <ResultRow icon={<TrendingUp size={16} style={{ color: C.pounamuGlow }} />} label="Monthly savings with assembl" value={fmt(roi.monthlySavings)} highlight />
              <ResultRow icon={<Calculator size={16} style={{ color: C.t3 }} />} label="Plan cost (from)" value={fmt(roi.planCost)} />

              {/* Summary block */}
              <div className="pt-5 mt-5 space-y-4" style={{ borderTop: `1px solid ${C.pounamu}25` }}>
                <SummaryRow label="Net monthly benefit" value={fmt(roi.netMonthlySavings)} color={roi.netMonthlySavings > 0 ? C.pounamuGlow : "#E87C7C"} large />
                <SummaryRow label="Annual savings" value={fmt(roi.annualSavings)} color={C.gold} />
                <div className="flex justify-between items-center">
                  <span className="text-[13px]" style={{ color: C.t3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ROI</span>
                  <span
                    className="text-xl font-bold px-3 py-1 rounded-lg"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: C.pounamuGlow,
                      background: `${C.pounamu}12`,
                    }}
                  >
                    {roi.roiPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/pricing" className="cta-glass-gold w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-medium">
                See pricing <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.p
          {...fade}
          className="text-center mt-8 text-[11px] max-w-lg mx-auto leading-relaxed"
          style={{ color: C.t3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Estimates assume 65% reduction in manual admin time based on early pilot data. Actual savings vary by business. All figures in $NZD ex GST.
        </motion.p>
      </section>

      <BrandFooter />
    </div>
  );
};

/* ─── Result row ─── */
function ResultRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[13px]" style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
      </div>
      <span
        className="text-[14px] font-medium"
        style={{ color: highlight ? "#7ECFC2" : "rgba(255,255,255,0.92)", fontFamily: "'JetBrains Mono', monospace" }}
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
      <span className="text-[13px]" style={{ color: "#9CA3AF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
      <span
        className={large ? "text-2xl font-light" : "text-base font-medium"}
        style={{ fontFamily: "'Lato', sans-serif", color }}
      >
        {value}
      </span>
    </div>
  );
}

export default RoiCalculatorPage;
