import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Palette, PenTool, Camera, Mic, BarChart3, Calendar, Globe, Sparkles, Eye } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KnowledgeSourcesStrip from "@/components/knowledge/KnowledgeSourcesStrip";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { AUAHA_USE_CASE } from "@/data/useCases";

const BG = "#FAFBFC";
const ACCENT = "#F0D078";
const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const BONE = "#F5F0E8";
const GOLD = "#D4A843";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Live agent roster — verified against agent_prompts table (pack='auaha', is_active=true)
// 9 active specialists. Order matches the brand → create → distribute → measure flow.
const AGENTS = [
  { code: "PRISM", role: "Brand DNA, visual identity & campaign engine", icon: Sparkles },
  { code: "MUSE", role: "Copywriting & brand voice enforcement", icon: PenTool },
  { code: "PIXEL", role: "Visual design & image generation", icon: Camera },
  { code: "CHROMATIC", role: "Colour systems & style guide", icon: Palette },
  { code: "VERSE", role: "Video scripting & storyboarding", icon: Mic },
  { code: "RHYTHM", role: "Content calendar & scheduling cadence", icon: Globe },
  { code: "FLUX", role: "Social distribution & multi-channel publishing", icon: Globe },
  { code: "ECHO", role: "Review, sentiment & feedback analysis", icon: Eye },
  { code: "MARKET", role: "Campaign analytics & performance", icon: BarChart3 },
];

const DEMO_FLOW = [
  { step: "Brand scan", detail: "Scan your website to extract brand DNA — voice, colours, fonts, and audience", icon: Eye },
  { step: "Brief to draft", detail: "AI-drafted content aligned to your brand voice across all formats", icon: PenTool },
  { step: "Review & approve", detail: "Compliance checks run, brand voice validated, human sign-off required", icon: Check },
  { step: "Publish & track", detail: "Cross-platform publishing with performance analytics in one view", icon: BarChart3 },
];

