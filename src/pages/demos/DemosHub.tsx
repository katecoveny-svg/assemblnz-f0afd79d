import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Clock, Shield, Check, X, AlertTriangle, ChevronRight } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";

const C = {
  pounamu: "#3A7D6E",
  pounamuLight: "#7ECFC2",
  pounamuGlow: "#5AADA0",
  gold: "#D4A853",
  goldLight: "#A8DDDB",
  bone: "#F5F0E8",
};

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Inline pipeline demo data ─── */
const PIPELINE_STAGES = [
  { name: "Kahu", fn: "Policy check", color: C.pounamuGlow },
  { name: "Iho", fn: "Route to specialist", color: C.gold },
  { name: "Tā", fn: "Execute task", color: C.pounamuLight },
  { name: "Mahara", fn: "Store memory", color: C.goldLight },
  { name: "Mana", fn: "Verify & sign", color: C.pounamuGlow },
];

const PIPELINE_RESULTS = [
  { verdict: "pass", text: "No sacred content detected. Commercial query — proceeding." },
  { verdict: "pass", text: "Routed to Manaaki kete — AURA (food safety) agent selected." },
  { verdict: "pass", text: "Food Act 2014 s37–40 cited. Template FCP generated." },
  { verdict: "pass", text: "Prior café registrations recalled. Consistency verified." },
  { verdict: "pass", text: "SHA-256 hash verified. Evidence pack ready for sign-off." },
];

const DEMOS = [
  {
    title: "Five-stage pipeline",
    path: "/demos/pipeline",
    pitch: "Watch a query flow through Kahu → Iho → Tā → Mahara → Mana, live.",
    proves: "Every output is governed. Nothing bypasses the pipeline.",
    accent: C.pounamu,
    time: "~60s",
  },
  {
    title: "Evidence pack",
    path: "/demos/evidence-pack",
    pitch: "The signed, sourced pack a customer actually keeps.",
    proves: "Audit-grade evidence, not chat replies.",
    accent: C.gold,
    time: "~60s",
  },
  {
    title: "Confidence scoring",
    path: "/demos/confidence-scoring",
    pitch: "Hover any claim to see the source it came from.",
    proves: "Every claim is cited. No hallucinations.",
    accent: C.pounamuLight,
    time: "~60s",
  },
  {
    title: "Kaitiaki gate",
    path: "/demos/kaitiaki-gate",
    pitch: "See how sacred content is hard-blocked.",
    proves: "Tikanga posture, not a compliance label.",
    accent: "#E87461",
    time: "~60s",
  },
];

