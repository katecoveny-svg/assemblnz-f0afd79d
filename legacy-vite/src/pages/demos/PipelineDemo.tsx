import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Play, ChevronDown } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";
import { DemoBreadcrumb, DemoProvesCard, DemoBottomNav } from "@/components/demos/DemoNavFooter";

const QUERIES = [
  {
    label: "Draft a site induction for a new scaffolder on a three-storey residential build.",
    kete: "Waihanga",
    stages: [
      { verdict: "pass", explanation: "Content relates to construction safety — no sacred or culturally sensitive material detected." },
      { verdict: "pass", explanation: "Routed to Waihanga kete — ĀRAI (site safety) agent selected for scaffolding induction." },
      { verdict: "pass", explanation: "HSWA 2015 s36 + NZS 3910 cited. Scaffolding height rules applied. Evidence pack generated." },
      { verdict: "pass", explanation: "Induction template stored. Prior site briefings recalled for consistency." },
      { verdict: "pass", explanation: "SHA-256 hash chain verified. Named operator sign-off required before distribution." },
    ],
  },
  {
    label: "Write a karakia for our opening ceremony.",
    kete: "Sacred content",
    stages: [
      { verdict: "block", explanation: "Sacred content — karakia cannot be AI-generated. Escalated to Kaitiaki Review." },
      { verdict: "skip", explanation: "Blocked at Kahu. No routing required." },
      { verdict: "skip", explanation: "Blocked at Kahu. No execution." },
      { verdict: "skip", explanation: "Blocked at Kahu. No memory stored." },
      { verdict: "skip", explanation: "Blocked at Kahu. No assurance needed." },
    ],
  },
  {
    label: "Check this Tauranga supplier invoice for CCA 2002 compliance.",
    kete: "Contracts",
    stages: [
      { verdict: "pass", explanation: "Commercial contract content. No cultural or privacy flags. Proceeding." },
      { verdict: "pass", explanation: "Routed to Contracts workflow — ACCORD agent selected for CCA 2002 review." },
      { verdict: "flag", explanation: "Payment claim schedule missing retention breakdown. Flagged for human review. CCA 2002 s20 cited." },
      { verdict: "pass", explanation: "Supplier history recalled. Two prior invoices from this vendor on file." },
      { verdict: "pass", explanation: "Evidence pack generated with FLAG code. Awaiting named operator sign-off." },
    ],
  },
];

const STAGES = [
  { name: "Kahu", fn: "Policy — what's allowed" },
  { name: "Iho", fn: "Routing — picks the right specialist" },
  { name: "Tā", fn: "Execution — does the work" },
  { name: "Mahara", fn: "Memory — learns and remembers" },
  { name: "Mana", fn: "Assurance — proves it was done right" },
];

const VERDICT_STYLES = {
  pass: { icon: Check, color: "#4FE4A7", bg: "rgba(79,228,167,0.08)", label: "PASS" },
  flag: { icon: AlertTriangle, color: "#A8DDDB", bg: "rgba(168,221,219,0.08)", label: "FLAG" },
  block: { icon: X, color: "#E87461", bg: "rgba(232,116,97,0.08)", label: "BLOCK" },
  skip: { icon: ChevronDown, color: "rgba(255,255,255,0.2)", bg: "rgba(255,255,255,0.02)", label: "SKIPPED" },
};

