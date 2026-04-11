import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import Kete3DModel from "@/components/kete/Kete3DModel";

const BG = "#09090F";
const ACCENT = "#E8E8E8";
const ACCENT_LIGHT = "#FFFFFF";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const WORKFLOWS = [
  {
    label: "Customer journey orchestrator",
    desc: "Enquiry through to loyalty. Every handoff tracked, nothing dropped between sales, service, and F&I.",
  },
  {
    label: "Warranty claim narrative drafter",
    desc: "Technical write-ups that get approved first time. Risk flagged before submission.",
  },
  {
    label: "Service loan car allocator",
    desc: "Loan cars matched to bookings. Degrades gracefully to courtesy rides when the fleet's committed.",
  },
  {
    label: "Workshop capacity co-pilot",
    desc: "Bay, technician, parts, and loan car aligned before the customer arrives.",
  },
  {
    label: "Campaign localisation engine",
    desc: "National brief lands — localised pack drafted in every dealer's brand voice, one-click approval.",
  },
  {
    label: "Internal comms drafter",
    desc: "Shift handovers, team updates, distributor briefings — right voice, right audience, every time.",
  },
];

const COMPLIANCE = [
  "Fair Trading Act 1986 — every claim scanned",
  "Motor Vehicle Sales Act 2003 — CIN timing enforced",
  "CCCFA 2003 — finance language guardrails",
  "Privacy Act 2020 · IPP 3A — automated-decision notices",
];

export default function AratakiLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Arataki — Automotive Dealership Operations | assembl"
          description="Customer journey orchestration, warranty claims, loan car allocation, workshop booking — the dealership back office handled. Built for NZ motor dealers."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          {/* 3D Kete model */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <Kete3DModel
              accentColor={ACCENT}
              accentLight={ACCENT_LIGHT}
              size={160}
            />
          </motion.div>

          {/* Kete label */}
          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5 font-mono"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            ARATAKI · AUTOMOTIVE
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            The dealership relay race
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              — so no handoff gets dropped
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
            Enquiry → test drive → sale → delivery → service → loyalty.
            Arataki works alongside your existing DMS, CRM, and OEM portals
            from day one. No rip and replace.
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
              className="text-[10px] uppercase tracking-[3px] mb-3 font-mono"
              style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            >
              11 workflows · human-in-the-loop
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
              Book a dealership walk-through <ArrowRight size={16} />
            </Link>
            <Link
              to="/sample/arataki"
              className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              See a sample evidence pack
            </Link>
          </motion.div>

          {/* Workflow grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-20 max-w-3xl w-full"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            {WORKFLOWS.map((item, i) => (
              <LiquidGlassCard key={item.label} className="p-6 text-left" accentColor={POUNAMU} delay={i * 0.1}>
                <h3 className="text-sm font-display font-light uppercase tracking-[0.08em] mb-2">{item.label}</h3>
                <p className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>{item.desc}</p>
              </LiquidGlassCard>
            ))}
          </motion.div>
        </main>

        <BrandFooter />
        <KeteAgentChat
          keteName="Arataki"
          keteLabel="Automotive Dealerships"
          accentColor="#E8E8E8"
          defaultAgentId="motor"
          packId="waka"
          starterPrompts={[
            "What does Arataki help with?",
            "How does the customer relay race work?",
            "Tell me about warranty claim drafting",
            "What compliance is built in for dealerships?",
          ]}
        />
      </div>
    </GlowPageWrapper>
  );
}
