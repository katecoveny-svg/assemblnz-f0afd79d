import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Building2, Scale, ShieldAlert, Brain, Globe, Database, MessageSquare, Send } from "lucide-react";
import { manaakiMark, hangaMark, auahaMark, pakihiMark, hangarauMark } from "@/assets/brand";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

/* ─── Shared ─── */
const Eyebrow = ({ children }: { children: string }) => (
  <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
    {children}
  </span>
);
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#FFFFFF", lineHeight: 1.25 }}>
    {children}
  </h2>
);
const Body = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm sm:text-[15px] leading-relaxed ${className}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.55)" }}>
    {children}
  </p>
);

const SECTION_STYLE = "relative px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";

/* ─── Micro-proof pills ─── */
const PROOF = [
  "Built in Aotearoa",
  "42 specialist agents",
  "5 industry packs",
  "NZ-context intelligence",
  "SMS-ready",
  "From $89/month NZD",
];

/* ─── Outcome cards ─── */
const OUTCOMES = [
  { title: "Win work", body: "Generate proposals, tenders, pricing support, content, and outreach faster — without starting from scratch every time.", color: "#D4A843" },
  { title: "Run work", body: "Support HR, payroll, reporting, operations, workflows, and day-to-day business execution in one connected system.", color: "#3A7D6E" },
  { title: "Stay sharp", body: "Bring NZ-aware compliance, shared business memory, and practical business intelligence into everyday decisions.", color: "#1A3A5C" },
];

/* ─── How-it-works steps ─── */
const STEPS = [
  { num: "01", title: "You ask", body: "Start with a real business task, problem, or workflow." },
  { num: "02", title: "Assembl routes", body: "The platform selects the right specialist intelligence and applies the right context." },
  { num: "03", title: "You move faster", body: "Get practical output, clearer decisions, and less admin drag." },
];

/* ─── Industry packs ─── */
const PACKS = [
  { name: "Manaaki", sub: "Hospitality", mark: manaakiMark, desc: "Support guest experience, food safety, service operations, and venue workflows.", to: "/packs/manaaki", color: "#D4A843" },
  { name: "Hanga", sub: "Construction", mark: hangaMark, desc: "Support BIM, documentation, safety, project coordination, and quoting workflows.", to: "/packs/hanga", color: "#3A7D6E" },
  { name: "Auaha", sub: "Creative", mark: auahaMark, desc: "Support strategy, content, campaigns, creative production, and brand execution.", to: "/packs/auaha", color: "#D4A843" },
  { name: "Pakihi", sub: "Business Operations", mark: pakihiMark, desc: "Support finance, HR, legal admin, planning, reporting, and internal operations.", to: "/packs/pakihi", color: "#3A7D6E" },
  { name: "Hangarau", sub: "Technology", mark: hangarauMark, desc: "Support systems, monitoring, architecture, code workflows, and technical delivery.", to: "/packs/hangarau", color: "#1A3A5C" },
];

/* ─── Differentiators ─── */
const DIFFS = [
  { icon: Globe, title: "NZ business context", body: "Built around local business reality, not overseas defaults." },
  { icon: Brain, title: "Specialist intelligence", body: "Purpose-built capability across five packs, not one generic assistant." },
  { icon: Database, title: "Shared business memory", body: "Work compounds over time instead of resetting every session." },
  { icon: MessageSquare, title: "Cultural & language intelligence", body: "Te Kāhui Reo strengthens trust, reo quality, and tikanga alignment." },
  { icon: Building2, title: "Accessible SME pricing", body: "Enterprise-level capability without enterprise-only pricing." },
];

/* ─── Pricing tiers ─── */
const TIERS = [
  { name: "Starter", price: "$89", period: "/month", desc: "One painful workflow solved well." },
  { name: "Pro", price: "$299", period: "/month", desc: "Multi-function support for growing teams." },
  { name: "Business", price: "$599", period: "/month", desc: "A real operating layer for established businesses." },
  { name: "Industry Suite", price: "$1,499", period: "/month", desc: "Tailored implementation for more complex needs." },
];

