import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FEATURES = [
  { emoji: "🎙️", name: "VOICE-TO-ACTION", one: "Nan calls. Tōroa listens. The right person gets a text.", how: "Kuia talks into any phone — even a Nokia. Tōroa understands te reo, sets reminders, and forwards messages to the right whānau member." },
  { emoji: "🥘", name: "FRIDGE-TO-KAI", one: "Photo your fridge. Get dinner sorted in 10 seconds.", how: "Tōroa sees what you've got, knows your daughter is gluten-free, and texts back three recipes that use what's already in the house." },
  { emoji: "💰", name: "BENEFITS CHECK", one: "Find out if you're leaving money on the table.", how: "Tōroa calculates your Working for Families, FamilyBoost, and childcare subsidy entitlements. Thousands of NZ families miss out every year." },
  { emoji: "🏫", name: "SCHOOL TRANSLATOR", one: "Forward the newsletter. Get the three things that matter.", how: "Hero notifications, email newsletters, camp forms — forward any of it to Tōroa. It reads the lot and texts you what you actually need to know." },
  { emoji: "🧠", name: "WHĀNAU MEMORY", one: "The longer you use it, the more it knows your family.", how: "Names, allergies, paydays, school terms, who picks up the kids on Wednesdays. Tōroa remembers — like your aunty does." },
  { emoji: "🧾", name: "RECEIPT TRACKER", one: "Photo your receipt. See where the money goes.", how: "Snap any receipt, text it to Tōroa. Weekly and monthly spending summaries arrive automatically. No bank login required." },
  { emoji: "📚", name: "HOMEWORK HELPER", one: "Your kid texts a photo. Tōroa teaches — doesn't cheat.", how: "Follows the NZ curriculum and NCEA standards. Explains the method, not the answer. Parents get a quiet update on what subjects need attention." },
  { emoji: "💊", name: "MEDICATION REMINDERS", one: "Nan gets a text at 8am and 8pm. You get a text if she doesn't reply.", how: "Set it once in plain language. Tōroa handles the reminders and the follow-ups. Works on basic phones with no apps." },
  { emoji: "🏔️", name: "MARAE COORDINATOR", one: "Organising kai for 60 people? Tōroa tracks who's bringing what.", how: "Whānau reunions, tangi, community events — Tōroa sends the texts, tracks RSVPs, and nudges Uncle Joe when he hasn't replied." },
  { emoji: "🔮", name: "PREDICTIVE CALENDAR", one: "School holidays in 2 weeks — last time you booked Nana for childcare.", how: "After a few months, Tōroa starts anticipating what's coming. It learns your family's patterns and gives you a heads-up before you have to ask." },
];

const STEPS = [
  { num: "01", title: "Text the number", desc: "Save Tōroa's number. Text \"kia ora\" to get started. Works on any phone — smartphone, flip phone, your nan's Nokia." },
  { num: "02", title: "Tell it about your whānau", desc: "Names, ages, allergies, school, payday — whatever you want Tōroa to know. It builds your family profile one text at a time." },
  { num: "03", title: "Just text when you need it", desc: "\"What's for dinner?\" \"When's the next mufti day?\" \"Am I eligible for FamilyBoost?\" Tōroa knows your family, so the answers are yours — not generic." },
];

const WHANAU_FEATURES = [
  "Up to 4 whānau members",
  "Whānau memory + context",
  "Fridge-to-kai recipes",
  "School admin translator",
  "Benefits eligibility check",
  "Medication reminders",
];

const PRO_FEATURES = [
  "Unlimited whānau members",
  "Voice-to-action (kuia feature)",
  "Receipt tracking + budget summaries",
  "Homework helper (NZ curriculum)",
  "Marae event coordinator",
  "Predictive calendar",
];

const Eyebrow = ({ children, color = "#D4A843" }: { children: string; color?: string }) => (
  <p
    className="font-display font-bold uppercase text-xs mb-4"
    style={{ letterSpacing: "5px", color }}
  >
    {children}
  </p>
);

const SectionHeading = ({ children }: { children: string }) => (
  <h2
    className="font-display font-light uppercase text-white mb-8"
    style={{ letterSpacing: "6px", fontSize: "clamp(24px, 4vw, 36px)" }}
  >
    {children}
  </h2>
);

