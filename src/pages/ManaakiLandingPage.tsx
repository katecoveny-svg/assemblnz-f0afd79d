import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Wine, Star, Leaf, Calendar, UtensilsCrossed, Coffee, Users, Thermometer, ClipboardList, Sparkles } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import KeteSwitcherPill from "@/components/kete/KeteSwitcherPill";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import UseCaseToggle from "@/components/kete/UseCaseToggle";

import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { MANAAKI_USE_CASE } from "@/data/useCases";

const BG = "#FAFBFC";
const ACCENT = "#4AA5A8";
const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const BONE = "#F5F0E8";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Live roster — verified against agent_prompts (pack='manaaki', is_active=true).
// 10 active specialists. Order = guest journey from arrival → service → review.
const AGENTS = [
  { code: "AURA", role: "Front-of-house, guest intelligence & workshop ops", icon: Star },
  { code: "SAFFRON", role: "Kitchen costing, allergens & seasonal menu planning", icon: UtensilsCrossed },
  { code: "CELLAR", role: "Alcohol licensing & duty manager compliance", icon: Wine },
  { code: "LUXE", role: "Premium guest experience & VIP coordination", icon: Sparkles },
  { code: "MOANA", role: "Coastal & marine-side hospitality operations", icon: Leaf },
  { code: "COAST", role: "Beachfront / outdoor service & weather routing", icon: Coffee },
  { code: "KURA", role: "Staff training, te reo greetings & cultural fluency", icon: Users },
  { code: "PAU", role: "Function coordination & banquet event orders", icon: Calendar },
  { code: "SUMMIT", role: "Multi-property reporting & general manager view", icon: ClipboardList },
  { code: "AROHA", role: "Staff rostering & employment compliance", icon: Shield },
];

const COMPLIANCE = [
  "Food Act 2014 — food control plans tracked",
  "Sale and Supply of Alcohol Act 2012 — licensing managed",
  "Privacy Act 2020 · IPP 3A — guest data governed",
  "Every workflow produces a signed evidence pack",
];

const DEMO_FLOW = [
  { step: "Add booking", detail: "Guest name, room, dates, dietary requirements, VIP status, and occasion", icon: ClipboardList },
  { step: "Auto-check compliance", detail: "Food safety, allergen matrix, alcohol licensing, and duty manager availability validated", icon: Shield },
  { step: "Generate evidence pack", detail: "Compliance checks documented with legislation references and sign-off trail", icon: Check },
  { step: "Guest ready", detail: "Personalised briefing generated for front-of-house team", icon: Sparkles },
];

