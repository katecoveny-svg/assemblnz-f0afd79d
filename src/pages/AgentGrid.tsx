import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agents, packs, echoAgent, pilotAgent } from "@/data/agents";
import AgentCard from "@/components/AgentCard";
import AgentAvatar from "@/components/AgentAvatar";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Zap, Users, BookOpen, Clock, Send, ArrowRight, Check } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LiveDemoSection from "@/components/LiveDemoSection";
import FAQSection from "@/components/FAQSection";
import CompetitorComparison from "@/components/CompetitorComparison";
import TrustSection from "@/components/landing/TrustSection";
import IndustrySolutions from "@/components/landing/IndustrySolutions";
import PipelineSection from "@/components/landing/PipelineSection";
import KeyFeaturesSection from "@/components/landing/KeyFeaturesSection";
import PackShowcase from "@/components/landing/PackShowcase";

const PACK_META: Record<string, { sector: string; description: string }> = {
  manaaki: { sector: "Hospitality & Tourism", description: "Care for customers, hospitality operations, tourism, and venue management" },
  hanga: { sector: "Construction & Property", description: "Building, safety, consenting, and project governance for Aotearoa" },
  auaha: { sector: "Creative & Digital", description: "Brand, content, video, social, and creative production" },
  pakihi: { sector: "Business Operations", description: "Finance, HR, strategy, sales, risk, and operational excellence" },
  hangarau: { sector: "Technology & Infrastructure", description: "Software, security, DevOps, integrations, and monitoring" },
};

const SPECIALIST_SECTORS = ["Family & Life", "Māori & Te Tiriti", "Immigration"];

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
    color: "#3A7D6E",
    features: ["1 specialist advisor", "100 messages/month", "NZ legislation references", "Email support"],
    cta: "Get started",
    href: "https://buy.stripe.com/fZuaEZa1CdkA6573Wu3oA0b",
    external: true,
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 299,
    color: "#3A7D6E",
    features: ["3 specialist advisors + SPARK", "500 messages/month", "Brand DNA scanner", "Cross-tool workflows", "Priority support"],
    cta: "Start Pro",
    href: "https://buy.stripe.com/14A00l4Hi4O43WZ50y3oA0a",
    external: true,
    highlighted: true,
  },
  {
    name: "Business",
    monthlyPrice: 599,
    color: "#3A7D6E",
    features: ["All 42 specialist tools", "2,000 messages/month", "Command Centre", "MCP API", "Phone support"],
    cta: "Start Business",
    href: "https://buy.stripe.com/6oU9AVa1C6Wcbpr2Sq3oA09",
    external: true,
    highlighted: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: 1499,
    color: "#D4A843",
    features: ["Unlimited tools & messages", "Dedicated account manager", "Custom integrations", "SLA guarantee", "On-premise option", "SOC 2 compliant"],
    cta: "Contact sales",
    href: "/#contact",
    external: false,
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Tell us about your business", desc: "Share your industry, team size, and goals. Your specialist team adapts to you.", icon: <Users size={24} /> },
  { step: "02", title: "Access your specialist tools", desc: "42 specialist tools covering every NZ industry, all trained on NZ legislation.", icon: <Zap size={24} /> },
  { step: "03", title: "Get specialist guidance", desc: "Ask anything. Get recommendations grounded in NZ legislation, regulations, and best practice.", icon: <BookOpen size={24} /> },
  { step: "04", title: "Run 24/7", desc: "Embed on your site, share with your team, or let customers chat directly.", icon: <Clock size={24} /> },
];

const ALSO_BY_ASSEMBL = [
  { title: "Custom Intelligence Builds", desc: "Bespoke specialist tools trained on your internal data, SOPs, and brand voice.", color: "hsl(var(--pounamu))" },
  { title: "Website Chatbots", desc: "Drop-in chat widgets for your website — trained, branded, and always on.", color: "hsl(var(--tangaroa-light))" },
  { title: "AssemblFund", desc: "Our initiative to bring enterprise-grade tools to Kiwi startups and community organisations.", color: "hsl(var(--kowhai))" },
];