const GlassCard = ({ children, className = "", highlighted = false }: { children: React.ReactNode; className?: string; highlighted?: boolean }) => (
  <div
    className={`rounded-2xl p-8 ${className}`}
    style={{
      background: "rgba(15, 15, 26, 0.6)",
      backdropFilter: "blur(20px)",
      border: highlighted
        ? "1px solid rgba(212, 168, 67, 0.3)"
        : "1px solid rgba(212, 168, 67, 0.12)",
      boxShadow: highlighted ? "0 0 40px rgba(212, 168, 67, 0.08)" : "none",
    }}
  >
    {children}
  </div>
);

const PrimaryBtn = ({ children, href, onClick }: { children: string; href?: string; onClick?: () => void }) => {
  const cls = "inline-block font-display font-bold uppercase text-sm rounded-lg cursor-pointer text-center";
  const style = { background: "#D4A843", color: "#09090F", letterSpacing: "2px", padding: "14px 32px" };
  if (href) return <a href={href} className={cls} style={style}>{children}</a>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
};

const SecondaryBtn = ({ children, onClick }: { children: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="inline-block font-display font-bold uppercase text-sm rounded-lg cursor-pointer"
    style={{ background: "transparent", border: "1px solid rgba(212, 168, 67, 0.4)", color: "#D4A843", letterSpacing: "2px", padding: "14px 32px" }}
  >
    {children}
  </button>
);

export default function ToroaLandingPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "#09090F", color: "#FFFFFF" }} className="min-h-screen font-body">
      <SEO title="Tōroa — SMS-first whānau AI navigator | Assembl" description="SMS-first AI that remembers your family, reminds your nan, and finds the money you're missing. Works on any phone. Built in Aotearoa." />
      <BrandNav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ padding: "80px 24px 80px" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(600px circle at 50% 40%, rgba(212, 168, 67, 0.08), transparent 70%)" }}
        />
        <motion.div className="relative max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} custom={0}>
            <Eyebrow>ASSEMBL WHĀNAU INTELLIGENCE</Eyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp} custom={1}
            className="font-display font-light uppercase text-white mb-6"
            style={{ letterSpacing: "6px", fontSize: "clamp(28px, 5vw, 48px)" }}
          >
            Your whānau has enough apps. Tōroa is a text message.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="font-body mx-auto mb-10" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 680, fontSize: 18 }}>
            SMS-first AI that remembers your family, reminds your nan, and tells you about the $3,000 in FamilyBoost you're not claiming. Works on any phone. No app. No wifi.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <PrimaryBtn href="/chat/family">Text Tōroa now</PrimaryBtn>
            <SecondaryBtn onClick={() => scrollTo("how-it-works")}>See how it works</SecondaryBtn>
          </motion.div>
          <motion.p variants={fadeUp} custom={4} className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
            From $14/month per whānau
          </motion.p>
        </motion.div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeUp} custom={0}><Eyebrow color="#3A7D6E">THE PROBLEM</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-display font-light uppercase text-white mb-6" style={{ letterSpacing: "6px", fontSize: "clamp(24px, 4vw, 36px)" }}>
              Seven apps. Three logins. Zero help.
            </motion.h2>
            <motion.div variants={fadeUp} custom={2} className="font-body space-y-4" style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.8 }}>
              <p>Hero for school notices. Kindo for school payments. A WhatsApp group for rugby. A shared calendar nobody updates. A spreadsheet for the budget that's three months out of date. And somewhere in your email, a FamilyBoost form you started filling out in February.</p>
              <p>Your whānau doesn't need another app. You need one place that actually knows your family and does something useful with that knowledge.</p>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-xs mx-auto rounded-3xl p-8" style={{ background: "rgba(15, 15, 26, 0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="space-y-3">
                {/* Tōroa message */}
                <div className="rounded-lg p-3" style={{ background: "rgba(58, 125, 110, 0.2)", borderLeft: "3px solid #3A7D6E" }}>
                  <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                    Kia ora! Mufti day Friday — $2 coin. Tama's camp dates moved to 15-17 March. Want me to add it to the calendar?
                  </p>
                </div>
                {/* User reply */}
                <div className="flex justify-end">
                  <div className="rounded-lg p-3" style={{ background: "rgba(212, 168, 67, 0.15)" }}>
                    <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Yes please</p>
                  </div>
                </div>
                {/* Tōroa reply */}
                <div className="rounded-lg p-3" style={{ background: "rgba(58, 125, 110, 0.2)", borderLeft: "3px solid #3A7D6E" }}>
                  <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                    Done. Also — your car WOF expires next Friday. $220.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto text-center">
          <Eyebrow>WHAT TŌROA DOES</Eyebrow>
          <SectionHeading>Ten things your family actually needs</SectionHeading>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 mt-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.name}
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp} custom={i % 4}
            >
              <GlassCard>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-2xl" style={{ background: "rgba(212, 168, 67, 0.1)" }}>
                    {f.emoji}
                  </div>
                  <div>
                    <p className="font-display font-bold uppercase text-sm mb-1" style={{ letterSpacing: "3px", color: "#D4A843", fontSize: 14 }}>{f.name}</p>
                    <p className="font-body mb-1" style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>{f.one}</p>
                    <p className="font-body italic" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{f.how}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto text-center">
          <Eyebrow color="#3A7D6E">HOW IT WORKS</Eyebrow>
          <SectionHeading>Three steps. No download.</SectionHeading>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-8">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <GlassCard className="!p-6">
                <p className="font-mono mb-3" style={{ fontSize: 48, color: "#D4A843", opacity: 0.3, fontWeight: 500 }}>{s.num}</p>
                <p className="font-display font-bold uppercase text-base mb-2" style={{ letterSpacing: "3px" }}>{s.title}</p>
                <p className="font-body" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{s.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto text-center">
          <Eyebrow>PRICING</Eyebrow>
          <SectionHeading>Less than your Netflix. More useful than your junk drawer.</SectionHeading>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6 mt-8">
          {/* Whānau */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <GlassCard className="h-full flex flex-col">
              <p className="font-display font-light uppercase text-sm mb-4" style={{ letterSpacing: "3px", color: "rgba(255,255,255,0.6)" }}>Whānau</p>
              <div className="mb-6">
                <span className="font-display font-light" style={{ fontSize: 56, color: "#D4A843" }}>$14</span>
                <span className="font-body ml-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>/month</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {WHANAU_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                    <span style={{ color: "#3A7D6E" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <PrimaryBtn href="/chat/family">Start texting</PrimaryBtn>
            </GlassCard>
          </motion.div>

          {/* Whānau Pro */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <GlassCard className="h-full flex flex-col" highlighted>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-display font-light uppercase text-sm" style={{ letterSpacing: "3px", color: "rgba(255,255,255,0.6)" }}>Whānau Pro</p>
                <span className="font-display font-bold uppercase rounded px-3 py-1" style={{ fontSize: 10, letterSpacing: "2px", background: "rgba(212,168,67,0.15)", color: "#D4A843" }}>
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-4">
                <span className="font-display font-light" style={{ fontSize: 56, color: "#D4A843" }}>$29</span>
                <span className="font-body ml-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>/month</span>
              </div>
              <p className="font-body text-sm mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Everything in Whānau, plus:</p>
              <ul className="space-y-2 mb-8 flex-1">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-body" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                    <span style={{ color: "#3A7D6E" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <PrimaryBtn href="/chat/family">Start texting</PrimaryBtn>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ── THE NZ DIFFERENCE ── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow color="#3A7D6E">BUILT IN AOTEAROA</Eyebrow>
          <SectionHeading>Every family AI on the market is an app built in California.</SectionHeading>
          <div className="font-body space-y-5" style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, lineHeight: 1.9 }}>
            <p>Tōroa is SMS-first. Built for families who might have a Nokia, might speak te reo, might live rural, and definitely deserve the same quality of AI that a tech family in Palo Alto gets.</p>
            <p>It knows Working for Families. It knows NCEA. It knows what a mufti day is. It knows that when Nan says "the mokos," she means her grandchildren — and it knows their names.</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>That's not a feature comparison. That's a values statement.</p>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative overflow-hidden" style={{ padding: "100px 24px 120px" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(600px circle at 50% 50%, rgba(212, 168, 67, 0.08), transparent 70%)" }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display font-light uppercase text-white mb-8" style={{ letterSpacing: "6px", fontSize: "clamp(22px, 4vw, 32px)" }}>
            Your whānau deserves better than seven apps and a spreadsheet.
          </h2>
          <PrimaryBtn href="/chat/family">Text Tōroa now</PrimaryBtn>
          <p className="font-body mt-6" style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300 }}>
            No app to download. No account to create. Just text.
          </p>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
}
