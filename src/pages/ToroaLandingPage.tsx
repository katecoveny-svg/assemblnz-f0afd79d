import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  ChevronDown, Send, Camera, CalendarDays, UtensilsCrossed, Bus, CloudSun,
  Bell, ShoppingCart, BookOpen, Globe, Wallet, Users, Lock,
  Smartphone, MessageSquare, Zap, Shield, GraduationCap, MapPin, DollarSign, Clock,
  Check,
} from "lucide-react";
import toroaLogo from "@/assets/brand/toroa-logo.svg";
import TeReoVideoLearner from "@/components/chat/TeReoVideoLearner";

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const glass = (accent = KOWHAI, opacity = 0.12) => ({
  background: "rgba(15,15,26,0.7)",
  border: `1px solid ${accent}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
  backdropFilter: "blur(12px)",
  boxShadow: `0 0 24px ${accent}08, 0 8px 32px rgba(0,0,0,0.3)`,
});

/* ── Starfield ── */
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

/* ── All 12 feature cards ── */
const FEATURES = [
  { icon: Camera, title: "Photo → school notice parsed", desc: "Snap a photo of a school newsletter or notice. Tōroa reads it, extracts dates, events, and deadlines, then adds them to your family calendar automatically.", color: KOWHAI },
  { icon: CalendarDays, title: "Calendar sync & gear lists", desc: "School events, sports fixtures, and practices sync to one calendar. Tōroa auto-generates packing and gear lists the night before — so nothing gets forgotten.", color: POUNAMU },
  { icon: UtensilsCrossed, title: "Photo your fridge → meal plan", desc: "Take a photo of what's in your fridge. Tōroa creates a weekly meal plan from what you have, then builds a smart shopping list for what you need.", color: KOWHAI },
  { icon: Bus, title: "Live Auckland bus tracking", desc: "Real-time Auckland Transport bus positions. Know exactly when the school bus is arriving — no more standing in the rain guessing.", color: POUNAMU },
  { icon: CloudSun, title: "Live weather → dress the kids", desc: "Tōroa checks the morning weather and texts you what the kids should wear today. Rain jacket? Sunhat? Shorts or long pants? Sorted.", color: KOWHAI },
  { icon: Bell, title: "Smart reminders", desc: "Permission slips, rego renewals, vet appointments, bill due dates — Tōroa remembers so you don't have to.", color: POUNAMU },
  { icon: ShoppingCart, title: "Shared grocery lists", desc: "Build, share, and tick off shopping lists via text. Anyone in the whānau can add items on the go.", color: KOWHAI },
  { icon: BookOpen, title: "Homework tracker", desc: "Track homework deadlines, reading logs, and projects. Get gentle nudges before things are due.", color: POUNAMU },
  { icon: DollarSign, title: "Household budget", desc: "Track weekly spending, set limits, and get alerts — all via SMS. No spreadsheets needed.", color: KOWHAI },
  { icon: MapPin, title: "NZ-specific answers", desc: "FamilyBoost, Working for Families, school zones, holiday dates — Tōroa knows Aotearoa context.", color: POUNAMU },
  { icon: Users, title: "Family coordination", desc: "Pickups, drop-offs, activities, appointments — Tōroa keeps the whole whānau in sync. Everyone knows who's doing what.", color: KOWHAI },
  { icon: Lock, title: "Safe family chat", desc: "A private, encrypted family messaging space. No ads, no strangers, no algorithmic feeds — just your whānau, kept safe.", color: POUNAMU },
];

const SMS_REASONS = [
  { icon: Smartphone, title: "No app friction", desc: "No downloads, no logins, no updates. Just text." },
  { icon: Clock, title: "Easy for busy families", desc: "Works while you're cooking dinner, waiting at sports, or on the school run." },
  { icon: Zap, title: "Accessible and immediate", desc: "Everyone has SMS. Every phone. Every age group. Instant." },
];

const PRICING_FEATURES = [
  "Unlimited texts to Tōroa", "School notice scanning", "Meal planning", "Calendar sync",
  "Bus tracking (Auckland)", "Weather alerts", "Smart reminders", "Shared lists",
  "Homework tracking", "Budget tracking", "Family chat", "Mārama learning", "NZ-specific answers",
];

const FAQS = [
  { q: "What is Tōroa?", a: "Tōroa is a text-based AI family navigator built for Aotearoa. You text a question about family life — school, meals, schedules, budgets — and Tōroa replies with practical help. No app to download. Works on every phone." },
  { q: "How does it work?", a: "You get a dedicated NZ phone number. Text it anything. Tōroa uses AI to understand what you need and replies via text. It can also read photos (school notices, fridge contents), track buses in real-time, check the weather, and manage your family calendar." },
  { q: "Can I really photograph a school notice?", a: "Yes. Take a photo, text it to Tōroa. It reads the notice, extracts dates and events, and can add them to your family calendar. Works with newsletters, permission slips, sports fixtures, and school updates." },
  { q: "How does bus tracking work?", a: "Tōroa connects to Auckland Transport's real-time API. Text 'Where's the bus?' and get live position data. We're expanding to Wellington and Christchurch." },
  { q: "Is my data safe?", a: "All data stays in New Zealand. We follow the NZ Privacy Act 2020. We never sell or share your family's information. Our tikanga governance framework treats your data as taonga (treasure)." },
  { q: "How much does it cost?", a: "$29/month during beta. First 100 whānau get locked in at that price for life. Cancel anytime." },
  { q: "What is Mārama?", a: "Mārama is Tōroa's built-in learning tool. Drop a YouTube URL and get vocabulary flashcards, translations, and interactive quizzes. Especially good for te reo Māori learning, but works with any video content." },
  { q: "What's the difference between Tōroa and the business kete?", a: "Tōroa is our consumer product for families — $29/mo, SMS-first, helps with school notices, meals, budgets, and daily family life. The business kete (Manaaki, Hanga, Auaha, Pakihi, Hangarau) are enterprise-grade AI operations hubs. Different products, different audiences." },
  { q: "Do I need technical knowledge?", a: "No. If you can send a text message, you can use Tōroa. That's the whole point." },
  { q: "Can the whole family use it?", a: "Yes. Add family members and they can all text Tōroa independently. Shared grocery lists and calendar updates sync across the whānau." },
];

/* ── Try Tōroa mini-chat ── */
function TryToroaChat() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const MAX_MSGS = 2;
  const used = messages.filter(m => m.role === "user").length;
  const remaining = MAX_MSGS - used;

  const send = async () => {
    if (!input.trim() || remaining <= 0 || loading) return;
    const userMsg = input.trim();
    setInput("");
    const updated = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(updated);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: updated.map(m => ({ role: m.role, content: m.text })), agentId: "family" },
      });
      if (error) throw error;
      const reply = data?.content || data?.text || data?.choices?.[0]?.message?.content || "Kia ora! I'm here to help your whānau.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Kia ora! I'm Tōroa — your family navigator. Try asking me about meal planning, school notices, or what the kids should wear today!" }]);
    }
    setLoading(false);
  };

  const suggestions = [
    "What should the kids wear today?",
    "Help me plan dinners this week",
    "When's the next school holiday?",
    "Create a packing list for rugby practice",
  ];

  return (
    <section className="relative z-10 px-6 py-16 md:py-20">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="font-display text-xl mb-3" style={{ fontWeight: 300, color: KOWHAI }}>
            Try Tōroa — {remaining} free message{remaining !== 1 ? "s" : ""}
          </h2>
          <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Ask anything a busy parent would need help with.
          </p>
        </motion.div>

        {/* Phone frame mockup */}
        <div className="mx-auto max-w-[380px]">
          <div className="rounded-[24px] overflow-hidden" style={{ ...glass(), border: `2px solid ${KOWHAI}25` }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${KOWHAI}15` }}>
              <div className="flex items-center gap-2">
                <img src={toroaLogo} alt="" className="w-5 h-5" />
                <span className="font-display text-xs" style={{ color: KOWHAI, fontWeight: 300 }}>Tōroa</span>
              </div>
              <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>SMS</span>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 space-y-3 min-h-[200px] max-h-[340px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="space-y-2 py-4">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => { setInput(s); }} className="block w-full text-left px-3 py-2 rounded-lg text-xs font-body transition-all"
                      style={{ background: `${KOWHAI}08`, border: `1px solid ${KOWHAI}15`, color: "rgba(255,255,255,0.5)" }}
                    >{s}</button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-body max-w-[85%] ${m.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
                    style={{
                      background: m.role === "user" ? `${KOWHAI}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${m.role === "user" ? `${KOWHAI}30` : "rgba(255,255,255,0.06)"}`,
                      color: m.role === "user" ? "#FFE082" : "rgba(255,255,255,0.7)",
                      lineHeight: 1.6,
                    }}
                  >{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md px-4 py-2.5 text-xs font-body" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                    <span className="animate-pulse">Tōroa is thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex gap-2" style={{ borderTop: `1px solid ${KOWHAI}10` }}>
              {remaining > 0 ? (
                <>
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                    placeholder="Ask Tōroa anything…"
                    className="flex-1 px-3 py-2.5 rounded-full text-xs font-body outline-none"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${KOWHAI}15`, color: "#FFFFFF" }}
                  />
                  <button onClick={send} disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                    style={{ background: KOWHAI, color: "#09090F" }}
                  ><Send size={14} /></button>
                </>
              ) : (
                <div className="w-full text-center py-2">
                  <p className="font-body text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>You've used your 2 free messages</p>
                  <a href="#waitlist" className="font-display text-sm transition-colors" style={{ color: KOWHAI, fontWeight: 300 }}>
                    Join the beta for unlimited access →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main page ── */
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
    if (!firstName.trim()) { toast.error("Please enter your first name"); return; }
    if (!mobile.trim() || !/^(\+?64|0)2\d{7,9}$/.test(mobile.replace(/\s/g, ""))) {
      toast.error("Please enter a valid NZ mobile number (e.g. 021 XXX XXXX)"); return;
    }
    setLoading(true);
    const { error } = await supabase.from("toroa_waitlist").insert({
      name: firstName.trim(),
      email: email.trim().toLowerCase() || null,
      mobile: mobile.trim(),
      biggest_pain: painPoint.trim() || null,
      sms_consent: smsConsent,
      email_consent: emailConsent,
    });
    setLoading(false);
    if (error?.code === "23505") { toast.info("You're already on the list!"); return; }
    if (error) { toast.error("Something went wrong — please try again"); return; }
    setDone(true);
    setCount((c) => (c ?? 0) + 1);
    supabase.functions.invoke("send-contact-email", {
      body: { name: firstName.trim(), email: email.trim() || "no-email@toroa.co.nz", message: `New Tōroa beta waitlist signup. Mobile: ${mobile}. Pain point: ${painPoint || "Not specified"}` },
    }).catch(console.error);
  };

  const inputStyle = { background: "#0F0F1A", border: `1px solid ${KOWHAI}25`, color: "#E8E8F0" };

  return (
    <div style={{ background: "#09090F" }} className="min-h-screen text-white font-body relative overflow-hidden">
      <SEO title="Tōroa — Family AI Navigator | SMS-First | Built for Aotearoa" description="SMS-first family AI navigator built for whānau in Aotearoa. Photo school notices, track buses, meal plan from your fridge. No app. Just text. $29/mo." />
      <Starfield />

      {/* NAV */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-xs font-body" style={{ color: "rgba(255,255,255,0.4)" }}>← assembl.co.nz</Link>
        <a href="#waitlist" className="px-4 py-2 rounded-lg text-xs font-display" style={{ background: `${KOWHAI}15`, border: `1px solid ${KOWHAI}30`, color: KOWHAI, fontWeight: 300 }}>
          Join the beta
        </a>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-16 pb-16 md:pt-24 md:pb-20 min-h-[70vh]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(600px circle at 50% 35%, rgba(212,168,67,0.06), transparent 70%)" }} />
        <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <img src={toroaLogo} alt="Tōroa — Family AI Navigator" className="w-40 h-auto" style={{ filter: `drop-shadow(0 0 20px ${KOWHAI}30)` }} />
            </motion.div>
            <motion.p variants={fadeUp} custom={0.5} className="font-display text-[10px] tracking-[4px] uppercase mb-4" style={{ fontWeight: 700, color: KOWHAI, letterSpacing: "4px" }}>
              FAMILY AI NAVIGATOR
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-[44px] leading-tight mb-4" style={{ fontWeight: 300, color: "rgba(255,255,255,0.9)" }}>
              Your whānau's intelligent navigator.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="font-body text-base md:text-lg mb-6" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 420, lineHeight: 1.7 }}>
              SMS-first support for everyday family life in Aotearoa. No app. No login. Just text.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ ...glass(KOWHAI, 0.15) }}>
              <span className="font-mono text-sm" style={{ color: KOWHAI }}>$29/mo</span>
              <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.4)" }}>· Beta invites opening soon</span>
            </motion.div>
          </motion.div>

          {/* Sign-up card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-6 md:p-8 card-glow-hover" style={{ ...glass() }}
          >
            {done ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${POUNAMU}20`, border: `1px solid ${POUNAMU}40` }}>
                  <Check size={20} style={{ color: POUNAMU }} />
                </div>
                <p className="font-display text-lg mb-2" style={{ fontWeight: 300, color: "#FFFFFF" }}>Ka pai — you're on the list.</p>
                <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>We'll text you when your invite is ready.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <h2 className="font-display text-base mb-1" style={{ fontWeight: 300, color: KOWHAI }}>Join the beta waitlist</h2>
                <p className="font-body text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Be among the first whānau to try Tōroa.</p>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="021 XXX XXXX *" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.co.nz (optional)" className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none" style={inputStyle} />
                <textarea value={painPoint} onChange={(e) => setPainPoint(e.target.value)} placeholder="Biggest admin pain right now..." rows={2} className="w-full rounded-lg px-4 py-2.5 text-sm font-body outline-none resize-none" style={inputStyle} />
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: KOWHAI }} />
                  <span className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.55)" }}>I agree to receive SMS updates about the Tōroa beta *</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: KOWHAI }} />
                  <span className="text-[11px] font-body" style={{ color: "rgba(255,255,255,0.4)" }}>I'd also like email updates (optional)</span>
                </label>
                <button type="submit" disabled={loading} className="w-full rounded-lg px-6 py-3 font-display text-sm transition-all disabled:opacity-50" style={{ background: KOWHAI, color: "#09090F", fontWeight: 400 }}>
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

      {/* ═══ 12 FEATURE CARDS ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-center mb-2" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,28px)", color: KOWHAI }}>
            Real tools for real families
          </h2>
          <p className="font-body text-center text-sm mb-12" style={{ color: "rgba(255,255,255,0.4)", maxWidth: 500, margin: "0 auto" }}>
            Not a chatbot — a navigator.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 4}
                className="rounded-xl p-5 card-glow-hover group"
                style={{ ...glass(f.color, 0.08), borderTop: `2px solid ${f.color}30` }}
              >
                <f.icon size={22} className="mb-3 transition-transform group-hover:scale-110" style={{ color: f.color }} />
                <h3 className="font-display text-xs mb-2" style={{ fontWeight: 400, color: "#FFFFFF" }}>{f.title}</h3>
                <p className="font-body text-[10px]" style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MĀRAMA LEARNING TOOL ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-8">
            <GraduationCap size={24} className="mx-auto mb-4" style={{ color: KOWHAI }} />
            <h2 className="font-display text-xl mb-3" style={{ fontWeight: 300, color: "#FFFFFF" }}>
              Try Mārama — instant learning from any video
            </h2>
            <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Drop in a YouTube URL and get vocab flashcards, sentence translations, and interactive quizzes instantly.
            </p>
          </motion.div>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${KOWHAI}25`, boxShadow: `0 0 40px ${KOWHAI}08, 0 8px 40px rgba(0,0,0,0.3)`, minHeight: 400 }}>
            <TeReoVideoLearner agentColor={KOWHAI} />
          </div>
        </div>
      </section>

      {/* ═══ TRY TŌROA ═══ */}
      <TryToroaChat />

      {/* ═══ WHY SMS-FIRST ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-center mb-10" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: KOWHAI }}>
            Why SMS-first works
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {SMS_REASONS.map((r, i) => (
              <motion.div key={r.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-xl p-5 text-center card-glow-hover" style={glass()}
              >
                <r.icon size={24} className="mx-auto mb-3" style={{ color: KOWHAI }} />
                <h3 className="font-display text-sm mb-1" style={{ fontWeight: 300, color: "#FFFFFF" }}>{r.title}</h3>
                <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY & TRUST ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 text-center card-glow-hover" style={{ ...glass(POUNAMU, 0.15) }}>
            <Shield size={24} className="mx-auto mb-4" style={{ color: POUNAMU }} />
            <h2 className="font-display mb-6" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: "#FFFFFF" }}>
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
                <p key={t} className="font-body text-sm flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={14} style={{ color: POUNAMU }} /> {t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-mono text-4xl mb-2" style={{ color: KOWHAI, fontWeight: 500 }}>$29/month</h2>
          <p className="font-body text-sm mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            Everything your whānau needs. Cancel anytime.
          </p>
          <div className="rounded-xl p-6 text-left" style={glass()}>
            <div className="grid grid-cols-2 gap-2">
              {PRICING_FEATURES.map((f) => (
                <p key={f} className="font-body text-xs flex items-start gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <Check size={12} className="shrink-0 mt-0.5" style={{ color: KOWHAI }} /> {f}
                </p>
              ))}
            </div>
          </div>
          <a href="#waitlist" className="inline-block mt-6 px-8 py-3 rounded-lg font-display text-sm transition-all" style={{ background: KOWHAI, color: "#09090F", fontWeight: 400 }}>
            Join the beta waitlist
          </a>
          <p className="font-body text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Beta pricing. First 100 whānau get locked in at $29/mo for life.
          </p>
        </div>
      </section>

      {/* ═══ BOTTOM WAITLIST ═══ */}
      <section id="waitlist" className="relative z-10 px-6 py-16 md:py-20">
        <div className="max-w-md mx-auto">
          <h2 className="font-display text-center mb-8" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,26px)", color: KOWHAI }}>
            Join the beta waitlist
          </h2>
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl p-8 text-center" style={{ ...glass(POUNAMU, 0.2) }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${POUNAMU}20`, border: `1px solid ${POUNAMU}40` }}>
                <Check size={20} style={{ color: POUNAMU }} />
              </div>
              <p className="font-display text-lg mb-2" style={{ fontWeight: 300, color: "#FFFFFF" }}>Ka pai — you're on the list.</p>
              <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>We'll text you when your invite is ready.</p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-xl p-6 card-glow-hover" style={glass()}>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>First name *</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Mobile number *</label>
                <input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="021 XXX XXXX" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.co.nz" className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs mb-1.5 font-body" style={{ color: "rgba(255,255,255,0.6)" }}>Biggest admin pain right now</label>
                <textarea value={painPoint} onChange={(e) => setPainPoint(e.target.value)} placeholder="e.g. keeping track of school notices, meal planning..." rows={3} className="w-full rounded-lg px-4 py-3 text-sm font-body outline-none resize-none" style={inputStyle} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: KOWHAI }} />
                <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.6)" }}>I agree to receive SMS updates about the Tōroa beta *</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={emailConsent} onChange={(e) => setEmailConsent(e.target.checked)} className="mt-0.5 rounded" style={{ accentColor: KOWHAI }} />
                <span className="text-xs font-body" style={{ color: "rgba(255,255,255,0.5)" }}>I'd also like email updates (optional)</span>
              </label>
              <button type="submit" disabled={loading} className="w-full rounded-lg px-6 py-3 font-display text-sm transition-all disabled:opacity-50" style={{ background: KOWHAI, color: "#09090F", fontWeight: 400 }}>
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
          <h2 className="font-display text-center mb-8" style={{ fontWeight: 300, fontSize: "clamp(20px,3vw,24px)", color: KOWHAI }}>
            Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl overflow-hidden card-glow-hover" style={{ ...glass(KOWHAI, 0.05) }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-body pr-4" style={{ color: "#FFFFFF" }}>{faq.q}</span>
                  <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.35)" }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                      <div className="px-5 pb-4">
                        <p className="text-xs font-body leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 px-6 py-10" style={{ borderTop: `1px solid ${KOWHAI}08` }}>
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Tōroa is a standalone product by{" "}
            <Link to="/" style={{ color: KOWHAI }}>Assembl</Link>
            {" · "}
            <a href="mailto:assembl@assembl.co.nz" style={{ color: KOWHAI }}>assembl@assembl.co.nz</a>
          </p>
          <div className="flex gap-4">
            {[
              { label: "Platform", to: "/" },
              { label: "Packs", to: "/kete" },
              { label: "Pricing", to: "/pricing" },
              { label: "Contact", to: "/contact" },
            ].map(l => (
              <Link key={l.label} to={l.to} className="font-body text-[10px] transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