const AgentGrid = () => {
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

  // Group agents by pack
  const specialistAgents = agents.filter(a => SPECIALIST_SECTORS.includes(a.sector));
  const crossPackAgents = [echoAgent, pilotAgent];

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl | Business Intelligence Platform for NZ | 42 Specialist Tools"
        description="42 specialist tools trained on 50+ NZ Acts. Employment, hospitality, construction, property, sports, and more. Enterprise-grade business intelligence at SME pricing. From $14/mo. Built in Aotearoa."
        path="/"
      />
      <ParticleField />

      {brandProfile && brandName && (
        <div className="relative z-10 bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2">
          <NeonWave size={14} />
          <span className="text-xs text-primary">Brand loaded: <strong>{brandName}</strong> — All tools have your context</span>
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

      {/* ═══════════════════════ INTELLIGENCE SPECIALISTS — Grouped by Pack ═══════════════════════ */}
      <main id="expert-team" ref={gridRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">44 Intelligence Specialists</p>
          <h2 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.08em] text-foreground mb-2">Your Specialist Team</h2>
          <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">Tap any tool to chat live — no signup needed.</p>
        </motion.div>

        {/* 5 Industry Packs */}
        {packs.map((pack, packIdx) => {
          const packAgents = agents.filter(a => a.pack === pack.id);
          const meta = PACK_META[pack.id];
          if (packAgents.length === 0) return null;

          return (
            <motion.section
              key={pack.id}
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: packIdx * 0.05 }}
            >
              {/* Pack header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pack.color }} />
                <h3 className="font-display font-light text-lg uppercase tracking-[0.06em] text-foreground">{pack.name}</h3>
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">{pack.label}</span>
              </div>
              <p className="text-xs font-body text-muted-foreground mb-6 ml-[22px]">{meta?.description}</p>

              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {packAgents.map((agent, i) => (
                  <AgentCard key={agent.id} agent={agent} index={i} />
                ))}
              </div>
            </motion.section>
          );
        })}

        {/* Specialist & Cross-Pack Agents */}
        {(specialistAgents.length > 0 || crossPackAgents.length > 0) && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/30" />
              <h3 className="font-display font-light text-lg uppercase tracking-[0.06em] text-foreground">Specialist & Cross-Pack</h3>
            </div>
            <p className="text-xs font-body text-muted-foreground mb-6 ml-[22px]">Purpose-built tools that work across every industry pack</p>

            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {[...crossPackAgents, ...specialistAgents].map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* ═══════════════════════ LIVE DEMO / STATS ═══════════════════════ */}
      <LiveDemoSection />

      {/* ═══════════════════════ PACK SHOWCASE ═══════════════════════ */}
      <PackShowcase />

      {/* ═══════════════════════ PIPELINE ═══════════════════════ */}
      <PipelineSection />

      {/* ═══════════════════════ KEY FEATURES ═══════════════════════ */}
      <KeyFeaturesSection />

      {/* ═══════════════════════ FEATURED AGENTS ═══════════════════════ */}
      <TurfSection />
      <AuraSection />
      <ApexSection />
      <ArohaSection />
      <EchoSection />

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-display font-light uppercase tracking-[0.06em] text-center mb-14 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How it works
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
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{item.step}</span>
                  <div className="text-foreground">{item.icon}</div>
                </div>
                <h3 className="text-sm font-display font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST ═══════════════════════ */}
      <TrustSection />

      {/* ═══════════════════════ COMPETITOR COMPARISON ═══════════════════════ */}
      <CompetitorComparison />

      {/* ═══════════════════════ INDUSTRY SOLUTIONS ═══════════════════════ */}
      <IndustrySolutions />

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-display font-light uppercase tracking-[0.06em] text-foreground mb-3">
              Enterprise-grade intelligence. SME-friendly pricing.
            </h2>
            <p className="text-sm font-body text-muted-foreground mb-6">From $14/month. No lock-in. Cancel anytime.</p>

            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-1.5 py-1.5">
              <button
                onClick={() => setIsAnnual(false)}
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold transition-all"
                style={{
                  background: !isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: !isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold transition-all"
                style={{
                  background: isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Annual
                <span className="ml-1.5 text-[9px] font-mono opacity-80">-15%</span>
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
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] font-display font-bold px-3 py-1 rounded-full" style={{ background: plan.color, color: "hsl(var(--background))" }}>
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
                    <h3 className="text-base font-display font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-0.5 my-3">
                      <span className="text-2xl font-display font-bold" style={{ color: plan.color }}>{price}</span>
                      {period && <span className="text-[10px] font-body text-muted-foreground">{period}</span>}
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-[9px] font-body text-muted-foreground -mt-2 mb-2">
                        Billed ${Math.round(plan.monthlyPrice * 0.85 * 12)}/year
                      </p>
                    )}
                    <ul className="flex-1 space-y-1.5 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[11px] font-body text-foreground/70">
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
                        className="block text-center text-xs font-display font-bold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg"
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
                        className="block text-center text-xs font-display font-bold py-2.5 rounded-xl transition-all duration-300"
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

      {/* ═══════════════════════ ALSO BY ASSEMBL ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-display font-light uppercase tracking-[0.06em] text-center text-foreground mb-14">
            Also by Assembl
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
                <h3 className="text-sm font-display font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{item.desc}</p>
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
          <h2 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.06em] text-foreground mb-3 flex items-center justify-center gap-2">Built in Aotearoa</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work.
            Every tool is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p className="text-xs font-display font-bold text-foreground">Kate</p>
          <p className="text-[11px] font-body text-muted-foreground">Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-[0.06em] text-foreground mb-3">Get in touch</h2>
            <p className="text-sm font-body text-muted-foreground">Custom builds, enterprise pricing, or just to say kia ora.</p>
          </div>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-2xl p-6 border border-border bg-card"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <label className="block text-xs font-body font-medium text-foreground/70 mb-1.5">Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                placeholder="Tell us what you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-display font-bold bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300"
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