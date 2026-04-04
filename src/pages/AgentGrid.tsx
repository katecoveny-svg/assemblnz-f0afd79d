import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import HowItWorksFlow from "@/components/landing/HowItWorksFlow";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import KeteExplorer from "@/components/landing/KeteExplorer";
import TrustStrip from "@/components/landing/TrustStrip";
import WhyAssemblStory from "@/components/landing/WhyAssemblStory";
import VideoShowcase from "@/components/landing/VideoShowcase";
import { TanikoDivider, GradientBorder, KoruAccent, MaungaRidgeDivider, MaungaWatermark } from "@/components/landing/AnimatedTaniko";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Outcome cards — lead with outcomes, NZ voice ── */
const OUTCOMES = [
  {
    title: "Win more work",
    description: "Your proposals go out in hours, not days. Assembl writes quotes, checks compliance, and formats tenders — so you pitch more and close faster.",
    color: "#D4A843",
    stat: "3x",
    statLabel: "faster proposals",
  },
  {
    title: "Stop the paper chase",
    description: "Payroll, GST, employment agreements, health & safety — every compliance task that eats your Friday afternoon. Assembl runs it. You don't have to.",
    color: "#3A7D6E",
    stat: "12h",
    statLabel: "saved per week",
  },
  {
    title: "Never miss a change",
    description: "NZ legislation changes constantly. New minimum wage, updated building code, revised privacy rules. Assembl watches for you and flags what matters to your business.",
    color: "#5B8FA8",
    stat: "50+",
    statLabel: "NZ Acts monitored",
  },
] as const;

