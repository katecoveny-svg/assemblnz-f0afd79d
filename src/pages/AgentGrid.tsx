import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agents, sectors } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import AgentCard from "@/components/AgentCard";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Zap, Users, BookOpen, Clock, Send, ArrowRight, Check } from "lucide-react";
import { NeonWave, NeonNZFlag } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    color: "#00FF88",
    features: ["3 messages per agent", "All 37 agents", "NZ legislation knowledge", "No signup required"],
    cta: "Start free",
    href: "/",
    external: false,
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    color: "#00E5FF",
    features: ["1 AI agent", "100 messages/month", "NZ legislation references", "Email support"],
    cta: "Get started",
    href: "https://pay.airwallex.com/sghgspa33ccg",
    external: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
    period: "/mo",
    color: "#FF2D9B",
    features: ["3 AI agents", "500 messages/month", "Brand scan", "Template library", "Priority support"],
    cta: "Start Pro",
    href: "https://pay.airwallex.com/sghgspe6mx61",
    external: true,
    highlighted: true,
  },
  {
    name: "Business",
    price: "$349",
    period: "/mo",
    color: "#FFB800",
    features: ["All 37 AI agents", "Unlimited messages", "Team access (5 seats)", "Usage analytics", "Dedicated support"],
    cta: "Start Business",
    href: "https://pay.airwallex.com/sghgspfps04o",
    external: true,
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick your agent", desc: "Choose from 37 specialists covering NZ industries from hospo to government.", icon: <Users size={24} /> },
  { step: "02", title: "Teach your brand", desc: "Scan your website or paste your brand profile. Every agent remembers your context.", icon: <Zap size={24} /> },
  { step: "03", title: "Get NZ advice", desc: "Ask anything. Get answers grounded in NZ legislation, regulations, and best practice.", icon: <BookOpen size={24} /> },
  { step: "04", title: "Run 24/7", desc: "Embed on your site, share with your team, or let customers chat directly.", icon: <Clock size={24} /> },
];

const ALSO_BY_ASSEMBL = [
  { title: "Custom AI Builds", desc: "Bespoke AI agents trained on your internal data, SOPs, and brand voice.", color: "#00FF88" },
  { title: "Website Chatbots", desc: "Drop-in chat widgets for your website — trained, branded, and always on.", color: "#00E5FF" },
  { title: "AssemblFund", desc: "Our initiative to bring AI tools to Kiwi startups and community organisations.", color: "#FF2D9B" },
];

