import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, Check, FileText, Lock, Eye } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

const BG = "#09090F";
const ACCENT = "#E8E8E8";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const PACK_CONTENTS = [
  { icon: Lock, label: "Consent notices", desc: "Pre-drafted, sector-specific, IPP 3A compliant" },
  { icon: Eye, label: "Audit log", desc: "Every decision timestamped, every source cited" },
  { icon: FileText, label: "Subject access pack", desc: "Ready to send within the 20-day window" },
  { icon: Shield, label: "Breach notification", desc: "Template, timeline, and regulator contact" },
];

export default function AratakiLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Arataki — Business Compliance | Assembl"
          description="The IPP3A-ready privacy pack your board and the Privacy Commissioner will both recognise. Built for NZ businesses."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: `${POUNAMU}20`, border: `1px solid ${POUNAMU}40` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Shield size={36} style={{ color: ACCENT }} />
          </motion.div>

          <motion.p
            className="text-xs uppercase tracking-[5px] mb-4"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            ARATAKI · LEAD KETE FOR LAUNCH
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-6 max-w-3xl"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            The IPP3A-ready privacy pack your board and the Privacy Commissioner will both recognise.
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg max-w-xl mb-4"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Business compliance, done by agents. Every run ends in a signed evidence pack — structured, sourced, and ready for your Privacy Officer to file.
          </motion.p>

          {/* IPP 3A badge */}
          <motion.div
            className="rounded-xl px-6 py-4 max-w-md mb-10 text-left"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${POUNAMU}35`,
              backdropFilter: "blur(16px)",
            }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <p className="text-[10px] uppercase tracking-[3px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              Privacy Act 2020 · IPP 3A · 1 May 2026
            </p>
            <ul className="space-y-2">
              {PACK_CONTENTS.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span><strong style={{ color: "#fff" }}>{item.label}</strong> — {item.desc}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <Link
              to="/sample/arataki"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: POUNAMU, color: "#fff" }}
            >
              See the ARATAKI pack <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book an IPP3A walk-through
            </Link>
          </motion.div>

          {/* Pack contents grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-20 max-w-3xl w-full"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            {PACK_CONTENTS.map((item, i) => (
              <LiquidGlassCard key={item.label} className="p-6 text-left" accentColor={POUNAMU} delay={i * 0.1}>
                <item.icon size={20} style={{ color: POUNAMU }} className="mb-3" />
                <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>{item.label}</h3>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.desc}</p>
              </LiquidGlassCard>
            ))}
          </motion.div>
        </main>

        <BrandFooter />
      </div>
    </GlowPageWrapper>
  );
}
