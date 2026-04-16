import React, { useState } from "react";
import { motion } from "framer-motion";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";
import { DemoBreadcrumb, DemoProvesCard, DemoBottomNav } from "@/components/demos/DemoNavFooter";

interface Claim {
  text: string;
  confidence: "high" | "medium" | "low";
  source: string;
  section: string;
  link: string;
  reasoning: string;
  lastVerified: string;
}

const CLAIMS: Claim[] = [
  { text: "Under the Food Act 2014, all food businesses in New Zealand must operate under a food control plan or national programme.", confidence: "high", source: "Food Act 2014", section: "s39", link: "https://legislation.govt.nz/act/public/2014/0032/latest/DLM2995811.html", reasoning: "Direct legislative citation. Mandatory requirement with no ambiguity.", lastVerified: "2026-04-15" },
  { text: "A small café serving food prepared on-site would typically fall under a template food control plan based on the type and risk of food operations.", confidence: "high", source: "Food Act 2014", section: "s40–s44", link: "https://legislation.govt.nz/act/public/2014/0032/latest/DLM2995811.html", reasoning: "MPI guidance confirms template plans for standard food service. Well-established practice.", lastVerified: "2026-04-15" },
  { text: "The plan must cover food safety hazards, critical control points, corrective actions, and record-keeping procedures.", confidence: "high", source: "Food Act 2014", section: "s41", link: "https://legislation.govt.nz/act/public/2014/0032/latest/DLM2995811.html", reasoning: "HACCP-based requirements explicitly stated in legislation.", lastVerified: "2026-04-15" },
  { text: "Food businesses must register with their local council and may be subject to verification by a recognised agency.", confidence: "high", source: "Food Act 2014", section: "s53", link: "https://legislation.govt.nz/act/public/2014/0032/latest/DLM2995811.html", reasoning: "Registration requirement is mandatory. Verification framework well-documented.", lastVerified: "2026-04-15" },
  { text: "Temperature monitoring is a key requirement — hot food must be kept above 60°C and cold food below 5°C.", confidence: "high", source: "MPI Food Safety Guidelines", section: "Temperature Control", link: "https://www.mpi.govt.nz/food-business/food-safety/", reasoning: "Standard MPI guidance. Widely cited in food control plan templates.", lastVerified: "2026-04-15" },
  { text: "Penalties for non-compliance can include fines of up to $500,000 for individuals and $2.5 million for companies in serious cases.", confidence: "medium", source: "Food Act 2014", section: "s233–s237", link: "https://legislation.govt.nz/act/public/2014/0032/latest/DLM2995811.html", reasoning: "Maximum penalties are accurate for serious offences. Typical penalties vary by case — context-dependent.", lastVerified: "2026-04-15" },
];

const SOURCES = [
  "legislation.govt.nz", "MBIE", "IRD", "WorkSafe NZ", "Privacy Commissioner", "Companies Office",
  "RBNZ", "FMA", "Hospitality NZ", "MTA", "Federated Farmers", "Master Builders",
  "Ministry of Education", "Auckland Transport", "DOC", "MetService", "SunSmart NZ",
  "NZ Events", "data.govt.nz", "Stats NZ", "NZLII", "MPI", "NZQA",
  "Te Taura Whiri", "Tenancy Services", "Commerce Commission",
];

const DOT = { high: { emoji: "🟢", color: "#4FE4A7" }, medium: { emoji: "🟡", color: "#F0D078" }, low: { emoji: "🔴", color: "#E87461" } };

