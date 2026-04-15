import React, { lazy, Suspense, useMemo, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ArrowRight, Check, Shield, Layers, Brain, Eye as EyeIcon, Zap, TestTube, MessageSquare, FileText, Megaphone, Send, Bot, User, Play, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { useReturnVisitor } from "@/hooks/useReturnVisitor";
import ContextBar from "@/components/personalized/ContextBar";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import KeteWeaveVisual from "@/components/KeteWeaveVisual";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import WharikiFoundation from "@/components/whariki/WharikiFoundation";
import { KETE } from "@/data/pricing";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/* ─── Tokens ─── */
const C = {
  bg: "#060C18",
  surface: "#0C1424",
  surfaceLight: "#121E34",
  pounamu: "#3A7D6E",
  pounamuLight: "#7ECFC2",
  pounamuGlow: "#5AADA0",
  gold: "#D4A853",
  goldLight: "#F0D078",
  navy: "#1A3A5C",
  bone: "#F5F0E8",
  white: "#FFFFFF",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08, duration: 0.5, ease },
});

/* ─── Data ─── */
const KETE_COLORS: Record<string, { color: string; accentLight: string; to: string }> = {
  manaaki: { color: C.pounamu, accentLight: C.pounamuLight, to: "/manaaki" },
  waihanga: { color: C.navy, accentLight: "#2A5A8C", to: "/waihanga/about" },
  auaha: { color: C.gold, accentLight: C.goldLight, to: "/auaha/about" },
  arataki: { color: "#C8C8C8", accentLight: "#A8A8A8", to: "/arataki" },
  pikau: { color: C.pounamuGlow, accentLight: "#A8E6DA", to: "/pikau" },
};

const PACKS = [
  ...KETE.map((k) => ({
    reo: k.name, en: k.eng, desc: k.desc,
    ...KETE_COLORS[k.key],
  })),
  { reo: "Toro", en: "Family", desc: "School runs, meal planning, family admin — one less thing to worry about.", color: C.bone, accentLight: "#E8DDD0", to: "/toroa" },
];

const LAYERS_DATA = [
  { name: "Perception", desc: "Reads your real inputs: invoices, emails, sensor data, calendar events.", icon: EyeIcon },
  { name: "Memory", desc: "Separates verified facts from inferred guesses. Keeps a validated knowledge base.", icon: Brain },
  { name: "Reasoning", desc: "Combines pattern recognition with hard compliance rules. Never guesses on legislation.", icon: Layers },
  { name: "Action", desc: "Every action is classified: allowed, needs approval, or forbidden.", icon: Zap },
  { name: "Explanation", desc: "Logs the reason behind every material decision in plain language.", icon: Shield },
  { name: "Simulation", desc: "Tests workflows against realistic scenarios before they touch production.", icon: TestTube },
];

const TRUST_NODES = [
  { name: "Kahu", desc: "Policy layer — what's allowed" },
  { name: "Iho", desc: "Routing — picks the right specialist" },
  { name: "Tā", desc: "Execution — does the work" },
  { name: "Mahara", desc: "Memory — learns and remembers" },
  { name: "Mana", desc: "Assurance — proves it was done right" },
];

const START_HERE = [
  {
    title: "Ask A Live Agent",
    desc: "Open a working agent and ask real business questions.",
    to: "/chat/echo",
    accent: C.pounamuLight,
    icon: MessageSquare,
  },
  {
    title: "Review A Document",
    desc: "Paste a contract or brief and get risks flagged instantly.",
    to: "/waihanga/docs",
    accent: C.gold,
    icon: FileText,
  },
  {
    title: "Make An Ad",
    desc: "Generate campaigns and visuals that look finished.",
    to: "/auaha/ads",
    accent: C.pounamuGlow,
    icon: Megaphone,
  },
  {
    title: "Run The Demo",
    desc: "Show a client what Assembl does in 60 seconds.",
    to: "/demos",
    accent: C.goldLight,
    icon: Play,
  },
];

