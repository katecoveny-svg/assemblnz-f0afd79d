import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Calendar,
  Utensils,
  Stethoscope,
  Wallet,
  Plane,
  Brain,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Users,
  CloudSun,
} from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import HeroBackdropNext from "@/components/next/HeroBackdropNext";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import KeteSwitcherPill from "@/components/kete/KeteSwitcherPill";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import LiveDataTiles, { loadWeather, loadLatestRegChange } from "@/components/kete/LiveDataTiles";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import TextUsButton from "@/components/kete/TextUsButton";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import { TORO_USE_CASE } from "@/data/useCases";

/* ─── Tōro palette — Moonstone Blue (TORO-04 industry accent) ─── */
const ACCENT = "#C7D9E8";       // moonstone blue (locked industry accent)
const ACCENT_DEEP = "#7BA8C9";  // deeper moonstone for primary actions
const POUNAMU = "#3A7D6E";      // brand green (CTA gradient end)
const INK = "#3D4250";          // charcoal text (brand standard)

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* Live agent roster — TŌRO family navigator specialists */
const AGENTS = [
  { code: "TŌRO", role: "Family command, scheduling & SMS gateway", icon: MessageSquare },
  { code: "KURA", role: "School notices, term dates & permission slips", icon: GraduationCap },
  { code: "KAI", role: "Meal planning, fridge inventory & shopping lists", icon: Utensils },
  { code: "ORA", role: "Health, appointments & prescriptions", icon: Stethoscope },
  { code: "TAUTOKO", role: "Bills, budget & weekly cashflow", icon: Wallet },
  { code: "HAERE", role: "Trips, holidays & weekend planning", icon: Plane },
  { code: "MAHARA", role: "The mental load — quietly remembered", icon: Brain },
  { code: "MANAAKI", role: "Birthdays, gifts & whānau milestones", icon: Sparkles },
  { code: "TIAKI", role: "Privacy, consent & child-safe boundaries", icon: ShieldCheck },
];

/* Live SMS thread — the hero proof point */
const THREAD: { side: "you" | "toro"; text: string }[] = [
  { side: "you", text: "Pick up Aroha at 3 — and I forgot the dentist form" },
  { side: "toro", text: "Got you. Reminder set for 2:45 — dentist form drafted, want me to text it back ready to sign?" },
  { side: "you", text: "Yes please. Also dinner — fridge is fish + spinach + kūmara" },
  { side: "toro", text: "Done — one-pan miso fish, kūmara, garlicky spinach. 22 min. Shopping list updated for Thursday." },
  { side: "you", text: "Mum's birthday next month?" },
  { side: "toro", text: "On it — 14 May. Booking suggestion + card + rough budget coming through tonight." },
];

const DEMO_FLOW = [
  { step: "Save 3688", detail: "Add Tōro to your contacts. That's the entire setup — no app, no login.", icon: MessageSquare },
  { step: "Text it", detail: "Pickups, dinners, dentist, school forms, trips — anything in plain English.", icon: Sparkles },
  { step: "Tōro sorts it", detail: "Plans the week, drafts the form, builds the shopping list, sets the reminders.", icon: Check },
  { step: "Quietly remembered", detail: "Next term, next birthday, next vet visit — held somewhere other than your head.", icon: Brain },
];

