import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AgentAvatar from "@/components/AgentAvatar";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Send, ArrowRight, Check, ChevronDown } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import EchoSection from "@/components/EchoSection";
import SparkSection from "@/components/SparkSection";
import HelmSection from "@/components/HelmSection";

// New landing sections
import AIStackShowcase from "@/components/landing/AIStackShowcase";
import IndustrySolutions from "@/components/landing/IndustrySolutions";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import TrustSection from "@/components/landing/TrustSection";
import ComparisonTable from "@/components/landing/ComparisonTable";

const PRICING_PLANS_MONTHLY = [
  {
    name: "Free",
    price: "$0",
    annual: "$0",
    period: "",
    color: "#A1A1AA",
    features: ["3 messages per agent", "All 42 agents", "NZ legislation knowledge", "No signup required"],
    cta: "Start free",
    href: "/",
    external: false,
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$89",
    annual: "$69",
    period: "/mo",
    color: "#10B981",
    features: ["1 AI agent", "100 messages/month", "NZ legislation references", "Email support"],
    cta: "Get started",
    href: "https://buy.stripe.com/fZuaEZa1CdkA6573Wu3oA0b",
    external: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$299",
    annual: "$239",
    period: "/mo",
    color: "#10B981",
    features: ["3 AI agents + SPARK", "500 messages/month", "Brand DNA scanner", "Symbiotic workflows", "Priority support"],
    cta: "Start Pro",
    href: "https://buy.stripe.com/14A00l4Hi4O43WZ50y3oA0a",
    external: true,
    highlighted: true,
  },
  {
    name: "Business",
    price: "$599",
    annual: "$479",
    period: "/mo",
    color: "#10B981",
    features: ["All 42 AI agents", "2,000 messages/month", "Command Centre", "MCP API", "Phone support"],
    cta: "Start Business",
    href: "https://buy.stripe.com/6oU9AVa1C6Wcbpr2Sq3oA09",
    external: true,
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    annual: "Custom",
    period: "",
    color: "#B388FF",
    features: ["Unlimited agents", "Unlimited messages", "Custom AI training", "Dedicated account manager", "SLA guarantee", "API access"],
    cta: "Contact us",
    href: "#contact",
    external: false,
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick your agent", desc: "Choose from 42 specialists covering NZ industries from hospo to government.", icon: "🎯" },
  { step: "02", title: "Teach your brand", desc: "Scan your website or paste your brand profile. Every agent remembers your context.", icon: "🧠" },
  { step: "03", title: "Get NZ advice", desc: "Ask anything. Get answers grounded in NZ legislation, regulations, and best practice.", icon: "📋" },
  { step: "04", title: "Run 24/7", desc: "Embed on your site, share with your team, or let customers chat directly.", icon: "⚡" },
];

const FAQ_ITEMS = [
  {
    q: "How is Assembl different from ChatGPT?",
    a: "Every Assembl agent is trained on NZ-specific legislation, regulations, and business practices. ChatGPT gives generic global advice — Assembl gives you answers grounded in the Health and Safety at Work Act, the Residential Tenancies Act, IRD requirements, and 50+ more NZ Acts.",
  },
  {
    q: "Can I try before I pay?",
    a: "Yes — every agent offers 3 free messages with no signup required. Test APEX on a construction question, ask LEDGER about GST, or try ANCHOR for legal advice. No credit card needed.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Your data is encrypted at rest, hosted in the AU/NZ Supabase region, and never shared with third parties. We're Privacy Act 2020 compliant and GDPR-ready.",
  },
  {
    q: "Can I embed an agent on my website?",
    a: "Yes — all paid plans include an embeddable chat widget. Drop a single script tag into your site and your customers can chat with your branded AI agent 24/7.",
  },
  {
    q: "What industries do you cover?",
    a: "42 agents across 16+ industries including construction, hospitality, property, legal, accounting, agriculture, maritime, retail, automotive, HR, IT, education, and more. Each agent is a deep specialist in their field.",
  },
];

const AgentGrid = () => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
      const { error } = await supabase.from("contact_submissions").insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      if (error) throw error;

      fetch("https://formspree.io/f/xbdzwqpy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, message: trimmedMessage }),
      }).catch(() => {});

      toast.success("Message sent! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact form error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleField />

      {/* Brand Banner */}
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

      {/* ═══════════ HERO ═══════════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToGrid} />
      </div>

      {/* ═══════════ AI STACK ═══════════ */}
      <AIStackShowcase />

      {/* ═══════════ LIVE DEMO ═══════════ */}
      <LiveDemoSection />

      {/* ═══════════ ECHO ═══════════ */}
      <EchoSection />

      {/* ═══════════ SPARK ═══════════ */}
      <SparkSection />

      {/* ═══════════ HELM ═══════════ */}
      <HelmSection />

      {/* ═══════════ INDUSTRY SOLUTIONS ═══════════ */}
      <div ref={gridRef}>
        <IndustrySolutions />
      </div>

      {/* ═══════════ COMPARISON TABLE ═══════════ */}
      <ComparisonTable />

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
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
                className="relative rounded-2xl p-6 group transition-colors duration-300 overflow-hidden border"
                style={{
                  background: "rgba(14,14,26,0.5)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono-jb text-[10px] font-bold text-muted-foreground">{item.step}</span>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST SECTION ═══════════ */}
      <TrustSection />

      {/* ═══════════ PRICING ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono-jb uppercase tracking-widest text-muted-foreground/60 mb-3 block">
              Pricing
            </span>
            <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
              Simple, honest <span className="text-gradient-hero">pricing</span>
            </h2>
            <p className="text-sm font-jakarta text-muted-foreground mb-6">Start free. Upgrade when you're ready.</p>

            {/* Annual toggle */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className={`text-xs font-jakarta ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 rounded-full transition-all duration-300"
                style={{
                  background: isAnnual ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)",
                  border: `1px solid ${isAnnual ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-foreground"
                  animate={{ left: isAnnual ? "calc(100% - 22px)" : "2px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-xs font-jakarta ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                Annual
                <span className="ml-1 text-[10px] font-mono-jb px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRICING_PLANS_MONTHLY.map((plan) => (
              <div key={plan.name} className="relative pt-4">
                {plan.highlighted && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] font-syne font-bold px-3 py-1 rounded-full"
                    style={{ background: plan.color, color: "hsl(var(--background))" }}
                  >
                    MOST POPULAR
                  </span>
                )}
                <div
                  className="relative rounded-2xl p-5 flex flex-col h-full border"
                  style={{
                    background: "rgba(14,14,26,0.6)",
                    backdropFilter: "blur(12px)",
                    borderColor: plan.highlighted ? plan.color + "30" : "rgba(255,255,255,0.06)",
                    boxShadow: plan.highlighted ? `0 0 40px ${plan.color}08` : "none",
                  }}
                >
                  <span
                    className="absolute top-0 left-[15%] right-[15%] h-px opacity-30"
                    style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }}
                  />
                  <h3 className="text-base font-syne font-bold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-0.5 my-3">
                    <span className="text-2xl font-syne font-extrabold" style={{ color: plan.color }}>
                      {isAnnual ? plan.annual : plan.price}
                    </span>
                    {plan.period && <span className="text-xs font-jakarta text-muted-foreground">{plan.period}</span>}
                  </div>
                  <ul className="flex-1 space-y-2 mb-5">
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
                        boxShadow: plan.highlighted ? `0 0 20px ${plan.color}20` : "none",
                      }}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <a
                      href={plan.href}
                      className="block text-center text-xs font-syne font-bold py-2.5 rounded-xl transition-all duration-300"
                      style={{
                        background: "transparent",
                        color: plan.color,
                        border: `1px solid ${plan.color}30`,
                      }}
                    >
                      {plan.cta}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto mt-16">
            <h3 className="text-lg sm:text-xl font-syne font-extrabold text-center text-foreground mb-8">
              Frequently asked questions
            </h3>
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border"
                  style={{
                    background: "rgba(14,14,26,0.5)",
                    backdropFilter: "blur(12px)",
                    borderColor: openFaq === i ? "rgba(0,255,136,0.15)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-xs sm:text-sm font-syne font-bold text-foreground">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-4">
                          <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MARINER SPOTLIGHT ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div
                className="w-64 h-64 rounded-2xl border flex items-center justify-center overflow-hidden"
                style={{ background: "rgba(14,14,26,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <AgentAvatar agentId="maritime" color="#26C6DA" size={160} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-028</span>
              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold mt-1 mb-4 text-foreground">
                Meet <span className="text-gradient-hero">MARINER</span>
              </h2>
              <p className="text-sm font-jakarta text-muted-foreground leading-relaxed mb-6">
                NZ's maritime AI expert. Fishing regulations, boat maintenance, weather interpretation,
                commercial maritime compliance — MARINER knows the waters of Aotearoa inside out.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Fishing regs", "Boat maintenance", "Marine weather", "Maritime compliance", "Coastguard courses"].map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-jakarta px-2.5 py-1 rounded-full border text-muted-foreground"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link to="/mariner" className="inline-flex items-center gap-2 text-sm font-syne font-bold text-foreground hover:text-gradient-hero transition-all duration-300">
                Explore MARINER <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOUNDER ═══════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-contain border-2"
            style={{ borderColor: "rgba(0,255,136,0.2)" }}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3">Built in Aotearoa</h2>
          <p className="text-sm font-jakarta text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            I built Assembl because NZ businesses deserve AI tools that understand our laws, our culture, and the way we work.
            Every agent is trained on real NZ legislation — not generic overseas advice.
          </p>
          <p className="text-xs font-syne font-bold text-foreground">Kate Harland</p>
          <p className="text-[11px] font-jakarta text-muted-foreground">Founder, Assembl · Auckland, New Zealand</p>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3">Get in touch</h2>
            <p className="text-sm font-jakarta text-muted-foreground">Custom builds, enterprise pricing, or just to say kia ora.</p>
          </div>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-2xl p-6 border"
            style={{
              background: "rgba(14,14,26,0.6)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <label className="block text-xs font-jakarta font-medium text-foreground/70 mb-1.5">Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
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
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
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
                className="w-full px-4 py-2.5 rounded-xl text-sm border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
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
