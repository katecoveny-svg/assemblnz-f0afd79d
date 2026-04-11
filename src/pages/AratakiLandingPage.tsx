import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import aratakiIcon from "@/assets/arataki-kete-car.png";

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
  {
    label: "Customer journey orchestration",
    desc: "Enquiry through to retention. Every stage tracked across sales, service, and F&I — nothing falls between teams.",
  },
  {
    label: "Warranty narrative drafting",
    desc: "Structured technical write-ups built from job card data. Risk-flagged before submission to the distributor.",
  },
  {
    label: "Service loan car allocation",
    desc: "Fleet matched to confirmed bookings. Graceful degradation to courtesy alternatives when capacity is full.",
  },
  {
    label: "Workshop capacity alignment",
    desc: "Bay, technician, parts availability, and loan car status resolved before the customer arrives.",
  },
  {
    label: "Campaign localisation",
    desc: "National OEM brief adapted to each dealer's brand voice. One-click approval, compliant copy guaranteed.",
  },
  {
    label: "Internal communications",
    desc: "Shift handovers, team briefings, distributor updates — consistent tone, appropriate audience, every time.",
  },
];

const COMPLIANCE = [
  "Fair Trading Act 1986 — claims scanned pre-publish",
  "Motor Vehicle Sales Act 2003 — CIN timing enforced",
  "CCCFA 2003 — finance language guardrails active",
  "Privacy Act 2020 · IPP 3A — automated-decision disclosure",
];

export default function AratakiLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Arataki — Automotive Dealership Operations | assembl"
          description="Operational intelligence for NZ motor dealers. Customer journey orchestration, warranty claims, workshop capacity, and compliance — governed, auditable, human-in-the-loop."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          {/* Kete-car icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <img
              src={aratakiIcon}
              alt="Arataki kete — automotive"
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_40px_rgba(58,125,110,0.3)]"
            />
          </motion.div>

          {/* Kete label */}
          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
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
            Every handoff. Tracked.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ dealerships
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
            Arataki connects the stages your teams already run — enquiry, test drive, sale, delivery, service, loyalty — into a single governed workflow. It works alongside your DMS, CRM, and OEM portals. Nothing to rip out.
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
              Book a walk-through <ArrowRight size={16} />
            </Link>
            <Link
              to="/arataki"
              className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              View a sample evidence pack
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
            "What does Arataki cover for dealerships?",
            "How does customer journey tracking work?",
            "Tell me about warranty claim drafting",
            "What compliance is built in?",
          ]}
        />
      </div>
    </GlowPageWrapper>
  );
}
