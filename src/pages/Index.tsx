import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Menu, X } from "lucide-react";
import SEO from "@/components/SEO";
import CelestialLogo from "@/components/CelestialLogo";

/* ─── Brand tokens ──────────────────────────────────────────────── */
const BG   = "#09090F";
const GOLD = "#C4A870";
const TEAL = "#3A7D6E";
const BONE = "#F5F0E8";

/* ─── CSS animations ────────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes eclipse-breathe {
    0%,100% { transform: scale(1);    }
    50%      { transform: scale(1.025); }
  }
  @keyframes eclipse-base-glow {
    0%,100% {
      box-shadow:
        0 0 18px rgba(196,168,112,0.40),
        0 0 50px rgba(196,168,112,0.18),
        0 0 110px rgba(196,168,112,0.07),
        inset 0 0 18px rgba(196,168,112,0.08);
    }
    50% {
      box-shadow:
        0 0 28px rgba(196,168,112,0.60),
        0 0 75px rgba(196,168,112,0.28),
        0 0 160px rgba(196,168,112,0.10),
        inset 0 0 28px rgba(196,168,112,0.12);
    }
  }
  @keyframes eclipse-flare-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes moon-breathe {
    0%,100% { transform: scale(1);    opacity: 0.90; }
    50%      { transform: scale(1.02); opacity: 1;    }
  }
  @keyframes moon-glow {
    0%,100% {
      box-shadow:
        0 0 40px rgba(196,168,112,0.40),
        0 0 100px rgba(196,168,112,0.18),
        0 0 200px rgba(196,168,112,0.07);
    }
    50% {
      box-shadow:
        0 0 60px rgba(196,168,112,0.60),
        0 0 140px rgba(196,168,112,0.28),
        0 0 280px rgba(196,168,112,0.10);
    }
  }
  .eclipse-ring-wrap {
    animation: eclipse-breathe 5s ease-in-out infinite;
  }
  .eclipse-ring-base {
    animation: eclipse-base-glow 5s ease-in-out infinite;
  }
  .eclipse-ring-flare {
    animation: eclipse-flare-spin 22s linear infinite;
    mask-image: radial-gradient(circle, transparent 44%, black 46.5%, black 53.5%, transparent 56%);
    -webkit-mask-image: radial-gradient(circle, transparent 44%, black 46.5%, black 53.5%, transparent 56%);
  }
`;

/* ─── Scroll fade-up ────────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

/* ─── Industry data ─────────────────────────────────────────────── */
type IndustryData = {
  name: string;
  accent: string;
  painPoints: string[];
  agents: { role: string; desc: string }[];
};