/* ─── Page ─── */
const Index = () => {
  const isMobile = useIsMobile();
  const packsRef = useRef<HTMLDivElement>(null);
  const [pilotName, setPilotName] = useState("");
  const [pilotEmail, setPilotEmail] = useState("");
  const [pilotBiz, setPilotBiz] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  const scrollToPacks = () => packsRef.current?.scrollIntoView({ behavior: "smooth" });

  const handlePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from("contact_submissions").insert({ name: pilotName, email: pilotEmail, message: `Founding pilot application — ${pilotBiz}` });
      toast.success("Application received! We'll be in touch.");
      setPilotName(""); setPilotEmail(""); setPilotBiz("");
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from("contact_submissions").insert({ name: contactName, email: contactEmail, message: contactMsg });
      toast.success("Message sent. We'll get back to you soon.");
      setContactName(""); setContactEmail(""); setContactMsg("");
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.6 } };

  return (
    <div className="min-h-screen" style={{ background: "#09090F", color: "#FFFFFF" }}>
      <SEO title="Assembl — The operating system for NZ business" description="One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa." />
      <BrandNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-16 sm:pt-20 pb-12" style={{ zIndex: 1 }}>
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(212,168,67,0.04) 0%, transparent 70%)", zIndex: 0 }} />

        {/* Matariki dots */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse pointer-events-none" style={{
            width: 2 + Math.random() * 2, height: 2 + Math.random() * 2,
            top: `${10 + Math.random() * 60}%`, left: `${5 + Math.random() * 90}%`,
            background: "#FFFFFF", opacity: 0.15 + Math.random() * 0.2,
            animationDelay: `${Math.random() * 4}s`, animationDuration: `${3 + Math.random() * 4}s`,
            zIndex: 0,
          }} />
        ))}

        <motion.h1 className="relative max-w-3xl" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: isMobile ? "1.75rem" : "3rem", lineHeight: 1.2, letterSpacing: "-0.01em", zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          The operating system for{" "}<span style={{ color: "#D4A843" }}>NZ business.</span>
        </motion.h1>

        <motion.p className="relative max-w-xl mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: isMobile ? "15px" : "17px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", zIndex: 1 }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          One intelligence layer for quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa.
        </motion.p>

        <motion.p className="relative max-w-md mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.38)", zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}>
          42 specialist AI agents across five industry packs. Built in New Zealand. Designed for real businesses.
        </motion.p>

        {/* Proof pills */}
        <motion.div className="relative flex flex-wrap justify-center gap-2.5 mt-6"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}>
          {PROOF.map((p) => (
            <span key={p} className="px-3.5 py-1.5 rounded-full text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, background: "rgba(15,15,26,0.7)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.03em" }}>
              {p}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div className="relative flex flex-col sm:flex-row gap-3 mt-8"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}>
          <a href="#founding-pilots" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full">
            Book a founding pilot <ArrowRight size={16} />
          </a>
          <button onClick={scrollToPacks} className="cta-glass-outline inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full">
            Explore industry packs →
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button onClick={scrollToPacks} className="mt-10" style={{ color: "rgba(255,255,255,0.25)", zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>
      </section>

      {/* ═══ 2. THE PROBLEM ═══ */}
      <section className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade}>
            <Eyebrow>WHY ASSEMBL</Eyebrow>
            <SectionHeading>NZ businesses are expected to do enterprise work with small-team resources.</SectionHeading>
            <Body className="max-w-2xl mb-10">
              Most owner-led businesses in Aotearoa are carrying too much operational complexity across too many disconnected tools. They need help with quoting, admin, compliance, planning, people, reporting, and growth — but they cannot justify a stack of consultants, agencies, and enterprise software.
            </Body>
            <Body className="max-w-2xl mb-12" >
              Generic AI helps in pieces. Assembl brings the whole operation closer together.
            </Body>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Building2, stat: "605,000", label: "NZ enterprises" },
              { icon: Scale, stat: "97%", label: "are small enterprises" },
              { icon: ShieldAlert, stat: "$4.2B", label: "professional services spend" },
            ].map((c, i) => (
              <motion.div key={c.label} className="rounded-2xl p-6 text-center card-glow-hover" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 20px rgba(212,168,67,0.06), 0 4px 20px rgba(0,0,0,0.3)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <c.icon size={24} className="mx-auto mb-3" style={{ color: "#D4A843" }} />
                <p className="text-2xl font-light mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{c.stat}</p>
                <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}>{c.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. WHAT ASSEMBL DOES (Outcomes) ═══ */}
      <section className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>ONE PLATFORM</Eyebrow>
            <SectionHeading>Win work. Run work. Stay sharp.</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OUTCOMES.map((o, i) => (
              <motion.div key={o.title} className="rounded-2xl p-8" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                <div className="w-10 h-1 rounded-full mb-5" style={{ background: o.color }} />
                <h3 className="text-lg mb-3" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF" }}>{o.title}</h3>
                <Body>{o.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. HOW IT WORKS ═══ */}
      <section id="how-it-works" className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <SectionHeading>One request. The right intelligence. The right context.</SectionHeading>
          </motion.div>
          <motion.div {...fade}>
            <Body className="max-w-2xl mx-auto text-center mb-14">
              Assembl routes work through the right specialist capability — whether that is finance, HR, marketing, construction, operations, or technology. The platform applies business context, compliance logic, and shared memory so work does not begin from zero each time.
            </Body>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} className="rounded-2xl p-8 relative" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                <span className="text-[40px] font-light absolute top-6 right-6" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(212,168,67,0.12)" }}>{s.num}</span>
                <h3 className="text-lg mb-3 mt-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF" }}>{s.title}</h3>
                <Body>{s.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. INDUSTRY PACKS ═══ */}
      <section ref={packsRef} id="industry-packs" className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>INDUSTRY PACKS</Eyebrow>
            <SectionHeading>Built for the way NZ businesses actually operate.</SectionHeading>
          </motion.div>
          <motion.div {...fade}>
            <Body className="text-center max-w-xl mx-auto mb-14">
              Assembl is organised into five industry packs so businesses can start where value is most immediate.
            </Body>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Link to={p.to} className="block rounded-2xl p-7 transition-all duration-300 hover:translate-y-[-2px] group" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={p.mark} alt={p.name} className="w-8 h-8 mb-4" />
                  <h3 className="text-base mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF" }}>
                    {p.name} <span style={{ color: "rgba(255,255,255,0.4)" }}>— {p.sub}</span>
                  </h3>
                  <Body>{p.desc}</Body>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. WHY ASSEMBL IS DIFFERENT ═══ */}
      <section id="why-assembl" className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>WHY IT WINS</Eyebrow>
            <SectionHeading>Built for Aotearoa, not adapted as an afterthought.</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIFFS.map((d, i) => (
              <motion.div key={d.title} className="rounded-2xl p-7" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <d.icon size={22} className="mb-4" style={{ color: "#3A7D6E" }} />
                <h3 className="text-sm font-medium mb-2" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{d.title}</h3>
                <Body>{d.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. TE KĀHUI REO ═══ */}
      <section id="te-kahui-reo" className={SECTION_STYLE}>
        <div className={`${INNER} max-w-3xl text-center`}>
          <motion.div {...fade}>
            <Eyebrow>TRUST LAYER</Eyebrow>
            <SectionHeading>Cultural and language intelligence, built in.</SectionHeading>
            <Body className="mb-6">
              Assembl includes a cross-platform cultural and language layer designed to support stronger reo quality, more grounded communication, and better alignment with Aotearoa context. It is not an add-on after the fact. It is part of how the platform earns trust.
            </Body>
            <p className="text-xs leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.35)" }}>
              Te Kāhui Reo supports organisations serving Māori communities, working in bilingual contexts, or seeking a more culturally grounded operating model.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ 8. FOUNDING PILOTS ═══ */}
      <section id="founding-pilots" className={SECTION_STYLE}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>FOUNDING PILOTS</Eyebrow>
            <SectionHeading>We're opening a limited number of founding pilots for NZ businesses.</SectionHeading>
            <Body className="mb-10">
              We're working with a small group of early customers to shape the next stage of Assembl. Founding pilots receive hands-on onboarding, direct access, and early workflow design support.
            </Body>
          </motion.div>
          <motion.form onSubmit={handlePilot} className="rounded-2xl p-8 text-left space-y-4" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input value={pilotName} onChange={(e) => setPilotName(e.target.value)} placeholder="Your name" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={pilotEmail} onChange={(e) => setPilotEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={pilotBiz} onChange={(e) => setPilotBiz(e.target.value)} placeholder="Business name & industry" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2" style={{ fontFamily: "'Lato', sans-serif", background: "#D4A843", color: "#09090F" }}>
              Apply for a founding pilot <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Best suited to businesses that want to replace fragmented tools with one intelligence layer.</p>
          </motion.form>
        </div>
      </section>

      {/* ═══ 9. PRICING PREVIEW ═══ */}
      <section className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-14">
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Start with the level that fits your business.</SectionHeading>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map((t, i) => (
              <motion.div key={t.name} className="rounded-2xl p-7 text-center" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <h3 className="text-sm font-medium mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{t.name}</h3>
                <p className="text-2xl font-light mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843" }}>{t.price}<span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.period}</span></p>
                <Body>{t.desc}</Body>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#3A7D6E" }}>
              See full pricing <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 10. TŌROA (Portfolio line) ═══ */}
      <section className={SECTION_STYLE}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <SectionHeading>Meet Tōroa.</SectionHeading>
            <Body className="mb-8">
              Tōroa is our standalone SMS-first family AI navigator for Aotearoa — designed for whānau, everyday coordination, and practical support.
            </Body>
            <Link to="/toroa" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full" style={{ fontFamily: "'Lato', sans-serif", border: "1px solid rgba(212,168,67,0.3)", color: "#D4A843" }}>
              Visit Tōroa <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ 11. CONTACT ═══ */}
      <section id="contact" className={SECTION_STYLE}>
        <div className={`${INNER} max-w-xl mx-auto`}>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow>CONTACT</Eyebrow>
            <SectionHeading>Get in touch.</SectionHeading>
          </motion.div>
          <motion.form onSubmit={handleContact} className="rounded-2xl p-8 space-y-4" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="How can we help?" rows={4} required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2" style={{ fontFamily: "'Lato', sans-serif", background: "#D4A843", color: "#09090F" }}>
              Send message <Send size={16} />
            </button>
          </motion.form>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default Index;
