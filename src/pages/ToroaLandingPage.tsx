import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, GraduationCap, HeartPulse, Receipt, UtensilsCrossed, Phone, ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import TextUsButton from "@/components/kete/TextUsButton";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Brand tokens ─── */
const BG = "#0A0A14";
const ACCENT = "#D4A843";
const POUNAMU = "#3A7D6E";
const BONE = "#F5F0E8";
const SKY = "#87CEEB";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ─── Capabilities ─── */
const CAPABILITIES = [
  { icon: CalendarDays, title: "Scheduling", body: "School pickups, sports, appointments — one text organises the whole whānau calendar." },
  { icon: GraduationCap, title: "School Admin", body: "Permission slips, newsletters, term events — Toro reads them and adds them before you forget." },
  { icon: HeartPulse, title: "Health Appointments", body: "Book the dentist, remind about prescriptions, track GP visits for every family member." },
  { icon: Receipt, title: "Household Bills", body: "Track due dates, get alerts before things go overdue, stay on top of the weekly budget." },
  { icon: UtensilsCrossed, title: "Meal Planning", body: "Tell Toro what's in the fridge — it plans the week's meals and writes the shopping list." },
  { icon: Phone, title: "Emergency Contacts", body: "Store and instantly retrieve every important number — school, GP, plumber, neighbours." },
];

const AGENTS = [
  { name: "TORO", desc: "SMS-first family AI navigator — school notices, meal planning, bus tracking, reminders, budgets", status: "Deployed" },
];

const PRICING_FEATURES = [
  "Covers your whole whānau — add everyone",
  "No setup fee, ever",
  "No lock-in contracts",
  "Cancel anytime, no questions asked",
  "Works on any phone, any network",
];