const AgentGrid = () => {
  const [activeSector, setActiveSector] = useState("All");
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("assembl_onboarded");
    if (!hasVisited) setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = (filter?: string) => {
    sessionStorage.setItem("assembl_onboarded", "true");
    setShowOnboarding(false);
    if (filter) setActiveSector(filter);
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
      // Save to database
      const { error } = await supabase.from("contact_submissions").insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      if (error) throw error;

      // Also send via Formspree for email notification
      fetch("https://formspree.io/f/xwpkpjpd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, message: trimmedMessage }),
      }).catch(() => {}); // fire-and-forget, DB is source of truth

      toast.success("Message sent! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact form error:", err);
    }
  };

  if (showOnboarding) {
    return <OnboardingQuiz onComplete={handleOnboardingComplete} />;
  }

  const filtered = activeSector === "All" ? agents : agents.filter(a => a.sector === activeSector);

  return (
    <div className="min-h-screen flex flex-col relative">
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
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-2">Meet the team</h2>
          <p className="text-sm font-jakarta text-muted-foreground">Tap any agent to chat live — no signup needed.</p>
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
                  ? "border-secondary/25 bg-secondary/5 text-secondary shadow-[0_0_12px_rgba(255,45,155,0.15)]"
                  : "border-white/[0.06] text-muted-foreground hover:border-foreground/10 hover:text-foreground"
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
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-syne font-extrabold text-center text-foreground mb-14"
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
                className="relative rounded-2xl p-6 group transition-colors duration-300 overflow-hidden border border-white/[0.06]"
                style={{ background: 'rgba(14, 14, 26, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 0 30px rgba(0,255,136,0.1)" }}
              >
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 group-hover:opacity-50 transition-opacity" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono-jb text-[10px] font-bold text-primary">{item.step}</span>
                  <div className="text-primary animate-neon-pulse">{item.icon}</div>
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
              Simple, honest <span className="text-gradient-hero">pricing</span>
            </h2>
            <p className="text-sm font-jakarta text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col overflow-hidden border"
                style={{
                  background: 'rgba(14, 14, 26, 0.7)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: plan.highlighted ? plan.color + "40" : "rgba(255, 255, 255, 0.06)",
                  boxShadow: plan.highlighted ? `0 0 30px ${plan.color}15` : "none",
                }}
              >
                {/* Top edge glow */}
                <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }} />
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-syne font-bold px-3 py-1 rounded-full" style={{ background: plan.color, color: "#0A0A14" }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-syne font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 my-3">
                  <span className="text-3xl font-syne font-extrabold" style={{ color: plan.color }}>{plan.price}</span>
                  {plan.period && <span className="text-xs font-jakarta text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs font-jakarta text-foreground/70">
                      <Check size={12} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
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
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HELM SPOTLIGHT ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-027</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mt-1 mb-4">
                Meet <span style={{ color: "#B388FF" }}>HELM</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Your personal Life Admin & Household Manager. Upload receipts, plan meals, track budgets, and tame the chaos of daily life — all through one AI assistant built for New Zealand families.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Meal planning", "Budget tracking", "Document parsing", "School admin", "Life checklists"].map((t) => (
                  <span key={t} className="text-[10px] px-2.5 py-1 rounded-full border text-foreground/60" style={{ borderColor: "#B388FF30" }}>{t}</span>
                ))}
              </div>
              <Link to="/chat/helm" className="inline-flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: "#B388FF" }}>
                Try HELM <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-2xl border flex items-center justify-center overflow-hidden" style={{ borderColor: "#B388FF20", background: "#B388FF08" }}>
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
              <div className="w-64 h-64 rounded-2xl border flex items-center justify-center overflow-hidden" style={{ borderColor: "#26C6DA20", background: "#26C6DA08" }}>
                <AgentAvatar agentId="maritime" color="#26C6DA" size={160} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-028</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mt-1 mb-4">
                Meet <span style={{ color: "#26C6DA" }}>MARINER</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                NZ's maritime AI expert. Fishing regulations, boat maintenance, weather interpretation, commercial maritime compliance — MARINER knows the waters of Aotearoa inside out.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Fishing regs", "Boat maintenance", "Marine weather", "Maritime compliance", "Coastguard courses"].map((t) => (
                  <span key={t} className="text-[10px] px-2.5 py-1 rounded-full border text-foreground/60" style={{ borderColor: "#26C6DA30" }}>{t}</span>
                ))}
              </div>
              <Link to="/mariner" className="inline-flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: "#26C6DA" }}>
                Explore MARINER <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ALSO BY ASSEMBL ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-center text-foreground mb-14">
            Also by <span className="text-gradient-hero">Assembl</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ALSO_BY_ASSEMBL.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4" style={{ background: item.color + "15" }}>
                  <Zap size={16} style={{ color: item.color }} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOUNDER ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-2"
            style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ boxShadow: "0 0 30px rgba(0,255,136,0.3)" }}
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 flex items-center justify-center gap-2">Built in Aotearoa <NeonNZFlag size={28} /></h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve AI tools that understand our laws, our culture, and the way we work.
            Every agent is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p className="text-xs font-bold text-foreground">Kate</p>
          <p className="text-[11px] text-muted-foreground">Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">Get in touch</h2>
            <p className="text-sm text-muted-foreground">Custom builds, enterprise pricing, or just to say kia ora.</p>
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-1.5">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Tell us what you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
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
