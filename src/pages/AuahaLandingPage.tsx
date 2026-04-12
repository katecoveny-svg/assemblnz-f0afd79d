import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Palette, PenTool, Camera, Mic, BarChart3, Calendar, Globe, Sparkles, Eye } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import KeteAgentChat from "@/components/kete/KeteAgentChat";

const BG = "#09090F";
const ACCENT = "#F0D078";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const AGENTS = [
  { code: "RAUTAKI", role: "Brand strategy & positioning", icon: Sparkles },
  { code: "PRISM", role: "Content ideation & brief generation", icon: PenTool },
  { code: "MUSE", role: "Copywriting & brand voice enforcement", icon: Palette },
  { code: "PIXEL", role: "Visual design & image generation", icon: Camera },
  { code: "VERSE", role: "Video scripting & storyboarding", icon: Mic },
  { code: "ECHO", role: "Review & feedback analysis", icon: Eye },
  { code: "FLUX", role: "Social media management & scheduling", icon: Globe },
  { code: "CHROMATIC", role: "Brand identity & style guide", icon: Palette },
  { code: "MARKET", role: "Campaign analytics & performance", icon: BarChart3 },
];

const DEMO_FLOW = [
  { step: "Brand scan", detail: "Scan your website to extract brand DNA — voice, colours, fonts, and audience" },
  { step: "Brief to draft", detail: "AI-drafted content aligned to your brand voice across all formats" },
  { step: "Review & approve", detail: "Compliance checks run, brand voice validated, human sign-off required" },
  { step: "Publish & track", detail: "Cross-platform publishing with performance analytics in one view" },
];

export default function AuahaLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Auaha — Creative & Media | Assembl"
          description="Strategy, content, brand voice, design, campaigns, analytics — one coordinated studio, not six tools and a freelancer. Built for NZ creative teams."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#D4A843" accentLight="#E8C76A" model="palette" size={160} />

          <motion.p
            className="text-[10px] uppercase tracking-[5px] mb-5"
            style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            AUAHA · CREATIVE & MEDIA
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-5xl font-display font-light uppercase tracking-[0.08em] mb-6 max-w-3xl"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            One coordinated studio.
            <span className="block text-lg sm:text-2xl mt-2 normal-case tracking-[0.02em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Nine specialist agents for NZ creative teams
            </span>
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base max-w-xl mb-4 font-body leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Strategy, content, brand voice, design, campaigns, lead formation, analytics — coordinated from brief to publish.
          </motion.p>

          {/* Compliance badge */}
          <motion.div
            className="rounded-2xl px-6 py-5 max-w-md mb-10 text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${POUNAMU}35`, backdropFilter: "blur(16px)" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <p className="text-[10px] uppercase tracking-[3px] mb-3" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              te kete aronui — human expression
            </p>
            <ul className="space-y-2.5">
              {[
                "No autonomous publishing — every piece reviewed before it goes live",
                "Brand voice enforced across every format and channel",
                "Every workflow run ends in a signed evidence pack",
                "Privacy Act 2020 and IPP 3A alignment built in",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: POUNAMU }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTAs */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-4" variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Link to="/auaha/command" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold font-body transition-all duration-300 hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Auaha Studio <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="px-8 py-3 rounded-full text-sm font-medium font-body transition-colors" style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Book a creative walk-through
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
                  { label: "Brand", value: "Kōwhai Café" },
                  { label: "Voice", value: "Warm, down-to-earth, local" },
                  { label: "Palette", value: "#D4A843, #3A7D6E, #1a1a2e" },
                  { label: "Fonts", value: "Canela Display + Inter" },
                  { label: "Audience", value: "Local families, 25–45" },
                  { label: "Channels", value: "Instagram, Facebook, EDM" },
                ].map(f => (
                  <div key={f.label} className="text-xs"><span className="text-white/30">{f.label}: </span><span className="text-white/70 font-mono">{f.value}</span></div>
                ))}
              </div>
            )}
            {activeDemo === 1 && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-white/30 mb-1">Instagram caption — drafted by MUSE</p>
                  <p className="text-xs text-white/60 italic">"Sunday mornings at Kōwhai. Fresh baking, strong flat whites, and the sun hitting the deck just right. Come find your spot 🌿☕"</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-[10px] text-white/30 mb-1">EDM subject line — drafted by PRISM</p>
                  <p className="text-xs text-white/60 italic">"This week at Kōwhai: New winter menu + live music Friday"</p>
                </div>
              </div>
            )}
            {activeDemo === 2 && (
              <div className="space-y-2">
                {[
                  { check: "Brand voice — matches DNA profile", st: "pass" },
                  { check: "Fair Trading Act — no misleading claims", st: "pass" },
                  { check: "Privacy Act — no PII in content", st: "pass" },
                  { check: "Human approval — awaiting sign-off", st: "pending" },
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
                <BarChart3 size={32} style={{ color: ACCENT }} className="mx-auto mb-3" />
                <p className="text-sm text-white/70 mb-1">Campaign live across 3 platforms</p>
                <p className="text-[10px] text-white/40">Engagement, reach, and conversion tracked in real-time by MARKET agent</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center px-6 pb-24">
          <motion.div
            className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${POUNAMU}25` }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <p className="text-sm text-white/60">Ready to coordinate your creative pipeline?</p>
            <Link to="/auaha/command" className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: POUNAMU, color: "#fff" }}>
              Open Auaha Studio <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Auaha" keteLabel="Creative & Media" accentColor="#F0D078"
          defaultAgentId="prism" packId="auaha"
          starterPrompts={["What does Auaha help with?", "How does the 9-agent creative studio work?", "Tell me about content calendar workflows", "What compliance checks run on my content?"]}
        />
      </div>
    </GlowPageWrapper>
  );
}
