import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agents, sectors } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import AgentCard from "@/components/AgentCard";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Zap, Users, BookOpen, Clock, Send, ArrowRight, Check } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LiveDemoSection from "@/components/LiveDemoSection";
import EchoSection from "@/components/EchoSection";
import TurfSection from "@/components/TurfSection";
import AuraSection from "@/components/AuraSection";
import ApexSection from "@/components/ApexSection";
import ArohaSection from "@/components/ArohaSection";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CompetitorComparison from "@/components/CompetitorComparison";
import TrustSection from "@/components/landing/TrustSection";
import IndustrySolutions from "@/components/landing/IndustrySolutions";

const PRICING_PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    color: "#A1A1AA",
    features: ["3 messages per advisor", "All 42 specialist tools", "NZ legislation knowledge", "No signup required"],
    cta: "Start free",
    href: "/",
    external: false,
    highlighted: false,
  },
  {
    name: "Starter",
    monthlyPrice: 89,
    color: "#10B981",
    features: ["1 specialist advisor", "100 messages/month", "NZ legislation references", "Email support"],
    cta: "Get started",
    href: "https://buy.stripe.com/fZuaEZa1CdkA6573Wu3oA0b",
    external: true,
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 299,
    color: "#10B981",
    features: ["3 specialist advisors + SPARK", "500 messages/month", "Brand DNA scanner", "Cross-tool workflows", "Priority support"],
    cta: "Start Pro",
    href: "https://buy.stripe.com/14A00l4Hi4O43WZ50y3oA0a",
    external: true,
    highlighted: true,
  },
  {
    name: "Business",
    monthlyPrice: 599,
    color: "#10B981",
    features: ["All 42 specialist tools", "2,000 messages/month", "Command Centre", "MCP API", "Phone support"],
    cta: "Start Business",
    href: "https://buy.stripe.com/6oU9AVa1C6Wcbpr2Sq3oA09",
    external: true,
    highlighted: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 1499,
    color: "#B388FF",
    features: ["Unlimited tools & messages", "Dedicated account manager", "Custom integrations", "SLA guarantee", "On-premise option", "SOC 2 compliant"],
    cta: "Contact sales",
    href: "/#contact",
    external: false,
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell us about your business", desc: "Share your industry, team size, and goals. Your expert team adapts to you.", icon: <Users size={24} /> },
  { step: "02", title: "Access your expert team", desc: "42 specialist advisors covering every NZ industry, all trained on NZ legislation.", icon: <Zap size={24} /> },
  { step: "03", title: "Get specialist guidance", desc: "Ask anything. Get recommendations grounded in NZ legislation, regulations, and best practice.", icon: <BookOpen size={24} /> },
  { step: "04", title: "Run 24/7", desc: "Embed on your site, share with your team, or let customers chat directly.", icon: <Clock size={24} /> },
];

const ALSO_BY_ASSEMBL = [
  { title: "Custom Intelligence Builds", desc: "Bespoke specialist advisors trained on your internal data, SOPs, and brand voice.", color: "#00FF88" },
  { title: "Website Chatbots", desc: "Drop-in chat widgets for your website — trained, branded, and always on.", color: "#00E5FF" },
  { title: "AssemblFund", desc: "Our initiative to bring enterprise tools to Kiwi startups and community organisations.", color: "#B388FF" },
];

