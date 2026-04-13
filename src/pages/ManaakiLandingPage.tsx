import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, Wine, Star, Leaf, Calendar, UtensilsCrossed, Coffee, Users, Thermometer, ClipboardList } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import KeteRaceVideo from "@/components/kete/KeteRaceVideo";

const BG = "#09090F";
const ACCENT = "#D4A843";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const AGENTS = [
  { code: "AURA", role: "Front-of-house & guest intelligence", icon: Star },
  { code: "CELLAR", role: "Alcohol licensing & duty manager compliance", icon: Wine },
  { code: "HACCP", role: "Food safety plans & temperature monitoring", icon: Thermometer },
  { code: "MENU", role: "Kitchen costing, allergens & seasonal planning", icon: UtensilsCrossed },
  { code: "EVENTS", role: "Function coordination & BEO generation", icon: Calendar },
  { code: "ECO", role: "Sustainability reporting & Qualmark prep", icon: Leaf },
  { code: "AROHA", role: "Staff rostering & employment compliance", icon: Users },
  { code: "ECHO", role: "Review sentiment & guest feedback analysis", icon: Coffee },
  { code: "SENTINEL", role: "Health & safety site compliance", icon: Shield },
];

const COMPLIANCE = [
  "Food Act 2014 — food control plans tracked",
  "Sale and Supply of Alcohol Act 2012 — licensing managed",
  "Privacy Act 2020 · IPP 3A — guest data governed",
  "Every workflow produces a signed evidence pack",
];

const DEMO_FLOW = [
  { step: "Add booking", detail: "Guest name, room, dates, dietary requirements, VIP status, and occasion" },
  { step: "Auto-check compliance", detail: "Food safety, allergen matrix, alcohol licensing, and duty manager availability validated" },
  { step: "Generate evidence pack", detail: "Compliance checks documented with legislation references and sign-off trail" },
  { step: "Guest ready", detail: "Personalised briefing generated for front-of-house team" },
];

export default function ManaakiLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Manaaki — Hospitality & Tourism | assembl"
          description="Food safety, alcohol licensing, guest experience, sustainability — hospitality compliance without the paperwork pile-up. Built for NZ operators."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#3A7D6E" accentLight="#7ECFC2" model="wine-glass" size={160} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            MANAAKI · HOSPITALITY & TOURISM
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light tracking-[0.02em] mb-6 max-w-3xl"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Compliance handled. Guests looked after.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Operational intelligence for NZ hospitality
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Food safety plans, alcohol licensing, guest profiles, sustainability reporting, and event coordination — handled, checked, and evidence-packed.
          </motion.p>

          {/* Compliance badge */}
          <motion.div
            className="rounded-2xl px-6 py-5 max-w-md mb-10 text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${POUNAMU}35`, backdropFilter: "blur(16px)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <p className="text-[10px] uppercase tracking-[3px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              governed · human-in-the-loop
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
            <Link to="/manaaki/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Launch Manaaki Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Book a hospitality walk-through
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
            9 specialist agents
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                    <a.icon size={16} style={{ color: ACCENT }} />
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
                  background: activeDemo === i ? `${ACCENT}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeDemo === i ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: activeDemo === i ? ACCENT : "rgba(255,255,255,0.08)", color: activeDemo === i ? BG : "rgba(255,255,255,0.4)" }}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium text-white/70">{d.step}</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{d.detail}</p>
              </motion.button>
            ))}
          </div>

          {/* Demo preview */}
          <motion.div
            className="mt-8 p-6 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20` }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Guest", value: "Sarah Mitchell" },
                  { label: "Room", value: "Suite 4 — Lake View" },
                  { label: "Arrival", value: "18 Apr 2026" },
                  { label: "Dietary", value: "Gluten-free, dairy-free" },
                  { label: "Occasion", value: "Anniversary" },
                  { label: "VIP", value: "Yes — returning guest" },
                ].map(f => (
                  <div key={f.label} className="text-xs"><span className="text-white/30">{f.label}: </span><span className="text-white/70 font-mono">{f.value}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 1 && (
              <div className="space-y-2">
                {["Food Act 2014 — allergen matrix updated ✓", "Alcohol licensing — duty manager confirmed ✓", "Privacy Act — guest consent recorded ✓", "Temperature logs — kitchen compliant ✓"].map(line => (
                  <div key={line} className="flex items-center gap-2 text-xs"><Check size={12} style={{ color: POUNAMU }} /><span className="text-white/60">{line}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 2 && (
              <div className="space-y-2">
                {[
                  { check: "Food control plan — current", st: "pass" },
                  { check: "Allergen matrix — gluten-free confirmed", st: "pass" },
                  { check: "DLC licence — valid until 2027", st: "pass" },
                  { check: "Duty manager — rostered for arrival", st: "pass" },
                ].map(c => (
                  <div key={c.check} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{c.check}</span>
                    <span className="text-emerald-400 text-[10px] uppercase">{c.st}</span>
                  </div>
                ))}
              </div>
            )}
            {activeDemo === 3 && (
              <div className="text-center py-4">
                <Star size={32} style={{ color: ACCENT }} className="mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-1">Guest briefing ready</p>
                <p className="text-[10px] text-white/40">Anniversary stay · GF/DF menu prepared · Lake View suite confirmed · Welcome amenity scheduled</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Race Video ── */}
        <KeteRaceVideo slug="manaaki" keteName="Manaaki" accentColor={ACCENT} />

        {/* ── CTA ── */}
        <section className="text-center px-6 pb-24">
          <motion.div
            className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}25` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-sm text-white/60">Ready to streamline your hospitality operations?</p>
            <Link to="/manaaki/dashboard" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Manaaki Dashboard <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Manaaki" keteLabel="Hospitality & Tourism" accentColor="#D4A843"
          defaultAgentId="aura" packId="manaaki"
          starterPrompts={["What does Manaaki cover for hospitality?", "How does food safety compliance work?", "Tell me about alcohol licensing support", "What evidence packs do I get?"]}
        />
      </div>
    </GlowPageWrapper>
  );
}