export default function AuahaLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Auaha — Creative & Media | Assembl"
          description="Strategy, content, brand voice, design, campaigns, analytics — one coordinated studio, not six tools and a freelancer. Built for NZ creative teams."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}10 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${POUNAMU}06 0%, transparent 60%)`,
          }} />

          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: 3 + i * 1.5, height: 3 + i * 1.5,
              background: i % 2 === 0 ? ACCENT : POUNAMU,
              left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.15,
            }} animate={{ y: [0, -20 - i * 5, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }} />
          ))}

          <LandingKeteHero accentColor="#D4A843" accentLight="#E8C76A" model="palette" size={200} />

          <motion.p className="text-[10px] uppercase tracking-[5px] mb-6" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            AUAHA · CREATIVE & MEDIA
          </motion.p>

          <motion.h1 className="text-4xl sm:text-6xl font-display font-light tracking-[0.02em] mb-4 max-w-3xl leading-[1.1]"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <span style={{ background: `linear-gradient(135deg, #3D4250 0%, ${ACCENT} 50%, ${BONE} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto" }}>
              One coordinated studio.
            </span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl font-display font-light tracking-[0.02em] mb-6 max-w-2xl" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={1.5}>
            Nine specialist agents for NZ creative teams
          </motion.p>

          <motion.p className="text-sm sm:text-base max-w-xl mb-8 font-body leading-relaxed" style={{ color: "#6B7280" }} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Strategy, content, brand voice, design, campaigns, lead formation, analytics — coordinated from brief to publish.
          </motion.p>

          <motion.div className="relative rounded-2xl px-7 py-6 max-w-md mb-12 text-left overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(58,125,110,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${POUNAMU}30`, backdropFilter: "blur(20px)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${POUNAMU}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }} variants={fadeUp} initial="hidden" animate="visible" custom={3}
            whileHover={{ scale: 1.02, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 80px ${POUNAMU}12` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${POUNAMU}60 50%, transparent 100%)` }} />
            <p className="text-[10px] uppercase tracking-[3px] mb-4" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              te kete aronui — human expression
            </p>
            <ul className="space-y-3">
              {["No autonomous publishing — every piece reviewed before it goes live", "Brand voice enforced across every format and channel", "Every workflow run ends in a signed evidence pack", "Privacy Act 2020 and IPP 3A alignment built in"].map((item, idx) => (
                <motion.li key={item} className="flex items-start gap-3 text-xs font-body" style={{ color: "#9CA3AF" }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${POUNAMU}20`, boxShadow: `0 0 8px ${POUNAMU}20` }}>
                    <Check size={10} style={{ color: POUNAMU_LIGHT }} />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/auaha" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold font-body overflow-hidden" style={{ color: "#3D4250" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${POUNAMU} 0%, #2D6A5E 100%)` }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10">Open Auaha Studio</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="group px-10 py-4 rounded-full text-sm font-medium font-body transition-all duration-300" style={{ color: "#6B7280", border: "1px solid rgba(74,165,168,0.15)", background: "rgba(255,255,255,0.5)" }}>
              <span className="group-hover:text-white/80 transition-colors">Book a creative walk-through</span>
            </Link>
          </motion.div>
        </main>

        {/* ── Real Use Case ── */}
        <KeteUseCaseSection data={AUAHA_USE_CASE} />

        {/* ── Agent Network ── */}
        <section className="relative px-6 pb-24 max-w-5xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${ACCENT}10 0%, transparent 70%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>specialist network</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: "#3D4250" }}>9 agents working together</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <motion.div key={a.code} className="group relative p-5 rounded-xl overflow-hidden cursor-default" style={{
                background: hoveredAgent === i ? `linear-gradient(135deg, rgba(240,208,120,0.18) 0%, rgba(58,125,110,0.08) 100%)` : "rgba(255,255,255,0.7)",
                border: `1px solid ${hoveredAgent === i ? ACCENT + "70" : "rgba(58,125,110,0.15)"}`,
                transition: "all 0.4s ease",
                backdropFilter: "blur(10px)",
                boxShadow: hoveredAgent === i ? `0 8px 32px rgba(58,125,110,0.12), 0 0 40px ${ACCENT}20` : "0 2px 8px rgba(0,0,0,0.04)",
              }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)} onMouseLeave={() => setHoveredAgent(null)}>
                <div className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500" style={{ opacity: hoveredAgent === i ? 1 : 0, background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 50%, transparent 100%)` }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400" style={{
                    background: hoveredAgent === i ? `linear-gradient(135deg, ${ACCENT}40 0%, ${ACCENT}20 100%)` : `${ACCENT}20`,
                    boxShadow: hoveredAgent === i ? `0 0 16px ${ACCENT}30` : "none",
                  }}>
                    <a.icon size={18} style={{ color: GOLD }} />
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: "#3D4250", transition: "color 0.3s" }}>{a.code}</span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#5B6374" }}>{a.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Live Demo Flow ── */}
        <section className="relative px-6 pb-28 max-w-4xl mx-auto">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${ACCENT}06 0%, transparent 60%)` }} />
          <motion.div className="text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-[10px] tracking-[4px] mb-3 uppercase" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>workflow</p>
            <h2 className="text-2xl sm:text-3xl font-display font-light" style={{ color: BONE }}>How it works</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {DEMO_FLOW.map((d, i) => (
              <motion.button key={d.step} onClick={() => setActiveDemo(i)} className="group relative p-5 rounded-xl text-left overflow-hidden" style={{
                background: activeDemo === i ? `linear-gradient(135deg, ${ACCENT}12 0%, rgba(255,255,255,0.03) 100%)` : "rgba(255,255,255,0.02)",
                border: `1px solid ${activeDemo === i ? ACCENT + "40" : "rgba(255,255,255,0.06)"}`,
                boxShadow: activeDemo === i ? `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${ACCENT}06` : "none",
                transition: "all 0.4s ease",
              }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {activeDemo === i && <motion.div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 50%, transparent 100%)` }} layoutId="auaha-demo-accent" />}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300" style={{
                    background: activeDemo === i ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT}CC 100%)` : "rgba(255,255,255,0.06)",
                    boxShadow: activeDemo === i ? `0 0 16px ${ACCENT}30` : "none",
                  }}>
                    <d.icon size={14} style={{ color: activeDemo === i ? BG : "rgba(255,255,255,0.35)" }} />
                  </div>
                  <span className="text-xs font-medium transition-colors duration-300" style={{ color: activeDemo === i ? BONE : "rgba(255,255,255,0.5)" }}>{d.step}</span>
                </div>
                <p className="text-[11px] leading-relaxed transition-colors duration-300" style={{ color: activeDemo === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>{d.detail}</p>
              </motion.button>
            ))}
          </div>

          <motion.div className="relative p-8 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${ACCENT}18`,
            boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${ACCENT}04, inset 0 1px 0 rgba(255,255,255,0.04)`,
          }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${ACCENT}30 50%, transparent 90%)` }} />
            <div className="flex items-center gap-2.5 mb-6">
              <motion.div className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}40` }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT }}>Live preview</span>
            </div>
            {activeDemo === 0 && (
              <motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="ad-0">
                {[
                  { label: "Brand", value: "Kōwhai Café" },
                  { label: "Voice", value: "Warm, down-to-earth, local" },
                  { label: "Palette", value: "#D4A843, #3A7D6E, #1a1a2e" },
                  { label: "Fonts", value: "Canela Display + Inter" },
                  { label: "Audience", value: "Local families, 25–45" },
                  { label: "Channels", value: "Instagram, Facebook, EDM" },
                ].map((f, idx) => (
                  <motion.div key={f.label} className="p-3 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <span className="text-white/25 text-[10px]">{f.label}</span>
                    <p className="text-assembl-text/70 font-mono mt-1">{f.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 1 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="ad-1">
                <div className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
                  <p className="text-[10px] text-gray-400 mb-1">Instagram caption — drafted by MUSE</p>
                  <p className="text-xs text-white/60 italic">"Sunday mornings at Kōwhai. Fresh baking, strong flat whites, and the sun hitting the deck just right. Come find your spot 🌿☕"</p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}>
                  <p className="text-[10px] text-gray-400 mb-1">EDM subject line — drafted by PRISM</p>
                  <p className="text-xs text-white/60 italic">"This week at Kōwhai: New winter menu + live music Friday"</p>
                </div>
              </motion.div>
            )}
            {activeDemo === 2 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="ad-2">
                {[
                  { check: "Brand voice — matches DNA profile", st: "pass" },
                  { check: "Fair Trading Act — no misleading claims", st: "pass" },
                  { check: "Privacy Act — no PII in content", st: "pass" },
                  { check: "Human approval — awaiting sign-off", st: "pending" },
                ].map((c, idx) => (
                  <motion.div key={c.check} className="flex items-center justify-between text-xs p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,165,168,0.15)" }}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}>
                    <span className="text-gray-500">{c.check}</span>
                    <span className={`text-[10px] uppercase font-semibold ${c.st === "pass" ? "text-emerald-400" : "text-amber-400"}`}>{c.st}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
            {activeDemo === 3 && (
              <motion.div className="text-center py-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key="ad-3">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${ACCENT}15`, boxShadow: `0 0 30px ${ACCENT}15` }}>
                  <BarChart3 size={28} style={{ color: ACCENT }} />
                </div>
                <p className="text-sm text-white/70 mb-1">Campaign live across 3 platforms</p>
                <p className="text-[10px] text-white/40">Engagement, reach, and conversion tracked in real-time by MARKET agent</p>
              </motion.div>
            )}
          </motion.div>
        </section>

        

        <section className="relative text-center px-6 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${ACCENT}06 0%, transparent 60%)` }} />
          <motion.div className="relative inline-flex flex-col items-center gap-4 p-10 rounded-2xl overflow-hidden" style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
            border: `1px solid ${POUNAMU}25`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${ACCENT}05`,
          }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />
            <p className="text-sm text-white/60">Ready to coordinate your creative pipeline?</p>
            <Link to="/auaha" className="group relative flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold transition-all overflow-hidden" style={{ color: "#3D4250" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: POUNAMU }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10">Open Auaha Studio</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <TextUsButton keteName="Auaha" accentColor={ACCENT} showWhatsApp={false} />
          </motion.div>
        </section>

        <KnowledgeSourcesStrip keteCode="AUAHA" />
        <BrandFooter />
        <KeteAgentChat
          keteName="Auaha" keteLabel="Creative & Media" accentColor="#F0D078"
          defaultAgentId="prism" packId="auaha"
          starterPrompts={["What does Auaha help with?", "How does the 9-agent creative studio work?", "Tell me about content calendar workflows", "What compliance checks run on my content?"]}
        />
      </div>
    </LightPageShell>
  );
}
