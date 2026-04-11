import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const BG = "#09090F";
const ACCENT = "#7ECFC2";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const COMPLIANCE = [
  "Customs and Excise Act 2018 — declarations validated",
  "MPI biosecurity standards — clearance tracked",
  "Dangerous Goods Act — classification enforced",
  "Privacy Act 2020 · IPP 3A — importer data governed",
];

export default function PikauLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Pikau — Freight & Customs | assembl"
          description="Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble. Built for NZ importers and logistics teams."
        />
        <BrandNav />

        <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#7ECFC2" accentLight="#A8E6DA" model="container" size={160} />

          {/* Kete label */}
          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            PIKAU · FREIGHT & CUSTOMS
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Border compliance. Sorted.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ freight and customs
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            HS code validation, incoterm handling, landed cost analysis, and broker hand-off — packed, checked, and ready to clear. Pikau works alongside your existing freight systems from day one.
          </motion.p>

          {/* Compliance badge */}
          <motion.div
            className="rounded-2xl px-6 py-5 max-w-md mb-10 text-left"
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
            <p
              className="text-[10px] uppercase tracking-[3px] mb-3"
              style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            >
              governed · human-in-the-loop
            </p>
            <ul className="space-y-2.5">
              {COMPLIANCE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-xs font-body"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <Link
              to="/contact"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90"
              style={{ background: POUNAMU, color: "#fff" }}
            >
              Book a freight walk-through <ArrowRight size={16} />
            </Link>
            <Link
              to="/pikau"
              className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              View a sample evidence pack
            </Link>
          </motion.div>
        </main>

        <BrandFooter />
        <KeteAgentChat
          keteName="Pikau"
          keteLabel="Freight & Customs"
          accentColor="#7ECFC2"
          defaultAgentId="gateway"
          packId="pikau"
          starterPrompts={[
            "What does Pikau cover for freight teams?",
            "How does customs declaration support work?",
            "Tell me about HS code validation",
            "What evidence packs do I get for shipments?",
          ]}
        />
      </div>
    </GlowPageWrapper>
  );
}
