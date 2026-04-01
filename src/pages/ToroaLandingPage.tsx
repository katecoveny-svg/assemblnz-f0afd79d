import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import toroaLogo from "@/assets/brand/toroa-logo.svg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

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

/* ── Feature showcase cards ── */
const HERO_FEATURES = [
  {
    icon: Camera,
    title: "Photo → school notice parsed",
    desc: "Snap a photo of a school newsletter or notice. Tōroa reads it, extracts dates, events, and deadlines, then adds them to your family calendar automatically.",
    color: "#D4A843",
  },
  {
    icon: CalendarDays,
    title: "Calendar sync & gear lists",
    desc: "School events, sports fixtures, and practices sync to one calendar. Tōroa auto-generates packing and gear lists the night before — so nothing gets forgotten.",
    color: "#3A7D6E",
  },
  {
    icon: Utensils,
    title: "Photo your fridge → meal plan + shopping list",
    desc: "Take a photo of what's in your fridge. Tōroa creates a weekly meal plan from what you have, then builds a smart shopping list for what you need.",
    color: "#D4A843",
  },
  {
    icon: Bus,
    title: "Live Auckland bus tracking",
    desc: "Real-time Auckland Transport bus positions. Know exactly when the school bus is arriving — no more standing in the rain guessing.",
    color: "#1A6B9C",
  },
  {
    icon: CloudSun,
    title: "Live weather → dress the kids",
    desc: "Tōroa checks the morning weather and texts you what the kids should wear today. Rain jacket? Sunhat? Shorts or long pants? Sorted.",
    color: "#3A7D6E",
  },
  {
    icon: Lock,
    title: "Safe & secure family chat",
    desc: "A private, encrypted family messaging space. No ads, no strangers, no algorithmic feeds — just your whānau, kept safe.",
    color: "#D4A843",
  },
];

const MORE_FEATURES = [
  { icon: Bell, title: "Smart reminders", desc: "Permission slips, rego renewals, vet appointments, bill due dates — Tōroa remembers so you don't have to." },
  { icon: ShoppingCart, title: "Shared grocery lists", desc: "Build, share, and tick off shopping lists via text. Anyone in the whānau can add items on the go." },
  { icon: Backpack, title: "Homework tracker", desc: "Track homework deadlines, reading logs, and projects. Get gentle nudges before things are due." },
  { icon: Shield, title: "NZ-specific answers", desc: "FamilyBoost, Working for Families, school zones, holiday dates — Tōroa knows Aotearoa context." },
  { icon: Clock, title: "Household budget", desc: "Track weekly spending, set limits, and get alerts — all via SMS. No spreadsheets needed." },
  { icon: MessageSquare, title: "Just text", desc: "No app to download. No login to remember. Works on every phone, every age group. Instant." },
];

const SMS_REASONS = [
  { title: "No app friction", desc: "No downloads, no logins, no updates. Just text." },
  { title: "Easy for busy families", desc: "Works while you're cooking dinner, waiting at sports, or on the school run." },
  { title: "Accessible and immediate", desc: "Everyone has SMS. Every phone. Every age group. Instant." },
];

const FAQS = [
  { q: "What is Tōroa?", a: "Tōroa is an SMS-first AI navigator built for families in Aotearoa. It helps with everyday family admin — reminders, coordination, useful information — via text message." },
  { q: "How does it work?", a: "Once you're invited to the beta, you'll receive a text from Tōroa. From there, just text your questions or requests like you would to a friend. Tōroa responds with helpful, NZ-specific answers." },
  { q: "Can I really photograph a school notice?", a: "Yes. Send a photo of any printed notice, newsletter, or letter. Tōroa uses vision AI to read the content, extract key dates and actions, and add them to your family calendar." },
  { q: "How does bus tracking work?", a: "Tōroa connects to Auckland Transport's live bus feed. Text 'Where's the bus?' and get real-time position and ETA for your child's route." },
  { q: "Is my data safe?", a: "Yes. Your data stays in New Zealand. We don't sell it, share it, or use it for advertising. Tōroa follows the NZ Privacy Act 2020 and Assembl's tikanga-based data governance." },
  { q: "How much does it cost?", a: "Tōroa will be $29/month when it launches. Beta testers get early access and launch pricing locked in." },
  { q: "What is the Mārama learning tool?", a: "Drop any YouTube URL into Tōroa and it instantly produces an interactive learning module — vocab flashcards, sentence translations, and quizzes. Perfect for homework help or te reo Māori practice." },
];