const INDUSTRIES: IndustryData[] = [
  {
    name: "Hospitality",
    accent: "#B8965A",
    painPoints: [
      "Food safety audit in 48 hours. Your paperwork is in three different places.",
      "Employment law changed. You found out from a staff member.",
      "Quoting a venue event takes 3 days. You lost the gig.",
    ],
    agents: [
      { role: "Compliance",          desc: "Food safety, liquor licensing, health & safety — current and audit-ready." },
      { role: "Employment",          desc: "Agreements, wage rates, leave entitlements aligned to NZ law." },
      { role: "Quoting & Proposals", desc: "Fast, professional quotes with margin built in." },
      { role: "Guest Experience",    desc: "Review management, feedback loops, rebooking workflows." },
    ],
  },
  {
    name: "Construction",
    accent: "#3A7D6E",
    painPoints: [
      "H&S audit next week. Your site forms are everywhere.",
      "Retention money compliance — are you actually covered?",
      "Subcontractor payments are overdue. Again.",
    ],
    agents: [
      { role: "Site Safety",         desc: "ARAI — hazard registers, toolbox meetings, incident reports." },
      { role: "Consenting",          desc: "WHAKAAE — council submissions, code compliance, sign-off tracking." },
      { role: "Tender Writing",      desc: "PAI — professional tenders faster, with the right pricing logic." },
      { role: "Project Management",  desc: "KAUPAPA — timelines, subcontractor management, milestone tracking." },
    ],
  },
  {
    name: "Creative",
    accent: "#A07840",
    painPoints: [
      "Client needs the campaign brief by morning. You haven't started.",
      "Your contracts don't cover IP ownership properly.",
      "Three platforms. Three briefs. No bandwidth.",
    ],
    agents: [
      { role: "Campaign Builder",    desc: "Brief to schedule in one place — copy, visuals, platform, timing." },
      { role: "Copy Studio",         desc: "Ads, emails, social, web — on brand and on brief, fast." },
      { role: "Brand Identity",      desc: "Guidelines, asset management, consistency across the team." },
      { role: "Analytics",           desc: "What's working, what's not, and what to do next." },
    ],
  },
  {
    name: "Business",
    accent: "#4A6D9A",
    painPoints: [
      "GST return due Friday. You haven't started.",
      "Your employment agreements are from 2019.",
      "Three systems for payroll, invoicing, and scheduling. None talk to each other.",
    ],
    agents: [
      { role: "Accounting",          desc: "GST, invoicing, cashflow — sorted without the spreadsheet chaos." },
      { role: "HR & Employment",     desc: "Agreements, onboarding, performance — NZ employment law built in." },
      { role: "Payroll",             desc: "Wages, PAYE, leave balances — accurate and on time." },
      { role: "Compliance",          desc: "Regulatory changes flagged before they become your problem." },
    ],
  },
  {
    name: "Technology",
    accent: "#3A8090",
    painPoints: [
      "A client asked for your security policy. You don't have one.",
      "Deployment went down at midnight. No documented runbook.",
      "IP ownership clauses in your dev contracts are dangerously vague.",
    ],
    agents: [
      { role: "Security",            desc: "SIGNAL — policies, pen test prep, incident response, compliance." },
      { role: "DevOps",              desc: "Runbooks, deployment docs, incident logs — structured and findable." },
      { role: "Infrastructure",      desc: "Architecture docs, capacity planning, monitoring frameworks." },
      { role: "IP & Contracts",      desc: "Dev agreements, IP clauses, SaaS terms — NZ tech context." },
    ],
  },
  {
    name: "Language & Culture",
    accent: "#8A5A6A",
    painPoints: [
      "Your iwi report needs te reo translation. Your team isn't confident.",
      "A funder asked about your data sovereignty policy. You froze.",
      "Cultural consultation is absent from your project plan.",
    ],
    agents: [
      { role: "Te Reo Māori",        desc: "Quality reo for documents, communications, and public-facing content." },
      { role: "Tikanga Guidance",    desc: "Cultural alignment for projects, events, and engagement." },
      { role: "Iwi Reporting",       desc: "Structured, culturally grounded reporting for iwi and community." },
      { role: "Data Sovereignty",    desc: "Māori data governance frameworks and FNDC-aligned policies." },
    ],
  },
  {
    name: "Health & Wellbeing",
    accent: "#3A7A50",
    painPoints: [
      "A new client regime needs a tailored nutrition plan. Built from scratch every time.",
      "Health and safety compliance for your studio changed. You missed it.",
      "Your rebooking rate is dropping and you have no idea why.",
    ],
    agents: [
      { role: "Client Management",   desc: "Records, progress tracking, rebooking — one place, no paper." },
      { role: "Compliance",          desc: "Studio H&S, ACC, professional standards — flagged when they change." },
      { role: "Nutrition Planning",  desc: "Evidence-based plans built for client specifics, fast." },
      { role: "Analytics",           desc: "Retention patterns, peak hours, revenue per session — clear." },
    ],
  },
  {
    name: "Transport & Logistics",
    accent: "#8A6040",
    painPoints: [
      "Logbook audit next month. Your records are incomplete.",
      "A heavy vehicle rule changed. You're not sure if you're compliant.",
      "Fuel costs are up 12%. Your quoting hasn't moved.",
    ],
    agents: [
      { role: "Vehicle Compliance",  desc: "WOF, RUC, COF — tracked and flagged before they lapse." },
      { role: "Logbook Management",  desc: "Driver hours, rest requirements, audit-ready records." },
      { role: "Fleet Management",    desc: "Maintenance schedules, vehicle costs, replacement planning." },
      { role: "Pricing & Quoting",   desc: "Margin-aware quoting that reflects your actual fuel and labour costs." },
    ],
  },
];

