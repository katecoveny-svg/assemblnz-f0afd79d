import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, Play } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";
import { DemoBreadcrumb, DemoProvesCard, DemoBottomNav } from "@/components/demos/DemoNavFooter";

const CHECKS = [
  { label: "Scaffolding height compliant (≤5m single, >5m LBP required)", ref: "HSWA-s36", confidence: "high", pass: true },
  { label: "Site induction register exists and is current", ref: "HSB-091", confidence: "high", pass: true },
  { label: "Toolbox talk records for week", ref: "TBT-W14", confidence: "high", pass: true },
  { label: "PPE compliance — hard hat, hi-vis, harness above 3m", ref: "PPE-003", confidence: "high", pass: true },
  { label: "Fall arrest plan for three-storey build", ref: "FAP-012", confidence: "medium", pass: true },
  { label: "Subcontractor pre-qualification check", ref: "SUB-PQ7", confidence: "high", pass: true },
];

const CONFIDENCE = { high: { dot: "", color: "#4FE4A7" }, medium: { dot: "", color: "#A8DDDB" }, low: { dot: "", color: "#E87461" } };

const EvidencePackDemo = () => {
  const [generated, setGenerated] = useState(false);
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ") + " NZST";
  const hash = "b7e4a9c3d1f8...2a6e";

  return (
    <DemoGlassShell>
      <SEO title="Evidence Pack Demo | assembl" description="See what a customer keeps — a structured, watermarked evidence pack with legislative citations and confidence scores." path="/demos/evidence-pack" image="/og/demos-evidence-pack.png" />
      <BrandNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <DemoBreadcrumb title="Evidence pack" />
        <DemoProvesCard slug="evidence-pack" />

        <div className="liquid-glass liquid-glass-gold rounded-xl px-4 py-2 text-center mb-10">
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#A8DDDB" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Evidence Pack
        </h1>
        <p className="text-center text-sm mb-10" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          What a customer actually keeps — structured, sourced, and signed
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: trigger — liquid glass */}
          <div>
            <div className="liquid-glass liquid-glass-pounamu rounded-2xl p-6">
              <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#7ECFC2" }}>Query</p>
              <p className="text-sm mb-6" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(245,240,232,0.7)" }}>
                "Draft a site induction for a new scaffolder on a three-storey residential build."
              </p>
              <button onClick={() => setGenerated(true)} disabled={generated}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all liquid-glass liquid-glass-gold"
                style={{
                  color: generated ? "rgba(245,240,232,0.4)" : "#A8DDDB",
                  borderColor: generated ? "rgba(255,255,255,0.06)" : "rgba(74,165,168,0.3)",
                }}>
                <Play size={14} /> {generated ? "Generated" : "Generate pack"}
              </button>
            </div>
          </div>

          {/* Right: A4 pack preview — premium white glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: generated ? 1 : 0.3 }}
            className="rounded-3xl relative overflow-hidden"
            style={{ 
              background: "linear-gradient(180deg, #FFFFFF 0%, #F8F7F5 100%)", 
              color: "#1a1a1a", 
              minHeight: 600,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="assembl-watermark lowercase">assembl — demo</p>
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{
              background: "linear-gradient(90deg, #3A7D6E, #4AA5A8, #3A7D6E)",
            }} />

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "2px solid #3A7D6E" }}>
                <div>
                  <p className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3A7D6E" }}>Evidence Pack</p>
                  <h2 className="text-lg font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Waihanga Site Safety Pack</h2>
                  <p className="text-xs text-gray-500">Scaffolder Induction — Three-storey Residential</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] tracking-[2px] uppercase px-3 py-1 rounded-full" style={{ background: "rgba(58,125,110,0.1)", color: "#3A7D6E", fontFamily: "'IBM Plex Mono', monospace", border: "1px solid rgba(58,125,110,0.2)" }}>WAIHANGA</span>
                </div>
              </div>

              {/* Checks — glass rows */}
              <div className="space-y-2 mb-6">
                {CHECKS.map((c) => {
                  const conf = CONFIDENCE[c.confidence as keyof typeof CONFIDENCE];
                  return (
                    <div key={c.ref} className="flex items-start gap-3 p-3 rounded-xl" style={{ 
                      background: "rgba(58,125,110,0.04)", 
                      border: "1px solid rgba(58,125,110,0.08)",
                    }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ 
                        background: c.pass ? "rgba(58,125,110,0.12)" : "rgba(232,116,97,0.12)",
                        border: `1px solid ${c.pass ? "rgba(58,125,110,0.2)" : "rgba(232,116,97,0.2)"}`,
                      }}>
                        <Check size={12} style={{ color: c.pass ? "#3A7D6E" : "#E87461" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: "#333" }}>{c.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#999", background: "rgba(0,0,0,0.04)" }}>{c.ref}</span>
                          <span className="text-[9px]" style={{ color: conf.color }}>{conf.dot} {c.confidence}</span>
                        </div>
                      </div>
                      <span className="text-[9px] tracking-[2px] uppercase px-2 py-1 rounded-lg" style={{ 
                        background: c.pass ? "rgba(58,125,110,0.08)" : "rgba(232,116,97,0.08)", 
                        color: c.pass ? "#3A7D6E" : "#E87461", 
                        fontFamily: "'IBM Plex Mono', monospace",
                        border: `1px solid ${c.pass ? "rgba(58,125,110,0.15)" : "rgba(232,116,97,0.15)"}`,
                      }}>
                        {c.pass ? "PASS" : "FLAG"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legislative citations */}
              <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(58,125,110,0.04)", border: "1px solid rgba(58,125,110,0.1)" }}>
                <p className="text-[9px] tracking-[2px] uppercase mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3A7D6E" }}>Legislative Citations</p>
                <p className="text-[11px]" style={{ color: "#555" }}>Health and Safety at Work Act 2015 · s36, s37 · WorkSafe NZ</p>
                <p className="text-[11px]" style={{ color: "#555" }}>NZS 3910:2013 · Conditions of Contract</p>
                <p className="text-[11px]" style={{ color: "#555" }}>Building Act 2004 · s17 Building Work</p>
              </div>

              {/* Hash + sign-off */}
              <div className="pt-4" style={{ borderTop: "1px solid rgba(58,125,110,0.15)" }}>
                <div className="flex justify-between text-[9px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#999" }}>
                  <span>SHA-256: {hash}</span>
                  <span>{timestamp}</span>
                </div>
                <div className="mt-4 p-4 rounded-xl" style={{ border: "1px dashed rgba(58,125,110,0.25)", background: "rgba(58,125,110,0.02)" }}>
                  <p className="text-[9px] tracking-[2px] uppercase mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3A7D6E" }}>Sign-off</p>
                  <p className="text-xs" style={{ color: "#666" }}>Named operator: ___________________________</p>
                  <p className="text-xs mt-1" style={{ color: "#666" }}>Date: _______________</p>
                </div>

                {/* Powered by Assembl */}
                <PoweredByAssembl variant="light" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Download button — glass */}
        {generated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all liquid-glass liquid-glass-pounamu"
              style={{ color: "#7ECFC2", borderColor: "rgba(58,125,110,0.3)" }}
              onClick={() => window.print()}>
              <Download size={14} /> Download PDF (print to PDF)
            </button>
            <p className="text-[10px] mt-2" style={{ color: "rgba(245,240,232,0.3)" }}>Uses your browser's print-to-PDF for this demo</p>
          </motion.div>
        )}
      </div>

      <DemoBottomNav />
      <BrandFooter />
    </DemoGlassShell>
  );
};

export default EvidencePackDemo;
