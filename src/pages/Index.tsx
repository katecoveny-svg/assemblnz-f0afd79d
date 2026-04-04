import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import { manaakiMark, hangaMark, auahaMark, pakihiMark, hangarauMark, ihoIcon, kanohiIcon, maharaIcon, manaIcon, teKahuiReoMark } from "@/assets/brand";
import KeteHero from "@/components/KeteHero";
import KetePackSelector from "@/components/KetePackSelector";
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
  "78 specialist agents",
  "9 industry kete",
  "8 Shared Core agents",
  "NZ-context intelligence",
  "SMS-ready",
];

/* ─── Outcome cards ─── */
const KoruSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ opacity: 0.18 }}>
    <path d="M40 8C40 8 20 16 20 36C20 50 30 56 40 56C50 56 56 48 56 40C56 32 50 28 44 28C38 28 34 32 34 36C34 40 38 44 42 44C46 44 48 42 48 40" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
const TanikoSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ opacity: 0.18 }}>
    <path d="M10 20L20 30L30 20L40 30L50 20L60 30L70 20" stroke="#3A7D6E" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M10 32L20 42L30 32L40 42L50 32L60 42L70 32" stroke="#3A7D6E" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M10 44L20 54L30 44L40 54L50 44L60 54L70 44" stroke="#3A7D6E" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M10 56L20 66L30 56L40 66L50 56L60 66L70 56" stroke="#3A7D6E" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
const MauaoSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ opacity: 0.18 }}>
    <path d="M8 68L30 24L40 36L56 16L72 68" stroke="#1A3A5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M8 68H72" stroke="#1A3A5C" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const TanikoDivider = () => (
  <svg width="300" height="8" viewBox="0 0 300 8" fill="none" aria-hidden="true" className="mx-auto mb-4">
    <path d="M0 4L10 0L20 4L30 0L40 4L50 0L60 4L70 0L80 4L90 0L100 4L110 0L120 4L130 0L140 4L150 0L160 4L170 0L180 4L190 0L200 4L210 0L220 4L230 0L240 4L250 0L260 4L270 0L280 4L290 0L300 4" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
  </svg>
);
const OUTCOMES = [
  { title: "Close Faster", body: "Better proposals start with speed. Assembl cuts the busywork, so your team pitches more, quotes tighter, closes harder.", color: "#D4A843", Icon: KoruSVG, iconPos: "top-left" as const },
  { title: "Run It Right", body: "Every NZ business juggles payroll, tax, compliance, schedules. Assembl handles it. Your team focuses on the work that makes money.", color: "#3A7D6E", Icon: TanikoSVG, iconPos: "top-right" as const },
  { title: "Alerts That Count", body: "NZ compliance changes weekly. Assembl flags what affects you — regulation, deadline, opportunity — so you're never caught flat.", color: "#1A3A5C", Icon: MauaoSVG, iconPos: "bottom-center" as const },
];

/* ─── How-it-works steps ─── */
const STEPS = [
  { num: "01", title: "You ask", body: "Start with a real business task, problem, or workflow." },
  { num: "02", title: "Assembl routes", body: "The platform selects the right specialist intelligence and applies the right context." },
  { num: "03", title: "You move faster", body: "Get practical output, clearer decisions, and less admin drag." },
];

/* ─── Industry packs ─── */
const PACKS = [
  { name: "Manaaki", sub: "Hospitality & Tourism", mark: manaakiMark, desc: "Food safety, liquor licensing, guest experience, luxury lodging, adventure tourism.", to: "/manaaki", color: "#D4A843" },
  { name: "Hanga", sub: "Construction", mark: hangaMark, desc: "Site to sign-off. Safety, BIM, consenting, project management, architecture, tenders.", to: "/hanga", color: "#3A7D6E" },
  { name: "Auaha", sub: "Creative & Media", mark: auahaMark, desc: "Brief to published. Copy, image, video, podcast, ads, analytics — the full creative pipeline.", to: "/auaha", color: "#D4A843" },
  { name: "Pakihi", sub: "Business & Commerce", mark: pakihiMark, desc: "Accounting, insurance, retail, trade, agriculture, real estate, immigration.", to: "/pakihi", color: "#5AADA0" },
  { name: "Hangarau", sub: "Technology", mark: hangarauMark, desc: "Security, DevOps, infrastructure, monitoring, environment, manufacturing, IP.", to: "/hangarau", color: "#1A3A5C" },
  { name: "Waka", sub: "Transport & Vehicles", mark: pakihiMark, desc: "Automotive, maritime, trucking, logistics. Dealership compliance to heavy vehicle logbooks.", to: "/kete/waka", color: "#6B8FA3" },
  { name: "Hauora", sub: "Health & Lifestyle", mark: manaakiMark, desc: "Sport, health, beauty, nutrition, interior design, travel.", to: "/kete/hauora", color: "#A87D4A" },
  { name: "Te Kāhui Reo", sub: "Māori Business Intelligence", mark: teKahuiReoMark, desc: "Data sovereignty, whānau governance, iwi reporting, kaupapa Māori.", to: "/kete/te-kahui-reo", color: "#3A6A9C" },
  { name: "Tōroa", sub: "Family Navigator", mark: manaakiMark, desc: "SMS-first. No app, no login. Just text. $29/mo.", to: "/toroa", color: "#D4A843" },
];