/* ─── Inline Mini Pipeline Animation ─── */
function InlinePipelineDemo() {
  const [activeStage, setActiveStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Auto-run on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runDemo();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const runDemo = () => {
    if (running) return;
    setRunning(true);
    setActiveStage(-1);
    let i = 0;
    const interval = setInterval(() => {
      setActiveStage(i);
      i++;
      if (i >= 5) {
        clearInterval(interval);
        setRunning(false);
        setHasRun(true);
      }
    }, 900);
  };

  const verdictIcon = (v: string) => {
    if (v === "pass") return <Check size={12} style={{ color: C.pounamuGlow }} />;
    if (v === "flag") return <AlertTriangle size={12} style={{ color: C.goldLight }} />;
    return <X size={12} style={{ color: "#E87461" }} />;
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(74,165,168,0.15)",
      boxShadow: "0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04)",
    }}>
      {/* Query bar */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.gold, boxShadow: `0 0 8px ${C.gold}60` }} />
          <p className="text-[13px] flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151" }}>
            "Do I need a food control plan for my cafe?"
          </p>
          {hasRun && !running && (
            <button onClick={runDemo} className="text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{
              fontFamily: "'JetBrains Mono', monospace", color: C.pounamuGlow,
              border: `1px solid ${C.pounamuGlow}30`, background: `${C.pounamuGlow}08`,
            }}>
              Replay
            </button>
          )}
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="px-6 py-6 space-y-3">
        {PIPELINE_STAGES.map((stage, i) => {
          const isActive = i <= activeStage;
          const isCurrent = i === activeStage;
          const result = PIPELINE_RESULTS[i];
          return (
            <motion.div key={stage.name}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isActive ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl transition-all"
              style={{
                background: isCurrent ? "rgba(74,165,168,0.06)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${isCurrent ? "rgba(74,165,168,0.15)" : "rgba(0,0,0,0.04)"}`,
              }}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  background: isActive ? `${stage.color}18` : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isActive ? stage.color + "30" : "rgba(0,0,0,0.06)"}`,
                  boxShadow: isCurrent ? `0 0 16px ${stage.color}30` : "none",
                }}>
                  {isActive ? verdictIcon(result.verdict) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
                  )}
                </div>
                <span className="text-[8px] tracking-[2px] uppercase" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: isActive ? stage.color : "rgba(0,0,0,0.3)",
                }}>{stage.name}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] tracking-[1px] uppercase mb-1" style={{
                  fontFamily: "'Lato', sans-serif", fontWeight: 400,
                  color: isActive ? "#374151" : "rgba(0,0,0,0.3)",
                }}>{stage.fn}</p>
                <AnimatePresence>
                  {isActive && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
                      className="text-[12px] leading-[1.7]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                      {result.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {isActive && (
                <span className="text-[8px] tracking-[1px] uppercase px-2 py-1 rounded-full shrink-0 mt-1" style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: `${C.pounamuGlow}12`, color: C.pounamuGlow,
                }}>PASS</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Result bar */}
      <AnimatePresence>
        {hasRun && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-6 p-4 rounded-xl flex items-center gap-3" style={{
              background: `${C.pounamuGlow}08`, border: `1px solid ${C.pounamuGlow}20`,
            }}>
            <Check size={16} style={{ color: C.pounamuGlow }} />
            <p className="text-[13px] flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151" }}>
              Evidence pack ready. All 5 governance stages passed.
            </p>
            <Link to="/demos/pipeline" className="text-[10px] tracking-[2px] uppercase flex items-center gap-1" style={{
              fontFamily: "'JetBrains Mono', monospace", color: C.gold,
            }}>
              Full demo <ChevronRight size={10} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DemosHub = () => {
  const navigate = useNavigate();

  return (
    <DemoGlassShell>
      <SEO title="See Assembl in action — Interactive demos" description="Four short demos showing what Assembl actually does on real NZ operations." path="/demos" />
      <BrandNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Intro */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <p className="text-[10px] tracking-[5px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold, fontWeight: 700 }}>
            — Live demos —
          </p>
          <h1 className="text-2xl sm:text-[40px] mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", color: "#3D4250" }}>
            See it work
          </h1>
          <p className="text-[15px] max-w-lg mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
            Watch a real query flow through the governance pipeline. Then explore each demo in detail.
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.div className="rounded-xl px-5 py-3 max-w-xl mx-auto mb-12 flex items-start gap-3"
          style={{ background: "rgba(212,168,83,0.06)", border: "1px solid rgba(212,168,83,0.12)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <Shield size={14} className="shrink-0 mt-0.5" style={{ color: C.goldLight }} />
          <p className="text-[11px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF" }}>
            These demos run with synthetic data. Nothing leaves this page.
          </p>
        </motion.div>

        {/* INLINE PIPELINE DEMO — runs automatically */}
        <motion.div className="max-w-[700px] mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
          <InlinePipelineDemo />
        </motion.div>

        {/* Demo cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {DEMOS.map((d, i) => (
            <motion.div key={d.path}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
            >
              <Link to={d.path} className="group block h-full">
                <div className="h-full rounded-2xl p-6 transition-all duration-400 group-hover:translate-y-[-6px]"
                   style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ background: d.accent, boxShadow: `0 0 16px ${d.accent}50` }} />
                    <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>
                      Demo {i + 1}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "#9CA3AF" }}>
                      <Clock size={10} /> {d.time}
                    </span>
                  </div>

                  <h3 className="text-[15px] mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#1F2937" }}>
                    {d.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                    {d.pitch}
                  </p>

                  <div className="rounded-xl px-3 py-2.5 mb-5" style={{ background: `${d.accent}08`, border: `1px solid ${d.accent}15` }}>
                    <p className="text-[11px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
                      <span className="font-semibold" style={{ color: d.accent }}>Proves:</span> {d.proves}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-[12px] font-medium group-hover:gap-3 transition-all" style={{ color: d.accent }}>
                    Run demo <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-14">
          <PoweredByAssembl />
        </div>
      </div>

      <BrandFooter />
    </DemoGlassShell>
  );
};

export default DemosHub;