const PipelineDemo = () => {
  const [selectedQuery, setSelectedQuery] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);

  const query = QUERIES[selectedQuery];

  const handleRun = () => {
    setRunning(true);
    setActiveStage(-1);
    let i = 0;
    const blocked = query.stages[0].verdict === "block";
    const interval = setInterval(() => {
      setActiveStage(i);
      i++;
      if (i >= 5 || (blocked && i >= 1)) {
        clearInterval(interval);
        if (blocked) setActiveStage(0);
      }
    }, 800);
  };

  useEffect(() => {
    setRunning(false);
    setActiveStage(-1);
  }, [selectedQuery]);

  const hashStub = "a3f8c1...7d2e";
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ") + " NZST";

  return (
    <DemoGlassShell>
      <SEO title="Pipeline Walkthrough Demo | assembl" description="See a sample query flow through the five-stage governance pipeline: Kahu, Iho, Tā, Mahara, Mana." path="/demos/pipeline" image="/og/demos-pipeline.png" />
      <BrandNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <DemoBreadcrumb title="Five-stage pipeline" />

        {/* Demo mode banner */}
        <div className="liquid-glass liquid-glass-gold rounded-xl px-4 py-2 text-center mb-10">
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#A8DDDB" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>

        <DemoProvesCard slug="pipeline" />

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Five-Stage Pipeline
        </h1>
        <p className="text-center text-sm mb-10" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          Watch a query flow through Kahu → Iho → Tā → Mahara → Mana
        </p>

        {/* Query selector — glass cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {QUERIES.map((q, i) => (
            <button key={i} onClick={() => setSelectedQuery(i)}
              className={`liquid-glass text-left p-5 rounded-2xl transition-all text-xs group ${selectedQuery === i ? "liquid-glass-pounamu" : ""}`}
              style={{
                fontFamily: "'Inter', sans-serif",
                borderColor: selectedQuery === i ? "rgba(58,125,110,0.4)" : undefined,
                boxShadow: selectedQuery === i ? "0 0 30px rgba(58,125,110,0.1), inset 0 1px 0 rgba(255,255,255,0.1)" : undefined,
              }}>
              <span className="text-[9px] tracking-[2px] uppercase block mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#7ECFC2" }}>{q.kete}</span>
              <span style={{ color: "rgba(245,240,232,0.75)" }}>{q.label}</span>
            </button>
          ))}
        </div>

        <div className="text-center mb-10">
          <button onClick={handleRun} disabled={running}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all liquid-glass liquid-glass-gold"
            style={{
              color: running ? "rgba(245,240,232,0.4)" : "#A8DDDB",
              borderColor: running ? "rgba(255,255,255,0.06)" : "rgba(74,165,168,0.3)",
            }}>
            <Play size={14} /> {running ? "Running..." : "Run query"}
          </button>
        </div>

        {/* Pipeline stages — premium glass */}
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isActive = activeStage >= i;
            const stageData = query.stages[i];
            const v = isActive ? VERDICT_STYLES[stageData.verdict as keyof typeof VERDICT_STYLES] : null;

            return (
              <React.Fragment key={stage.name}>
                <motion.div
                  animate={isActive ? { boxShadow: `0 0 40px ${v?.color}12, 0 8px 32px rgba(0,0,0,0.3)` } : {}}
                  className="liquid-glass rounded-2xl p-5 transition-all duration-500"
                  style={{
                    borderColor: isActive ? `${v?.color}30` : undefined,
                    background: isActive 
                      ? `linear-gradient(145deg, ${v?.bg} 0%, rgba(10,22,40,0.55) 100%)`
                      : undefined,
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ 
                        background: isActive ? `${v?.color}15` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isActive ? `${v?.color}25` : "rgba(255,255,255,0.06)"}`,
                        boxShadow: isActive ? `0 0 20px ${v?.color}10` : "none",
                      }}>
                      {isActive && v ? <v.icon size={18} style={{ color: v.color }} /> : (
                        <span className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.2)" }}>{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: isActive ? "#F5F0E8" : "rgba(245,240,232,0.4)" }}>{stage.name}</span>
                        <span className="text-[11px]" style={{ color: "rgba(245,240,232,0.3)" }}>{stage.fn}</span>
                        {isActive && v && (
                          <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full" 
                            style={{ 
                              background: `${v.color}12`, 
                              color: v.color, 
                              fontFamily: "'IBM Plex Mono', monospace",
                              border: `1px solid ${v.color}20`,
                              boxShadow: `0 0 12px ${v.color}10`,
                            }}>
                            {v.label}
                          </span>
                        )}
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs mt-2" style={{ color: "rgba(245,240,232,0.55)", fontFamily: "'Inter', sans-serif" }}>
                            {stageData.explanation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
                {i < 4 && (
                  <div className="flex justify-center">
                    <div className="w-px h-5" style={{ 
                      background: isActive 
                        ? `linear-gradient(180deg, ${v?.color}30, transparent)` 
                        : "rgba(255,255,255,0.06)" 
                    }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* End state — evidence pack preview */}
        <AnimatePresence>
          {activeStage >= (query.stages[0].verdict === "block" ? 0 : 4) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} 
              className="mt-8 liquid-glass liquid-glass-pounamu rounded-2xl p-8 text-center"
              style={{ borderColor: "rgba(58,125,110,0.25)" }}>
              <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#7ECFC2" }}>Evidence Pack (Demo)</p>
              <p className="text-xs mb-1" style={{ color: "rgba(245,240,232,0.6)" }}>Pack ID: <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>EP-DEMO-{String(selectedQuery + 1).padStart(3, "0")}</span></p>
              <p className="text-xs mb-1" style={{ color: "rgba(245,240,232,0.4)" }}>Timestamp: {timestamp}</p>
              <p className="text-xs" style={{ color: "rgba(245,240,232,0.4)", fontFamily: "'IBM Plex Mono', monospace" }}>SHA-256: {hashStub}</p>
              <PoweredByAssembl />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DemoBottomNav />
      <BrandFooter />
    </DemoGlassShell>
  );
};

export default PipelineDemo;
