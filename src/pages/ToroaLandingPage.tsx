import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import TextUsButton from "@/components/kete/TextUsButton";
import heroWhanau from "@/assets/toro-hero-whanau.jpg";

/* ─── Bold Aotearoa Modernist palette ─────────────────────────── */
const INK = "#1A1D29";       // charcoal
const PAPER = "#F5F0E6";     // warm bone
const OCHRE = "#D4A843";     // primary accent
const POUNAMU = "#2E5D52";   // deep green for trust
const MUTED = "#6B6F7A";

/* ─── Animated SMS thread (the hero) ──────────────────────────── */
const THREAD: { side: "you" | "toro"; text: string }[] = [
  { side: "you",  text: "Pick up Aroha at 3 — and I forgot the dentist form" },
  { side: "toro", text: "Got you. Reminder set for 2:45 ✓ Dentist form drafted — want me to text it back ready to sign?" },
  { side: "you",  text: "Yes please. Also dinner — fridge is fish + spinach + kūmara" },
  { side: "toro", text: "Done ✓ One-pan miso fish, kūmara, garlicky spinach. 22 min. Shopping list updated for Thursday." },
  { side: "you",  text: "Mum's birthday next month?" },
  { side: "toro", text: "On it — 14 May. Booking suggestion + card + rough budget coming through tonight." },
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
        background: PAPER,
        border: `1px solid ${INK}14`,
        boxShadow: `0 30px 80px -40px ${INK}55, 0 2px 0 ${INK}06 inset`,
      }}
    >
      {/* phone status bar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <span
          className="text-[10px] uppercase tracking-[0.25em] font-medium"
          style={{ color: INK, opacity: 0.55, fontFamily: "'JetBrains Mono', monospace" }}
        >
          3688 · TŌRO
        </span>
        <span
          className="text-[10px] tracking-[0.15em] font-medium"
          style={{ color: INK, opacity: 0.4 }}
        >
          today · 3:01 pm
        </span>
      </div>

      <div className="flex flex-col gap-2.5 min-h-[420px]">
        {THREAD.slice(0, count).map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${m.side === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-[13.5px] leading-snug ${
                m.side === "you"
                  ? "rounded-2xl rounded-br-sm"
                  : "rounded-2xl rounded-bl-sm"
              }`}
              style={
                m.side === "you"
                  ? { background: INK, color: PAPER }
                  : { background: "#FFFFFF", color: INK, border: `1px solid ${INK}14` }
              }
            >
              {m.side === "toro" && (
                <span
                  className="block text-[9px] uppercase tracking-[0.25em] font-semibold mb-1"
                  style={{ color: OCHRE }}
                >
                  Tōro
                </span>
              )}
              {m.text}
            </div>
          </motion.div>
        ))}

        {count < THREAD.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1"
              style={{ background: "#FFFFFF", border: `1px solid ${INK}14` }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce-dot"
                  style={{ background: INK, opacity: 0.4, animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div
        className="mt-5 pt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em]"
        style={{ borderTop: `1px solid ${INK}10`, color: INK, opacity: 0.45 }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: POUNAMU }} />
        Live · no app · standard SMS
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
const NUMBERS = [
  { k: "00", v: "Apps to install" },
  { k: "01", v: "Number to text — 3688" },
  { k: "$29", v: "A month, whole whānau" },
];

const HANDLES = [
  { num: "01", title: "School & sports", body: "Permission slips, term dates, pickups, sports draws — added before you forget." },
  { num: "02", title: "Meals & shopping", body: "Tell Tōro what's in the fridge. It plans the week and writes the list." },
  { num: "03", title: "Health & appointments", body: "Dentist, GP, vet, prescriptions — booked, remembered, followed up." },
  { num: "04", title: "Bills & budget", body: "Due dates tracked, weekly budget kept honest, no late fees." },
  { num: "05", title: "Trips & holidays", body: "Plan a long weekend or three weeks in Italy — by text." },
  { num: "06", title: "The mental load", body: "The list of everything you're holding in your head — held somewhere else for once." },
];

export default function ToroaLandingPage() {
  return (
    <LightPageShell>
      <div style={{ background: PAPER, color: INK, minHeight: "100vh" }}>
        <SEO
          title="Tōro — Family navigator by text | Aotearoa"
          description="No app. No login. Text 3688. Tōro handles school, meals, appointments, bills and trips for your whānau — one number, $29 a month."
          path="/toro"
        />
        <BrandNav />

        {/* ════ HERO ════ */}
        <section
          className="relative overflow-hidden"
          style={{ background: PAPER }}
        >
          {/* faint grid */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage: `linear-gradient(${INK} 1px, transparent 1px), linear-gradient(90deg, ${INK} 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-32">
            {/* eyebrow */}
            <div className="flex items-center gap-3 mb-12">
              <span
                className="text-[10px] uppercase tracking-[0.4em] font-semibold"
                style={{ color: INK, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Tōro
              </span>
              <span className="h-px w-10" style={{ background: INK, opacity: 0.3 }} />
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: MUTED }}
              >
                Family navigator · Aotearoa
              </span>
            </div>

            <div className="grid grid-cols-12 gap-6 items-end">
              {/* headline — asymmetric, oversized */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-12 lg:col-span-7"
              >
                <h1
                  className="font-light leading-[0.92] tracking-[-0.03em]"
                  style={{
                    color: INK,
                    fontFamily: "Lato, sans-serif",
                    fontSize: "clamp(3.25rem, 9vw, 7.5rem)",
                  }}
                >
                  Text it.
                  <br />
                  <span style={{ fontStyle: "italic", fontWeight: 300, color: OCHRE }}>
                    Sorted.
                  </span>
                </h1>

                <p
                  className="mt-8 max-w-xl text-[17px] sm:text-[19px] leading-relaxed"
                  style={{ color: INK, opacity: 0.75 }}
                >
                  Tōro is the family navigator that lives in your messages. No app. No login. Text{" "}
                  <span
                    className="px-2 py-0.5 rounded-md font-semibold"
                    style={{ background: INK, color: PAPER, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    3688
                  </span>{" "}
                  and your whānau runs itself.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a
                    href="sms:3688?body=Kia%20ora%20T%C5%8Dro%20%E2%80%94%20I%27d%20like%20to%20get%20started"
                    className="group inline-flex items-center gap-3 px-7 py-4 rounded-full text-sm font-medium transition-transform hover:-translate-y-0.5"
                    style={{ background: INK, color: PAPER }}
                  >
                    Text 3688 now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <Link
                    to="/toro/app"
                    className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-[6px] decoration-1"
                    style={{ color: INK, textDecorationColor: `${INK}40` }}
                  >
                    Open the dashboard
                  </Link>
                </div>

                <p
                  className="mt-6 text-[11px] uppercase tracking-[0.3em]"
                  style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  $29 / month · whole whānau · cancel anytime
                </p>
              </motion.div>

              {/* SMS thread — the hero */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-12 lg:col-span-5 flex justify-center lg:justify-end"
              >
                <SmsThread />
              </motion.div>
            </div>

            {/* numbered counter strip */}
            <div className="mt-20 sm:mt-28 grid grid-cols-3 gap-6 sm:gap-12">
              {NUMBERS.map((n, i) => (
                <motion.div
                  key={n.k}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="border-l pl-4 sm:pl-6"
                  style={{ borderColor: `${INK}25` }}
                >
                  <div
                    className="font-light leading-none"
                    style={{
                      color: INK,
                      fontFamily: "Lato, sans-serif",
                      fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
                    }}
                  >
                    {n.k}
                  </div>
                  <div
                    className="mt-2 text-[11px] sm:text-xs uppercase tracking-[0.2em]"
                    style={{ color: MUTED }}
                  >
                    {n.v}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ EDITORIAL PHOTO + STATEMENT ════ */}
        <section style={{ background: INK }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32 grid grid-cols-12 gap-8 items-center">
            <div className="col-span-12 lg:col-span-7 relative">
              <img
                src={heroWhanau}
                alt="A whānau gathered around a single phone on a sunlit deck"
                className="w-full h-auto rounded-sm"
                style={{ filter: "saturate(0.85) contrast(1.05)" }}
                loading="lazy"
                width={1600}
                height={1280}
              />
              <div
                className="absolute -bottom-4 -left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em]"
                style={{
                  background: OCHRE,
                  color: INK,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                One phone. One number. One whānau.
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <p
                className="text-[10px] uppercase tracking-[0.4em] mb-6"
                style={{ color: OCHRE, fontFamily: "'JetBrains Mono', monospace" }}
              >
                The promise
              </p>
              <h2
                className="font-light leading-[1.05] tracking-[-0.02em]"
                style={{
                  color: PAPER,
                  fontFamily: "Lato, sans-serif",
                  fontSize: "clamp(2rem, 3.6vw, 3.25rem)",
                }}
              >
                Built for the parent who is{" "}
                <em style={{ color: OCHRE, fontStyle: "italic" }}>holding everything</em> and quietly
                drowning.
              </h2>
              <p className="mt-6 text-[16px] leading-relaxed" style={{ color: PAPER, opacity: 0.7 }}>
                Tōro doesn't ask you to learn another app, log in again, or download anything. It just
                takes a text. School notices. Meal plans. Appointments. Birthday gifts. Term dates.
                Mum's prescription. Done — and quietly remembered for next time.
              </p>
            </div>
          </div>
        </section>

        {/* ════ WHAT IT HANDLES — asymmetric grid ════ */}
        <section style={{ background: PAPER }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="grid grid-cols-12 gap-6 mb-16">
              <div className="col-span-12 lg:col-span-5">
                <p
                  className="text-[10px] uppercase tracking-[0.4em] mb-5"
                  style={{ color: OCHRE, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  What it handles
                </p>
                <h2
                  className="font-light leading-[1] tracking-[-0.02em]"
                  style={{
                    color: INK,
                    fontFamily: "Lato, sans-serif",
                    fontSize: "clamp(2.25rem, 4.5vw, 4rem)",
                  }}
                >
                  Six things off your plate.
                </h2>
              </div>
              <div className="col-span-12 lg:col-span-6 lg:col-start-7 self-end">
                <p className="text-[16px] leading-relaxed" style={{ color: INK, opacity: 0.7 }}>
                  Each one starts with a single text. Tōro picks it up, asks two clarifying questions if
                  needed, then takes care of it. You see the result come back as a message — or in the
                  dashboard if you want to see the working.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-px" style={{ background: `${INK}14` }}>
              {HANDLES.map((h, i) => (
                <motion.div
                  key={h.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="col-span-12 sm:col-span-6 lg:col-span-4 p-8 sm:p-10 group transition-colors"
                  style={{ background: PAPER }}
                >
                  <div className="flex items-baseline gap-4 mb-5">
                    <span
                      className="text-[11px] uppercase tracking-[0.3em] font-semibold"
                      style={{ color: OCHRE, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {h.num}
                    </span>
                    <span className="h-px flex-1" style={{ background: `${INK}25` }} />
                  </div>
                  <h3
                    className="font-light leading-tight tracking-[-0.01em] mb-3"
                    style={{
                      color: INK,
                      fontFamily: "Lato, sans-serif",
                      fontSize: "clamp(1.5rem, 2.2vw, 2rem)",
                    }}
                  >
                    {h.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed" style={{ color: INK, opacity: 0.65 }}>
                    {h.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ HOW IT WORKS — three steps, oversized numerals ════ */}
        <section style={{ background: PAPER }}>
          <div
            className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32"
            style={{ borderTop: `1px solid ${INK}14` }}
          >
            <div className="grid grid-cols-12 gap-8">
              {[
                { n: "01", t: "Save 3688", b: "Add Tōro to your contacts. That's the entire setup." },
                { n: "02", t: "Text it", b: "Anything — pickup time, dinner ideas, dentist, school form, trip." },
                { n: "03", t: "It's handled", b: "You get a reply. Tōro remembers. Your whānau keeps moving." },
              ].map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="col-span-12 md:col-span-4"
                >
                  <div
                    className="font-light leading-none"
                    style={{
                      color: i === 1 ? OCHRE : INK,
                      fontFamily: "Lato, sans-serif",
                      fontSize: "clamp(4rem, 8vw, 7rem)",
                      opacity: i === 1 ? 1 : 0.95,
                    }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="mt-3 font-light tracking-[-0.01em]"
                    style={{ color: INK, fontFamily: "Lato, sans-serif", fontSize: "1.75rem" }}
                  >
                    {s.t}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed max-w-xs" style={{ color: INK, opacity: 0.65 }}>
                    {s.b}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════ PRICING — single bold panel ════ */}
        <section style={{ background: INK }}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-12 lg:col-span-6">
                <p
                  className="text-[10px] uppercase tracking-[0.4em] mb-6"
                  style={{ color: OCHRE, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Pricing
                </p>
                <div className="flex items-end gap-4 mb-4">
                  <div
                    className="font-light leading-none"
                    style={{
                      color: PAPER,
                      fontFamily: "Lato, sans-serif",
                      fontSize: "clamp(5rem, 12vw, 10rem)",
                    }}
                  >
                    $29
                  </div>
                  <div className="pb-4 text-[11px] uppercase tracking-[0.3em]" style={{ color: PAPER, opacity: 0.55 }}>
                    / month
                  </div>
                </div>
                <p className="text-[16px] leading-relaxed max-w-md" style={{ color: PAPER, opacity: 0.7 }}>
                  Whole whānau. No setup fee. No contract. Cancel by texting{" "}
                  <span style={{ color: OCHRE, fontFamily: "'JetBrains Mono', monospace" }}>STOP</span>.
                </p>
              </div>

              <div className="col-span-12 lg:col-span-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "Covers your whole whānau",
                    "No setup fee, ever",
                    "No lock-in contracts",
                    "Cancel anytime",
                    "Works on any phone, any network",
                    "First month on us",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: OCHRE, color: INK }}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span className="text-[14.5px]" style={{ color: PAPER, opacity: 0.85 }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-4 items-center">
                  <a
                    href="https://buy.stripe.com/7sYdRbc9KeoE0KNdx43oA0c"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-7 py-4 rounded-full text-sm font-medium transition-transform hover:-translate-y-0.5"
                    style={{ background: OCHRE, color: INK }}
                  >
                    Start free — first month on us
                    <ArrowRight size={16} />
                  </a>
                  <TextUsButton keteName="Tōro" accentColor={OCHRE} showWhatsApp={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════ CLOSING LINE ════ */}
        <section style={{ background: PAPER }}>
          <div
            className="max-w-7xl mx-auto px-6 sm:px-10 py-28 sm:py-40 text-left"
            style={{ borderTop: `1px solid ${INK}14` }}
          >
            <p
              className="font-light tracking-[-0.02em] max-w-4xl"
              style={{
                color: INK,
                fontFamily: "Lato, sans-serif",
                fontSize: "clamp(2rem, 5vw, 4.5rem)",
                lineHeight: 1.05,
              }}
            >
              The mental load{" "}
              <em style={{ color: OCHRE, fontStyle: "italic" }}>was never yours alone</em> to carry.
              Text 3688.
            </p>
            <a
              href="sms:3688?body=Kia%20ora%20T%C5%8Dro"
              className="mt-12 inline-flex items-center gap-3 text-sm font-medium underline underline-offset-[6px] decoration-1"
              style={{ color: INK, textDecorationColor: `${INK}40` }}
            >
              Start now <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className="px-6 pb-12 text-center">
          <LiveStatusStrip pack="toroa" agentCodes={["nexus", "creative", "wellness"]} accent={POUNAMU} />
        </section>
        <BrandFooter />
        <KeteAgentChat
          keteName="Tōro"
          keteLabel="Family Navigator"
          accentColor={OCHRE}
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
