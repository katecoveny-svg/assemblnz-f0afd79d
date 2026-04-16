import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { UtensilsCrossed, HardHat, Car, Play, ChevronRight, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const BG = "#FAFBFC";
const GOLD = "#D4A843";
const POUNAMU = "#3A7D6E";

const PACKS = [
  {
    id: "manaaki",
    name: "Manaaki",
    subtitle: "Hospitality — 30-seat Wellington restaurant",
    icon: UtensilsCrossed,
    color: "#D4A843",
    scenario: "Tonight's duty manager shift-change",
    inputs: ["8 staff roster", "3 allergen flags", "1 near-miss from last night", "FCP audit due next week"],
    outputs: ["Shift handover brief", "Allergen checklist", "FCP readiness note", "Toolbox chat suggestion"],
    compliance: ["Food Act 2014", "Sale & Supply of Alcohol Act", "H&S at Work Act"],
    steps: [
      { label: "Shift handover", detail: "8 staff reviewed. 2 on allergen stations. Near-miss flagged for toolbox talk.", status: "pass" as const },
      { label: "Allergen check", detail: "3 flags: dairy (Table 4), shellfish (Table 9), gluten-free (Table 12). Cross-contamination protocols confirmed.", status: "pass" as const },
      { label: "Near-miss review", detail: "Last night: wet floor slip near bar. Corrective action: additional non-slip mat ordered, toolbox talk #7 drafted.", status: "warn" as const },
      { label: "FCP audit prep", detail: "Food Control Plan audit due in 6 days. 14/16 records current. 2 temperature logs need back-fill from yesterday.", status: "warn" as const },
      { label: "Evidence pack", detail: "Shift handover brief generated. Allergen checklist signed. FCP gap list ready. All logged with timestamps.", status: "pass" as const },
    ],
  },
  {
    id: "waihanga",
    name: "Waihanga",
    subtitle: "Construction — residential build site H&S",
    icon: HardHat,
    color: "#3A7D6E",
    scenario: "New subcontractor starting Monday",
    inputs: ["Architect PDF (sample)", "LBP register", "Last 2 weeks of toolbox talks"],
    outputs: ["Site-specific SWMS", "Induction checklist", "Toolbox talk #3 draft"],
    compliance: ["H&S at Work Act 2015", "Construction Contracts Act", "LBP rules"],
    steps: [
      { label: "Document intake", detail: "Architect PDF parsed. 3 hazard zones identified. LBP register checked — 2 of 4 subbies current.", status: "pass" as const },
      { label: "SWMS generation", detail: "Site-specific Safe Work Method Statement drafted for roofing works. Height work controls, exclusion zones, PPE requirements included.", status: "pass" as const },
      { label: "Induction checklist", detail: "18-point induction checklist generated. Emergency procedures, site rules, hazard register acknowledgment required before Monday.", status: "pass" as const },
      { label: "Toolbox talk", detail: "Toolbox Talk #3 draft: 'Working at Heights — Roof Truss Installation'. Includes near-miss from Week 2.", status: "pass" as const },
      { label: "Evidence pack", detail: "SWMS signed off. Induction checklist template ready. Toolbox talk scheduled. Compliance gap: 1 LBP renewal overdue.", status: "warn" as const },
    ],
  },
  {
    id: "arataki",
    name: "Arataki",
    subtitle: "Automotive — 6-vehicle courier fleet",
    icon: Car,
    color: "#E8E8E8",
    scenario: "Tomorrow's Auckland → Taupō → Napier run",
    inputs: ["6 vehicles (mixed fuel)", "WoF/CoF/RUC state", "Driver licence classes", "Live NZ fuel prices", "Weather + roadworks"],
    outputs: ["Per-vehicle assignment", "Fuel-optimised route", "Driver compliance checklist", "Trip evidence pack"],
    compliance: ["Land Transport Act", "RUC Act", "H&S at Work Act (driver fatigue)"],
    steps: [
      { label: "Fleet check", detail: "6 vehicles assessed. Van #3: WoF expires in 4 days — flagged. Van #5: RUC balance low (142km remaining). All others clear.", status: "warn" as const },
      { label: "Route planning", detail: "SH1 via Taupō selected. Roadworks at Huntly (15min delay). Weather: rain Taupō–Napier from 2pm. Fuel stop: Gull Taupō ($2.41/L diesel).", status: "pass" as const },
      { label: "Driver compliance", detail: "6 drivers checked. All Class 1 current. Driver D: logbook shows 11hr shift yesterday — fatigue risk flagged, rest break required.", status: "warn" as const },
      { label: "Vehicle assignment", detail: "Van #3 swapped to local runs (WoF due). Van #1 assigned Auckland–Napier (best economy, full RUC). Driver D assigned afternoon leg only.", status: "pass" as const },
      { label: "Evidence pack", detail: "Trip log pre-populated. Fuel cost estimate: $187.40. Insurance evidence pack: timestamps, route, driver hours, vehicle condition — all contemporaneous.", status: "pass" as const },
    ],
  },
];

const statusIcon = (s: string) => {
  if (s === "pass") return <CheckCircle2 size={14} className="text-emerald-400" />;
  if (s === "warn") return <AlertTriangle size={14} className="text-amber-400" />;
  return <Clock size={14} className="text-assembl-text/40" />;
};

export default function SimulatorHub() {
  const [activePack, setActivePack] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [running, setRunning] = useState(false);

  const pack = PACKS.find(p => p.id === activePack);

  const runScenario = (id: string) => {
    setActivePack(id);
    setStepIndex(0);
    setRunning(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStepIndex(i);
      const p = PACKS.find(p => p.id === id);
      if (p && i >= p.steps.length) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <SEO title="Scenario Simulator | assembl" description="Run realistic industry scenarios and see how Assembl agents handle compliance, operations, and evidence packs." />
      <BrandNav />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
            Scenario Simulator
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
            See exactly how an agent handles a real NZ business scenario — step by step, with compliance checks and evidence packs.
          </p>
        </motion.div>

        {/* Pack cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {PACKS.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-6 cursor-pointer group transition-all duration-300"
              style={{ background: activePack === p.id ? `${p.color}12` : "rgba(255,255,255,0.03)", border: `1px solid ${activePack === p.id ? p.color + "40" : "rgba(255,255,255,0.06)"}` }}
              onClick={() => !running && runScenario(p.id)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                  <p.icon size={20} style={{ color: p.color }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white/90">{p.name}</h3>
                  <p className="text-[11px] text-white/40">{p.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{p.scenario}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.compliance.map(c => (
                  <span key={c} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${p.color}10`, color: `${p.color}CC`, border: `1px solid ${p.color}20` }}>{c}</span>
                ))}
              </div>
              <button className="flex items-center gap-2 text-xs font-medium group-hover:gap-3 transition-all" style={{ color: p.color }}>
                <Play size={12} /> Run this scenario <ChevronRight size={12} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Active scenario */}
        <AnimatePresence mode="wait">
          {pack && (
            <motion.div key={pack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
              <div className="flex items-center gap-3 mb-6">
                <pack.icon size={20} style={{ color: pack.color }} />
                <h2 className="text-xl font-light text-white/90">{pack.name} — {pack.scenario}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Inputs</h4>
                  <ul className="space-y-1.5">
                    {pack.inputs.map(inp => <li key={inp} className="text-sm text-white/60 flex items-center gap-2"><ChevronRight size={10} className="text-gray-300" />{inp}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Expected outputs</h4>
                  <ul className="space-y-1.5">
                    {pack.outputs.map(out => <li key={out} className="text-sm text-white/60 flex items-center gap-2"><FileText size={10} className="text-gray-300" />{out}</li>)}
                  </ul>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {pack.steps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: i <= stepIndex ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all" style={{ background: i <= stepIndex ? "rgba(255,255,255,0.03)" : "transparent" }}>
                    <div className="mt-0.5">{i <= stepIndex ? statusIcon(step.status) : <div className="w-3.5 h-3.5 rounded-full border border-gray-200" />}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white/80">{step.label}</div>
                      {i <= stepIndex && <p className="text-xs text-gray-500 mt-1">{step.detail}</p>}
                    </div>
                    {i <= stepIndex && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${step.status === "pass" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {step.status === "pass" ? "PASS" : "FLAG"}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {!running && stepIndex >= pack.steps.length - 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
                  <Link to={`/${pack.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium" style={{ background: POUNAMU, color: "#3D4250" }}>
                    See what your evidence pack looks like <ChevronRight size={14} />
                  </Link>
                  <button onClick={() => runScenario(pack.id)} className="block mx-auto mt-3 text-xs text-white/40 hover:text-white/60 transition-colors">
                    Replay scenario
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BrandFooter />
    </div>
  );
}