const AgentGrid = () => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const flowRef = useRef<HTMLDivElement>(null);

  const scrollToFlow = () => {
    flowRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();
    try {
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      }).select("id").single();
      if (error) throw error;

      supabase.functions.invoke("send-contact-email", {
        body: { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
      }).catch((err) => console.error("Contact email error:", err));

      if (inserted?.id) {
        supabase.functions.invoke("qualify-lead", {
          body: { submissionId: inserted.id },
        }).catch((err) => console.error("Lead qualification error:", err));
      }

      toast.success("Kia ora! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl | An Intelligence Layer That Weaves Your Business Together"
        description="44+ specialist tools across 9 industry kete. Compliance, quoting, payroll, marketing — connected and handled. Built for New Zealand. From $199/mo + GST."
        path="/"
      />
      <ParticleField />

      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* ══════ 1. HERO — Showstopping constellation + gradient mesh ══════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToFlow} />
      </div>

      {/* ══════ 2. OUTCOMES — He Hua · Results ══════ */}
      <section id="outcomes" className="relative z-10 py-20 sm:py-24 overflow-hidden pt-14">
        <MaungaRidgeDivider color="#D4A843" />

        {/* Ambient moonlight glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-[30vw] h-[30vh] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 65%)", filter: "blur(50px)" }} />
        </div>

        {/* Background koru accent */}
        <div className="absolute bottom-0 right-0 opacity-[0.02] pointer-events-none">
          <KoruAccent color="#D4A843" size={350} delay={0} />
        </div>

        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease }}
          >
            <p className="mb-4 text-[11px] tracking-[5px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#D4A843" }}>
              HE HUA · RESULTS
            </p>
            <TanikoDivider color="#D4A843" width={200} />
            <h2 className="mx-auto mb-3 mt-4 max-w-3xl text-[2rem] sm:text-[2.75rem] leading-[1.15] text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, textShadow: "0 0 30px rgba(255,255,255,0.08), 0 0 60px rgba(255,255,255,0.04)" }}>
              What changes when Assembl weaves it together
            </h2>
            <p className="mx-auto max-w-[34rem] text-[15px] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
              Your team stops drowning in admin and starts doing the work that actually grows the business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {OUTCOMES.map((item, i) => (
              <motion.article
                key={item.title}
                className="glass-card group relative overflow-hidden rounded-[20px] p-7 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.08, ease }}
                whileHover={{ y: -5, boxShadow: `0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05), 0 0 10px ${item.color}12` }}
                style={{ borderColor: `${item.color}15` }}
              >
                {/* Stat */}
                <div className="mb-5">
                  <motion.span
                    className="text-3xl inline-block"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: item.color }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.stat}
                  </motion.span>
                  <span className="text-[10px] ml-2 tracking-[1px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: `${item.color}80` }}>
                    {item.statLabel}
                  </span>
                </div>

                <h3 className="text-lg mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#fff" }}>
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.85]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
                  {item.description}
                </p>

                {/* Maunga watermark */}
                <MaungaWatermark color={item.color} />
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 50% 100%, ${item.color}10 0%, transparent 60%)` }}
                />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ 3. WHY ASSEMBL — Te Take · The Why ══════ */}
      <WhyAssemblStory />

      {/* ══════ 4. HOW IT WORKS — Te Ara · The Pathway ══════ */}
      <div id="how-it-works" ref={flowRef}>
        <HowItWorksFlow />
      </div>

      {/* ══════ 5. VIDEO SHOWCASE — Mātakitaki · Watch ══════ */}
      <VideoShowcase />

      {/* ══════ 6. LIVE DEMO — Whakamātau · Try It ══════ */}
      <LiveDemoSection />

      {/* ══════ 7. KETE EXPLORER — Ngā Kete · The Collection ══════ */}
      <KeteExplorer />

      {/* ══════ 8. TRUST SIGNALS — Whakapono · Trust ══════ */}
      <TrustStrip />

      {/* ══════ 9. PRICING CTA ══════ */}
      <section id="pricing" className="relative z-10 py-16 sm:py-20 overflow-hidden pt-14">
        <MaungaRidgeDivider color="#3A7D6E" />

        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease }}
          >
            <p className="text-[11px] tracking-[5px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#3A7D6E" }}>
              UTU · PRICING
            </p>
            <TanikoDivider color="#3A7D6E" width={160} />
            <h2 className="text-2xl sm:text-3xl mb-3 mt-4 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
              Simple, transparent, NZ-priced
            </h2>
            <p className="text-sm max-w-lg mx-auto mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
              All 44+ agents and 9 kete included on every plan. No hidden add-ons.
            </p>

            {/* Quick pricing cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto my-10">
              {[
                { name: "Essentials", price: "$199", users: "2 users", queries: "500 queries/mo", accent: "#3A7D6E", trial: true },
                { name: "Business", price: "$399", users: "10 users", queries: "2,000 queries/mo", accent: "#D4A843", popular: true },
                { name: "Enterprise", price: "$799", users: "Unlimited", queries: "Unlimited", accent: "#5B8FA8" },
              ].map((tier, i) => (
                <motion.div
                  key={tier.name}
                  className="glass-card rounded-xl p-5 text-center relative cursor-default group"
                  style={{ border: tier.popular ? `2px solid ${tier.accent}30` : undefined }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35, ease }}
                  whileHover={{ y: -5, boxShadow: `0 0 20px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05), 0 0 10px ${tier.accent}12` }}
                >
                  {tier.popular && (
                    <motion.span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] tracking-[2px] uppercase px-3 py-0.5 rounded-full"
                      style={{ background: tier.accent, color: "#09090F", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
                      animate={{ boxShadow: [`0 0 10px ${tier.accent}30`, `0 0 20px ${tier.accent}50`, `0 0 10px ${tier.accent}30`] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      POPULAR
                    </motion.span>
                  )}
                  <p className="text-xs mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: tier.accent }}>
                    {tier.name}
                  </p>
                  <p className="text-2xl mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: "#fff" }}>
                    {tier.price}<span className="text-xs text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{tier.users} · {tier.queries}</p>
                  {tier.trial && (
                    <p className="text-[9px]" style={{ color: "#5AADA0" }}>14-day free trial</p>
                  )}
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 100%, ${tier.accent}10 0%, transparent 60%)` }} />
                </motion.div>
              ))}
            </div>

            <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>All prices NZD + GST. $749 one-time setup fee. Save 20% with annual billing.</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/pricing" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
                  Start free trial <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link to="/pricing" className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm">
                  Compare plans
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ 10. CONTACT ══════ */}
      <section id="contact" className="relative z-10 py-16 sm:py-20 overflow-hidden pt-14">
        <MaungaRidgeDivider color="#E8B4B8" />

        <div className="max-w-xl mx-auto px-5">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[11px] tracking-[5px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#E8B4B8" }}>
              WHAKAPĀ MAI · GET IN TOUCH
            </p>
            <TanikoDivider color="#E8B4B8" width={160} />
            <h2 className="text-xl sm:text-2xl mb-2 mt-4 text-foreground" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
              Questions? Kia ora, we're here.
            </h2>
            <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>
              Whether you need a demo, want to talk enterprise, or just want to say hello.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleContactSubmit}
            className="glass-card rounded-2xl p-6 space-y-4 text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ boxShadow: "0 0 40px rgba(232,180,184,0.05)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Name</label>
                <input
                  type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  placeholder="Your name"
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(232,180,184,0.3)"; (e.target as HTMLElement).style.boxShadow = "0 0 15px rgba(232,180,184,0.08)"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Email</label>
                <input
                  type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  placeholder="your@email.co.nz"
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(232,180,184,0.3)"; (e.target as HTMLElement).style.boxShadow = "0 0 15px rgba(232,180,184,0.08)"; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>How can we help?</label>
              <textarea
                value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="Your industry, team size, biggest pain point..."
                onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(232,180,184,0.3)"; (e.target as HTMLElement).style.boxShadow = "0 0 15px rgba(232,180,184,0.08)"; }}
                onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
              />
            </div>
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-300"
              style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, background: "#D4A843", border: "1px solid #D4A843", color: "#09090F", boxShadow: "0 0 20px rgba(212,168,67,0.2)" }}
              whileHover={{ scale: 1.01, boxShadow: "0 0 35px rgba(212,168,67,0.3)" }}
              whileTap={{ scale: 0.99 }}
            >
              <Send size={14} /> Send message
            </motion.button>
            <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              Or email <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: "#D4A843" }}>assembl@assembl.co.nz</a>
            </p>
          </motion.form>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AgentGrid;