const SETUP_FEE = 749;
const PLANS = [
  {
    name: "Essentials", price: 199,
    desc: "For small teams getting started",
    features: ["2 users", "500 queries/month", "1 industry pack", "Email support"],
    popular: false,
  },
  {
    name: "Business", price: 399,
    desc: "For growing teams with real operations",
    features: ["10 users", "2,000 queries/month", "All industry packs", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise", price: 799,
    desc: "For organisations that need everything",
    features: ["Unlimited users", "Unlimited queries", "All packs + custom tools", "White-glove onboarding"],
    popular: false,
  },
];

/* ─── Minimal nav ───────────────────────────────────────────────── */
const MinimalNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 h-16"
        style={{ background: "transparent" }}>
        <Link to="/" className="flex items-center gap-2.5">
          <CelestialLogo size={28} />
          <span style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            letterSpacing: "6px", textTransform: "uppercase",
            fontSize: "12px", color: "rgba(255,255,255,0.8)",
          }}>ASSEMBL</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#industries" className="text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.48)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Industries
          </a>
          <a href="#pricing" className="text-sm transition-colors hover:text-white"
            style={{ color: "rgba(255,255,255,0.48)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Pricing
          </a>
          <a href="#cta"
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            See it in action
          </a>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(true)}
          style={{ color: "rgba(255,255,255,0.65)" }} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] flex flex-col" style={{ background: BG }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end p-6">
              <button onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.65)" }}>
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-10 mt-12">
              <a href="#industries" className="text-2xl"
                style={{ color: BONE, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}
                onClick={() => setOpen(false)}>Industries</a>
              <a href="#pricing" className="text-2xl"
                style={{ color: BONE, fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px", textTransform: "uppercase" }}
                onClick={() => setOpen(false)}>Pricing</a>
              <a href="#cta" className="px-8 py-4 rounded-full text-base font-semibold"
                style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => setOpen(false)}>See it in action</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─── Particle Eclipse (canvas) ────────────────────────────────── */
const PARTICLE_COUNT = 2500;
const DOT_HEX = ["#C4A870", "#F5F0E8", "#FFFFFF"] as const;

type Dot = {
  x0: number; y0: number;
  phaseX: number; phaseY: number;
  freqX: number; freqY: number;
  amp: number;
  r: number;
  ci: number;
  alpha: number;
};

const CANVAS_PX = 500;

const ParticleEclipse = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const t0Ref   = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = CANVAS_PX * dpr;
    canvas.height = CANVAS_PX * dpr;
    ctx.scale(dpr, dpr);

    const cx = CANVAS_PX / 2;
    const cy = CANVAS_PX / 2;
    const ringR = CANVAS_PX * 0.36;   // mean ring radius
    const bandW = CANVAS_PX * 0.13;   // ring band width (±)

    // Gaussian-ish distribution within the band
    const gauss = () => ((Math.random() + Math.random() + Math.random()) / 3 - 0.5);

    const dots: Dot[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const rad   = ringR + gauss() * bandW;
      dots.push({
        x0:    cx + rad * Math.cos(theta),
        y0:    cy + rad * Math.sin(theta),
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        freqX:  0.18 + Math.random() * 0.44,
        freqY:  0.18 + Math.random() * 0.44,
        amp:    1.2 + Math.random() * 2.8,
        r:      0.6 + Math.random() * 1.1,
        ci:     Math.floor(Math.random() * DOT_HEX.length),
        alpha:  0.35 + Math.random() * 0.65,
      });
    }
    dotsRef.current = dots;

    const draw = (ts: number) => {
      if (!t0Ref.current) t0Ref.current = ts;
      const t = (ts - t0Ref.current) / 1000;

      // Slow breathing scale
      const scale = 1 + 0.022 * Math.sin(t * 0.45);

      ctx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      for (const d of dots) {
        const x = d.x0 + d.amp * Math.sin(t * d.freqX + d.phaseX);
        const y = d.y0 + d.amp * Math.cos(t * d.freqY + d.phaseY);
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle   = DOT_HEX[d.ci];
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        width:  "min(440px, calc(100vw - 48px))",
        height: "min(440px, calc(100vw - 48px))",
        flexShrink: 0,
      }}
    />
  );
};