const AgentGrid = () => {
  const [activeSector, setActiveSector] = useState("All");
  const [isAnnual, setIsAnnual] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const brandProfile = sessionStorage.getItem("assembl_brand_profile");
  const brandName = sessionStorage.getItem("assembl_brand_name");

  const clearBrand = () => {
    sessionStorage.removeItem("assembl_brand_profile");
    sessionStorage.removeItem("assembl_brand_name");
    window.dispatchEvent(new Event("storage"));
    window.location.reload();
  };

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
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

      // Auto-qualify the lead with AI scoring
      if (inserted?.id) {
        supabase.functions.invoke("qualify-lead", {
          body: { submissionId: inserted.id },
        }).catch((err) => console.error("Lead qualification error:", err));
      }

      toast.success("Message sent! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact form error:", err);
    }
  };

  const filtered = activeSector === "All" ? agents : agents.filter(a => a.sector === activeSector);

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl — AI Operations Platform for NZ Business | 42 Agents"
        description="42 specialist AI agents that know NZ law. Employment, hospitality, construction, property, sports, education and more. Enterprise AI at SME pricing. From $89/mo. Built in Aotearoa."
        path="/"
      />
      <ParticleField />

      {/* Shared Brand Banner */}
      {brandProfile && brandName && (
        <div className="relative z-10 bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2">
          <NeonWave size={14} />
          <span className="text-xs text-primary">Brand loaded: <strong>{brandName}</strong> — All agents have your context</span>
          <button onClick={clearBrand} className="text-primary/60 hover:text-primary transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToGrid} />
      </div>

      {/* ═══════════════════════ LIVE DEMO / STATS ═══════════════════════ */}
      <LiveDemoSection />

      {/* ═══════════════════════ FEATURED AGENTS ═══════════════════════ */}
      <TurfSection />
      <AuraSection />
      <ApexSection />
      <ArohaSection />
      <EchoSection />

      {/* ═══════════════════════ AGENT GRID ═══════════════════════ */}
      <main ref={gridRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-glow-cyan mb-2">Your expert team</h2>
          <p className="text-sm font-jakarta text-muted-foreground">Tap any advisor to chat live — no signup needed.</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {sectors.map(sector => (
            <motion.button
              key={sector}
              onClick={() => setActiveSector(sector)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all duration-200 border ${
                activeSector === sector
                  ? "border-foreground/20 bg-foreground/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/10 hover:text-foreground"
              }`}
            >
              {sector}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </main>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-syne font-extrabold text-center mb-14 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How it <span className="text-gradient-hero">works</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative rounded-2xl p-6 group transition-colors duration-300 overflow-hidden border border-border bg-card"
                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono-jb text-[10px] font-bold text-muted-foreground">{item.step}</span>
                  <div className="text-foreground">{item.icon}</div>
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST & TESTIMONIALS ═══════════════════════ */}
      <TrustSection />

      {/* ═══════════════════════ COMPETITOR COMPARISON ═══════════════════════ */}
      <CompetitorComparison />

      {/* ═══════════════════════ INDUSTRY SOLUTIONS ═══════════════════════ */}
      <IndustrySolutions />

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
              Simple, honest <span className="text-gradient-hero">pricing</span>
            </h2>
            <p className="text-sm font-jakarta text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>

            {/* Annual/Monthly toggle */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-1.5 py-1.5">
              <button
                onClick={() => setIsAnnual(false)}
                className="px-4 py-1.5 rounded-full text-xs font-syne font-bold transition-all"
                style={{
                  background: !isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: !isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className="px-4 py-1.5 rounded-full text-xs font-syne font-bold transition-all"
                style={{
                  background: isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Annual
                <span className="ml-1.5 text-[9px] font-mono-jb opacity-80">-15%</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRICING_PLANS.map((plan) => {
              const price = plan.monthlyPrice === 0
                ? "$0"
                : isAnnual
                  ? `$${Math.round(plan.monthlyPrice * 0.85)}`
                  : `$${plan.monthlyPrice}`;
              const period = plan.monthlyPrice === 0 ? "" : "/mo";

              return (
                <div key={plan.name} className="relative pt-4">
                  {plan.highlighted && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] font-syne font-bold px-3 py-1 rounded-full" style={{ background: plan.color, color: "hsl(var(--background))" }}>
                      MOST POPULAR
                    </span>
                  )}
                  <div
                    className="relative rounded-2xl p-5 flex flex-col h-full border border-border bg-card"
                    style={{
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderColor: plan.highlighted ? plan.color + "30" : undefined,
                    }}
                  >
                    <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }} />
                    <h3 className="text-base font-syne font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-0.5 my-3">
                      <span className="text-2xl font-syne font-extrabold" style={{ color: plan.color }}>{price}</span>
                      {period && <span className="text-[10px] font-jakarta text-muted-foreground">{period}</span>}
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-[9px] font-jakarta text-muted-foreground -mt-2 mb-2">
                        Billed ${Math.round(plan.monthlyPrice * 0.85 * 12)}/year
                      </p>
                    )}
                    <ul className="flex-1 space-y-1.5 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[11px] font-jakarta text-foreground/70">
                          <Check size={11} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.external ? (
                      <a
                        href={plan.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs font-syne font-bold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg"
                        style={{
                          background: plan.highlighted ? plan.color : "transparent",
                          color: plan.highlighted ? "#0A0A14" : plan.color,
                          border: `1px solid ${plan.color}30`,
                          boxShadow: plan.highlighted ? `0 0 20px ${plan.color}20` : 'none',
                        }}
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link
                        to={plan.href}
                        className="block text-center text-xs font-syne font-bold py-2.5 rounded-xl transition-all duration-300"
                        style={{
                          background: plan.highlighted ? plan.color : "transparent",
                          color: plan.highlighted ? "#0A0A14" : plan.color,
                          border: `1px solid ${plan.color}30`,
                        }}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HELM SPOTLIGHT ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-013</span>
              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold mt-1 mb-4 text-foreground">
                Meet <span className="text-gradient-hero">HELM</span>
              </h2>
              <p className="text-sm font-jakarta text-muted-foreground leading-relaxed mb-6">
                Your personal Life Admin & Household Manager. Upload receipts, plan meals, track budgets, and tame the chaos of daily life — all through one AI assistant built for New Zealand families.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Meal planning", "Budget tracking", "Document parsing", "School admin", "Life checklists"].map((t) => (
                  <span key={t} className="text-[10px] font-jakarta px-2.5 py-1 rounded-full border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
              <Link to="/chat/operations" className="inline-flex items-center gap-2 text-sm font-syne font-bold text-foreground hover:text-gradient-hero transition-all duration-300">
                Try HELM <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-2xl border border-border flex items-center justify-center overflow-hidden bg-card">
                <AgentAvatar agentId="operations" color="#B388FF" size={160} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MARINER SPOTLIGHT ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-64 h-64 rounded-2xl border border-border flex items-center justify-center overflow-hidden bg-card">
                <AgentAvatar agentId="maritime" color="#26C6DA" size={160} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-028</span>
              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold mt-1 mb-4 text-foreground">
                Meet <span className="text-gradient-hero">MARINER</span>
              </h2>
              <p className="text-sm font-jakarta text-muted-foreground leading-relaxed mb-6">
                NZ's maritime AI expert. Fishing regulations, boat maintenance, weather interpretation, commercial maritime compliance — MARINER knows the waters of Aotearoa inside out.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Fishing regs", "Boat maintenance", "Marine weather", "Maritime compliance", "Coastguard courses"].map((t) => (
                  <span key={t} className="text-[10px] font-jakarta px-2.5 py-1 rounded-full border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
              <Link to="/mariner" className="inline-flex items-center gap-2 text-sm font-syne font-bold text-foreground hover:text-gradient-hero transition-all duration-300">
                Explore MARINER <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ALSO BY ASSEMBL ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-center text-foreground mb-14">
            Also by <span className="text-gradient-hero">Assembl</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ALSO_BY_ASSEMBL.map((item) => (
              <div
                key={item.title}
                className="relative rounded-2xl p-6 overflow-hidden border border-border bg-card group transition-all duration-300 hover:-translate-y-1"
                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              >
                <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${item.color}80, transparent)` }} />
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 bg-muted">
                  <Zap size={16} style={{ color: item.color }} />
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <FAQSection />

      {/* ═══════════════════════ FOUNDER ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-contain border-2 border-border"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3 flex items-center justify-center gap-2">Built in Aotearoa</h2>
          <p className="text-sm font-jakarta text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve AI tools that understand our laws, our culture, and the way we work.
            Every agent is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p className="text-xs font-syne font-bold text-foreground">Kate</p>
          <p className="text-[11px] font-jakarta text-muted-foreground">Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3">Get in touch</h2>
            <p className="text-sm font-jakarta text-muted-foreground">Custom builds, enterprise pricing, or just to say kia ora.</p>
          </div>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-2xl p-6 border border-border bg-card"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <label className="block text-xs font-jakarta font-medium text-foreground/70 mb-1.5">Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-medium text-muted-foreground mb-1.5">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                placeholder="Tell us what you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300"
            >
              <Send size={14} /> Send message
            </button>
          </form>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AgentGrid;