export default function ToroaLandingPage() {
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("toroa_waitlist").select("id", { count: "exact", head: true }).eq("status", "waiting")
      .then(({ count: c }) => setCount(c ?? 0));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsConsent) { toast.error("Please agree to receive SMS updates about the beta"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.from("toroa_waitlist").insert({
      email: email.trim().toLowerCase(),
      name: firstName.trim() || null,
    });
    setLoading(false);
    if (error?.code === "23505") { toast.info("You're already on the list!"); return; }
    if (error) { toast.error("Something went wrong — please try again"); return; }
    setDone(true);
    setCount((c) => (c ?? 0) + 1);
  };

  const inputStyle = {
    background: "#0F0F1A",
    border: "1px solid rgba(212,168,67,0.2)",
    color: "#E8E8F0",
  };

  return (
    <div style={{ background: "#09090F" }} className="min-h-screen text-white font-body relative overflow-hidden">
      <SEO title="Tōroa — Family AI Navigator | SMS-First | Built for Aotearoa" description="SMS-first family AI navigator built for whānau in Aotearoa. Photo school notices, track buses, meal plan from your fridge, live weather reminders. Join the beta." />
      <Starfield />

      {/* NAV */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <a href="/" className="text-xs font-body" style={{ color: "rgba(255,255,255,0.4)" }}>← assembl.co.nz</a>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-16 md:pt-24 md:pb-20 min-h-[70vh]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(600px circle at 50% 35%, rgba(212,168,67,0.06), transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
          {/* Left — copy */}
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <img src={toroaLogo} alt="Tōroa — Family AI Navigator" className="w-40 h-auto" />
            </motion.div>
            <motion.p variants={fadeUp} custom={1} className="font-display text-lg mb-4" style={{ fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
              Your whānau's intelligent navigator.
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="font-body text-base md:text-lg mb-6" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 420, lineHeight: 1.7 }}>
              SMS-first support for everyday family life in Aotearoa. No app. No login. Just text.
            </motion.p>
            <motion.p variants={fadeUp} custom={3} className="font-body text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              $29/mo · Beta invites opening soon
            </motion.p>
          </motion.div>

          {/* Right — sign-up card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-6 md:p-8 card-glow-hover"
            style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(212,168,67,0.15)", boxShadow: "0 0 30px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.3)" }}
          >
            {done ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-3">✓</p>
                <p className="font-display text-lg mb-2" style={{ fontWeight: 300, color: "#FFFFFF" }}>Ka pai — you're on the list.</p>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>We'll text you when your invite is ready.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <h2 className="font-display text-base mb-1" style={{ fontWeight: 300, color: "#D4A843" }}>Join the beta waitlist</h2>
                <p className="font-body text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Be among the first whānau to try Tōroa.</p>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="021 XXX XXXX" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.co.nz" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <textarea value={painPoint} onChange={(e) => setPainPoint(e.target.value)} placeholder="Biggest admin pain right now..." rows={2} className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none resize-none" style={inputStyle} />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: "#D4A843" }} />
                  <span className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.55)" }}>I agree to receive SMS updates about the Tōroa beta</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: "#D4A843" }} />
                  <span className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>I'd also like email updates (optional)</span>
                </label>

                <button type="submit" disabled={loading} className="cta-glass-green w-full rounded-lg px-6 py-3 font-display text-sm transition-all disabled:opacity-50">
                  {loading ? "Joining…" : "Join the beta waitlist"}
                </button>
                {count !== null && (
                  <p className="text-center font-mono text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{count} whānau already waiting</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ HERO FEATURES — large showcase cards ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-center mb-4" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,28px)", color: "#D4A843" }}>
            What Tōroa actually does
          </h2>
          <p className="font-body text-center text-sm mb-12" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto" }}>
            Real tools for real families. Not a chatbot — a navigator.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HERO_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 3}
                className="rounded-2xl p-6 card-glow-hover"
                style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: `0 0 20px ${f.color}10, 0 4px 20px rgba(0,0,0,0.3)` }}
              >
                <span className="text-2xl mb-4 block">{f.emoji}</span>
                <h3 className="font-display text-sm mb-2" style={{ fontWeight: 400, color: "#FFFFFF" }}>{f.title}</h3>
                <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MĀRAMA LEARNING TOOL — spotlight ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="rounded-2xl p-8 md:p-10 card-glow-hover text-center"
            style={{ background: "rgba(15,15,26,0.7)", border: "1px solid rgba(212,168,67,0.15)", boxShadow: "0 0 40px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.3)" }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.25)" }}>
              <Youtube size={28} style={{ color: "#D4A843" }} />
            </div>
            <h2 className="font-display text-xl mb-3" style={{ fontWeight: 300, color: "#FFFFFF" }}>
              Mārama — instant learning from any video
            </h2>
            <p className="font-body text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Drop in a YouTube URL and Tōroa instantly produces an interactive learning module — vocab flashcards with pronunciation guides, sentence translations, and interactive quizzes with immediate feedback.
            </p>
            <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              Perfect for homework help, te reo Māori practice, or exploring any topic together as a whānau.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {["Vocab flashcards", "Pronunciation guides", "Sentence translations", "Interactive quizzes"].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full text-[10px] stat-pill" style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)", color: "rgba(255,255,255,0.6)", boxShadow: "0 0 12px rgba(212,168,67,0.06)" }}>
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ MORE FEATURES — compact grid ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-center mb-10" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: "#D4A843" }}>
            Plus everything else a busy whānau needs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MORE_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 3}
                className="rounded-xl p-5 card-glow-hover"
                style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(212,168,67,0.12)", boxShadow: "0 0 16px rgba(212,168,67,0.04), 0 4px 16px rgba(0,0,0,0.25)" }}
              >
                <f.icon size={20} style={{ color: "#D4A843", marginBottom: "10px" }} />
                <h3 className="font-display text-sm mb-1.5" style={{ fontWeight: 300, color: "#FFFFFF" }}>{f.title}</h3>
                <p className="font-body text-[11px]" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY SMS-FIRST ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-center mb-10" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: "#D4A843" }}>
            Why SMS-first works
          </h2>
          <div className="space-y-4">
            {SMS_REASONS.map((r, i) => (
              <motion.div key={r.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-start gap-4 rounded-xl p-5 card-glow-hover"
                style={{ background: "rgba(15,15,26,0.4)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 16px rgba(58,125,110,0.04), 0 4px 16px rgba(0,0,0,0.2)" }}
              >
                <Smartphone size={18} style={{ color: "#D4A843", marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <h3 className="font-display text-sm mb-1" style={{ fontWeight: 300, color: "#FFFFFF" }}>{r.title}</h3>
                  <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY & TRUST ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Shield size={28} style={{ color: "#3A7D6E", margin: "0 auto 16px" }} />
          <h2 className="font-display mb-4" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: "#FFFFFF" }}>
            Privacy and trust
          </h2>
          <div className="space-y-3">
            {[
              "Your data stays in New Zealand",
              "We never sell or share your family's information",
              "Built under the NZ Privacy Act 2020",
              "Encrypted family chat — no ads, no strangers",
              "Tikanga-based data governance from Assembl",
            ].map((t) => (
              <p key={t} className="font-body text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>✓ {t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM WAITLIST ═══ */}
      <section id="waitlist" className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-center mb-8" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: "#D4A843" }}>
            Join the beta waitlist
          </h2>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl p-8 text-center" style={{ background: "rgba(58,125,110,0.15)", border: "1px solid rgba(58,125,110,0.3)", boxShadow: "0 0 30px rgba(58,125,110,0.08)" }}>
              <p className="text-2xl mb-3">✓</p>
              <p className="font-display text-lg mb-2" style={{ fontWeight: 300, color: "#FFFFFF" }}>Ka pai — you're on the list.</p>
              <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>We'll text you when your invite is ready.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-xl p-6 card-glow-hover" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(212,168,67,0.12)", boxShadow: "0 0 24px rgba(212,168,67,0.06), 0 4px 20px rgba(0,0,0,0.3)" }}>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Mobile number</label>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="021 XXX XXXX" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.co.nz" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Biggest admin pain right now</label>
                <textarea value={painPoint} onChange={(e) => setPainPoint(e.target.value)} placeholder="e.g. keeping track of school notices, meal planning..." rows={3} className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none resize-none" style={inputStyle} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: "#D4A843" }} />
                <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>I agree to receive SMS updates about the Tōroa beta</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: "#D4A843" }} />
                <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>I'd also like email updates (optional)</span>
              </label>

              <button type="submit" disabled={loading} className="cta-glass-green w-full rounded-lg px-6 py-3 font-display text-sm transition-all disabled:opacity-50">
                {loading ? "Joining…" : "Join the beta waitlist"}
              </button>
            </form>
          )}

          {count !== null && (
            <p className="mt-6 text-center font-mono text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              {count} whānau already waiting
            </p>
          )}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-center mb-8" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,24px)", color: "#D4A843" }}>
            Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden card-glow-hover" style={{ border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 12px rgba(212,168,67,0.03)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-body pr-4" style={{ color: "#FFFFFF" }}>{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.35)" }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-body leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-10 text-center" style={{ borderTop: "1px solid rgba(212,168,67,0.08)" }}>
        <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Tōroa is a standalone product by{" "}
          <a href="/" style={{ color: "#D4A843" }}>Assembl</a>
          {" · "}
          <a href="mailto:assembl@assembl.co.nz" style={{ color: "#D4A843" }}>assembl@assembl.co.nz</a>
        </p>
      </footer>
    </div>
  );
}