/* ─── Live Demo Chat Mockup ─── */
const DEMO_MESSAGES = [
  { role: "user" as const, text: "Do I need a food control plan for my cafe?" },
  { role: "agent" as const, text: "Yes — under the Food Act 2014, all food businesses in NZ must operate under either a Food Control Plan (FCP) or a National Programme.", citation: "Food Act 2014, s 37–40", highlight: "Food Act 2014" },
  { role: "agent" as const, text: "A cafe that prepares and serves food on-site typically requires a template Food Control Plan, registered with your local council. I can draft one for you now.", citation: "MPI Template FCP-03", highlight: "template Food Control Plan" },
];

function LiveDemoChatSection() {
  const [showMessages, setShowMessages] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setShowMessages(1), 600));
    timers.push(setTimeout(() => setShowMessages(2), 1800));
    timers.push(setTimeout(() => setShowMessages(3), 3200));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Chat window */}
      <div className="rounded-2xl overflow-hidden" style={{
        background: "linear-gradient(145deg, rgba(18,30,52,0.95) 0%, rgba(10,18,34,0.9) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 0 80px rgba(212,168,83,0.08), 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.2)" }}>
            <Bot size={18} style={{ color: C.gold }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] tracking-[3px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, color: C.white }}>AURA</p>
            <p className="text-[11px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>Hospitality · Food Safety Specialist</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(90,173,160,0.12)", border: "1px solid rgba(90,173,160,0.2)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: C.pounamuGlow, boxShadow: `0 0 8px ${C.pounamuGlow}` }} />
            <span className="text-[9px] tracking-[2px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.pounamuGlow }}>Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 py-6 space-y-5 min-h-[220px]">
          {DEMO_MESSAGES.slice(0, showMessages).map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="rounded-2xl rounded-tr-md px-5 py-3.5" style={{ background: "rgba(212,168,83,0.10)", border: "1px solid rgba(212,168,83,0.15)" }}>
                      <p className="text-[14px] leading-[1.7]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.9)" }}>{msg.text}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <User size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: "rgba(212,168,83,0.12)" }}>
                    <Bot size={13} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <div className="rounded-2xl rounded-tl-md px-5 py-3.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[14px] leading-[1.8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.82)" }}>
                        {msg.text.split(msg.highlight!).map((part, j, arr) => (
                          <React.Fragment key={j}>
                            {part}
                            {j < arr.length - 1 && <span style={{ color: C.gold, fontWeight: 500 }}>{msg.highlight}</span>}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                    <p className="mt-2 px-2 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)" }}>
                      📎 {msg.citation}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {showMessages < 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-2 pl-12">
              <div className="w-2 h-2 rounded-full" style={{ background: C.gold }} />
              <div className="w-2 h-2 rounded-full" style={{ background: C.gold, opacity: 0.6 }} />
              <div className="w-2 h-2 rounded-full" style={{ background: C.gold, opacity: 0.3 }} />
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-6 pb-5">
          <button onClick={() => navigate("/chat/hospitality")} className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 group" style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span className="text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.3)" }}>Ask your own question…</span>
            <Send size={16} style={{ color: C.gold }} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CTA below */}
      <div className="text-center mt-6">
        <Link to="/chat/hospitality" className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase transition-all hover:gap-3" style={{ fontFamily: "'Lato', sans-serif", color: C.gold }}>
          Try it live with your own question <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

