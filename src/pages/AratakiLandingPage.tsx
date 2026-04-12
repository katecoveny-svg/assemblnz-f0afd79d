import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Car, Users, FileText, Shield, Wrench, DollarSign, MessageSquare, Clock, Star, Megaphone, Heart } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteRaceVideo from "@/components/kete/KeteRaceVideo";
import aratakiIcon from "@/assets/arataki-kete-car.png";

const BG = "#09090F";
const ACCENT = "#E8E8E8";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const AGENTS = [
  { code: "CHARTER", role: "Customer enquiry intake & qualification", icon: MessageSquare },
  { code: "ARBITER", role: "Deal structuring & negotiation support", icon: DollarSign },
  { code: "SHIELD", role: "Compliance — MVSA, FTA, CCCFA", icon: Shield },
  { code: "ANCHOR", role: "Delivery coordination & handover", icon: Car },
  { code: "MOTOR", role: "Workshop scheduling & capacity", icon: Wrench },
  { code: "APEX", role: "Warranty narrative drafting", icon: FileText },
  { code: "PILOT", role: "Loan car & fleet management", icon: Clock },
  { code: "ECHO", role: "Customer communications & follow-up", icon: Users },
  { code: "FLUX", role: "Campaign localisation from OEM briefs", icon: Megaphone },
  { code: "AROHA", role: "Staff rostering & HR compliance", icon: Heart },
  { code: "SENTINEL", role: "Site safety & workshop H&S", icon: Star },
];

const COMPLIANCE = [
  "Fair Trading Act 1986 — claims scanned pre-publish",
  "Motor Vehicle Sales Act 2003 — CIN timing enforced",
  "CCCFA 2003 — finance language guardrails active",
  "Privacy Act 2020 · IPP 3A — automated-decision disclosure",
];

const DEMO_FLOW = [
  { step: "Enquiry received", detail: "Customer details captured, vehicle interest logged, test drive booked" },
  { step: "Deal & compliance", detail: "MVSA CIN generated, finance language checked, FTA claims scanned" },
  { step: "Delivery pack", detail: "Handover checklist, warranty registration, and service schedule prepared" },
  { step: "Service & loyalty", detail: "Workshop booking, warranty claim drafting, retention touchpoints" },
];

export default function AratakiLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Arataki — Automotive Dealership Operations | assembl"
          description="Operational intelligence for NZ motor dealers. Customer journey orchestration, warranty claims, workshop capacity, and compliance — governed, auditable, human-in-the-loop."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="flex flex-col items-center px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <img src={aratakiIcon} alt="Arataki kete — automotive" className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_40px_rgba(58,125,110,0.3)]" />
          </motion.div>

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            ARATAKI · AUTOMOTIVE
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Every handoff. Tracked.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ dealerships
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Arataki connects the stages your teams already run — enquiry, test drive, sale, delivery, service, loyalty — into a single governed workflow. Nothing to rip out.
          </motion.p>

          {/* Compliance badge */}
          <motion.div
            className="rounded-2xl px-6 py-5 max-w-md mb-10 text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${POUNAMU}35`, backdropFilter: "blur(16px)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <p className="text-[10px] uppercase tracking-[3px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              11 agents · human-in-the-loop
            </p>
            <ul className="space-y-2.5">
              {COMPLIANCE.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/arataki/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Launch Arataki Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Book a walk-through
            </Link>
          </motion.div>
        </main>

        {/* ── Agent Network ── */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <motion.h2
            className="text-center text-xs uppercase tracking-[4px] mb-10"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            11 specialist agents
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.code}
                className="p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${POUNAMU}15` }}>
                    <a.icon size={16} style={{ color: POUNAMU }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-white/80">{a.code}</span>
                </div>
                <p className="text-[11px] text-white/45 leading-relaxed">{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Live Demo Flow ── */}
        <section className="px-6 pb-24 max-w-4xl mx-auto">
          <motion.h2
            className="text-center text-xs uppercase tracking-[4px] mb-10"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            How it works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {DEMO_FLOW.map((d, i) => (
              <motion.button
                key={d.step}
                onClick={() => setActiveDemo(i)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: activeDemo === i ? `${POUNAMU}18` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeDemo === i ? POUNAMU + "40" : "rgba(255,255,255,0.06)"}`,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: activeDemo === i ? POUNAMU : "rgba(255,255,255,0.08)", color: activeDemo === i ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-white/70">{d.step}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{d.detail}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="mt-8 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}20` }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: POUNAMU }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: POUNAMU }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer", value: "James & Sarah Chen" },
                  { label: "Interest", value: "2026 Toyota RAV4 Hybrid" },
                  { label: "Stage", value: "Test drive booked" },
                  { label: "Source", value: "Website enquiry" },
                  { label: "Trade-in", value: "2019 Honda CR-V" },
                  { label: "Finance", value: "Pre-approved — $42k" },
                ].map(f => (
                  <div key={f.label} className="text-xs"><span className="text-white/30">{f.label}: </span><span className="text-white/70 font-mono">{f.value}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 1 && (
              <div className="space-y-2">
                {["MVSA 2003 — CIN generated within 3 working days ✓", "FTA 1986 — advertised price claims validated ✓", "CCCFA — finance disclosure language checked ✓", "Privacy Act — automated-decision disclosure prepared ✓"].map(line => (
                  <div key={line} className="flex items-center gap-2 text-xs"><Check size={12} style={{ color: POUNAMU }} /><span className="text-white/60">{line}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 2 && (
              <div className="space-y-2">
                {[
                  { check: "Vehicle handover checklist — 14 items", st: "pass" },
                  { check: "Warranty registration — submitted", st: "pass" },
                  { check: "First service scheduled — 10,000km", st: "pass" },
                  { check: "Customer satisfaction survey — queued", st: "pending" },
                ].map(c => (
                  <div key={c.check} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{c.check}</span>
                    <span className={`text-[10px] uppercase ${c.st === "pass" ? "text-emerald-400" : "text-amber-400"}`}>{c.st}</span>
                  </div>
                ))}
              </div>
            )}
            {activeDemo === 3 && (
              <div className="text-center py-4">
                <Wrench size={32} style={{ color: POUNAMU }} className="mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-1">Service loop activated</p>
                <p className="text-[10px] text-white/40">10,000km service reminder · Warranty claim auto-drafted from job card · Loyalty touchpoint at 6 months</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Race Video ── */}
        <KeteRaceVideo slug="arataki" keteName="Arataki" accentColor={ACCENT} />

        {/* ── CTA ── */}
        <section className="text-center px-6 pb-24">
          <motion.div
            className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}25` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-sm text-white/60">Ready to connect your dealership operations?</p>
            <Link to="/arataki/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Arataki Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Arataki" keteLabel="Automotive Dealerships" accentColor="#E8E8E8"
          defaultAgentId="motor" packId="waka"
          starterPrompts={["What does Arataki cover for dealerships?", "How does customer journey tracking work?", "Tell me about warranty claim drafting", "What compliance is built in?"]}
        />
      </div>
    </GlowPageWrapper>
  );
}
