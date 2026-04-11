import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Car, ArrowRight, Check, Wrench, Users, Calendar, FileText } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

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

const WORKFLOWS = [
  { icon: Users, label: "Customer journey orchestrator", desc: "Enquiry → test drive → sale → delivery → service → loyalty. No handoff dropped." },
  { icon: FileText, label: "Warranty claim drafter", desc: "Technical narratives that get approved first time. Flags risk before submission." },
  { icon: Car, label: "Service loan car allocator", desc: "Matches loan cars to bookings, degrades gracefully to courtesy rides when the fleet's out." },
  { icon: Wrench, label: "Workshop capacity co-pilot", desc: "Bay + tech + parts + loan car aligned before the customer arrives." },
  { icon: Calendar, label: "Campaign speed engine", desc: "National brief lands, localised pack drafted in every brand voice, ready for one-click approval." },
  { icon: Users, label: "Internal comms co-pilot", desc: "Shift handovers, team updates, distributor briefings — drafted in the right voice for the right audience." },
];

export default function AratakiLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Arataki — Automotive Dealership AI | Assembl"
          description="Customer journey orchestration, warranty claims, loan car allocation, workshop booking — the dealership back office handled. Built for NZ motor dealers."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#E8E8E8" accentLight="#D8D8D8" model="car" size={160} />

          <motion.p
            className="text-xs uppercase tracking-[5px] mb-4"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            ARATAKI · AUTOMOTIVE
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-6 max-w-3xl"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            The baton around the dealership relay race — so no handoff gets dropped.
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg max-w-xl mb-4"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Enquiry → test drive → sale → delivery → service → loyalty. Arataki works alongside your existing DMS, CRM, and OEM portals from day one. No rip and replace.
          </motion.p>

          {/* Compliance badge */}
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
              11 workflows · human-in-the-loop
            </p>
            <ul className="space-y-2">
              {[
                "Fair Trading Act 1986 — every claim scanned",
                "Motor Vehicle Sales Act 2003 — CIN timing enforced",
                "CCCFA 2003 — finance language guardrails",
                "Privacy Act 2020 · IPP 3A — automated-decision notices",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
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
              Open Arataki dashboard <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book a dealership walk-through
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
                <item.icon size={20} style={{ color: POUNAMU }} className="mb-3" />
                <h3 className="text-sm font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>{item.label}</h3>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.desc}</p>
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