/* ─── SMS Demo ─── */
function TryToroSmsDemo() {
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^(\+?64|0)\d{7,10}$/.test(cleaned)) {
      toast.error("Enter a valid NZ phone number");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("tnz-send", {
        body: { channel: "sms", to: cleaned.startsWith("0") ? "+64" + cleaned.slice(1) : cleaned, message: "Kia ora! This is Toro — your whānau navigator. Text us anytime to get started. 🪶" },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Demo SMS sent — check your phone!");
    } catch {
      toast.error("Could not send SMS right now. Try again shortly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.3em] mb-3 font-light" style={{ color: SKY, fontFamily: "Lato, sans-serif" }}>Try it now</p>
      <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.12em] mb-2" style={{ color: "#1A1D29", fontFamily: "Lato, sans-serif" }}>
        Send yourself a demo text
      </h2>
      <p className="text-sm opacity-50 mb-6" style={{ color: "#1A1D29" }}>Enter your NZ mobile number. One intro text — no spam, no sign-up.</p>
      <div className="flex gap-2 max-w-xs mx-auto">
        {sent ? (
          <p className="text-sm w-full text-center py-3" style={{ color: ACCENT }}>✓ Sent! Check your phone.</p>
        ) : (
          <>
            <input
              type="tel" placeholder="021 123 4567" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 rounded-full px-4 py-3 text-sm bg-white/5 border text-foreground placeholder:text-gray-400 focus:outline-none"
              style={{ borderColor: `${POUNAMU}40` }}
              maxLength={15}
            />
            <button onClick={send} disabled={sending}
              className="px-5 py-3 rounded-full text-sm font-medium transition-all"
              style={{ background: POUNAMU, color: "#1A1D29", opacity: sending ? 0.5 : 1 }}>
              {sending ? "…" : "Send"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
export default function ToroaLandingPage() {
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Tōro — Family Navigator for Aotearoa | $29/mo"
          description="An SMS-first whānau navigator for New Zealand families. School admin, meal planning, appointments, budgets — no app, no login, just text."
          path="/toro"
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center justify-center px-6 pt-16 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}10 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${SKY}06 0%, transparent 60%)`,
          }} />

          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: 3 + i * 1.5, height: 3 + i * 1.5,
              background: i % 2 === 0 ? ACCENT : SKY,
              left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.15,
            }} animate={{ y: [0, -20 - i * 5, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }} />
          ))}

          <motion.div className="relative z-10 max-w-3xl" initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] mb-5 font-light"
              style={{ color: SKY, fontFamily: "Lato, sans-serif" }}>
              Tōro · Family Navigator
            </motion.p>

            <motion.h1 variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl md:text-6xl font-light uppercase tracking-[0.08em] leading-tight mb-6"
              style={{ color: "#1A1D29", fontFamily: "Lato, sans-serif" }}>
              Your whānau's
              <br />
              <span style={{ color: ACCENT }}>command centre</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2}
              className="text-base sm:text-lg max-w-lg mx-auto leading-relaxed opacity-70 mb-8"
              style={{ color: "#1A1D29" }}>
              No app. No login. Just text your whānau's next move. School admin, meal plans, appointments, budgets — all by SMS.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/toro/app"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm uppercase tracking-[0.15em] font-light transition-all"
                style={{ background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}15)`, border: `1px solid ${ACCENT}50`, color: "#1A1D29" }}>
                Start a Tōro record <ArrowRight size={14} />
              </Link>
              <a
                href="#try-toro-sms"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm uppercase tracking-[0.15em] font-light transition-all"
                style={{ background: `linear-gradient(135deg, ${POUNAMU}24, ${SKY}18)`, border: `1px solid ${POUNAMU}45`, color: "#1A1D29" }}
              >
                Get a text from Tōro <ArrowRight size={14} />
              </a>
            </motion.div>

            <motion.p variants={fadeUp} custom={4}
              className="mt-5 text-xs tracking-[0.25em] uppercase opacity-40" style={{ color: "#1A1D29" }}>
              $29/mo · whole whānau · cancel anytime
            </motion.p>
          </motion.div>
        </main>

        {/* ── How it works — SMS bubbles ── */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] mb-3 font-light" style={{ color: SKY }}>How it works</p>
            <h2 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.12em]" style={{ color: "#1A1D29", fontFamily: "Lato, sans-serif" }}>
              Text it. <span style={{ color: ACCENT }}>Done.</span>
            </h2>
            <p className="mt-4 text-base max-w-sm mx-auto opacity-60" style={{ color: "#1A1D29" }}>
              Toro lives in your messages app. No download, no account — just send a text.
            </p>
          </motion.div>

          <div className="max-w-sm mx-auto flex flex-col gap-6">
            {[
              { user: "Remind me to pick up the kids at 3pm", agent: "Done ✓ I'll text you at 2:45pm — 'Leave now to pick up kids at 3pm'. Add it to the family calendar too?" },
              { user: "What's on for the kids this week?", agent: "Here's the week: Mon — football 4:30pm. Tue — library books due. Thu — school trip (need $5 + packed lunch). Fri — early finish 2pm." },
              { user: "Can you book a dentist for Aroha?", agent: "On it. I'll find a dentist near you and text you 3 options with available times. Prefer morning or afternoon?" },
            ].map((convo, i) => (
              <motion.div key={i} className="flex flex-col gap-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm" style={{ background: POUNAMU, color: "#1A1D29" }}>
                    {convo.user}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm" style={{ background: "rgba(135,206,235,0.08)", border: `1px solid ${SKY}25`, color: "#1A1D29" }}>
                    <span style={{ color: ACCENT, fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>TORO</span>
                    {convo.agent}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Capabilities grid ── */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] mb-3 font-light" style={{ color: ACCENT }}>What it handles</p>
            <h2 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.12em]" style={{ color: "#1A1D29", fontFamily: "Lato, sans-serif" }}>
              One text away from <span style={{ color: ACCENT }}>sorted</span>
            </h2>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {CAPABILITIES.map((cap, i) => (
              <motion.div key={cap.title} variants={fadeUp} custom={i}
                className="rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${ACCENT}15`, backdropFilter: "blur(16px)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}>
                  <cap.icon size={18} style={{ color: ACCENT }} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm uppercase tracking-[0.15em] font-light" style={{ color: ACCENT, fontFamily: "Lato, sans-serif" }}>{cap.title}</h3>
                <p className="text-sm leading-relaxed opacity-65" style={{ color: "#1A1D29" }}>{cap.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Agent ── */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.3em] mb-3 font-light" style={{ color: POUNAMU }}>Your Navigator</p>
          </motion.div>
          <div className="max-w-lg mx-auto">
            {AGENTS.map((agent, i) => (
              <motion.div key={agent.name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="rounded-2xl p-5 transition-all duration-300 cursor-default"
                style={{
                  background: hoveredAgent === i ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.65)",
                  border: `1px solid ${hoveredAgent === i ? ACCENT + "40" : "rgba(255,255,255,0.5)"}`,
                  backdropFilter: "blur(16px)",
                }}
                onMouseEnter={() => setHoveredAgent(i)}
                onMouseLeave={() => setHoveredAgent(null)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: ACCENT }}>{agent.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full" style={{ background: `${POUNAMU}20`, color: POUNAMU, border: `1px solid ${POUNAMU}30` }}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-sm opacity-65" style={{ color: "#1A1D29" }}>{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="max-w-lg mx-auto px-6 py-20 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] mb-3 font-light" style={{ color: POUNAMU }}>Pricing</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl font-light uppercase tracking-[0.08em] mb-1" style={{ color: ACCENT, fontFamily: "Lato, sans-serif" }}>$29</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg uppercase tracking-[0.2em] font-light mb-10 opacity-60" style={{ color: "#1A1D29" }}>a month. that's it.</motion.p>

            <motion.div variants={fadeUp} custom={3} className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${ACCENT}20`, backdropFilter: "blur(16px)" }}>
              <ul className="flex flex-col gap-4 text-left mb-8">
                {PRICING_FEATURES.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: `${POUNAMU}25`, color: POUNAMU, border: `1px solid ${POUNAMU}35` }}>
                      <Check size={12} />
                    </span>
                    <span className="text-sm leading-relaxed opacity-70" style={{ color: "#1A1D29" }}>{item}</span>
                  </li>
                ))}
              </ul>
              <a href="https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm uppercase tracking-[0.15em] font-light transition-all"
                style={{ background: `linear-gradient(135deg, ${ACCENT}30, ${ACCENT}15)`, border: `1px solid ${ACCENT}50`, color: "#1A1D29" }}>
                Start free — first month on us
              </a>
              <div className="mt-6">
                <TextUsButton keteName="Tōro" accentColor={ACCENT} showWhatsApp={true} />
              </div>
            </motion.div>
          </motion.div>
        </section>


        {/* ── SMS Demo ── */}
        <div id="try-toro-sms">
          <TryToroSmsDemo />
        </div>

        <BrandFooter />
        <KeteAgentChat
          keteName="Tōro"
          keteLabel="Family Navigator"
          accentColor={ACCENT}
          defaultAgentId="toroa"
          packId="toroa"
          starterPrompts={[
            "What can Tōro do for my whānau?",
            "How does the SMS service work?",
            "What's included in the $29/month plan?",
          ]}
        />
      </div>
    </LightPageShell>
  );
}
