import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { toast } from "sonner";

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── starfield canvas ── */
function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, s: Math.random() * 0.3 + 0.1,
    }));
    const draw = () => {
      c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2;
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((s) => {
        s.y += s.s * 0.0003;
        if (s.y > 1) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x * c.width, s.y * c.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${0.15 + Math.random() * 0.15})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── feature cards data ── */
const CARDS = [
  { emoji: "🔍", title: "Find Services", desc: "Ask Tōroa anything: 'Where's the nearest after-hours GP?', 'What financial support can I get as a single parent?', 'How do I apply for a disability allowance?' Tōroa knows NZ services." },
  { emoji: "👨‍👩‍👧‍👦", title: "Whānau Support", desc: "Track family wellbeing, coordinate care across whānau members, keep everyone connected. One place for your family's important information." },
  { emoji: "🧭", title: "Navigate the System", desc: "Health, education, WINZ, ACC, housing — Tōroa cuts through the bureaucracy and tells you exactly what to do, step by step." },
];

const TRUST = [
  "Built by Assembl — Aotearoa's business intelligence platform",
  "Governed by tikanga Māori",
  "Your data stays in Aotearoa",
];

/* ── page ── */
export default function ToroaLandingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("toroa_waitlist").select("id", { count: "exact", head: true }).eq("status", "waiting")
      .then(({ count: c }) => setCount(c ?? 0));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.from("toroa_waitlist").insert({ email: email.trim().toLowerCase(), name: name.trim() || null });
    setLoading(false);
    if (error?.code === "23505") { toast.info("You're already on the list!"); return; }
    if (error) { toast.error("Something went wrong — please try again"); return; }
    setDone(true);
    setCount((c) => (c ?? 0) + 1);
    toast.success("Kia ora! You're on the list. We'll be in touch soon.");
  };

  return (
    <div style={{ background: "#09090F" }} className="min-h-screen text-white font-body relative overflow-hidden">
      <SEO title="Tōroa — Whānau Navigator Waitlist | Assembl" description="Join the waitlist for Tōroa, the AI-powered family navigator built for Aotearoa. Find services, coordinate care, navigate the system." />
      <Starfield />

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 md:pt-32 md:pb-24 min-h-[80vh]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(600px circle at 50% 35%, rgba(212,168,67,0.08), transparent 70%)" }} />

        {/* hero video background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none" src="/videos/toroa-hero.mp4" />

        <motion.div className="relative z-10 max-w-2xl" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.h1 variants={fadeUp} custom={0} className="font-display font-light uppercase mb-4" style={{ letterSpacing: "8px", fontSize: "clamp(36px,6vw,56px)", color: "#D4A843" }}>
            Tōroa
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="font-display font-light uppercase text-lg mb-6" style={{ letterSpacing: "4px", color: "rgba(255,255,255,0.7)" }}>
            Your whānau's navigator
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="font-body text-base md:text-lg mb-8 mx-auto" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 620, lineHeight: 1.8 }}>
            Tōroa helps NZ families find the right services — health, education, financial support, aged care — in seconds. Built for Aotearoa. Speaks te reo Māori.
          </motion.p>
          <motion.div variants={fadeUp} custom={3}>
            <span className="inline-block rounded-lg font-display font-bold text-sm uppercase px-5 py-2" style={{ background: "#3A7D6E", color: "#FFFFFF", letterSpacing: "2px" }}>
              $29 / month
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* WHAT TŌROA DOES */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-light uppercase text-center mb-12" style={{ letterSpacing: "8px", fontSize: "clamp(20px,3vw,28px)", color: "#D4A843" }}>
            What Tōroa Does
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CARDS.map((c, i) => (
              <motion.div key={c.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                className="rounded-2xl p-6"
                style={{ background: "rgba(15,15,26,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(212,168,67,0.2)" }}
              >
                <div className="text-3xl mb-4">{c.emoji}</div>
                <h3 className="font-display font-light uppercase text-sm mb-3" style={{ letterSpacing: "3px", color: "#D4A843" }}>{c.title}</h3>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST FORM */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-display font-light uppercase mb-8" style={{ letterSpacing: "8px", fontSize: "clamp(20px,3vw,28px)", color: "#D4A843" }}>
            Join the Waitlist
          </h2>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl p-8" style={{ background: "rgba(58,125,110,0.2)", border: "1px solid #3A7D6E" }}>
              <p className="text-2xl mb-2">✓</p>
              <p className="font-body" style={{ color: "rgba(255,255,255,0.85)" }}>Kia ora! You're on the list. We'll be in touch soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your.whānau@example.com"
                aria-label="Email address"
                className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none transition-all"
                style={{ background: "#0F0F1A", border: "1px solid rgba(212,168,67,0.3)", color: "#E8E8F0" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#D4A843"; e.currentTarget.style.boxShadow = "0 0 12px rgba(212,168,67,0.2)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                aria-label="Name"
                className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none transition-all"
                style={{ background: "#0F0F1A", border: "1px solid rgba(212,168,67,0.3)", color: "#E8E8F0" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#D4A843"; e.currentTarget.style.boxShadow = "0 0 12px rgba(212,168,67,0.2)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg px-6 py-3 font-display font-semibold uppercase text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #D4A843 0%, #C19A2C 100%)", color: "#09090F", letterSpacing: "2px" }}
              >
                {loading ? "Joining…" : "Join the Waitlist"}
              </button>
            </form>
          )}

          {count !== null && (
            <p className="mt-6 font-mono text-sm" style={{ color: "#A8A8B8" }}>
              {count} whānau already waiting
            </p>
          )}
        </div>
      </section>

      {/* TRUST */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-light uppercase text-center mb-10" style={{ letterSpacing: "8px", fontSize: "clamp(20px,3vw,28px)", color: "#D4A843" }}>
            Why Tōroa?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TRUST.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-xl p-6 text-center"
                style={{ border: "1px solid rgba(212,168,67,0.12)" }}
              >
                <p className="font-body text-sm" style={{ color: "#A8A8B8", lineHeight: 1.7 }}>{t}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8">
            <a href="https://assemblnz.lovable.app" className="font-body text-sm underline-offset-4 hover:underline" style={{ color: "#D4A843" }}>
              Learn more at assembl.co.nz →
            </a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-10 text-center" style={{ borderTop: "1px solid rgba(212,168,67,0.1)" }}>
        <p className="font-body text-sm" style={{ color: "#A8A8B8" }}>
          <a href="https://assemblnz.lovable.app" style={{ color: "#D4A843" }}>assembl.co.nz</a> | <a href="mailto:assembl@assembl.co.nz" style={{ color: "#D4A843" }}>assembl@assembl.co.nz</a>
        </p>
        <p className="font-body text-xs mt-2" style={{ color: "rgba(168,168,184,0.6)" }}>
          Tōroa is part of the Assembl platform
        </p>
      </footer>
    </div>
  );
}
