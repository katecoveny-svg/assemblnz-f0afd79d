import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Play } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#5AADA0";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function TryPage() {
  return (
    <GlowPageWrapper accentColor={POUNAMU}>
      <div className="min-h-screen" style={{ background: "#09090F", color: "#fff" }}>
        <SEO
          title="Try Assembl — See a real evidence pack, then run the simulator"
          description="See a real evidence pack built in front of you, then try the simulator that made it. No login required."
        />
        <BrandNav />

        <main className="max-w-6xl mx-auto px-6 py-24">
          <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <p className="text-[10px] uppercase tracking-[5px] mb-4" style={{ color: POUNAMU_LIGHT, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              TRY ASSEMBL
            </p>
            <h1 className="text-3xl sm:text-5xl mb-4 max-w-3xl mx-auto" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "-0.5px" }}>
              See a real evidence pack built in front of you — then try the simulator that made it.
            </h1>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Pack first, simulator second. No login required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left — Sample pack */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <LiquidGlassCard className="p-8 h-full" accentColor={POUNAMU} glassIntensity="strong">
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={20} style={{ color: POUNAMU }} />
                  <span className="text-[10px] uppercase tracking-[3px]" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    SAMPLE PACK
                  </span>
                </div>
                <h2 className="text-xl mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  A real evidence pack
                </h2>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.7 }}>
                  Signed, sourced, and structured. This is what your auditor, lawyer, or board will read. Pick a kete and see the output.
                </p>
                <div className="space-y-3 mb-8">
                  {["Manaaki — Food safety pack", "Waihanga — Site compliance pack", "Arataki — Privacy pack", "Auaha — Creative rights pack"].map((label) => (
                    <Link
                      key={label}
                      to={`/sample/${label.split(" — ")[0].toLowerCase()}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {label}
                      <ArrowRight size={13} style={{ color: POUNAMU }} />
                    </Link>
                  ))}
                </div>
                <Link
                  to="/sample/manaaki"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
                  style={{ background: POUNAMU, color: "#fff" }}
                >
                  View the sample pack <ArrowRight size={14} />
                </Link>
              </LiquidGlassCard>
            </motion.div>

            {/* Right — Simulator */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <LiquidGlassCard className="p-8 h-full" accentColor={POUNAMU_LIGHT}>
                <div className="flex items-center gap-3 mb-6">
                  <Play size={20} style={{ color: POUNAMU_LIGHT }} />
                  <span className="text-[10px] uppercase tracking-[3px]" style={{ color: POUNAMU_LIGHT, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                    SIMULATOR
                  </span>
                </div>
                <h2 className="text-xl mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
                  Run the simulator
                </h2>
                <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.7 }}>
                  Watch how assembl thinks. The AAAIP simulator runs real policy checks, compliance gates, and governance layers — the same stack that builds the packs above.
                </p>
                <div className="rounded-xl p-6 mb-8" style={{ background: "rgba(90,173,160,0.06)", border: "1px solid rgba(90,173,160,0.15)" }}>
                  <p className="text-xs mb-2" style={{ color: POUNAMU_LIGHT, fontFamily: "'JetBrains Mono', monospace" }}>What the simulator shows:</p>
                  <ul className="space-y-1.5">
                    {["Policy evaluation in real time", "Compliance decisions with rationale", "Human-in-the-loop approval gates", "Audit trail generation"].map((item) => (
                      <li key={item} className="text-xs flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: POUNAMU_LIGHT }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/aaaip"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Run the simulator <Play size={14} />
                </Link>
              </LiquidGlassCard>
            </motion.div>
          </div>
        </main>

        <BrandFooter />
      </div>
    </GlowPageWrapper>
  );
}