const ConfidenceScoringDemo = () => {
  const [hoveredClaim, setHoveredClaim] = useState<number | null>(null);
  const high = CLAIMS.filter(c => c.confidence === "high").length;
  const medium = CLAIMS.filter(c => c.confidence === "medium").length;
  const low = CLAIMS.filter(c => c.confidence === "low").length;

  return (
    <DemoGlassShell>
      <SEO title="Confidence Scoring Demo | assembl" description="See how every claim carries a confidence badge and legislative citation from the anti-hallucination stack." path="/demos/confidence-scoring" image="/og/demos-confidence-scoring.png" />
      <BrandNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <DemoBreadcrumb title="Confidence scoring" />
        <DemoProvesCard slug="confidence-scoring" />

        <div className="liquid-glass liquid-glass-gold rounded-xl px-4 py-2 text-center mb-10">
          <p className="text-[11px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#F0D078" }}>
            Demo mode — no real data leaves this page
          </p>
        </div>

        <h1 className="text-2xl sm:text-4xl mb-2 text-center" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
          Confidence Scoring
        </h1>
        <p className="text-center text-sm mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
          Every substantive claim carries a confidence badge and a legislative citation
        </p>

        {/* Summary — liquid glass */}
        <div className="liquid-glass liquid-glass-pounamu rounded-2xl p-5 mb-8" style={{ borderColor: "rgba(58,125,110,0.2)" }}>
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: "rgba(245,240,232,0.6)" }}>{CLAIMS.length} claims</span>
            <span style={{ color: "#4FE4A7" }}>🟢 {high} high</span>
            <span style={{ color: "#F0D078" }}>🟡 {medium} medium</span>
            <span style={{ color: "#E87461" }}>🔴 {low} low</span>
            <span className="ml-auto" style={{ color: "rgba(245,240,232,0.4)" }}>Last scanner sync: today 05:00 NZST from 26 sources</span>
          </div>
        </div>

        {/* Claims — liquid glass card */}
        <div className="liquid-glass rounded-2xl p-6 mb-8">
          <p className="text-[10px] tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7ECFC2" }}>
            Food Act 2014 — Food control plan requirements for a small café
          </p>
          <div className="space-y-0">
            {CLAIMS.map((claim, i) => {
              const dot = DOT[claim.confidence];
              return (
                <div key={i} className="relative">
                  <span
                    className="inline cursor-help transition-all"
                    onMouseEnter={() => setHoveredClaim(i)}
                    onMouseLeave={() => setHoveredClaim(null)}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "14px",
                      lineHeight: "2",
                      color: "rgba(245,240,232,0.75)",
                      borderBottom: `1px dotted ${dot.color}40`,
                    }}>
                    <span className="mr-1" style={{ fontSize: "10px" }}>{dot.emoji}</span>
                    {claim.text}{" "}
                  </span>
                  {hoveredClaim === i && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 left-0 mt-1 liquid-glass rounded-2xl p-5 w-full max-w-md"
                      style={{ 
                        borderColor: `${dot.color}30`,
                        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${dot.color}08`,
                      }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: dot.color, fontSize: "10px" }}>{dot.emoji}</span>
                        <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: dot.color }}>{claim.confidence} confidence</span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: "rgba(245,240,232,0.5)" }}>
                        <a href={claim.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{claim.source} · {claim.section}</a>
                      </p>
                      <p className="text-xs mb-2" style={{ color: "rgba(245,240,232,0.6)" }}>{claim.reasoning}</p>
                      <p className="text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(245,240,232,0.3)" }}>Last verified: {claim.lastVerified}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sources — glass surface */}
        <div className="liquid-glass rounded-2xl p-5">
          <p className="text-[10px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(245,240,232,0.4)" }}>
            26 verified NZ sources — daily scan at 05:00 NZST
          </p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(s => (
              <span key={s} className="text-[10px] px-3 py-1.5 rounded-lg" style={{ 
                background: "rgba(255,255,255,0.04)", 
                color: "rgba(245,240,232,0.45)", 
                fontFamily: "'JetBrains Mono', monospace",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {s}
              </span>
            ))}
          </div>
          <PoweredByAssembl />
        </div>
      </div>

      <DemoBottomNav />
      <BrandFooter />
    </DemoGlassShell>
  );
};

export default ConfidenceScoringDemo;