function SmsThread() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? THREAD.length : 1);

  useEffect(() => {
    if (reduce) return;
    if (count >= THREAD.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), 1100);
    return () => clearTimeout(t);
  }, [count, reduce]);

  return (
    <div
      className="relative w-full max-w-md rounded-[2rem] p-5 sm:p-6"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: `1px solid ${ACCENT}`,
        backdropFilter: "blur(20px)",
        boxShadow: `0 20px 60px rgba(58,125,110,0.10), 0 0 80px ${ACCENT}40`,
      }}
    >
      <div className="flex items-center justify-between mb-5 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.25em] font-medium"
          style={{ color: INK, opacity: 0.55, fontFamily: "'JetBrains Mono', monospace" }}
        >
          3688 · TŌRO
        </span>
        <span className="text-[10px] tracking-[0.15em]" style={{ color: INK, opacity: 0.4 }}>
          today · 3:01 pm
        </span>
      </div>

      <div className="flex flex-col gap-2.5 min-h-[400px]">
        {THREAD.slice(0, count).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${m.side === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-2.5 text-[13.5px] leading-snug rounded-2xl"
              style={
                m.side === "you"
                  ? { background: ACCENT_DEEP, color: "#FFFFFF", borderBottomRightRadius: 4 }
                  : { background: "rgba(255,255,255,0.95)", color: INK, border: `1px solid ${ACCENT}`, borderBottomLeftRadius: 4 }
              }
            >
              {m.side === "toro" && (
                <span
                  className="block text-[9px] uppercase tracking-[0.25em] font-semibold mb-1"
                  style={{ color: ACCENT_DEEP }}
                >
                  Tōro
                </span>
              )}
              {m.text}
            </div>
          </motion.div>
        ))}

        {count < THREAD.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl flex gap-1"
              style={{ background: "rgba(255,255,255,0.95)", border: `1px solid ${ACCENT}`, borderBottomLeftRadius: 4 }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce-dot"
                  style={{ background: ACCENT_DEEP, opacity: 0.5, animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div
        className="mt-5 pt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em]"
        style={{ borderTop: `1px solid ${ACCENT}`, color: INK, opacity: 0.5 }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT_DEEP }} />
        Live · no app · standard SMS
      </div>
    </div>
  );
}

export default function ToroaLandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Tōro — Family Navigator | Assembl"
          description="No app. No login. Text 3688. Tōro handles school, meals, appointments, bills and trips for your whānau — one number, $29 a month."
          path="/toro"
        />
        <BrandNav />
        <KeteSwitcherPill activeKete="toro" />

        {/* ── Hero ── */}
        <HeroBackdropNext variant="layered" accentTint={`${ACCENT}30`}>
          <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}25 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${ACCENT_DEEP}10 0%, transparent 60%)`,
              }}
            />

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 3 + i * 1.5,
                  height: 3 + i * 1.5,
                  background: i % 2 === 0 ? ACCENT : ACCENT_DEEP,
                  left: `${15 + i * 14}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  opacity: 0.2,
                }}
                animate={{ y: [0, -20 - i * 5, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              />
            ))}

            <LandingKeteHero accentColor={ACCENT_DEEP} accentLight={ACCENT} model="palette" size={200} />

            <motion.p
              className="text-[10px] uppercase tracking-[5px] mb-6"
              style={{ color: ACCENT_DEEP, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              TŌRO · FAMILY NAVIGATOR
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-6xl font-display tracking-[0.01em] mb-4 max-w-3xl leading-[1.05]"
              style={{ fontWeight: 200 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <span
                style={{
                  background: `linear-gradient(135deg, ${INK} 0%, ${ACCENT_DEEP} 60%, ${POUNAMU} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% auto",
                }}
              >
                Text it. Sorted.
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl font-display font-light tracking-[0.02em] mb-6 max-w-2xl"
              style={{ color: "#6B7280" }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1.5}
            >
              The family navigator that lives in your messages
            </motion.p>

            <motion.p
              className="text-sm sm:text-base max-w-xl mb-8 font-body leading-relaxed"
              style={{ color: "#6B7280" }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              No app. No login. Text{" "}
              <span
                className="px-2 py-0.5 rounded-md font-semibold"
                style={{ background: ACCENT_DEEP, color: "#FFFFFF", fontFamily: "'JetBrains Mono', monospace" }}
              >
                3688
              </span>{" "}
              — school, meals, appointments, bills and trips, quietly remembered for your whole whānau.
            </motion.p>

            <motion.div
              className="relative rounded-2xl px-7 py-6 max-w-md mb-12 text-left overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: `1px solid ${ACCENT}`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 8px 32px rgba(123,168,201,0.10), 0 0 60px ${ACCENT}30`,
              }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT_DEEP}80 50%, transparent 100%)` }}
              />
              <p
                className="text-[10px] uppercase tracking-[3px] mb-4"
                style={{ color: ACCENT_DEEP, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
              >
                te kete tuauri — quiet care
              </p>
              <ul className="space-y-3">
                {[
                  "$29 / month — whole whānau, cancel anytime",
                  "Standard SMS — no app, no login, no second tab",
                  "Privacy-first — family data never sold or used for ads",
                  "Child-safe by design — IPP-aligned, parental-consent gated",
                ].map((item, idx) => (
                  <motion.li
                    key={item}
                    className="flex items-start gap-3 text-xs font-body"
                    style={{ color: "#5B6374" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.08 }}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${ACCENT_DEEP}30`, boxShadow: `0 0 8px ${ACCENT}80` }}
                    >
                      <Check size={10} style={{ color: ACCENT_DEEP }} />
                    </div>
                    <span>{item}</span>
                  </motion.li>
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
              <a
                href="sms:3688?body=Kia%20ora%20T%C5%8Dro%20%E2%80%94%20I%27d%20like%20to%20get%20started"
                className="group relative flex items-center gap-2 px-9 py-3.5 rounded-full text-sm font-body overflow-hidden transition-all duration-300"
                style={{
                  color: "#FFFFFF",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  background: `linear-gradient(135deg, ${ACCENT_DEEP} 0%, ${POUNAMU} 100%)`,
                  border: `1px solid ${ACCENT_DEEP}80`,
                  backdropFilter: "blur(20px)",
                  boxShadow: `0 8px 24px rgba(123,168,201,0.30), 0 0 0 1px rgba(255,255,255,0.1) inset`,
                }}
              >
                <span className="relative z-10">Text 3688 now</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/toro/app"
                className="group flex items-center gap-2 px-9 py-3.5 rounded-full text-sm font-body transition-all duration-300"
                style={{
                  color: INK,
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  background: "rgba(255,255,255,0.7)",
                  border: `1px solid ${ACCENT}`,
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 16px rgba(123,168,201,0.10), 0 0 0 1px rgba(255,255,255,0.4) inset",
                }}
              >
                <span>Open the dashboard</span>
              </Link>
            </motion.div>

            {/* SMS thread directly under hero */}
            <motion.div
              className="mt-16 w-full flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <SmsThread />
            </motion.div>
          </main>
        </HeroBackdropNext>

        {/* ── Real Use Case ── */}
        <KeteUseCaseSection data={TORO_USE_CASE} />

        {/* ── Agent Network ── */}
        <section className="relative px-6 pb-24 max-w-5xl mx-auto">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${ACCENT}25 0%, transparent 70%)` }}
          />
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p
              className="text-[10px] tracking-[4px] mb-3 uppercase"
              style={{ color: ACCENT_DEEP, fontFamily: "'JetBrains Mono', monospace" }}
            >
              specialist network
            </p>
            <h2 className="text-2xl sm:text-3xl font-display tracking-[0.01em]" style={{ color: INK, fontWeight: 200 }}>
              9 quiet helpers, one text thread
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.code}
                className="group relative p-5 rounded-xl overflow-hidden cursor-default"
                style={{
                  background:
                    hoveredAgent === i
                      ? `linear-gradient(135deg, ${ACCENT}40 0%, ${ACCENT_DEEP}15 100%)`
                      : "rgba(255,255,255,0.7)",
                  border: `1px solid ${hoveredAgent === i ? ACCENT_DEEP + "70" : ACCENT}`,
                  transition: "all 0.4s ease",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    hoveredAgent === i
                      ? `0 8px 32px rgba(123,168,201,0.15), 0 0 40px ${ACCENT}40`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setHoveredAgent(i)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-[1px] transition-opacity duration-500"
                  style={{
                    opacity: hoveredAgent === i ? 1 : 0,
                    background: `linear-gradient(90deg, transparent 0%, ${ACCENT_DEEP} 50%, transparent 100%)`,
                  }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-400"
                    style={{
                      background:
                        hoveredAgent === i
                          ? `linear-gradient(135deg, ${ACCENT_DEEP}40 0%, ${ACCENT}40 100%)`
                          : `${ACCENT}40`,
                      boxShadow: hoveredAgent === i ? `0 0 16px ${ACCENT_DEEP}40` : "none",
                    }}
                  >
                    <a.icon size={18} style={{ color: ACCENT_DEEP }} />
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: INK }}>
                    {a.code}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#5B6374" }}>
                  {a.role}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="relative px-6 pb-28 max-w-4xl mx-auto">
          <div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${ACCENT}25 0%, transparent 60%)` }}
          />
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p
              className="text-[10px] tracking-[4px] mb-3 uppercase"
              style={{ color: ACCENT_DEEP, fontFamily: "'JetBrains Mono', monospace" }}
            >
              how it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-display tracking-[0.01em]" style={{ color: INK, fontWeight: 200 }}>
              Four steps. Then your weekend back.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            {DEMO_FLOW.map((d, i) => (
              <motion.button
                key={d.step}
                onClick={() => setActiveDemo(i)}
                className="group relative p-5 rounded-xl text-left overflow-hidden"
                style={{
                  background:
                    activeDemo === i
                      ? `linear-gradient(135deg, ${ACCENT}40 0%, rgba(255,255,255,0.7) 100%)`
                      : "rgba(255,255,255,0.6)",
                  border: `1px solid ${activeDemo === i ? ACCENT_DEEP + "70" : ACCENT}`,
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    activeDemo === i
                      ? `0 4px 24px rgba(123,168,201,0.15), 0 0 40px ${ACCENT}30`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.4s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {activeDemo === i && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT_DEEP} 50%, transparent 100%)` }}
                    layoutId="toro-demo-accent"
                  />
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                      background:
                        activeDemo === i
                          ? `linear-gradient(135deg, ${ACCENT_DEEP} 0%, ${ACCENT} 100%)`
                          : `${ACCENT}30`,
                      boxShadow: activeDemo === i ? `0 0 16px ${ACCENT_DEEP}40` : "none",
                    }}
                  >
                    <d.icon size={14} style={{ color: activeDemo === i ? "#FFFFFF" : ACCENT_DEEP }} />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: activeDemo === i ? INK : "#5B6374" }}
                  >
                    {d.step}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: activeDemo === i ? "#5B6374" : "#7B8294" }}
                >
                  {d.detail}
                </p>
              </motion.button>
            ))}
          </div>

          <motion.div
            className="relative p-8 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${ACCENT}`,
              backdropFilter: "blur(10px)",
              boxShadow: `0 16px 48px rgba(123,168,201,0.10), 0 0 80px ${ACCENT}30`,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: `linear-gradient(90deg, transparent 10%, ${ACCENT_DEEP}60 50%, transparent 90%)` }}
            />
            <div className="flex items-center gap-2.5 mb-6">
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: ACCENT_DEEP, boxShadow: `0 0 10px ${ACCENT_DEEP}80` }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] uppercase tracking-[3px] font-mono" style={{ color: ACCENT_DEEP }}>
                Live preview
              </span>
            </div>

            {activeDemo === 0 && (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key="demo-0"
              >
                <div
                  className="inline-block px-6 py-3 rounded-2xl text-2xl font-mono font-bold mb-3"
                  style={{ background: ACCENT_DEEP, color: "#FFFFFF", letterSpacing: "0.1em" }}
                >
                  3688
                </div>
                <p className="text-sm" style={{ color: INK }}>
                  Save Tōro to your contacts.
                </p>
                <p className="text-[11px] mt-2" style={{ color: "#7B8294" }}>
                  That's the entire setup. No download, no account.
                </p>
              </motion.div>
            )}

            {activeDemo === 1 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="demo-1">
                {[
                  "Pick up Aroha at 3 — and dentist form",
                  "What's for dinner? Fridge has fish + spinach + kūmara",
                  "Mum's birthday next month — book something nice",
                ].map((q, idx) => (
                  <motion.div
                    key={q}
                    className="p-4 rounded-lg flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <div
                      className="px-4 py-2.5 rounded-2xl text-xs max-w-[80%]"
                      style={{ background: ACCENT_DEEP, color: "#FFFFFF", borderBottomRightRadius: 4 }}
                    >
                      {q}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeDemo === 2 && (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="demo-2">
                {[
                  { label: "Pickup", value: "Reminder set 2:45 pm — dentist form drafted" },
                  { label: "Dinner", value: "One-pan miso fish + kūmara — 22 min, list updated" },
                  { label: "Birthday", value: "14 May booked, gift suggestion + budget tonight" },
                ].map((f, idx) => (
                  <motion.div
                    key={f.label}
                    className="p-3 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${ACCENT}` }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: ACCENT_DEEP }}>
                      {f.label}
                    </span>
                    <p className="mt-1" style={{ color: INK }}>
                      {f.value}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeDemo === 3 && (
              <motion.div
                className="text-center py-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key="demo-3"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: `${ACCENT}50`, boxShadow: `0 0 30px ${ACCENT}50` }}
                >
                  <Brain size={28} style={{ color: ACCENT_DEEP }} />
                </div>
                <p className="text-sm mb-1" style={{ color: INK }}>
                  Quietly remembered for next time.
                </p>
                <p className="text-[11px]" style={{ color: "#7B8294" }}>
                  Term dates, vet visits, prescriptions, birthdays — held outside your head, every week, forever.
                </p>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* ── Closing CTA ── */}
        <section className="relative text-center px-6 pb-24">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 50% 60% at 50% 50%, ${ACCENT}25 0%, transparent 60%)` }}
          />
          <motion.div
            className="relative inline-flex flex-col items-center gap-4 p-10 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${ACCENT}`,
              backdropFilter: "blur(10px)",
              boxShadow: `0 8px 32px rgba(123,168,201,0.10), 0 0 60px ${ACCENT}30`,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: `linear-gradient(90deg, transparent, ${ACCENT_DEEP}60, transparent)` }}
            />
            <Users size={28} style={{ color: ACCENT_DEEP }} />
            <p className="text-sm" style={{ color: "#5B6374" }}>
              Ready to give your whānau back the weekend?
            </p>
            <a
              href="sms:3688?body=Kia%20ora%20T%C5%8Dro%20%E2%80%94%20I%27d%20like%20to%20get%20started"
              className="group flex items-center gap-2 px-9 py-3.5 rounded-full text-sm font-body transition-all duration-300"
              style={{
                color: "#FFFFFF",
                fontWeight: 400,
                letterSpacing: "0.02em",
                background: `linear-gradient(135deg, ${ACCENT_DEEP} 0%, ${POUNAMU} 100%)`,
                border: `1px solid ${ACCENT_DEEP}80`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 8px 24px rgba(123,168,201,0.30), 0 0 0 1px rgba(255,255,255,0.1) inset`,
              }}
            >
              <span>Text 3688 now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <TextUsButton keteName="Tōro" accentColor={ACCENT_DEEP} showWhatsApp={true} />
            <p className="text-[11px] mt-2" style={{ color: "#7B8294" }}>
              $29 / month · whole whānau · cancel anytime
            </p>
          </motion.div>
        </section>

        {/* ── Live data strip ── */}
        <section className="px-6 pb-12 text-center space-y-5">
          <LiveStatusStrip pack="toro" agentCodes={["toro", "kura", "kai", "ora", "mahara"]} accent={ACCENT_DEEP} />
          <LiveDataTiles
            accent={ACCENT_DEEP}
            tiles={[
              { label: "Today's weather", source: "MetService NZ", icon: CloudSun, load: () => loadWeather("Auckland") },
              {
                label: "Family privacy",
                source: "Privacy Act 2020 · IPPs",
                icon: ShieldCheck,
                load: () => loadLatestRegChange(["family", "privacy", "child"]),
              },
              {
                label: "Tōro status",
                source: "SMS gateway",
                icon: MessageSquare,
                load: async () => "5 / 5 family agents online · 3688 live",
              },
            ]}
          />
        </section>

        <BrandFooter />
        <KeteAgentChat
          keteName="Tōro"
          keteLabel="Family Navigator"
          accentColor={ACCENT}
          defaultAgentId="toro"
          packId="toro"
          starterPrompts={[
            "What can Tōro help my family with?",
            "How does the SMS-only setup work?",
            "Is my family's data private and safe?",
            "Tell me about the $29/month plan",
          ]}
        />
      </div>
    </LightPageShell>
  );
}
