import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CalendarDays,
  GraduationCap,
  HeartPulse,
  Receipt,
  UtensilsCrossed,
  Phone,
} from "lucide-react";

/* ─── Brand tokens ─── */
const BG = "#09090F";
const GOLD = "#D4A843";
const TEAL = "#3A7D6E";
const BONE = "#F5F0E8";
const SKY = "#87CEEB";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Albatross silhouette ─── */
function Albatross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Simplified albatross in soaring flight — wide wingspan, slender body */}
      <path
        d="M160 40 C140 32, 80 18, 20 28 C50 26, 90 34, 130 38 L160 40 L190 38 C230 34, 270 26, 300 28 C240 18, 180 32, 160 40Z"
        fill={SKY}
        fillOpacity="0.18"
      />
      <path
        d="M155 40 C158 36, 162 36, 165 40 C163 44, 157 44, 155 40Z"
        fill={SKY}
        fillOpacity="0.3"
      />
      <path
        d="M163 39 Q175 37 185 38 Q178 42 165 42Z"
        fill={SKY}
        fillOpacity="0.22"
      />
    </svg>
  );
}

/* ─── Moon glow ─── */
function Moon() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-10" aria-hidden="true">
      {/* Outer glow rings */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${SKY}18 0%, ${SKY}06 55%, transparent 75%)`,
          transform: "scale(2.4)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${SKY}10 0%, transparent 60%)`,
          transform: "scale(1.7)",
        }}
      />
      {/* Moon disc */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 38% 35%, ${BONE} 0%, #D8D0C4 60%, #B8B0A4 100%)`,
          boxShadow: `0 0 40px ${SKY}40, 0 0 80px ${SKY}20`,
        }}
      />
      {/* Subtle crater texture */}
      <div
        className="absolute rounded-full"
        style={{
          width: "22%",
          height: "18%",
          top: "28%",
          left: "22%",
          background: "rgba(0,0,0,0.07)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "14%",
          height: "12%",
          top: "55%",
          left: "52%",
          background: "rgba(0,0,0,0.05)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

/* ─── SMS Bubble ─── */
function SMSConversation({
  user,
  agent,
  delay = 0,
}: {
  user: string;
  agent: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* User message */}
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
          style={{
            background: TEAL,
            color: BONE,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          {user}
        </div>
      </div>
      {/* Agent reply */}
      <div className="flex justify-start">
        <div
          className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
          style={{
            background: "rgba(135,206,235,0.10)",
            border: `1px solid ${SKY}30`,
            color: BONE,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
          }}
        >
          <span style={{ color: SKY, fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.1em", display: "block", marginBottom: "2px" }}>
            TŌROA
          </span>
          {agent}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Glass card ─── */
function GlassCard({
  icon: Icon,
  title,
  body,
  i,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  i: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={{
        background: "rgba(15,15,26,0.65)",
        border: `1px solid ${SKY}22`,
        backdropFilter: "blur(16px)",
        boxShadow: `0 0 32px ${SKY}08, 0 8px 40px rgba(0,0,0,0.35)`,
      }}
      whileHover={{ y: -4, boxShadow: `0 0 48px ${SKY}18, 0 16px 48px rgba(0,0,0,0.4)` }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${SKY}15`, border: `1px solid ${SKY}30` }}
      >
        <Icon size={18} style={{ color: SKY }} strokeWidth={1.5} />
      </div>
      <h3
        className="text-sm uppercase tracking-widest font-light"
        style={{ color: GOLD, fontFamily: "Lato, sans-serif", letterSpacing: "0.15em" }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed opacity-70"
        style={{ color: BONE, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        {body}
      </p>
    </motion.div>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs uppercase tracking-[0.35em] mb-4 font-light"
      style={{ color: SKY, fontFamily: "Lato, sans-serif" }}
    >
      {children}
    </p>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <h2
      className="text-3xl sm:text-4xl md:text-5xl font-light uppercase tracking-[0.18em] leading-tight"
      style={{
        color: gold ? GOLD : BONE,
        fontFamily: "Lato, sans-serif",
      }}
    >
      {children}
    </h2>
  );
}

/* ─── Section wrapper ─── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative px-6 py-24 md:py-32 max-w-5xl mx-auto ${className}`}>
      {children}
    </section>
  );
}

/* ─── Capabilities data ─── */
const CAPABILITIES = [
  {
    icon: CalendarDays,
    title: "Scheduling",
    body: "School pickups, sports fixtures, appointments — one text organises the whole whānau calendar without lifting a finger.",
  },
  {
    icon: GraduationCap,
    title: "School Admin",
    body: "Permission slips, newsletter dates, term events — Tōroa reads them and adds them before you forget.",
  },
  {
    icon: HeartPulse,
    title: "Health Appointments",
    body: "Book the dentist, remind about prescriptions, track GP visits for every family member in one place.",
  },
  {
    icon: Receipt,
    title: "Household Bills",
    body: "Track due dates, get alerts before things go overdue, and stay on top of the weekly budget — all by text.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Planning",
    body: "Tell Tōroa what's in the fridge. It plans the week's meals and writes the shopping list so you don't have to.",
  },
  {
    icon: Phone,
    title: "Emergency Contacts",
    body: "Store and instantly retrieve every important number for your whānau — school, GP, plumber, neighbours.",
  },
];

/* ─── Try Tōroa SMS Demo ─── */
function TryToroaSmsDemo() {
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
      const { data, error } = await supabase.functions.invoke("tnz-send", {
        body: { channel: "sms", to: cleaned.startsWith("0") ? "+64" + cleaned.slice(1) : cleaned, message: "Kia ora! This is Tōroa — your whānau navigator. Text us anytime to get started. 🪶" },
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
    <Section>
      <motion.div className="text-center max-w-md mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
        <motion.div variants={fadeUp}><Eyebrow>Try it now</Eyebrow></motion.div>
        <motion.div variants={fadeUp} custom={1}>
          <SectionHeading>Send yourself a demo text</SectionHeading>
          <p className="mt-3 text-sm opacity-50" style={{ color: BONE, fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Enter your NZ mobile number. We'll send one intro text — no spam, no sign-up.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} custom={2} className="mt-6 flex gap-2 max-w-xs mx-auto">
          {sent ? (
            <p className="text-sm w-full text-center py-3" style={{ color: GOLD }}>✓ Sent! Check your phone.</p>
          ) : (
            <>
              <input
                type="tel"
                placeholder="021 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="New Zealand mobile number"
                className="flex-1 rounded-full px-4 py-3 text-sm bg-white/5 border text-white placeholder:text-white/30 focus:outline-none"
                style={{ borderColor: `${SKY}30`, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                maxLength={15}
              />
              <button
                onClick={send}
                disabled={sending}
                aria-label="Send demo SMS"
                className="px-5 py-3 rounded-full text-sm font-medium transition-all"
                style={{ background: SKY, color: BG, opacity: sending ? 0.5 : 1 }}
              >
                {sending ? "…" : "Send"}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ─── Main page ─── */
export default function ToroaLandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: BG, color: BONE }}
    >
      <SEO
        title="Tōroa — SMS Family Navigator for Aotearoa | $29/mo"
        description="An SMS-first whānau navigator for New Zealand families. School admin, meal planning, appointments, budgets — no app, no login, just text. $29/month covers the whole whānau."
        path="/toroa"
        image="https://www.assembl.co.nz/assembl-og.png"
      />

      {/* ── 1. HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      >
        {/* Sky glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 20%, ${SKY}0F 0%, transparent 65%)`,
          }}
          aria-hidden="true"
        />

        {/* Albatross */}
        <motion.div
          className="absolute top-[12%] inset-x-0 px-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.8 }}
          aria-hidden="true"
        >
          <Albatross className="w-full max-w-2xl mx-auto" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Moon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Moon />
          </motion.div>

          {/* Wordmark */}
          <motion.p
            className="text-xs uppercase tracking-[0.45em] mb-6 font-light"
            style={{ color: SKY, fontFamily: "Lato, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Tōroa
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light uppercase tracking-[0.12em] leading-none mb-6"
            style={{ color: BONE, fontFamily: "Lato, sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Your whānau,
            <br />
            <span style={{ color: GOLD }}>sorted.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg md:text-xl max-w-md leading-relaxed mb-10 opacity-75"
            style={{ color: BONE, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            A family agent that runs on text.
            <br />
            No app. No login.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <a
              href="https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Tōroa for $29 per month"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm uppercase tracking-[0.2em] font-light transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${SKY}28, ${SKY}14)`,
                border: `1px solid ${SKY}50`,
                color: BONE,
                fontFamily: "Lato, sans-serif",
                boxShadow: `0 0 32px ${SKY}20`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 48px ${SKY}40`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${SKY}40, ${SKY}22)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${SKY}20`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${SKY}28, ${SKY}14)`;
              }}
            >
              Try it free
            </a>
          </motion.div>

          {/* Pricing hint */}
          <motion.p
            className="mt-5 text-xs tracking-widest uppercase opacity-40"
            style={{ fontFamily: "Lato, sans-serif", color: BONE }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            $29/mo · whole whānau · cancel anytime
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <div
            className="w-px h-12 mx-auto"
            style={{ background: `linear-gradient(to bottom, ${SKY}50, transparent)` }}
          />
        </motion.div>
      </section>

      {/* Divider */}
      <div
        className="h-px max-w-xs mx-auto"
        style={{ background: `linear-gradient(to right, transparent, ${SKY}30, transparent)` }}
      />

      {/* ── 2. HOW IT WORKS ── */}
      <Section>
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Eyebrow>How it works</Eyebrow>
          <SectionHeading>Text it. Done.</SectionHeading>
          <p
            className="mt-5 text-lg max-w-sm mx-auto opacity-60 leading-relaxed"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Tōroa lives in your messages app. No download, no account — just send a text.
          </p>
        </motion.div>

        {/* SMS bubbles */}
        <div className="max-w-sm mx-auto flex flex-col gap-8">
          <SMSConversation
            user="Remind me to pick up the kids at 3pm"
            agent="Done ✓ I'll text you at 2:45pm — 'Leave now to pick up kids at 3pm'. Add it to the family calendar too?"
            delay={0}
          />
          <SMSConversation
            user="What's on for the kids this week?"
            agent="Here's the week: Mon — football 4:30pm. Tue — library books due. Thu — school trip (need $5 + packed lunch). Fri — early finish 2pm."
            delay={1}
          />
          <SMSConversation
            user="Can you book a dentist for Aroha?"
            agent="On it. I'll find a dentist near you and text you 3 options with available times. Prefer morning or afternoon appointments?"
            delay={2}
          />
        </div>
      </Section>

      {/* Divider */}
      <div
        className="h-px max-w-xs mx-auto"
        style={{ background: `linear-gradient(to right, transparent, ${GOLD}25, transparent)` }}
      />

      {/* ── 3. WHAT IT HANDLES ── */}
      <Section>
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Eyebrow>What it handles</Eyebrow>
          <SectionHeading>One text away</SectionHeading>
          <p
            className="mt-2 text-2xl md:text-3xl font-light uppercase tracking-[0.14em]"
            style={{ color: GOLD, fontFamily: "Lato, sans-serif" }}
          >
            from sorted.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {CAPABILITIES.map((cap, i) => (
            <GlassCard key={cap.title} {...cap} i={i} />
          ))}
        </motion.div>
      </Section>

      {/* Divider */}
      <div
        className="h-px max-w-xs mx-auto"
        style={{ background: `linear-gradient(to right, transparent, ${SKY}25, transparent)` }}
      />

      {/* ── 4. PRICING ── */}
      <Section>
        <motion.div
          className="text-center max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>Pricing</Eyebrow>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <h2
              className="text-5xl sm:text-6xl md:text-7xl font-light uppercase tracking-[0.08em] leading-none mb-3"
              style={{ color: GOLD, fontFamily: "Lato, sans-serif" }}
            >
              $29
            </h2>
            <p
              className="text-xl uppercase tracking-[0.2em] font-light mb-10 opacity-60"
              style={{ color: BONE, fontFamily: "Lato, sans-serif" }}
            >
              a month. that's it.
            </p>
          </motion.div>

          {/* Pricing card */}
          <motion.div
            variants={fadeUp}
            custom={2}
            className="rounded-2xl p-8"
            style={{
              background: "rgba(15,15,26,0.7)",
              border: `1px solid ${GOLD}25`,
              backdropFilter: "blur(16px)",
              boxShadow: `0 0 48px ${GOLD}08, 0 16px 48px rgba(0,0,0,0.4)`,
            }}
          >
            <ul className="flex flex-col gap-4 text-left mb-8">
              {[
                "Covers your whole whānau — add everyone",
                "No setup fee, ever",
                "No lock-in contracts",
                "Cancel anytime, no questions asked",
                "Works on any phone, any network",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: `${TEAL}30`, color: TEAL, border: `1px solid ${TEAL}40` }}
                  >
                    ✓
                  </span>
                  <span
                    className="text-base leading-relaxed opacity-75"
                    style={{ color: BONE, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Tōroa — start free, first month on us"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm uppercase tracking-[0.2em] font-light transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${SKY}28, ${SKY}14)`,
                border: `1px solid ${SKY}50`,
                color: BONE,
                fontFamily: "Lato, sans-serif",
                boxShadow: `0 0 24px ${SKY}15`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${SKY}35`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${SKY}15`;
              }}
            >
              Start free — first month on us
            </a>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SMS DEMO ── */}
      <TryToroaSmsDemo />

      {/* ── 5. FOOTER ── */}
      <footer
        className="border-t py-12 px-6 text-center"
        style={{ borderColor: `${BONE}10` }}
      >
        <p
          className="text-xs uppercase tracking-[0.3em] mb-4 font-light opacity-40"
          style={{ color: BONE, fontFamily: "Lato, sans-serif" }}
        >
          A product by
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] font-light transition-opacity duration-200 hover:opacity-100 opacity-55"
          style={{ color: GOLD, fontFamily: "Lato, sans-serif" }}
        >
          ← Assembl
        </Link>
        <p
          className="mt-8 text-xs opacity-25"
          style={{ color: BONE, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          © {new Date().getFullYear()} Assembl · Aotearoa New Zealand
        </p>
      </footer>
    </div>
  );
}