/* ─── Differentiators ─── */
const DIFFS = [
  { mark: ihoIcon, title: "NZ business context", body: "Built around local business reality, not overseas defaults." },
  { mark: kanohiIcon, title: "Specialist intelligence", body: "Purpose-built capability across seven kete, not one generic assistant." },
  { mark: maharaIcon, title: "Shared business memory", body: "Work compounds over time instead of resetting every session." },
  { mark: teKahuiReoMark, title: "Cultural & language intelligence", body: "Te Kāhui Reo strengthens trust, reo quality, and tikanga alignment." },
  { mark: manaIcon, title: "Accessible SME pricing", body: "Enterprise-level capability without enterprise-only pricing." },
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
      const msg = `Launch Sprint application — ${pilotBiz}`;
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({ name: pilotName, email: pilotEmail, message: msg }).select("id").single();
      if (error) throw error;
      toast.success("Application received! We'll be in touch within 24 hours.");
      setPilotName(""); setPilotEmail(""); setPilotBiz("");
      supabase.functions.invoke("send-contact-email", { body: { name: pilotName, email: pilotEmail, message: msg } }).catch(console.error);
      if (inserted?.id) supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({ name: contactName, email: contactEmail, message: contactMsg }).select("id").single();
      if (error) throw error;
      toast.success("Message sent. We'll get back to you soon.");
      setContactName(""); setContactEmail(""); setContactMsg("");
      supabase.functions.invoke("send-contact-email", { body: { name: contactName, email: contactEmail, message: contactMsg } }).catch(console.error);
      if (inserted?.id) supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" as const }, transition: { duration: 0.6 } };

  return (
    <div className="min-h-screen" style={{ background: "#09090F", color: "#FFFFFF" }}>
      <SEO title="Assembl — The Operating System for NZ Business" description="44 specialist AI agents across 7 industry kete. One operating system for quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa." />
      <BrandNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-16 sm:pt-20 pb-12" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(212,168,67,0.04) 0%, transparent 70%)", zIndex: 0 }} />

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

        <KeteHero />

        <motion.p className="relative max-w-xl mt-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: isMobile ? "15px" : "17px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", zIndex: 1 }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
          All your business operations in one place: quoting, payroll, planning, marketing, compliance, execution — connected and intelligent.
        </motion.p>

        <motion.p className="relative max-w-md mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.38)", zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.45 }}>
          44 specialist AI agents across seven industry kete. Built in New Zealand. Designed for real businesses.
        </motion.p>

        {/* Proof pills */}
        <motion.div className="relative flex flex-wrap justify-center gap-2.5 mt-6"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }}>
          {PROOF.map((p) => (
            <span key={p} className="px-3.5 py-1.5 rounded-full text-[11px] stat-pill" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, background: "rgba(15,15,26,0.7)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", letterSpacing: "0.03em", boxShadow: "0 0 12px rgba(212,168,67,0.06)" }}>
              {p}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div className="relative flex flex-col sm:flex-row gap-3 mt-8"
          style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}>
          <Link to="/contact" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full">
            Book a Launch Sprint <ArrowRight size={16} />
          </Link>
          <button onClick={scrollToPacks} className="cta-glass-outline inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full">
            Explore industry packs →
          </button>
        </motion.div>

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
              { stat: "605,000", label: "NZ enterprises" },
              { stat: "97%", label: "are small enterprises" },
              { stat: "$4.2B", label: "professional services spend" },
            ].map((c, i) => (
              <motion.div key={c.label} className="rounded-2xl p-6 text-center card-glow-hover" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 20px rgba(212,168,67,0.06), 0 4px 20px rgba(0,0,0,0.3)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <p className="text-2xl font-light mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#D4A843" }}>{c.stat}</p>
                <p className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.45)" }}>{c.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. WHAT CHANGES ═══ */}
      <section className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-8">
            <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "14px", letterSpacing: "4px", color: "#D4A843", textTransform: "uppercase" }}>
              WHAT CHANGES
            </p>
          </motion.div>
          <TanikoDivider />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.title}
                className="relative rounded-2xl p-8 overflow-hidden group cursor-pointer"
                style={{
                  background: "rgba(15,15,26,0.7)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  willChange: "transform, opacity",
                  transition: "border-color 300ms cubic-bezier(0.16,1,0.3,1), transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms cubic-bezier(0.16,1,0.3,1)",
                }}
                whileHover={{
                  y: -3,
                  borderColor: "rgba(255,255,255,0.25)",
                  boxShadow: `0 0 30px ${o.color}30, 0 8px 32px rgba(0,0,0,0.4)`,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                tabIndex={0}
              >
                {/* Motif SVG */}
                <div className="absolute pointer-events-none transition-all duration-300" style={{
                  ...(o.iconPos === "top-left" ? { top: 12, left: 12 } : o.iconPos === "top-right" ? { top: 12, right: 12 } : { bottom: 12, left: "50%", transform: "translateX(-50%)" }),
                  filter: "none",
                }}
                >
                  <div className="group-hover:drop-shadow-lg transition-[filter] duration-300" style={{ filter: `drop-shadow(0 0 0px transparent)` }}>
                    <style>{`.group:hover .motif-glow-${i} { filter: drop-shadow(0 0 12px ${o.color}50) !important; }`}</style>
                    <div className={`motif-glow-${i}`}>
                      <o.Icon />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10" style={{ marginTop: o.iconPos === "top-left" || o.iconPos === "top-right" ? "48px" : "0" }}>
                  <div className="w-10 h-[2px] rounded-full mb-5" style={{ background: o.color }} />
                  <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "24px", color: "#FFFFFF", marginBottom: "12px" }}>
                    {o.title}
                  </h3>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, fontSize: "15px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>
                    {o.body}
                  </p>
                </div>
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
              <motion.div key={s.num} className="rounded-2xl p-8 relative card-glow-hover" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 20px rgba(58,125,110,0.05), 0 4px 20px rgba(0,0,0,0.3)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                <span className="text-[40px] font-light absolute top-6 right-6" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(212,168,67,0.12)" }}>{s.num}</span>
                <h3 className="text-lg mb-3 mt-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF" }}>{s.title}</h3>
                <Body>{s.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. INDUSTRY PACKS — Ngā Kete o te Wānanga ═══ */}
      <section ref={packsRef} id="industry-packs" className={SECTION_STYLE}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-6">
            <Eyebrow>NGĀ KETE O TE WĀNANGA</Eyebrow>
            <SectionHeading>Seven baskets of knowledge for NZ business.</SectionHeading>
          </motion.div>
          <motion.div {...fade}>
            <Body className="text-center max-w-xl mx-auto mb-14">
              Like the three kete o te wānanga carried from the heavens, each industry pack carries the specialist knowledge your business needs — woven together in one place.
            </Body>
          </motion.div>
          <KetePackSelector />
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
              <motion.div key={d.title} className="rounded-2xl p-7 card-glow-hover" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 20px rgba(58,125,110,0.05), 0 4px 20px rgba(0,0,0,0.3)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <img src={d.mark} alt="" className="w-6 h-6 mb-4 opacity-70" />
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

      {/* ═══ 8. LAUNCH SPRINT ═══ */}
      <section id="launch-sprint" className={SECTION_STYLE}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>GET STARTED</Eyebrow>
            <SectionHeading>Book a Launch Sprint — your first step to AI-powered operations.</SectionHeading>
            <Body className="mb-10">
              We map your workflows, connect your tools, configure your agents, and go live in 2–4 weeks. Hands-on onboarding with direct access to the team.
            </Body>
          </motion.div>
          <motion.form onSubmit={handlePilot} className="rounded-2xl p-8 text-left space-y-4 card-glow-hover" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 30px rgba(212,168,67,0.08), 0 4px 24px rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input value={pilotName} onChange={(e) => setPilotName(e.target.value)} placeholder="Your name" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={pilotEmail} onChange={(e) => setPilotEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={pilotBiz} onChange={(e) => setPilotBiz(e.target.value)} placeholder="Business name & industry" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="cta-glass-green w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2">
              Book a Launch Sprint <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>We'll map your workflows and show you exactly which agents can run them.</p>
          </motion.form>
        </div>
      </section>

      {/* ═══ 9. TŌROA (Portfolio line) ═══ */}
      <section className={SECTION_STYLE}>
        <div className={`${INNER} max-w-2xl mx-auto text-center`}>
          <motion.div {...fade}>
            <Eyebrow>ALSO FROM ASSEMBL</Eyebrow>
            <SectionHeading>Meet Tōroa.</SectionHeading>
            <Body className="mb-8">
              Tōroa is our standalone SMS-first family AI navigator for Aotearoa — designed for whānau, everyday coordination, and practical support. $29/month.
            </Body>
            <Link to="/toroa" className="cta-glass-outline inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full">
              Visit Tōroa <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ 10. CONTACT ═══ */}
      <section id="contact" className={SECTION_STYLE}>
        <div className={`${INNER} max-w-xl mx-auto`}>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow>CONTACT</Eyebrow>
            <SectionHeading>Get in touch.</SectionHeading>
          </motion.div>
          <motion.form onSubmit={handleContact} className="rounded-2xl p-8 space-y-4 card-glow-hover" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 30px rgba(212,168,67,0.08), 0 4px 24px rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="How can we help?" rows={4} required
              className="w-full px-4 py-3 rounded-xl text-sm font-body text-white placeholder:text-white/30 focus:outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="cta-glass-green w-full py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2">
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