/* ─── Full moon — section 4 transformation ──────────────────────── */
const FullMoon = ({ size = 200 }: { size?: number }) => (
  <div aria-hidden="true" style={{
    width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 38% 35%,
      rgba(255,250,238,0.92) 0%,
      rgba(220,195,145,0.80) 32%,
      rgba(196,168,112,0.62) 56%,
      rgba(160,130,80,0.24) 76%,
      transparent 90%
    )`,
    animation: "moon-breathe 5s ease-in-out infinite, moon-glow 5s ease-in-out infinite",
    flexShrink: 0,
  }} />
);

/* ─── Small eclipse mark ────────────────────────────────────────── */
const EclipseMark = ({ size = 64 }: { size?: number }) => (
  <div aria-hidden="true" style={{
    width: size, height: size, borderRadius: "50%",
    border: "1px solid rgba(196,168,112,0.48)",
    boxShadow: "0 0 14px rgba(196,168,112,0.28), 0 0 40px rgba(196,168,112,0.10)",
    animation: "eclipse-breathe 4.5s ease-in-out infinite",
    flexShrink: 0,
  }} />
);

/* ─── Count-up step ─────────────────────────────────────────────── */
const CountStep = ({ num, title, body, delay }: {
  num: string; title: string; body: string; delay: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("00");

  useEffect(() => {
    if (!inView) return;
    const target = parseInt(num, 10);
    let step = 0;
    const total = 20;
    const id = setInterval(() => {
      step++;
      if (step >= total) { setDisplay(num); clearInterval(id); }
      else setDisplay(String(Math.min(Math.ceil((step / total) * target), target)).padStart(2, "0"));
    }, 40);
    return () => clearInterval(id);
  }, [inView, num]);

  return (
    <motion.div ref={ref} className="flex flex-col items-center md:items-start text-center md:text-left"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
      <span style={{
        fontFamily: "'Lato', sans-serif", fontWeight: 300,
        fontSize: "clamp(4.5rem, 9vw, 7.5rem)",
        lineHeight: 1, letterSpacing: "-0.04em",
        color: "rgba(196,168,112,0.10)", display: "block", marginBottom: "1rem",
      }}>{display}</span>
      <h3 style={{
        fontFamily: "'Lato', sans-serif", fontWeight: 300,
        fontSize: "clamp(1rem, 2.2vw, 1.3rem)",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "#FFFFFF", marginBottom: "0.5rem",
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "15px", lineHeight: 1.75,
        color: "rgba(255,255,255,0.42)", maxWidth: "200px",
      }}>{body}</p>
    </motion.div>
  );
};

/* ─── Page ──────────────────────────────────────────────────────── */
const Index = () => {
  const [selected, setSelected] = useState<IndustryData | null>(null);
  const [annual, setAnnual] = useState(false);
  const industryDetailRef = useRef<HTMLElement>(null);

  const handleSelect = (ind: IndustryData) => {
    setSelected(ind);
    setTimeout(() => {
      industryDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const industry = selected ?? INDUSTRIES[0];

  return (
    <div style={{ background: BG, color: "#FFFFFF", overflowX: "hidden" }}>
      <style>{KEYFRAMES}</style>
      <SEO
        title="Assembl — The Operating System for NZ Business"
        description="44 specialist tools across 8 industries. Quoting, payroll, compliance, marketing — connected and intelligent. Built in Aotearoa."
      />
      <MinimalNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-screen flex items-center px-6 sm:px-12 pt-16">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24">

          {/* Left — headline + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}>
            <p className="mb-5 text-xs tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.22)", fontFamily: "'JetBrains Mono', monospace" }}>
              Built for Aotearoa
            </p>
            <h1 style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300,
              fontSize: "clamp(2rem, 5vw, 3.6rem)",
              letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.2,
            }}>
              The operating<br />system for<br />
              <span style={{ color: GOLD }}>NZ business.</span>
            </h1>
            <p className="mt-6 text-base max-w-sm" style={{
              color: BONE, opacity: 0.52,
              fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.75,
            }}>
              Quoting, payroll, compliance, marketing — connected and intelligent.
            </p>
            <p className="mt-3 text-sm" style={{
              color: "rgba(255,255,255,0.20)",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
            }}>
              Choose your industry ↓
            </p>
            <motion.div className="flex flex-col sm:flex-row gap-4 mt-9"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <a href="#industries"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Find your industry <ArrowRight size={15} />
              </a>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-sm transition-all hover:text-white"
                style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.09)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                How it works
              </a>
            </motion.div>
          </motion.div>

          {/* Right — particle eclipse ring */}
          <motion.div className="flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
            <ParticleEclipse />
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 32, background: `linear-gradient(to bottom, transparent, ${GOLD}45)` }} />
        </motion.div>
      </section>

      {/* ═══ 2. INDUSTRY SELECTOR ═══ */}
      <section id="industries" className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div className="mb-14" {...fadeUp}>
            <p className="text-xs mb-3" style={{
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
            }}>Step one</p>
            <h2 style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300,
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              What do you do?
            </h2>
          </motion.div>

          <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            {INDUSTRIES.map((ind) => (
              <motion.button
                key={ind.name}
                className="rounded-xl px-4 py-5 text-left transition-all"
                style={{
                  background: selected?.name === ind.name ? `${ind.accent}14` : "rgba(255,255,255,0.02)",
                  border: selected?.name === ind.name
                    ? `1px solid ${ind.accent}55`
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: selected?.name === ind.name
                    ? `0 0 30px ${ind.accent}18`
                    : "none",
                }}
                onClick={() => handleSelect(ind)}
                whileHover={{
                  background: `${ind.accent}0e`,
                  borderColor: `${ind.accent}40`,
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="block w-1.5 h-1.5 rounded-full mb-3" style={{ background: ind.accent, opacity: 0.7 }} />
                <span style={{
                  fontFamily: "'Lato', sans-serif", fontWeight: 300,
                  fontSize: "13px", letterSpacing: "0.07em", textTransform: "uppercase",
                  color: selected?.name === ind.name ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                }}>
                  {ind.name}
                </span>
              </motion.button>
            ))}
          </motion.div>

          {!selected && (
            <motion.p className="mt-8 text-sm" style={{
              color: "rgba(255,255,255,0.22)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Select your industry to see what's relevant to your business.
            </motion.p>
          )}
        </div>
      </section>

      {/* ═══ 3. YOUR INDUSTRY — personalised ═══ */}
      <section ref={industryDetailRef} className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={industry.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

              <p className="text-xs mb-3" style={{
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em",
                textTransform: "uppercase", color: industry.accent,
              }}>
                Assembl for
              </p>
              <h2 className="mb-10" style={{
                fontFamily: "'Lato', sans-serif", fontWeight: 300,
                fontSize: "clamp(2rem, 5vw, 3.8rem)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {industry.name}
              </h2>

              {/* Pain points */}
              <div className="space-y-4 mb-14">
                {industry.painPoints.map((pt, i) => (
                  <motion.div
                    key={pt}
                    className="flex items-start gap-4 py-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0"
                      style={{ background: industry.accent, opacity: 0.65 }} />
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "16px", lineHeight: 1.7,
                      color: "rgba(255,255,255,0.62)",
                    }}>
                      {pt}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.p className="mb-2 text-xs" style={{
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
              }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                Here's what changes →
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ 4. THE SHIFT — your tools ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={`shift-${industry.name}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}>

              <div className="flex flex-col md:flex-row md:items-start gap-12">
                {/* Full moon visual */}
                <div className="flex-shrink-0 flex items-center justify-center md:pt-2">
                  <FullMoon size={160} />
                </div>

                <div className="flex-1">
                  <p className="text-xs mb-3" style={{
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.12em",
                    textTransform: "uppercase", color: industry.accent,
                  }}>
                    Your {industry.name.toLowerCase()} team
                  </p>
                  <h2 className="mb-8" style={{
                    fontFamily: "'Lato', sans-serif", fontWeight: 300,
                    fontSize: "clamp(1.8rem, 4vw, 3rem)",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                    Four specialists.<br />One platform.
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {industry.agents.map((agent, i) => (
                      <motion.div
                        key={agent.role}
                        className="rounded-xl p-5"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderLeft: `2px solid ${industry.accent}50`,
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                        whileHover={{ borderColor: `${industry.accent}90`, y: -2 }}
                      >
                        <h4 style={{
                          fontFamily: "'Lato', sans-serif", fontWeight: 300,
                          fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                          color: industry.accent, marginBottom: "6px",
                        }}>
                          {agent.role}
                        </h4>
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "13px", lineHeight: 1.6,
                          color: "rgba(255,255,255,0.46)",
                        }}>
                          {agent.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS ═══ */}
      <section id="how-it-works" className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-5xl mx-auto w-full">
          <motion.p className="text-center mb-20 text-xs tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}
            {...fadeUp}>
            How it works
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: "01", title: "We learn your business",  body: "A 20-minute call maps your workflows and identifies the tools that apply to you." },
              { num: "02", title: "Your tools connect",       body: "Platform configured and ready — specialist tools for your industry in 48 hours." },
              { num: "03", title: "You get time back",        body: "Use it on a real task. See the difference on day one." },
            ].map((s, i) => (
              <CountStep key={s.num} num={s.num} title={s.title} body={s.body} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. PRICING ═══ */}
      <section id="pricing" className="min-h-screen flex flex-col justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div className="text-center mb-4" {...fadeUp}>
            <h2 style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300,
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm" style={{
              color: "rgba(255,255,255,0.28)",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em",
            }}>
              ${SETUP_FEE} NZD + GST one-time setup · All prices NZD + GST
            </p>
          </motion.div>

          {/* Annual toggle */}
          <motion.div className="flex items-center justify-center gap-4 mt-7 mb-12"
            {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
            <span className="text-sm" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: annual ? "rgba(255,255,255,0.28)" : "#FFFFFF", transition: "color 0.2s",
            }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className="relative w-11 h-6 rounded-full transition-colors duration-300"
              style={{ background: annual ? GOLD : "rgba(255,255,255,0.1)" }}
              aria-label="Toggle annual billing">
              <div className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-300"
                style={{
                  background: annual ? BG : "rgba(255,255,255,0.82)",
                  transform: annual ? "translateX(22px)" : "translateX(2px)",
                }} />
            </button>
            <span className="text-sm flex items-center gap-2" style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: annual ? "#FFFFFF" : "rgba(255,255,255,0.28)", transition: "color 0.2s",
            }}>
              Annual
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: `${TEAL}28`, color: TEAL }}>Save 20%</span>
            </span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map((p, i) => {
              const price = annual ? Math.round(p.price * 0.8) : p.price;
              return (
                <motion.div key={p.name}
                  className="rounded-2xl p-8 relative flex flex-col"
                  style={{
                    background: p.popular ? "rgba(58,125,110,0.06)" : "rgba(255,255,255,0.02)",
                    border: p.popular ? `1px solid rgba(58,125,110,0.30)` : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: p.popular ? "0 0 60px rgba(58,125,110,0.07)" : "none",
                  }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: p.popular ? -6 : -3 }}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: TEAL, color: "#FFFFFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Most popular
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm mb-1" style={{
                      fontFamily: "'Lato', sans-serif", fontWeight: 400,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFFFFF",
                    }}>{p.name}</h3>
                    <p className="text-xs mb-5" style={{
                      color: "rgba(255,255,255,0.32)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5,
                    }}>{p.desc}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span style={{
                        fontFamily: "'Lato', sans-serif", color: "#FFFFFF",
                        fontSize: "clamp(2.2rem, 4vw, 2.8rem)", fontWeight: 300,
                      }}>${price}</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>/mo</span>
                    </div>
                    <ul className="space-y-2.5 mb-7">
                      {p.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{
                          color: "rgba(255,255,255,0.44)",
                          fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5,
                        }}>
                          <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a href="#cta"
                    className="block text-center py-3 rounded-full text-sm font-medium transition-all hover:opacity-90"
                    style={{
                      background: p.popular ? TEAL : "transparent",
                      color: p.popular ? "#FFFFFF" : "rgba(255,255,255,0.48)",
                      border: p.popular ? "none" : "1px solid rgba(255,255,255,0.12)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                    Start 14-day free trial
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 7. CTA ═══ */}
      <section id="cta" className="py-36 px-6 text-center">
        <motion.div {...fadeUp} className="flex flex-col items-center">
          <EclipseMark size={68} />
          <h2 className="mt-10" style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}>See it in action</h2>
          <p className="mt-3 text-base max-w-xs mx-auto" style={{
            color: "rgba(255,255,255,0.38)",
            fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.75,
          }}>
            20 minutes. Your industry. Your workflows.
          </p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 mt-10 px-10 py-4 rounded-full text-base font-semibold transition-all hover:brightness-110"
            style={{ background: GOLD, color: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Book a demo <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Tōroa callout */}
      <section className="py-10 px-6">
        <motion.div
          className="max-w-2xl mx-auto rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center gap-6"
          style={{ background: "rgba(58,125,110,0.04)", border: "1px solid rgba(58,125,110,0.16)" }}
          {...fadeUp}>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs mb-1.5" style={{
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL,
            }}>Also from Assembl</p>
            <h3 style={{
              fontFamily: "'Lato', sans-serif", fontWeight: 300,
              fontSize: "17px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#FFFFFF",
            }}>Tōroa — Family Navigator</h3>
            <p className="mt-1 text-sm" style={{
              color: "rgba(255,255,255,0.38)",
              fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.65,
            }}>SMS-first. No app, no login. Just text. $29/month.</p>
          </div>
          <Link to="/toroa"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-80 whitespace-nowrap"
            style={{ border: `1px solid ${TEAL}`, color: TEAL, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Learn more <ArrowRight size={13} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300,
            letterSpacing: "6px", textTransform: "uppercase",
            fontSize: "11px", color: "rgba(255,255,255,0.2)",
          }}>ASSEMBL</span>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: "Platform",     to: "/app" },
              { label: "How It Works", to: "/how-it-works" },
              { label: "Pricing",      to: "/pricing" },
              { label: "Contact",      to: "/contact" },
              { label: "Privacy",      to: "/privacy" },
              { label: "Terms",        to: "/terms" },
            ].map(link => (
              <Link key={link.label} to={link.to}
                className="text-sm transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.24)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.14)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            © 2025 Assembl Ltd
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
