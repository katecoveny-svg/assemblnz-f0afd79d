// ============================================================================
// QuietHeroPage — premium "AI works quietly" landing hero
// ----------------------------------------------------------------------------
// Route: /quiet
// Brand: assembl — quiet intelligence, woven to give time back.
// Palette: ivory, pearl, soft stone, champagne gold, misty sage, charcoal text.
// ============================================================================
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ShieldCheck, Sparkles, Mountain } from "lucide-react";
import KeteHero3D from "@/components/hero/KeteHero3D";

const PALETTE = {
  bg: "#FBF7EF",          // warm ivory page
  ivory: "#F4ECD9",
  pearl: "#FFFDF7",
  stone: "#E9DEC8",
  champagne: "#D9BC7A",
  champagneDeep: "#B89456",
  sage: "#C9D8D0",
  charcoal: "#3D4250",
  taupe: "#6F6158",
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.1 },
  }),
};

export default function QuietHeroPage() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: PALETTE.bg, color: PALETTE.charcoal }}
    >
      <Helmet>
        <title>assembl — Quiet intelligence, woven to give time back</title>
        <meta
          name="description"
          content="Premium AI from Aotearoa. Quiet intelligence that handles the busywork so people can focus on what matters most."
        />
      </Helmet>

      {/* ── Background: gold data lines + sparkle layer ─────────────── */}
      <BackgroundLayer />

      {/* ── Top brand bar ──────────────────────────────────────────── */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-8 flex items-center justify-between">
        <div
          className="font-serif text-2xl tracking-tight"
          style={{ color: PALETTE.charcoal, fontFamily: "'Cormorant Garamond', serif" }}
        >
          assembl
        </div>
        <nav className="hidden sm:flex gap-7 text-[13px]" style={{ color: PALETTE.taupe }}>
          <a href="#how" className="hover:text-[color:var(--charcoal)] transition" style={{ ["--charcoal" as any]: PALETTE.charcoal }}>How it works</a>
          <a href="#values" className="hover:opacity-80 transition">Values</a>
          <Link to="/pricing" className="hover:opacity-80 transition">Pricing</Link>
          <Link to="/auth" className="hover:opacity-80 transition">Sign in</Link>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-24 lg:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* LEFT — copy */}
        <div className="lg:col-span-6">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-[12px] tracking-[0.32em] uppercase mb-7"
            style={{ color: PALETTE.champagneDeep }}
          >
            Quiet intelligence, woven to give time back.
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="font-light leading-[1.05] tracking-[-0.01em] text-[44px] sm:text-[58px] lg:text-[72px]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: PALETTE.charcoal,
            }}
          >
            AI that works quietly.
            <br />
            <span style={{ fontStyle: "italic", color: PALETTE.champagneDeep }}>
              So your time comes back.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-7 text-[17px] lg:text-[18px] leading-[1.65] max-w-[520px]"
            style={{ color: PALETTE.taupe }}
          >
            Premium intelligence that handles the busywork so people can focus on
            what matters most.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/demo"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium transition-all hover:translate-y-[-1px]"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.champagne}, ${PALETTE.champagneDeep})`,
                color: "#2A2317",
                boxShadow: "0 12px 28px rgba(184,148,86,0.32)",
              }}
            >
              See what a quiet day looks like
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.6)",
                color: PALETTE.charcoal,
                border: `1px solid ${PALETTE.stone}`,
                backdropFilter: "blur(12px)",
              }}
            >
              Book a demo
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-12 flex items-center gap-3 text-[12px]"
            style={{ color: PALETTE.taupe }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: PALETTE.champagne }}
            />
            Built in Aotearoa · Tikanga-grounded · Privacy-first
          </motion.div>
        </div>

        {/* RIGHT — kete visual, slightly right of centre */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="lg:col-span-6 lg:translate-x-6"
        >
          {/* Replace placeholder with a real Spline scene URL when ready */}
          <KeteHero3D sceneUrl={undefined} />
        </motion.div>
      </section>

      {/* ── THREE GLASS CARDS ─────────────────────────────────────── */}
      <section
        id="values"
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-28 grid md:grid-cols-3 gap-5"
      >
        {[
          {
            icon: <Sparkles className="w-4 h-4" />,
            title: "Works quietly",
            body: "Intelligent automation that runs in the background.",
          },
          {
            icon: <ShieldCheck className="w-4 h-4" />,
            title: "Protects what matters",
            body: "Privacy-first and secure by design.",
          },
          {
            icon: <Mountain className="w-4 h-4" />,
            title: "Made for Aotearoa",
            body: "Grounded in local values and built for the way we work.",
          },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="group rounded-3xl p-7 transition-all hover:-translate-y-1"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: `1px solid ${PALETTE.stone}`,
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 8px 30px rgba(111,97,88,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
              style={{
                background: `linear-gradient(135deg, ${PALETTE.champagne}33, ${PALETTE.sage}55)`,
                color: PALETTE.champagneDeep,
              }}
            >
              {c.icon}
            </div>
            <h3
              className="text-[22px] font-light mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: PALETTE.charcoal }}
            >
              {c.title}
            </h3>
            <p className="text-[14px] leading-[1.65]" style={{ color: PALETTE.taupe }}>
              {c.body}
            </p>
          </motion.div>
        ))}
      </section>

      {/* ── footer whisper ─────────────────────────────────────────── */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-10 text-[11px] flex items-center justify-between" style={{ color: PALETTE.taupe }}>
        <span>© {new Date().getFullYear()} assembl · Aotearoa New Zealand</span>
        <span className="opacity-70">Quiet by design.</span>
      </footer>
    </main>
  );
}

// ============================================================================
// BackgroundLayer — soft champagne data lines + drifting sparkles
// ============================================================================
function BackgroundLayer() {
  return (
    <>
      {/* Vignette wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 35%, rgba(217,188,122,0.18), transparent 55%), radial-gradient(ellipse at 20% 90%, rgba(201,216,208,0.22), transparent 60%)",
        }}
      />

      {/* Faint data lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35]"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(217,188,122,0)" />
            <stop offset="50%" stopColor="rgba(217,188,122,0.55)" />
            <stop offset="100%" stopColor="rgba(217,188,122,0)" />
          </linearGradient>
        </defs>
        {[
          "M 0 200 Q 400 140 800 220 T 1600 180",
          "M 0 420 Q 500 360 1000 460 T 1800 420",
          "M 0 660 Q 350 600 700 680 T 1600 640",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#line-grad)"
            strokeWidth="0.7"
            fill="none"
            strokeDasharray="2 8"
          />
        ))}
      </svg>

      {/* Drifting sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => {
          const top = `${(i * 53) % 100}%`;
          const left = `${(i * 37) % 100}%`;
          const delay = (i % 7) * 0.6;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top,
                left,
                width: 2,
                height: 2,
                background: "rgba(217,188,122,0.85)",
                boxShadow: "0 0 6px rgba(217,188,122,0.55)",
                animation: `quiet-drift 9s ease-in-out ${delay}s infinite`,
                opacity: 0.0,
              }}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes quiet-drift {
          0%, 100% { opacity: 0; transform: translateY(0px); }
          40%      { opacity: 0.9; transform: translateY(-6px); }
          60%      { opacity: 0.7; transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
