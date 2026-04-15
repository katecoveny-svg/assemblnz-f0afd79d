import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, Play } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { DemoBreadcrumb, DemoProvesCard, DemoBottomNav } from "@/components/demos/DemoNavFooter";

const CHECKS = [
  { label: "Scaffolding height compliant (≤5m single, >5m LBP required)", ref: "HSWA-s36", confidence: "high", pass: true },
  { label: "Site induction register exists and is current", ref: "HSB-091", confidence: "high", pass: true },
  { label: "Toolbox talk records for week", ref: "TBT-W14", confidence: "high", pass: true },
  { label: "PPE compliance — hard hat, hi-vis, harness above 3m", ref: "PPE-003", confidence: "high", pass: true },
  { label: "Fall arrest plan for three-storey build", ref: "FAP-012", confidence: "medium", pass: true },
  { label: "Subcontractor pre-qualification check", ref: "SUB-PQ7", confidence: "high", pass: true },
];

const CONFIDENCE = { high: { dot: "🟢", color: "#4FE4A7" }, medium: { dot: "🟡", color: "#F0D078" }, low: { dot: "🔴", color: "#E87461" } };

const EvidencePackDemo = () => {
  const [generated, setGenerated] = useState(false);
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ") + " NZST";
  const hash = "b7e4a9c3d1f8...2a6e";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0A1628 0%, #0D1E35 50%, #0A1628 100%)", color: "#F5F0E8" }}>
      <SEO title="Evidence Pack Demo | assembl" description="See what a customer keeps — a structured, watermarked evidence pack with legislative citations and confidence scores." path="/demos/evidence-pack" />
      <BrandNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="rounded-xl px-4 py-2 text-center mb-10" style={{ background: "rgba(240,208,120,0.08)", border: "1px solid rgba(240,208,120,0.2)" }}>
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#F0D078" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Evidence Pack
        </h1>
        <p className="text-center text-sm mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          What a customer actually keeps — structured, sourced, and signed
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: trigger */}
          <div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7ECFC2" }}>Query</p>
              <p className="text-sm mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.7)" }}>
                "Draft a site induction for a new scaffolder on a three-storey residential build."
              </p>
              <button onClick={() => setGenerated(true)} disabled={generated}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: generated ? "rgba(255,255,255,0.05)" : "rgba(212,168,83,0.12)",
                  border: `1px solid ${generated ? "rgba(255,255,255,0.1)" : "rgba(212,168,83,0.4)"}`,
                  color: generated ? "rgba(245,240,232,0.4)" : "#F0D078",
                }}>
                <Play size={14} /> {generated ? "Generated" : "Generate pack"}
              </button>
            </div>
          </div>

          {/* Right: A4 pack preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: generated ? 1 : 0.3 }}
            className="rounded-2xl relative overflow-hidden"
            style={{ background: "#FFF", color: "#1a1a1a", minHeight: 600 }}>
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "rotate(-35deg)" }}>
              <p className="text-6xl font-bold tracking-[12px] uppercase select-none" style={{ color: "rgba(58,125,110,0.06)" }}>ASSEMBL — DEMO</p>
            </div>

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "2px solid #3A7D6E" }}>
                <div>
                  <p className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#3A7D6E" }}>Evidence Pack</p>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "'Lato', sans-serif" }}>Waihanga Site Safety Pack</h2>
                  <p className="text-xs text-gray-500">Scaffolder Induction — Three-storey Residential</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full" style={{ background: "rgba(58,125,110,0.1)", color: "#3A7D6E", fontFamily: "'JetBrains Mono', monospace" }}>WAIHANGA</span>
                </div>
              </div>

              {/* Checks */}
              <div className="space-y-3 mb-6">
                {CHECKS.map((c) => {
                  const conf = CONFIDENCE[c.confidence as keyof typeof CONFIDENCE];
                  return (
                    <div key={c.ref} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "#f8f7f5" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.pass ? "rgba(58,125,110,0.15)" : "rgba(232,116,97,0.15)" }}>
                        <Check size={12} style={{ color: c.pass ? "#3A7D6E" : "#E87461" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: "#333" }}>{c.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#999" }}>{c.ref}</span>
                          <span className="text-[9px]" style={{ color: conf.color }}>{conf.dot} {c.confidence}</span>
                        </div>
                      </div>
                      <span className="text-[9px] tracking-[2px] uppercase px-2 py-0.5 rounded" style={{ background: c.pass ? "rgba(58,125,110,0.1)" : "rgba(232,116,97,0.1)", color: c.pass ? "#3A7D6E" : "#E87461", fontFamily: "'JetBrains Mono', monospace" }}>
                        {c.pass ? "PASS" : "FLAG"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legislative citations */}
              <div className="mb-6 p-3 rounded-lg" style={{ background: "#f8f7f5" }}>
                <p className="text-[9px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#999" }}>Legislative Citations</p>
                <p className="text-[11px]" style={{ color: "#555" }}>Health and Safety at Work Act 2015 · s36, s37 · WorkSafe NZ</p>
                <p className="text-[11px]" style={{ color: "#555" }}>NZS 3910:2013 · Conditions of Contract</p>
                <p className="text-[11px]" style={{ color: "#555" }}>Building Act 2004 · s17 Building Work</p>
              </div>

              {/* Hash + sign-off */}
              <div className="pt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
                <div className="flex justify-between text-[9px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#999" }}>
                  <span>SHA-256: {hash}</span>
                  <span>{timestamp}</span>
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{ border: "1px dashed #ccc" }}>
                  <p className="text-[9px] tracking-[2px] uppercase mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#999" }}>Sign-off</p>
                  <p className="text-xs" style={{ color: "#666" }}>Named operator: ___________________________</p>
                  <p className="text-xs mt-1" style={{ color: "#666" }}>Date: _______________</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Download button */}
        {generated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all"
              style={{ background: "rgba(58,125,110,0.12)", border: "1px solid rgba(58,125,110,0.3)", color: "#7ECFC2" }}
              onClick={() => window.print()}>
              <Download size={14} /> Download PDF (print to PDF)
            </button>
            <p className="text-[10px] mt-2" style={{ color: "rgba(245,240,232,0.3)" }}>Uses your browser's print-to-PDF for this demo</p>
          </motion.div>
        )}
      </div>

      <BrandFooter />
    </div>
  );
};

export default EvidencePackDemo;
