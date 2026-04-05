import { useState, useEffect, useRef, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed, HardHat, Palette, Briefcase, Cpu, Globe,
  HeartPulse, Heart, Compass, Shield, CheckCircle2, Star,
  Menu, X, ChevronDown, ArrowRight,
} from "lucide-react";
import SEO from "@/components/SEO";
import CelestialLogo from "@/components/CelestialLogo";

/* ─── Brand tokens ─────────────────────────────────────────────── */
const BG = "#09090F";
const GOLD = "#C4A870";   // warm muted bronze-gold (not yellow)
const TEAL = "#3A7D6E";
const BONE = "#F5F0E8";

/* ─── Animation helper ─────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

/* ─── Full-page star field canvas ─────────────────────────────── */
// 120 stars spread across viewport, twinkling, with faint constellation lines
const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed a stable distribution so stars don't move on resize
    const count = 130;
    const stars = Array.from({ length: count }, (_, i) => ({
      // Use a pseudo-deterministic spread
      x: ((i * 0.618033988 % 1) * 0.96 + 0.02),
      y: ((i * 0.381966011 % 1) * 0.96 + 0.02),
      r: 0.4 + (i % 5) * 0.22,
      baseO: 0.08 + (i % 7) * 0.025,
      phase: (i * 1.7) % (Math.PI * 2),
      speed: 0.25 + (i % 9) * 0.08,
    }));

    // Constellation lines: connect stars that happen to be nearby
    const lines: [number, number][] = [];
    for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        const dx = (stars[a].x - stars[b].x) * 1920;
        const dy = (stars[a].y - stars[b].y) * 1080;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 60 && dist < 140 && lines.length < 28) {
          lines.push([a, b]);
        }
      }
    }

    let frame: number;
    let t = 0;

    const draw = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.008;

      // Constellation lines
      ctx.lineWidth = 0.4;
      lines.forEach(([a, b]) => {
        const sa = stars[a], sb = stars[b];
        const lineO = 0.03 + Math.sin(t * 0.3 + a) * 0.015;
        ctx.strokeStyle = `rgba(245,240,232,${lineO})`;
        ctx.beginPath();
        ctx.moveTo(sa.x * w, sa.y * h);
        ctx.lineTo(sb.x * w, sb.y * h);
        ctx.stroke();
      });

      // Stars
      stars.forEach((s) => {
        const twinkle = s.baseO + Math.sin(t * s.speed + s.phase) * 0.07;
        const opacity = Math.max(0.04, Math.min(0.32, twinkle));
        // Larger stars get a tiny soft halo
        if (s.r > 0.8) {
          const grad = ctx.createRadialGradient(s.x * w, s.y * h, 0, s.x * w, s.y * h, s.r * 3.5);
          grad.addColorStop(0, `rgba(245,240,232,${opacity * 0.7})`);
          grad.addColorStop(1, "rgba(245,240,232,0)");
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,240,232,${opacity})`;
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

/* ─── Minimal fixed nav ────────────────────────────────────────── */
const MinimalNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-16"
        style={{ background: "transparent" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <CelestialLogo size={30} />
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontSize: "13px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            ASSEMBL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#industries"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Industries
          </a>
          <a
            href="#pricing"
            className="text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pricing
          </a>
          <a
            href="#contact"
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            See it in action
          </a>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(true)}
          style={{ color: "rgba(255,255,255,0.7)" }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: BG }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-end p-6">
              <button
                onClick={() => setOpen(false)}
                style={{ color: "rgba(255,255,255,0.7)" }}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-10 mt-12">
              <a
                href="#industries"
                className="text-2xl"
                style={{ color: BONE, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}
                onClick={() => setOpen(false)}
              >
                Industries
              </a>
              <a
                href="#pricing"
                className="text-2xl"
                style={{ color: BONE, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}
                onClick={() => setOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="px-8 py-4 rounded-full text-base font-semibold"
                style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => setOpen(false)}
              >
                See it in action
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Mārama Moon — triple halo crescent ──────────────────────── */
// Warm cream-gold (#C4A870) crescent with three nested glow halos
const MOON = "#C4A870";
const MaramaMoon = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none" aria-hidden="true">
    <defs>
      <filter id="moon-core" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <mask id="crescent-m">
        <circle cx="130" cy="130" r="84" fill="white" />
        <circle cx="163" cy="120" r="72" fill="black" />
      </mask>
    </defs>
    {/* Halo 3 — outermost, very faint */}
    <circle cx="130" cy="130" r="116" fill={MOON} opacity="0.025" />
    {/* Halo 2 */}
    <circle cx="130" cy="130" r="100" fill={MOON} opacity="0.04" />
    {/* Halo 1 — inner atmospheric glow */}
    <circle cx="130" cy="130" r="88" fill={MOON} opacity="0.06" />
    {/* Crescent body */}
    <circle
      cx="130"
      cy="130"
      r="84"
      fill={MOON}
      mask="url(#crescent-m)"
      filter="url(#moon-core)"
      opacity="0.82"
    />
  </svg>
);


/* ─── Industry accordion ───────────────────────────────────────── */
type Industry = {
  name: string;
  agents: string;
  icon: ElementType;
  to: string;
  accent: string;  // muted moonlit tint — not neon
};

// Accents are desaturated / darkened so they read as moonlit, not neon
const INDUSTRIES: Industry[] = [
  { name: "Hospitality",          agents: "Food safety, liquor licensing, guest experience, menus, adventure tourism",        icon: UtensilsCrossed, to: "/manaaki",        accent: "#B8965A" },
  { name: "Construction",         agents: "Site safety, BIM, consenting, tender writing, project management",                 icon: HardHat,         to: "/hanga",           accent: "#3A7D6E" },
  { name: "Creative",             agents: "Copy, design, campaign management, video, podcast, social, analytics",             icon: Palette,         to: "/auaha",           accent: "#A07840" },
  { name: "Business",             agents: "Accounting, payroll, HR, insurance, retail, trade, agriculture",                   icon: Briefcase,       to: "/pakihi",          accent: "#4A6D9A" },
  { name: "Technology",           agents: "Security, DevOps, infrastructure, monitoring, IP management",                      icon: Cpu,             to: "/hangarau",        accent: "#3A8090" },
  { name: "Language & Culture",   agents: "Te reo Māori, tikanga alignment, iwi reporting, data sovereignty",                 icon: Globe,           to: "/te-kahui-reo",    accent: "#8A5A6A" },
  { name: "Health & Wellbeing",   agents: "Sport, health, nutrition, beauty, lifestyle, travel planning",                     icon: HeartPulse,      to: "/kete/hauora",     accent: "#3A7A50" },
  { name: "Transport & Logistics",agents: "Automotive, maritime, trucking, dealership compliance, heavy vehicle logbooks",    icon: Compass,         to: "/kete/waka",       accent: "#8A6040" },
];

const IndustryRow = ({ industry }: { industry: Industry }) => {
  const [open, setOpen] = useState(false);
  const Icon = industry.icon;
  const { accent } = industry;

  return (
    <motion.div
      className="border-b"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        borderLeft: open ? `2px solid ${accent}` : "2px solid transparent",
        paddingLeft: open ? "8px" : "8px",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: open ? `inset 3px 0 12px ${accent}18` : "none",
      }}
    >
      <button
        className="w-full flex items-center justify-between py-6 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: open ? `${accent}20` : "rgba(255,255,255,0.04)",
            }}
          >
            <Icon size={16} style={{ color: open ? accent : "rgba(255,255,255,0.4)", transition: "color 0.2s" }} />
          </div>
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(15px, 2.5vw, 19px)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: open ? "#FFFFFF" : "rgba(255,255,255,0.65)",
              transition: "color 0.2s",
            }}
          >
            {industry.name}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: open ? `${accent}` : "rgba(255,255,255,0.2)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s, color 0.3s",
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-6 pl-12">
              <p
                className="text-sm mb-3 max-w-xl"
                style={{
                  color: "rgba(255,255,255,0.48)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.75,
                }}
              >
                {industry.agents}
              </p>
              <Link
                to={industry.to}
                className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
                style={{ color: accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                See what's included <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── What Changes cards ───────────────────────────────────────── */
const OUTCOMES = [
  {
    title: "Close Faster",
    body: "Better proposals start with speed. Assembl cuts the busywork so your team pitches more, quotes tighter, closes harder.",
  },
  {
    title: "Stop Juggling",
    body: "Payroll, tax, compliance, schedules. Assembl runs the back office so your team runs the business.",
  },
  {
    title: "Alerts That Count",
    body: "NZ compliance changes weekly. Assembl flags what affects you — regulation, deadline, opportunity — so you're never caught flat.",
  },
];

/* ─── Pricing ──────────────────────────────────────────────────── */
const SETUP_FEE = 749;
const PLANS = [
  {
    name: "Essentials",
    price: 199,
    desc: "For small teams getting started",
    features: ["2 users", "500 queries/month", "1 industry pack", "Email support"],
    popular: false,
  },
  {
    name: "Business",
    price: 399,
    desc: "For growing businesses with real operations",
    features: ["10 users", "2,000 queries/month", "All industry packs", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 799,
    desc: "For organisations that need everything",
    features: ["Unlimited users", "Unlimited queries", "All packs + custom tools", "White-glove onboarding"],
    popular: false,
  },
];

/* ─── How it works ─────────────────────────────────────────────── */
const HOW_STEPS = [
  { num: "01", title: "Discovery call", body: "We map your workflows and show you exactly which tools apply to your business." },
  { num: "02", title: "Setup", body: "Your platform is configured and ready — typically within 48 hours." },
  { num: "03", title: "First result", body: "You use it on a real business task and see the difference immediately." },
];

/* ─── Page ─────────────────────────────────────────────────────── */
const Index = () => {
  const [annual, setAnnual] = useState(false);

  // Paint the body so the fixed star canvas background shows correctly
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = BG;
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <div style={{ background: "transparent", color: "#FFFFFF", overflowX: "hidden", position: "relative", zIndex: 1 }}>
      <SEO
        title="Assembl — The Operating System for NZ Business"
        description="44 specialist tools across 7 industries. Quoting, payroll, compliance, marketing — connected and intelligent. Built in Aotearoa."
      />
      {/* Persistent star field — fixed behind all content */}
      <StarField />
      <MinimalNav />

      {/* ═══ 1. HERO ═══ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16"
      >

        {/* Mārama moon — top right */}
        <div className="absolute top-6 right-6 md:top-10 md:right-14 pointer-events-none" style={{ zIndex: 1 }}>
          <MaramaMoon />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Wordmark */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CelestialLogo size={44} />
            <span
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                letterSpacing: "8px",
                textTransform: "uppercase",
                fontSize: "14px",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              ASSEMBL
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              lineHeight: 1.1,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            The operating system
            <br />
            <span style={{ color: GOLD }}>for NZ business.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mt-7 max-w-lg mx-auto text-lg md:text-xl leading-relaxed"
            style={{ color: BONE, opacity: 0.68, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Quoting, payroll, compliance, marketing — connected and intelligent. One platform instead of twelve.
          </motion.p>

          {/* Badge */}
          <motion.p
            className="mt-3 text-sm"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            44 specialist tools across 7 industries · Built in Aotearoa
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-11"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:brightness-110"
              style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              See it in action <ArrowRight size={16} />
            </a>
            <a
              href="#industries"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base transition-all hover:text-white"
              style={{
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Choose your industry <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>

        {/* Scroll line */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 1,
              height: 36,
              background: `linear-gradient(to bottom, transparent, ${GOLD}40)`,
              margin: "0 auto",
            }}
          />
        </motion.div>
      </section>

      {/* ═══ 2. WHAT CHANGES ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-28">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              What changes in your first month
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.title}
                className="rounded-2xl p-8"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderLeft: `3px solid ${TEAL}`,
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
              >
                <div className="w-8 h-[2px] rounded mb-6" style={{ background: GOLD }} />
                <h3
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    fontSize: "22px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#FFFFFF",
                    marginBottom: "12px",
                  }}
                >
                  {o.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "15px",
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  {o.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. INDUSTRIES ═══ */}
      <section id="industries" className="min-h-screen flex flex-col justify-center px-6 py-28">
        <div className="max-w-3xl mx-auto w-full">
          <motion.div className="mb-14" {...fadeUp}>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Choose your industry
            </h2>
            <p
              className="mt-4 text-base max-w-md"
              style={{
                color: "rgba(255,255,255,0.42)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.7,
              }}
            >
              Every industry runs differently. Assembl is built around yours.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
          >
            {INDUSTRIES.map((ind) => (
              <IndustryRow key={ind.name} industry={ind} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 4. PRICING ═══ */}
      <section id="pricing" className="min-h-screen flex flex-col justify-center px-6 py-28">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div className="text-center mb-4" {...fadeUp}>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              className="mt-3 text-sm"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              ${SETUP_FEE} NZD + GST one-time setup · All prices NZD + GST
            </p>
          </motion.div>

          {/* Annual toggle */}
          <motion.div
            className="flex items-center justify-center gap-4 mt-7 mb-12"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            <span
              className="text-sm"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: annual ? "rgba(255,255,255,0.32)" : "#FFFFFF",
                transition: "color 0.2s",
              }}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full transition-colors duration-300"
              style={{ background: annual ? GOLD : "rgba(255,255,255,0.12)" }}
              aria-label="Toggle annual billing"
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-300"
                style={{
                  background: annual ? BG : "rgba(255,255,255,0.9)",
                  transform: annual ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </button>
            <span
              className="text-sm flex items-center gap-2"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: annual ? "#FFFFFF" : "rgba(255,255,255,0.32)",
                transition: "color 0.2s",
              }}
            >
              Annual
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${TEAL}28`, color: TEAL }}
              >
                Save 20%
              </span>
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {PLANS.map((p, i) => {
              const displayPrice = annual ? Math.round(p.price * 0.8) : p.price;
              return (
                <motion.div
                  key={p.name}
                  className="rounded-2xl p-7 relative flex flex-col"
                  style={{
                    background: p.popular ? "rgba(58,125,110,0.07)" : "rgba(255,255,255,0.02)",
                    border: p.popular
                      ? `1px solid rgba(58,125,110,0.35)`
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.75, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  {p.popular && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: TEAL, color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      Most popular
                    </div>
                  )}
                  <div className="flex-1">
                    <h3
                      className="text-sm mb-1"
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 400,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#FFFFFF",
                      }}
                    >
                      {p.name}
                    </h3>
                    <p
                      className="text-xs mb-5"
                      style={{
                        color: "rgba(255,255,255,0.36)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        lineHeight: 1.5,
                      }}
                    >
                      {p.desc}
                    </p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span
                        className="text-4xl font-light"
                        style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}
                      >
                        ${displayPrice}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.32)" }}>
                        /mo
                      </span>
                    </div>
                    <ul className="space-y-2.5 mb-7">
                      {p.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs"
                          style={{
                            color: "rgba(255,255,255,0.48)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            lineHeight: 1.5,
                          }}
                        >
                          <CheckCircle2 size={12} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href="#contact"
                    className="block text-center py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
                    style={{
                      background: p.popular ? TEAL : "transparent",
                      color: p.popular ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                      border: p.popular ? "none" : "1px solid rgba(255,255,255,0.14)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Start free
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-28">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div className="text-center mb-20" {...fadeUp}>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              How it works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.75, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="text-8xl font-light leading-none mb-6"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    color: "rgba(212,168,67,0.07)",
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.num}
                </div>
                <h3
                  className="text-lg mb-3"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#FFFFFF",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(255,255,255,0.46)",
                    lineHeight: 1.75,
                    fontSize: "15px",
                  }}
                >
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. TRUST ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Built in Aotearoa, for Aotearoa
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14">
              {[
                { Icon: Shield, label: "NZ-owned and operated" },
                { Icon: CheckCircle2, label: "Data stays in New Zealand" },
                { Icon: Star, label: "Tikanga Māori governance" },
                { Icon: CheckCircle2, label: "Cancel anytime" },
              ].map((t, i) => (
                <motion.div
                  key={t.label}
                  className="flex flex-col items-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <t.Icon size={22} style={{ color: TEAL }} />
                  <p
                    className="text-sm leading-relaxed text-center"
                    style={{
                      color: "rgba(255,255,255,0.48)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {t.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TŌROA CALLOUT ═══ */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-3xl mx-auto rounded-2xl px-10 py-12 flex flex-col md:flex-row items-center gap-8"
          style={{
            background: "rgba(58,125,110,0.06)",
            border: "1px solid rgba(58,125,110,0.2)",
          }}
          {...fadeUp}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(58,125,110,0.15)" }}>
            <Heart size={22} style={{ color: TEAL }} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p
              className="text-xs mb-2"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: TEAL,
              }}
            >
              Also from Assembl
            </p>
            <h3
              className="mb-2"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "22px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              Tōroa — Family Navigator
            </h3>
            <p
              className="text-sm"
              style={{
                color: "rgba(255,255,255,0.48)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.7,
              }}
            >
              A standalone SMS-first family tool for Aotearoa whānau. No app, no login — just text. $29/month.
            </p>
          </div>
          <Link
            to="/toroa"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-90 whitespace-nowrap"
            style={{
              border: `1px solid ${TEAL}`,
              color: TEAL,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Learn more <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* ═══ 7. FOOTER CTA ═══ */}
      <section id="contact" className="py-32 px-6 text-center">
        <motion.div {...fadeUp}>
          <h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            See it in action
          </h2>
          <p
            className="mt-4 text-base max-w-sm mx-auto"
            style={{
              color: "rgba(255,255,255,0.42)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.75,
            }}
          >
            Book a 20-minute demo. We'll show you exactly how Assembl handles your industry.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-full text-base font-semibold transition-all hover:brightness-110"
            style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Book a demo <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              letterSpacing: "6px",
              textTransform: "uppercase",
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            ASSEMBL
          </span>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: "Platform", to: "/app" },
              { label: "How It Works", to: "/how-it-works" },
              { label: "Pricing", to: "/pricing" },
              { label: "Contact", to: "/contact" },
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm transition-colors hover:text-white"
                style={{
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p
            className="text-xs"
            style={{
              color: "rgba(255,255,255,0.16)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            © 2025 Assembl Ltd
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
