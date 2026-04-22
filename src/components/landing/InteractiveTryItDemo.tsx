// ═══════════════════════════════════════════════════════════════
// Interactive 3-step "Try It Live" demo for the homepage hero.
// Step 1 — Pick a kete (industry)
// Step 2 — Watch the agent answer with citations
// Step 3 — See the auto-generated evidence pack appear
// All deterministic, no signup required.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, FileText, Shield, Check, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateAndDownloadEvidencePack } from "@/lib/evidencePackPdf";

const C = {
  teal: "#4AA5A8",
  ochre: "#4AA5A8",
  lavender: "#9B8EC4",
  text: "#3D4250",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  surface: "rgba(255,255,255,0.65)",
};

type Scenario = {
  id: string;
  kete: string;
  reo: string;
  english: string;
  accent: string;
  question: string;
  agentName: string;
  agentRole: string;
  answer: string;
  highlight: string;
  citation: string;
  evidencePack: {
    title: string;
    findings: { label: string; status: "ok" | "warn" }[];
  };
};

const SCENARIOS: Scenario[] = [
  {
    id: "manaaki",
    kete: "manaaki",
    reo: "MANAAKI",
    english: "Hospitality",
    accent: C.teal,
    question: "Do I need a Food Control Plan for my new cafe?",
    agentName: "AURA",
    agentRole: "Food Safety Specialist",
    answer:
      "Yes — under the Food Act 2014, all food businesses in NZ must operate under either a Food Control Plan or a National Programme. A cafe preparing food on-site needs a template Food Control Plan registered with your council.",
    highlight: "Food Act 2014",
    citation: "Food Act 2014, s 37–40 · MPI Template FCP-03",
    evidencePack: {
      title: "Food Control Plan readiness check",
      findings: [
        { label: "FCP template selected (FCP-03)", status: "ok" },
        { label: "Council registration required", status: "warn" },
        { label: "Allergen matrix attached", status: "ok" },
        { label: "Verifier visit scheduled", status: "warn" },
      ],
    },
  },
  {
    id: "waihanga",
    kete: "waihanga",
    reo: "WAIHANGA",
    english: "Construction",
    accent: C.ochre,
    question: "Is this contractor's SWMS compliant before they start on site?",
    agentName: "STRATA",
    agentRole: "Health & Safety Lead",
    answer:
      "Under HSWA 2015 the PCBU must verify a Safe Work Method Statement before high-risk work. This SWMS is missing two controls — fall protection above 3m and a notifiable-work declaration to WorkSafe.",
    highlight: "HSWA 2015",
    citation: "Health and Safety at Work Act 2015 · WorkSafe Notifiable Work Schedule",
    evidencePack: {
      title: "Subcontractor onboarding pack",
      findings: [
        { label: "Insurance certificate current", status: "ok" },
        { label: "Fall-protection control missing", status: "warn" },
        { label: "WorkSafe notification required", status: "warn" },
        { label: "Site induction logged", status: "ok" },
      ],
    },
  },
  {
    id: "auaha",
    kete: "auaha",
    reo: "AUAHA",
    english: "Creative",
    accent: C.lavender,
    question: "Can I make this 'best in NZ' claim in our new ad campaign?",
    agentName: "PRISM",
    agentRole: "Brand & Compliance",
    answer:
      "Under the Fair Trading Act 1986 superlative claims like 'best' must be substantiated. Without a public ranking or independent study you'd risk a misleading-conduct breach. I can rewrite it as a verifiable claim instead.",
    highlight: "Fair Trading Act 1986",
    citation: "Fair Trading Act 1986, s 9 · Commerce Commission guidance",
    evidencePack: {
      title: "Campaign approval pack",
      findings: [
        { label: "Claim substantiation reviewed", status: "warn" },
        { label: "Visual brand consistency", status: "ok" },
        { label: "Suggested rewrite ready", status: "ok" },
        { label: "Platform briefs generated", status: "ok" },
      ],
    },
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function InteractiveTryItDemo() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [reveal, setReveal] = useState(0); // animation tick within step 2
  const [generating, setGenerating] = useState(false);
  const [packResult, setPackResult] = useState<{ watermark: string; filename: string } | null>(null);
  const navigate = useNavigate();

  // step 2 animated reveal — question, then answer, then citation
  useEffect(() => {
    if (step !== 2) {
      setReveal(0);
      return;
    }
    const t1 = setTimeout(() => setReveal(1), 350);
    const t2 = setTimeout(() => setReveal(2), 1700);
    const t3 = setTimeout(() => setReveal(3), 2900);
    const advance = setTimeout(() => setStep(3), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(advance);
    };
  }, [step, scenario?.id]);

  function pick(s: Scenario) {
    setScenario(s);
    setStep(2);
    setPackResult(null);
  }

  function reset() {
    setStep(1);
    setScenario(null);
    setPackResult(null);
  }

  /**
   * Generate the audit-ready evidence pack PDF for this scenario via the
   * canonical pdfBranding pipeline, then route to the on-screen sample
   * viewer. Both artefacts share the same watermark + ASSEMBL- pack ID
   * so the download and the web view are provably the same evidence pack.
   */
  async function handleGenerateEvidencePack() {
    if (!scenario || generating) return;
    setGenerating(true);
    try {
      const result = await generateAndDownloadEvidencePack({
        kete: scenario.kete,
        title: `${scenario.evidencePack.title} — Evidence Pack`,
        client: "Assembl Demo",
        summary:
          `Audit-ready evidence pack generated from the homepage demo for the ${scenario.english} kete (${scenario.reo}). ` +
          `Source-cited, watermarked, and signed by ${scenario.agentName}.`,
        sections: [
          {
            agent: scenario.agentName,
            designation: scenario.agentRole,
            title: scenario.evidencePack.title,
            body: `${scenario.question}\n\n${scenario.answer}`,
            status: scenario.evidencePack.findings.some((f) => f.status === "warn") ? "flag" : "pass",
            legislationRef: scenario.citation,
          },
          ...scenario.evidencePack.findings.map((f) => ({
            agent: scenario.agentName,
            designation: scenario.agentRole,
            title: f.label,
            body: f.status === "ok"
              ? "Verified against the cited source. No action required."
              : "Flagged for human review before filing.",
            status: (f.status === "ok" ? "pass" : "flag") as "pass" | "flag",
            legislationRef: scenario.citation,
          })),
        ],
        version: "v1.0",
        simulated: true,
      });
      setPackResult({ watermark: result.watermark, filename: result.filename });
      toast.success("Evidence pack ready", {
        description: `Audit-ready · ${result.watermark}`,
      });
      // Also open the on-screen sample so the user sees the same artefact
      navigate(`/sample/${scenario.id}`);
    } catch (e) {
      toast.error("Couldn't generate the evidence pack", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-[760px] mx-auto">
      {/* progress bar */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {[1, 2, 3].map((n) => {
          const active = step >= (n as 1 | 2 | 3);
          const isCurrent = step === (n as 1 | 2 | 3);
          return (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium"
                  style={{
                    background: active ? scenario?.accent ?? C.teal : "rgba(74,165,168,0.08)",
                    color: active ? "#fff" : C.textTertiary,
                    border: `1px solid ${active ? "transparent" : "rgba(74,165,168,0.18)"}`,
                    boxShadow: isCurrent ? `0 0 0 4px ${(scenario?.accent ?? C.teal) + "20"}` : "none",
                    transition: "all 0.4s ease",
                  }}
                >
                  {step > n ? <Check size={12} /> : n}
                </div>
                <span
                  className="text-[11px] tracking-[2px] uppercase hidden sm:inline"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: active ? C.text : C.textTertiary }}
                >
                  {n === 1 ? "Pick" : n === 2 ? "Run" : "Evidence"}
                </span>
              </div>
              {n < 3 && (
                <div
                  className="h-px w-8 sm:w-16"
                  style={{
                    background: step > n ? scenario?.accent ?? C.teal : "rgba(74,165,168,0.15)",
                    transition: "background 0.4s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: C.surface,
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(74,165,168,0.15)",
          boxShadow: "0 20px 60px -20px rgba(74,165,168,0.18), 0 4px 16px -4px rgba(0,0,0,0.04)",
          minHeight: 360,
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-8"
            >
              <p
                className="text-[10px] tracking-[3px] uppercase mb-3 text-center"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}
              >
                Step 1 · Choose your industry
              </p>
              <h3 className="text-[20px] sm:text-[26px] font-light text-center mb-8" style={{ color: C.text }}>
                Pick a kete to see a live agent run
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCENARIOS.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease }}
                    onClick={() => pick(s)}
                    className="group p-5 rounded-2xl text-left transition-all hover:-translate-y-1"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: `1px solid ${s.accent}22`,
                      boxShadow: `0 6px 20px -10px ${s.accent}25`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                      style={{ background: `${s.accent}15` }}
                    >
                      <Sparkles size={16} style={{ color: s.accent }} />
                    </div>
                    <p
                      className="text-[10px] tracking-[2px] uppercase mb-1"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: s.accent }}
                    >
                      {s.reo}
                    </p>
                    <p className="text-[14px] font-medium mb-2" style={{ color: C.text }}>
                      {s.english}
                    </p>
                    <p className="text-[12px] leading-[1.5]" style={{ color: C.textSecondary }}>
                      "{s.question}"
                    </p>
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium opacity-70 group-hover:opacity-100"
                      style={{ color: s.accent }}
                    >
                      Run this <ArrowRight size={11} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && scenario && (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8"
            >
              {/* Agent header */}
              <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: "1px solid rgba(74,165,168,0.08)" }}>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: `${scenario.accent}12` }}
                >
                  <Bot size={18} style={{ color: scenario.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] tracking-[3px] uppercase font-medium" style={{ color: C.text }}>
                    {scenario.agentName}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: C.textTertiary }}>
                    {scenario.english} · {scenario.agentRole}
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: `${scenario.accent}10`, border: `1px solid ${scenario.accent}20` }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: scenario.accent }}
                  />
                  <span
                    className="text-[9px] tracking-[2px] uppercase"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: scenario.accent }}
                  >
                    Thinking
                  </span>
                </div>
              </div>

              {/* User question */}
              {reveal >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-end mb-5"
                >
                  <div
                    className="rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]"
                    style={{ background: `${scenario.accent}10`, border: `1px solid ${scenario.accent}18` }}
                  >
                    <p className="text-[14px] leading-[1.6]" style={{ color: C.text }}>
                      {scenario.question}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Agent answer */}
              {reveal >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-3 mb-3 max-w-[88%]"
                >
                  <div
                    className="w-8 h-8 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                    style={{ background: `${scenario.accent}12` }}
                  >
                    <Bot size={13} style={{ color: scenario.accent }} />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-md px-4 py-3"
                    style={{ background: "rgba(155,142,196,0.10)" }}
                  >
                    <p className="text-[14px] leading-[1.7]" style={{ color: C.text }}>
                      {scenario.answer.split(scenario.highlight).map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span style={{ color: scenario.accent, fontWeight: 500 }}>{scenario.highlight}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Citation */}
              {reveal >= 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pl-11 text-[10px]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: C.textTertiary }}
                >
                  📎 {scenario.citation}
                </motion.p>
              )}

              {reveal < 3 && (
                <div className="flex items-center gap-1.5 pl-11 mt-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: scenario.accent }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && scenario && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8"
            >
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${scenario.accent}12` }}
                >
                  <FileText size={18} style={{ color: scenario.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] tracking-[3px] uppercase mb-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace", color: scenario.accent }}
                  >
                    Step 3 · Evidence pack generated
                  </p>
                  <h4 className="text-[18px] font-medium" style={{ color: C.text }}>
                    {scenario.evidencePack.title}
                  </h4>
                  <p className="text-[11px] mt-0.5" style={{ color: C.textTertiary }}>
                    Signed by {scenario.agentName} · {new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {scenario.evidencePack.findings.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: f.status === "ok" ? `${C.teal}15` : `${C.ochre}15`,
                      }}
                    >
                      {f.status === "ok" ? (
                        <Check size={12} style={{ color: C.teal }} />
                      ) : (
                        <Shield size={12} style={{ color: C.ochre }} />
                      )}
                    </div>
                    <p className="text-[13px] flex-1" style={{ color: C.text }}>
                      {f.label}
                    </p>
                    <span
                      className="text-[10px] tracking-[2px] uppercase"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: f.status === "ok" ? C.teal : C.ochre,
                      }}
                    >
                      {f.status === "ok" ? "PASS" : "REVIEW"}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 rounded-2xl"
                style={{ background: `${scenario.accent}08`, border: `1px solid ${scenario.accent}20` }}
              >
                <div className="flex items-center gap-2 text-[12px]" style={{ color: C.textSecondary }}>
                  <Shield size={13} style={{ color: scenario.accent }} />
                  {packResult ? (
                    <span>
                      Audit-ready evidence pack saved · <span style={{ fontFamily: "'JetBrains Mono', monospace", color: scenario.accent }}>{packResult.watermark}</span>
                    </span>
                  ) : (
                    <span>Watermarked, source-cited, audit-trail logged — ready to file with your auditor.</span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      color: C.textSecondary,
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <RotateCcw size={11} /> Try another
                  </button>
                  <button
                    onClick={handleGenerateEvidencePack}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium disabled:opacity-60"
                    style={{ background: scenario.accent, color: "#fff" }}
                  >
                    {generating ? (
                      <>
                        <Loader2 size={11} className="animate-spin" /> Generating evidence pack…
                      </>
                    ) : (
                      <>
                        Download evidence pack <ArrowRight size={11} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