/* ═══ PAGE ═══ */
const Index = () => {
  const isMobile = useIsMobile();
  const { profile, isPersonalized } = usePersonalization();
  useReturnVisitor();

  const orderedPacks = useMemo(() => {
    if (!isPersonalized) return PACKS;
    const keteOrder = profile.preferences.keteOrder;
    const SLUG_MAP: Record<string, string> = {
      manaaki: "Manaaki", waihanga: "Waihanga", auaha: "Auaha",
      arataki: "Arataki", pikau: "Pikau", toro: "Toro",
    };
    return [...PACKS].sort((a, b) => {
      const aIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === a.reo)?.[0] as any ?? "");
      const bIdx = keteOrder.indexOf(Object.entries(SLUG_MAP).find(([_, v]) => v === b.reo)?.[0] as any ?? "");
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
  }, [isPersonalized, profile.preferences.keteOrder]);

  return (
    <div className="min-h-screen relative" style={{ background: C.bg, color: C.bone }}>
      <SEO
        title="assembl — Governed workflow tools for NZ businesses"
        description="Specialist operational workflows that reduce admin, surface risk earlier, and keep people in control. Built for NZ."
      />
      <WharikiFoundation />

      <div className="relative z-10">
        <BrandNav />
        <ContextBar />

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Luminous background layers */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse 50% 45% at 50% 45%, rgba(212,168,83,0.12) 0%, transparent 50%),
              radial-gradient(ellipse 70% 60% at 50% 55%, rgba(58,125,110,0.10) 0%, transparent 55%),
              radial-gradient(ellipse 100% 100% at 50% 50%, rgba(6,12,24,0.7) 0%, ${C.bg} 100%)
            `,
          }} />

          {/* Animated glow orbs */}
          <motion.div className="absolute pointer-events-none" style={{ width: 600, height: 600, top: "2%", left: "0%", background: "radial-gradient(circle, rgba(90,173,160,0.14) 0%, transparent 55%)", filter: "blur(100px)" }}
            animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute pointer-events-none" style={{ width: 500, height: 500, bottom: "5%", right: "0%", background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 55%)", filter: "blur(90px)" }}
            animate={{ x: [0, -50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
          {/* Central bright spot */}
          <motion.div className="absolute pointer-events-none" style={{ width: 300, height: 300, top: "42%", left: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 50%)", filter: "blur(40px)" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

          {/* Video layer */}
          <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ opacity: 0.2, mixBlendMode: "screen" }}>
            <source src="/hero-woven-video.mp4" type="video/mp4" />
          </video>

          {/* Edge vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 65% at 50% 50%, transparent 30%, rgba(6,12,24,0.95) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none" style={{ background: `linear-gradient(transparent, ${C.bg})` }} />

          <div className="relative z-10 max-w-3xl">
            {/* Status badge */}
            <motion.div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full mb-14"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(24px)" }}
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: C.pounamuGlow, boxShadow: `0 0 12px ${C.pounamuGlow}` }} />
              <span className="text-[10px] tracking-[3px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.55)" }}>
                Now onboarding NZ businesses
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: isMobile ? "2.5rem" : "4.5rem",
                lineHeight: 1.05,
                letterSpacing: isMobile ? "6px" : "14px",
                textTransform: "uppercase" as const,
                color: C.white,
                textShadow: "0 0 80px rgba(255,255,255,0.15), 0 0 160px rgba(212,168,83,0.10)",
              }}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease }}
            >
              The operating system<br />for NZ business
            </motion.h1>

            {/* Gold accent line */}
            <motion.div className="mx-auto mt-12 mb-12" style={{
              width: 120, height: 2,
              background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              boxShadow: `0 0 40px rgba(212,168,83,0.6), 0 0 80px rgba(212,168,83,0.25)`,
            }} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease }} />

            <motion.p
              className="max-w-[520px] mx-auto text-[16px] sm:text-[18px] leading-[2]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.65)" }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
            >
              Specialist workflows that reduce admin, surface risk earlier, and keep your people in control.
            </motion.p>

            {/* CTA buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-5 mt-16 justify-center"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease }}
            >
              <Link to="/how-it-works" className="group inline-flex items-center justify-center gap-3 px-14 py-[18px] text-[11px] font-semibold rounded-full transition-all duration-300 tracking-[3px] uppercase hover:scale-[1.03]"
                style={{
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
                  color: C.bg,
                  boxShadow: `0 4px 40px rgba(212,168,83,0.4), 0 0 80px rgba(212,168,83,0.2)`,
                  fontFamily: "'Lato', sans-serif",
                }}>
                Start here <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link to="/demos" className="group inline-flex items-center justify-center gap-3 px-14 py-[18px] text-[11px] font-medium rounded-full transition-all duration-300 tracking-[3px] uppercase hover:border-white/25"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(20px)",
                  background: "rgba(255,255,255,0.03)",
                  fontFamily: "'Lato', sans-serif",
                }}>
                Run live demo <ArrowRight size={13} className="opacity-50 group-hover:opacity-80 transition-opacity" />
              </Link>
            </motion.div>

            <motion.p className="mt-24 text-[9px] tracking-[6px] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
            >
              Trusted · Intelligent · Aotearoa
            </motion.p>
          </div>
        </section>

        {/* ═══ LIVE DEMO EMBED — The centrepiece ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-14">
            <SectionEyebrow color={C.gold}>Try it now</SectionEyebrow>
            <SectionH2>See it work. Right now.</SectionH2>
            <SectionP>This is a real agent answering a real compliance question. No signup required.</SectionP>
          </motion.div>
          <motion.div {...fade}>
            <LiveDemoChatSection />
          </motion.div>
        </Sect>

        {/* ═══ START HERE ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.pounamuLight}>What do you need?</SectionEyebrow>
            <SectionH2>Choose the job you need done</SectionH2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {START_HERE.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} {...stagger(i)}>
                  <Link to={item.to} className="group block h-full">
                    <GlowCard className="h-full hover:translate-y-[-8px] transition-all duration-400" accentColor={item.accent}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}20` }}>
                        <Icon size={20} style={{ color: item.accent }} />
                      </div>
                      <h3 className="text-[14px] mb-3 tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.92)" }}>
                        {item.title}
                      </h3>
                      <p className="text-[13px] leading-[1.9] mb-5" style={{ color: "rgba(255,255,255,0.48)" }}>
                        {item.desc}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[11px] font-medium group-hover:gap-3 transition-all" style={{ color: item.accent }}>
                        Open now <ArrowRight size={11} />
                      </span>
                    </GlowCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ WHAT WE DO ═══ */}
        <Sect>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div {...fade}>
              <GlowCard>
                <p className="text-[10px] tracking-[4px] uppercase mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>
                  — What we do —
                </p>
                <p className="text-[18px] leading-[2] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.85)" }}>
                  Assembl creates New Zealand business specialist operational workflows that reduce admin, surface risk earlier, and keep people in control.
                </p>
                <div className="h-px my-6" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.25), transparent)" }} />
                <p className="text-[15px] leading-[1.9]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>
                  We help teams act faster with better information — not replace the people who know the work best.
                </p>
              </GlowCard>
            </motion.div>

            <motion.div {...fade}>
              <GlowCard className="text-center py-12">
                <p className="text-[10px] tracking-[4px] uppercase mb-8" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.4)" }}>
                  Industry kete
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {PACKS.map((p) => (
                    <Link to={p.to} key={p.reo} className="text-[9px] tracking-[2px] uppercase px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "rgba(255,255,255,0.75)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                      }}>
                      <span style={{ color: p.color }}>{p.reo}</span> <span style={{ opacity: 0.4 }}>/ {p.en}</span>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.1), ${C.gold}80)` }} />
                  <div className="w-6 h-6 rounded-full mt-2" style={{
                    background: `radial-gradient(circle, ${C.goldLight} 0%, ${C.gold} 100%)`,
                    boxShadow: `0 0 30px ${C.gold}50, 0 0 60px ${C.gold}25`,
                  }} />
                  <p className="mt-3 text-[9px] tracking-[4px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>
                    Iho Router
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </Sect>

        {/* ═══ INDUSTRY KETE ═══ */}
        <Sect id="industry-packs">
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.pounamuGlow}>Your industry</SectionEyebrow>
            <SectionH2>Sector-specific workflow packs</SectionH2>
          </motion.div>
          <LayoutGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {orderedPacks.map((p, i) => {
                const isDetected = isPersonalized && i === 0;
                return (
                  <motion.div key={p.reo} layout layoutId={`kete-${p.reo}`} {...stagger(i)}>
                    <Link to={p.to} className="group block h-full">
                      <GlowCard className="h-full hover:translate-y-[-8px] transition-all duration-400" accentColor={p.color}>
                        {isDetected && (
                          <span className="text-[9px] px-3 py-1 rounded-full tracking-[2px] uppercase inline-block mb-4"
                            style={{ background: `${C.gold}15`, color: C.gold, border: `1px solid ${C.gold}30`, fontFamily: "'JetBrains Mono', monospace" }}>
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center gap-4 mb-5">
                          <Suspense fallback={<KeteWeaveVisual size={40} accentColor={p.color} accentLight={p.accentLight} showNodes={false} showGlow={false} />}>
                            <Kete3DModel accentColor={p.color} accentLight={p.accentLight} size={48} />
                          </Suspense>
                          <div>
                            <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.2rem", letterSpacing: "5px", textTransform: "uppercase", color: C.white }}>{p.reo}</h3>
                            <p className="text-[11px] tracking-[2px] uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.en}</p>
                          </div>
                        </div>
                        <p className="text-[14px] leading-[1.8] mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>{p.desc}</p>
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium group-hover:gap-3 transition-all" style={{ color: p.color }}>
                          Explore <ArrowRight size={12} />
                        </span>
                      </GlowCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </Sect>

        {/* ═══ HOW IT WORKS — 6 layers ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.gold}>How assembl works</SectionEyebrow>
            <SectionH2>Six layers of governed intelligence</SectionH2>
            <SectionP>Every decision checked, every action logged, every output something you can file.</SectionP>
          </motion.div>
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
            {LAYERS_DATA.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <motion.div key={layer.name} {...stagger(i)}>
                  <GlowCard className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <Icon size={18} style={{ color: i % 2 === 0 ? C.pounamuLight : C.goldLight }} />
                      </div>
                      <div>
                        <p className="text-[13px] mb-1 tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.88)" }}>
                          <span className="text-[10px] mr-2" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>{String(i + 1).padStart(2, "0")}</span>
                          {layer.name}
                        </p>
                        <p className="text-[12px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.45)" }}>{layer.desc}</p>
                      </div>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        </Sect>

        {/* ═══ EVIDENCE PACKS ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.gold}>Evidence packs</SectionEyebrow>
            <SectionH2>Every workflow ends in a pack you can file</SectionH2>
            <SectionP>Not a chatbot response. A structured document your auditor, bank, or regulator can trust.</SectionP>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                kete: "Manaaki", title: "Monthly Food Safety Report", date: "March 2026",
                checks: [
                  { label: "Food Control Plan verification", ref: "FCP-2024", pass: true },
                  { label: "Temperature log compliance", ref: "TMP-047", pass: true },
                  { label: "Staff certification check", ref: "CERT-12", pass: true },
                ],
              },
              {
                kete: "Waihanga", title: "Site Safety Evidence Pack", date: "March 2026",
                checks: [
                  { label: "H&S site briefing log", ref: "HSB-091", pass: true },
                  { label: "Payment claim schedule verified", ref: "PCS-004", pass: true },
                ],
              },
              {
                kete: "Arataki", title: "Vehicle Compliance Pack", date: "March 2026",
                checks: [
                  { label: "WoF/CoF status verified", ref: "VCC-12", pass: true },
                  { label: "Workshop service log", ref: "WSL-033", pass: true },
                ],
              },
            ].map((pack, i) => (
              <motion.div key={pack.kete} {...stagger(i)}>
                <GlowCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.gold, boxShadow: `0 0 12px ${C.gold}60` }} />
                    <p className="text-[9px] tracking-[3px] uppercase" style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>Evidence Pack</p>
                  </div>
                  <h3 className="text-[15px] mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.88)" }}>{pack.title}</h3>
                  <p className="text-[10px] tracking-[2px] uppercase mb-5" style={{ color: C.pounamuGlow, fontFamily: "'JetBrains Mono', monospace" }}>{pack.kete} · {pack.date}</p>
                  <div className="space-y-2.5">
                    {pack.checks.map((c) => (
                      <div key={c.ref} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.pounamuGlow}20` }}>
                          <Check size={11} style={{ color: C.pounamuLight }} />
                        </div>
                        <span className="text-[12px] flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>{c.label}</span>
                        <span className="text-[9px] tracking-wider" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{c.ref}</span>
                      </div>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </Sect>

        {/* ═══ TRUST PIPELINE ═══ */}
        <Sect>
          <motion.div {...fade} className="text-center mb-16">
            <SectionEyebrow color={C.pounamuGlow}>Trust</SectionEyebrow>
            <SectionH2>Governed from the ground up</SectionH2>
            <SectionP>Five stages of oversight from policy to proof.</SectionP>
          </motion.div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 max-w-4xl mx-auto">
            {TRUST_NODES.map((node, i) => (
              <React.Fragment key={node.name}>
                <motion.div {...stagger(i)} className="flex flex-col items-center text-center min-w-[110px]">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: `0 0 24px ${C.pounamuGlow}15` }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: C.pounamuGlow, boxShadow: `0 0 16px ${C.pounamuGlow}70` }} />
                  </div>
                  <span className="text-[10px] tracking-[3px] uppercase font-bold" style={{ color: C.pounamuLight, fontFamily: "'JetBrains Mono', monospace" }}>{node.name}</span>
                  <span className="text-[10px] mt-2 max-w-[130px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.4)" }}>{node.desc}</span>
                </motion.div>
                {i < TRUST_NODES.length - 1 && (
                  <div className="hidden sm:block w-10 h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.pounamuGlow}40, transparent)` }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Sect>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative px-6 py-36 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.08) 0%, transparent 60%)`,
          }} />
          <div className="max-w-xl mx-auto relative z-10">
            <motion.div {...fade}>
              <GlowCard className="p-12 sm:p-16 text-center">
                <SectionH2>Ready to see your industry team?</SectionH2>
                <SectionP className="mb-12">Pick your kete. Run the demo. See the evidence pack it produces.</SectionP>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-12 py-4 text-[11px] tracking-[2px] uppercase font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
                    style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.bg, boxShadow: `0 4px 40px rgba(212,168,83,0.4), 0 0 80px rgba(212,168,83,0.2)`, fontFamily: "'Lato', sans-serif" }}>
                    See it in action <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-12 py-4 text-[11px] tracking-[2px] uppercase font-medium rounded-full transition-all duration-300 hover:border-white/25"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)", fontFamily: "'Lato', sans-serif" }}>
                    Book a walkthrough
                  </Link>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </section>

        <BrandFooter />
      </div>

      <KeteAgentChat
        keteName="assembl" keteLabel="Platform Concierge" accentColor="#3A7D6E"
        defaultAgentId="echo" packId="assembl"
        starterPrompts={["What industry kete is right for my business?", "How does the onboarding process work?", "What's included in the Operator plan?", "How does assembl handle compliance?"]}
      />
    </div>
  );
};

