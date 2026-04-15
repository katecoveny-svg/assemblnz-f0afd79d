import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Play, ChevronDown } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
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
  pass: { icon: Check, color: "#4FE4A7", bg: "rgba(79,228,167,0.1)", label: "PASS" },
  flag: { icon: AlertTriangle, color: "#F0D078", bg: "rgba(240,208,120,0.1)", label: "FLAG" },
  block: { icon: X, color: "#E87461", bg: "rgba(232,116,97,0.1)", label: "BLOCK" },
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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D1E35 50%, #0A1628 100%)", color: "#F5F0E8" }}>
      <SEO title="Pipeline Walkthrough Demo | assembl" description="See a sample query flow through the five-stage governance pipeline: Kahu, Iho, Tā, Mahara, Mana." path="/demos/pipeline" image="/og/demos-pipeline.png" />
      <BrandNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <DemoBreadcrumb title="Five-stage pipeline" />
        {/* Demo banner */}
        <div className="rounded-xl px-4 py-2 text-center mb-10" style={{ background: "rgba(240,208,120,0.08)", border: "1px solid rgba(240,208,120,0.2)" }}>
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#F0D078" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>
        <DemoProvesCard slug="pipeline" />

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Five-Stage Pipeline
        </h1>
        <p className="text-center text-sm mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          Watch a query flow through Kahu → Iho → Tā → Mahara → Mana
        </p>

        {/* Query selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {QUERIES.map((q, i) => (
            <button key={i} onClick={() => setSelectedQuery(i)}
              className="text-left p-4 rounded-xl transition-all text-xs"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: selectedQuery === i ? "rgba(58,125,110,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedQuery === i ? "rgba(58,125,110,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: "rgba(245,240,232,0.75)",
              }}>
              <span className="text-[9px] tracking-[2px] uppercase block mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7ECFC2" }}>{q.kete}</span>
              {q.label}
            </button>
          ))}
        </div>

        <div className="text-center mb-10">
          <button onClick={handleRun} disabled={running}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: running ? "rgba(255,255,255,0.05)" : "rgba(212,168,83,0.12)",
              border: `1px solid ${running ? "rgba(255,255,255,0.1)" : "rgba(212,168,83,0.4)"}`,
              color: running ? "rgba(245,240,232,0.4)" : "#F0D078",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            <Play size={14} /> {running ? "Running..." : "Run query"}
          </button>
        </div>

        {/* Pipeline stages */}
        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isActive = activeStage >= i;
            const stageData = query.stages[i];
            const v = isActive ? VERDICT_STYLES[stageData.verdict as keyof typeof VERDICT_STYLES] : null;

            return (
              <React.Fragment key={stage.name}>
                <motion.div
                  animate={isActive ? { boxShadow: `0 0 30px ${v?.color}15` } : {}}
                  className="rounded-2xl p-5 transition-all duration-500"
                  style={{
                    background: isActive ? v?.bg : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? `${v?.color}30` : "rgba(255,255,255,0.05)"}`,
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: isActive ? `${v?.color}20` : "rgba(255,255,255,0.04)" }}>
                      {isActive && v ? <v.icon size={16} style={{ color: v.color }} /> : (
                        <span className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)" }}>{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: isActive ? "#F5F0E8" : "rgba(245,240,232,0.4)" }}>{stage.name}</span>
                        <span className="text-[11px]" style={{ color: "rgba(245,240,232,0.3)" }}>{stage.fn}</span>
                        {isActive && v && (
                          <span className="text-[9px] tracking-[2px] uppercase px-2 py-0.5 rounded-full" style={{ background: `${v.color}15`, color: v.color, fontFamily: "'JetBrains Mono', monospace" }}>
                            {v.label}
                          </span>
                        )}
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {stageData.explanation}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
                {i < 4 && (
                  <div className="flex justify-center">
                    <div className="w-px h-4" style={{ background: isActive ? `${v?.color}30` : "rgba(255,255,255,0.06)" }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* End state */}
        <AnimatePresence>
          {activeStage >= (query.stages[0].verdict === "block" ? 0 : 4) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl p-6 text-center"
              style={{ background: "rgba(58,125,110,0.06)", border: "1px solid rgba(58,125,110,0.15)" }}>
              <p className="text-[10px] tracking-[3px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7ECFC2" }}>Evidence Pack (Demo)</p>
              <p className="text-xs mb-1" style={{ color: "rgba(245,240,232,0.6)" }}>Pack ID: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>EP-DEMO-{String(selectedQuery + 1).padStart(3, "0")}</span></p>
              <p className="text-xs mb-1" style={{ color: "rgba(245,240,232,0.4)" }}>Timestamp: {timestamp}</p>
              <p className="text-xs" style={{ color: "rgba(245,240,232,0.4)", fontFamily: "'JetBrains Mono', monospace" }}>SHA-256: {hashStub}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DemoBottomNav />
      <BrandFooter />
    </div>
  );
};

export default PipelineDemo;