export default function ManaakiLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Manaaki — Hospitality & Tourism | assembl"
          description="Food safety, alcohol licensing, guest experience, sustainability — hospitality compliance without the paperwork pile-up. Built for NZ operators."
        />
        <BrandNav />
        <KeteSwitcherPill activeKete="manaaki" />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${POUNAMU}12 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${ACCENT}08 0%, transparent 60%), radial-gradient(ellipse 50% 30% at 70% 40%, ${POUNAMU}06 0%, transparent 50%)`,
          }} />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 3 + i * 1.5,
                height: 3 + i * 1.5,
                background: i % 2 === 0 ? POUNAMU : ACCENT,
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
                opacity: 0.15,
              }}
              animate={{
                y: [0, -20 - i * 5, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
            />
          ))}

          {/* 3D Hero — larger, more dramatic */}
          <LandingKeteHero accentColor={POUNAMU} accentLight={POUNAMU_LIGHT} model="wine-glass" size={200} />

          <motion.p
            className="text-[10px] tracking-[5px] mb-6"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            Manaaki · Hospitality & Tourism
          </motion.p>

          {/* Hero headline with gradient text */}
          <motion.h1
            className="text-4xl sm:text-6xl font-display font-light tracking-[0.02em] mb-4 max-w-3xl leading-[1.1]"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            <span style={{
              background: `linear-gradient(135deg, #3D4250 0%, ${POUNAMU_LIGHT} 50%, ${BONE} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}>
              Compliance handled.
            </span>
            <br />
            <span style={{
              background: `linear-gradient(135deg, #3D4250 0%, ${ACCENT} 60%, ${BONE} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}>
              Guests looked after.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl font-display font-light tracking-[0.02em] mb-6 max-w-2xl"
            style={{ color: "#6B7280" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={1.5}
          >
            Operational intelligence for NZ hospitality
          </motion.p>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-8 font-body leading-relaxed"
            style={{ color: "#6B7280" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Food safety plans, alcohol licensing, guest profiles, sustainability reporting, and event coordination — handled, checked, and evidence-packed.
          </motion.p>

          {/* Live status strip */}
          <motion.div className="mb-6" variants={fadeUp} initial="hidden" animate="visible" custom={2.5}>
            <LiveStatusStrip pack="manaaki" agentCodes={["aura", "wellness", "creative", "operations", "guardian"]} accent={POUNAMU} />
          </motion.div>

          {/* Compliance — single line */}
          <motion.p
            className="text-xs font-body mb-10 max-w-xl"
            style={{ color: "#5B6374", letterSpacing: "0.02em" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <span style={{ color: POUNAMU, fontWeight: 500 }}>Governed by</span> Food Act 2014, Sale &amp; Supply of Alcohol Act 2012, Privacy Act 2020. Every workflow produces a signed evidence pack.
          </motion.p>

          {/* CTAs — elevated with glow */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link
              to="/manaaki/dashboard"
              className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold font-body transition-all duration-500 overflow-hidden"
              style={{ color: "#3D4250" }}
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 rounded-full" style={{
                background: `linear-gradient(135deg, ${POUNAMU} 0%, #2D6A5E 50%, ${POUNAMU} 100%)`,
                backgroundSize: "200% auto",
              }} />
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                boxShadow: `0 0 30px ${POUNAMU}40, 0 0 60px ${POUNAMU}20`,
              }} />
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
                backgroundSize: "200% 100%",
              }} />
              <span className="relative z-10">Launch Manaaki Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group px-10 py-4 rounded-full text-sm font-medium font-body transition-all duration-300"
              style={{
                color: "#6B7280",
                border: "1px solid rgba(74,165,168,0.15)",
                background: "rgba(255,255,255,0.5)",
              }}
            >
              <span className="group-hover:text-white/80 transition-colors">Book a hospitality walk-through</span>
            </Link>
          </motion.div>
        </main>

        {/* ── Real Use Case (collapsed by default) ── */}
        <UseCaseToggle accent={POUNAMU}>
          <KeteUseCaseSection data={MANAAKI_USE_CASE} />
        </UseCaseToggle>

        {/* ── Agent Network ── */}
        <section className="relative px-6 pb-24 max-w-5xl mx-auto">
          {/* Section ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none" style={{
            background: `radial-gradient(ellipse, ${ACCENT}06 0%, transparent 70%)`,
          }} />

          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
              specialist network
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>
              10 agents working together
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.code}
                className="group relative p-5 rounded-xl overflow-hidden cursor-default"
                style={{
                  background: hoveredAgent === i
                    ? `linear-gradient(135deg, rgba(58,125,110,0.1) 0%, rgba(74,165,168,0.05) 100%)`
                    : `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
                  border: `1px solid ${hoveredAgent === i ? POUNAMU + "40" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.4s ease",
                  boxShadow: hoveredAgent === i ? `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${POUNAMU}08` : "none",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500" style={{
                  opacity: hoveredAgent === i ? 1 : 0,
                  background: `linear-gradient(90deg, transparent 0%, ${POUNAMU}50 50%, transparent 100%)`,
                }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400" style={{
                    background: hoveredAgent === i
                      ? `linear-gradient(135deg, ${ACCENT}25 0%, ${ACCENT}10 100%)`
                      : `${ACCENT}10`,
                    boxShadow: hoveredAgent === i ? `0 0 16px ${ACCENT}15` : "none",
                  }}>
                    <a.icon size={18} style={{ color: ACCENT }} />
                  </div>
                  <span className="text-xs font-mono font-bold" style={{
                    color: hoveredAgent === i ? BONE : "rgba(255,255,255,0.7)",
                    transition: "color 0.3s",
                  }}>{a.code}</span>
                </div>
                <p className="text-[12px] leading-relaxed transition-colors duration-300" style={{
                  color: hoveredAgent === i ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                }}>{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Demo flow removed — replaced by the live KeteAgentChat (bottom-right) */}


        {/* ── CTA ── */}
        <section className="relative text-center px-6 pb-28">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none" style={{
            background: `radial-gradient(ellipse, ${POUNAMU}08 0%, transparent 70%)`,
          }} />
          <motion.div
            className="relative inline-flex flex-col items-center gap-6 p-10 rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(58,125,110,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${POUNAMU}20`,
              boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 60px ${POUNAMU}06`,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{
              background: `linear-gradient(90deg, transparent 0%, ${POUNAMU}40 50%, transparent 100%)`,
            }} />
            <h3 className="text-xl sm:text-2xl font-display font-light" style={{ color: BONE }}>
              Ready to streamline your hospitality?
            </h3>
            <p className="text-sm text-white/40 max-w-md">
              Join NZ operators using assembl to cut compliance admin by 70% while keeping guests and inspectors happy.
            </p>
            <Link
              to="/manaaki/dashboard"
              className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold font-body overflow-hidden"
              style={{ color: "#3D4250" }}
            >
              <div className="absolute inset-0 rounded-full" style={{
                background: `linear-gradient(135deg, ${POUNAMU} 0%, #2D6A5E 100%)`,
              }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                boxShadow: `0 0 30px ${POUNAMU}40, 0 0 60px ${POUNAMU}20`,
              }} />
              <span className="relative z-10">Open Manaaki Dashboard</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <TextUsButton keteName="Manaaki" accentColor={ACCENT} showWhatsApp={true} />
          </motion.div>
        </section>

        
        <BrandFooter />
        <KeteAgentChat
          keteName="Manaaki" keteLabel="Hospitality & Tourism" accentColor="#4AA5A8"
          defaultAgentId="aura" packId="manaaki"
          starterPrompts={["What does Manaaki cover for hospitality?", "How does food safety compliance work?", "Tell me about alcohol licensing support", "What evidence packs do I get?"]}
        />
      </div>
    </LightPageShell>
  );
}
