import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

const C = {
  bg: "#060610",
  pounamu: "#3A7D6E",
  pounamuLight: "#5AADA0",
  pounamuGlow: "#7ECFC2",
  gold: "#D4A843",
  white: "#FFFFFF",
  t1: "rgba(255,255,255,0.92)",
  t2: "rgba(255,255,255,0.6)",
  t3: "rgba(255,255,255,0.36)",
  border: "rgba(255,255,255,0.07)",
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
    const savingsRate = 0.65; // 65% reduction
    const monthlySavings = monthlyWaste * savingsRate;
    const annualSavings = annualWaste * savingsRate;
    const planCost = 590; // starter plan
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

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-12">
        <motion.p className="text-[11px] font-semibold tracking-[5px] uppercase mb-7" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          ROI CALCULATOR
        </motion.p>
        <motion.h1 className="max-w-3xl" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.12 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}>
          How much is{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.gold}, #E8C76A)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            inconsistent admin
          </span>
          {" "}costing you?
        </motion.h1>
        <motion.p className="max-w-xl mt-5 text-base leading-[1.7]" style={{ color: C.t2 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Real numbers in $NZD. Adjust for your team size, hourly rate, and hours spent on manual admin each week.
        </motion.p>
      </section>

      {/* Scenarios */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => selectScenario(s)}
              className="text-[13px] px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: scenario.id === s.id ? `${C.pounamu}20` : "rgba(255,255,255,0.03)",
                border: `1px solid ${scenario.id === s.id ? C.pounamu : C.border}`,
                color: scenario.id === s.id ? C.pounamuGlow : C.t3,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <motion.div {...fade} className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
            <h2 className="text-lg font-medium mb-6" style={{ color: C.t1 }}>Your numbers</h2>
            <div className="space-y-6">
              {[
                { label: "Team size", value: teamSize, set: setTeamSize, min: 1, max: 100, unit: "people", icon: "👥" },
                { label: "Avg hourly rate", value: hourlyRate, set: setHourlyRate, min: 20, max: 200, unit: "$NZD/hr", icon: "💰" },
                { label: "Hours on manual admin / week", value: hoursWasted, set: setHoursWasted, min: 1, max: 40, unit: "hrs/wk", icon: "⏱️" },
              ].map((input) => (
                <div key={input.label}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[14px]" style={{ color: C.t2 }}>{input.icon} {input.label}</label>
                    <span className="text-[15px] font-medium" style={{ color: C.t1 }}>{input.value} {input.unit}</span>
                  </div>
                  <input
                    type="range" min={input.min} max={input.max} value={input.value}
                    onChange={(e) => input.set(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${C.pounamu} ${((input.value - input.min) / (input.max - input.min)) * 100}%, rgba(255,255,255,0.1) 0%)` }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Results */}
          <motion.div {...fade} className="rounded-2xl p-8" style={{ background: `${C.pounamu}08`, border: `1px solid ${C.pounamu}20` }}>
            <h2 className="text-lg font-medium mb-6" style={{ color: C.t1 }}>Estimated savings</h2>
            <div className="space-y-5">
              <ResultRow icon={<Clock size={20} style={{ color: C.pounamuGlow }} />} label="Hours saved per week" value={`${roi.hoursSavedWeekly} hrs`} />
              <ResultRow icon={<DollarSign size={20} style={{ color: C.gold }} />} label="Monthly admin cost currently" value={fmt(roi.monthlyWaste)} />
              <ResultRow icon={<TrendingUp size={20} style={{ color: C.pounamuGlow }} />} label="Monthly savings with assembl" value={fmt(roi.monthlySavings)} highlight />
              <ResultRow icon={<Calculator size={20} style={{ color: C.t3 }} />} label="Plan cost (from)" value={fmt(roi.planCost)} />

              <div className="pt-4 mt-4" style={{ borderTop: `1px solid ${C.pounamu}30` }}>
                <div className="flex justify-between items-center">
                  <span className="text-[15px] font-medium" style={{ color: C.t1 }}>Net monthly benefit</span>
                  <span className="text-2xl font-light" style={{ fontFamily: "'Lato', sans-serif", color: roi.netMonthlySavings > 0 ? C.pounamuGlow : "#E87C7C" }}>
                    {fmt(roi.netMonthlySavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[14px]" style={{ color: C.t3 }}>Annual savings</span>
                  <span className="text-lg font-medium" style={{ color: C.gold }}>{fmt(roi.annualSavings)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[14px]" style={{ color: C.t3 }}>ROI</span>
                  <span className="text-lg font-medium" style={{ color: C.pounamuGlow }}>{roi.roiPercent}%</span>
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

        <motion.p {...fade} className="text-center mt-6 text-[12px]" style={{ color: C.t3 }}>
          Estimates assume 65% reduction in manual admin time based on early pilot data. Actual savings vary by business. All figures in $NZD ex GST.
        </motion.p>
      </section>

      <BrandFooter />
    </div>
  );
};

function ResultRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  const C2 = { t1: "rgba(255,255,255,0.92)", t3: "rgba(255,255,255,0.36)", pounamuGlow: "#7ECFC2" };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[14px]" style={{ color: C2.t3 }}>{label}</span>
      </div>
      <span className="text-[16px] font-medium" style={{ color: highlight ? C2.pounamuGlow : C2.t1 }}>{value}</span>
    </div>
  );
}

export default RoiCalculatorPage;