export default Index;

/* ─── Layout Primitives ─── */

function Sect({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="px-6 py-28 sm:py-36 relative">
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
      <div className="absolute bottom-0 left-[10%] right-[10%] h-px" style={{
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
      }} />
    </section>
  );
}

function SectionEyebrow({ children, color = "#3A7D6E" }: { children: string; color?: string }) {
  return (
    <p className="text-[10px] font-bold tracking-[5px] uppercase mb-5"
      style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
      — {children} —
    </p>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-[36px] lg:text-[42px] mb-6"
      style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px", textTransform: "uppercase", lineHeight: 1.1, color: "rgba(255,255,255,0.94)" }}>
      {children}
    </h2>
  );
}

function SectionP({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[15px] sm:text-[16px] leading-[1.9] max-w-xl mx-auto ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.5)" }}>
      {children}
    </p>
  );
}

/* ─── Glow Card — the premium surface component ─── */
function GlowCard({ children, className = "", accentColor }: { children: React.ReactNode; className?: string; accentColor?: string }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden p-7 ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(18,30,52,0.95) 0%, rgba(10,18,34,0.85) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: `0 0 1px rgba(255,255,255,0.12), 0 12px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)${accentColor ? `, 0 0 40px ${accentColor}08` : ""}`,
      }}
    >
      {/* Top edge highlight */}
      <div className="absolute top-0 left-[8%] right-[8%] h-px" style={{
        background: `linear-gradient(90deg, transparent, ${accentColor ? accentColor + "50" : "rgba(255,255,255,0.15)"}, transparent)`,
      }} />
      {children}
    </div>
  );
}
