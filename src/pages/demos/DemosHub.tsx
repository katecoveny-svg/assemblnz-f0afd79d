import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play, Clock, Shield } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import DemoGlassShell from "@/components/demos/DemoGlassShell";
import PoweredByAssembl from "@/components/demos/PoweredByAssembl";

const C = {
  pounamu: "#3A7D6E",
  pounamuLight: "#4FE4A7",
  gold: "#D4A853",
  goldLight: "#F0D078",
  bone: "#F5F0E8",
};

const DEMOS = [
  {
    title: "Five-stage pipeline",
    path: "/demos/pipeline",
    pitch: "Watch a query flow through Kahu → Iho → Tā → Mahara → Mana, live.",
    proves: "Every output is governed. Nothing bypasses the pipeline.",
    accent: C.pounamu,
    accentLight: C.pounamuLight,
    time: "~60 seconds",
  },
  {
    title: "Evidence pack",
    path: "/demos/evidence-pack",
    pitch: "The signed, sourced pack a customer actually keeps.",
    proves: "We produce audit-grade evidence, not chat replies.",
    accent: C.gold,
    accentLight: C.goldLight,
    time: "~60 seconds",
  },
  {
    title: "Confidence scoring",
    path: "/demos/confidence-scoring",
    pitch: "Hover any claim to see the source it came from.",
    proves: "Every claim is cited. No hallucinations.",
    accent: C.pounamuLight,
    accentLight: C.pounamuLight,
    time: "~60 seconds",
  },
  {
    title: "Kaitiaki gate",
    path: "/demos/kaitiaki-gate",
    pitch: "See how sacred content is hard-blocked and Mead's Five Tests applied.",
    proves: "Tikanga posture, not a compliance label.",
    accent: "#E87461",
    accentLight: "#E87461",
    time: "~60 seconds",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.1, duration: 0.5, ease },
});

const DemosHub = () => {
  const navigate = useNavigate();

  const startTour = () => {
    sessionStorage.setItem("assembl-demo-tour", "1");
    navigate("/demos/pipeline");
  };

  return (
    <DemoGlassShell>
      <SEO title="See Assembl in action — Interactive demos" description="Four short demos. Each one shows what Assembl actually does on real NZ operations — not just what the marketing says." path="/demos" image="/og/demos-hub.png" />
      <BrandNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Intro */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <h1 className="text-2xl sm:text-4xl mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}>
            See Assembl in Action
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.7)" }}>
            Four short demos. Each one shows what Assembl actually does on real NZ operations — not just what the marketing says.
          </p>
        </motion.div>

        {/* Disclaimer — liquid glass */}
        <motion.div className="liquid-glass liquid-glass-gold rounded-xl px-5 py-3 max-w-xl mx-auto mb-14 flex items-start gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <Shield size={16} className="shrink-0 mt-0.5" style={{ color: C.goldLight }} />
          <p className="text-[12px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.6)" }}>
            These demos run with synthetic data. No real customer information is processed. Nothing leaves this page.
          </p>
        </motion.div>

        {/* Tour CTA — premium glass button */}
        <motion.div className="text-center mb-14" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <button onClick={startTour}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-medium transition-all liquid-glass liquid-glass-gold hover:scale-[1.02]"
            style={{ color: C.goldLight, borderColor: "rgba(212,168,83,0.3)" }}>
            <Play size={16} fill={C.goldLight} /> Take the 4-minute tour
          </button>
        </motion.div>

        {/* Demo cards — premium liquid glass grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {DEMOS.map((d, i) => (
            <motion.div key={d.path} {...stagger(i)}>
              <Link to={d.path} className="group block h-full">
                <div className="liquid-glass h-full rounded-2xl p-6 transition-all duration-500 group-hover:translate-y-[-6px]"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                  }}>
                  {/* Accent glow line on hover */}
                  <div className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${d.accent}, transparent)`, boxShadow: `0 0 20px ${d.accent}30` }} />
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: d.accent, boxShadow: `0 0 16px ${d.accent}40` }} />
                    <span className="text-[10px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(245,240,232,0.4)" }}>
                      Demo {i + 1}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "rgba(245,240,232,0.3)" }}>
                      <Clock size={10} /> {d.time}
                    </span>
                  </div>

                  <h3 className="text-[15px] sm:text-[17px] mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(245,240,232,0.9)" }}>
                    {d.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(245,240,232,0.55)" }}>
                    {d.pitch}
                  </p>

                  <div className="rounded-xl px-3 py-2.5 mb-5" style={{ background: `${d.accent}08`, border: `1px solid ${d.accent}15` }}>
                    <p className="text-[11px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: `${d.accentLight}cc` }}>
                      <span className="font-semibold">What this proves:</span> {d.proves}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-[12px] font-medium group-hover:gap-3 transition-all" style={{ color: d.accent }}>
                    Run the demo <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <PoweredByAssembl />
        </div>
      </div>

      <BrandFooter />
    </DemoGlassShell>
  );
};

export default DemosHub;
