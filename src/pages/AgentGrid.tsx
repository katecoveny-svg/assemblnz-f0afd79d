import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agents, sectors } from "@/data/agents";
import RobotIcon from "@/components/RobotIcon";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, ArrowDown, Zap, Users, BookOpen, Clock, Send, ArrowRight, Check } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import AssemblLogo from "@/components/AssemblLogo";
import { toast } from "sonner";

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    color: "#00FF88",
    features: ["3 messages per agent", "All 29 agents", "NZ legislation knowledge", "No signup required"],
    cta: "Start free",
    href: "/",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    color: "#00E5FF",
    features: ["50 messages/day", "All 29 agents", "Brand scan", "Template library", "Email support"],
    cta: "Get started",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    color: "#FF2D9B",
    features: ["Unlimited messages", "All 29 agents", "HELM & MARINER", "Brand memory", "Priority support", "Embed on your site"],
    cta: "Go Pro",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$199",
    period: "/mo",
    color: "#FFB800",
    features: ["Everything in Pro", "Team seats (5)", "Custom agent training", "API access", "Dedicated account manager"],
    cta: "Contact us",
    href: "mailto:hello@assembl.co.nz",
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick your agent", desc: "Choose from 29 specialists covering NZ industries from hospo to construction.", icon: <Users size={24} /> },
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
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim(),
      });
      if (error) throw error;
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
    <div className="min-h-screen star-field flex flex-col">
      {/* Shared Brand Banner */}
      {brandProfile && brandName && (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2">
          <NeonWave size={14} />
          <span className="text-xs text-primary">Brand loaded: <strong>{brandName}</strong> — All agents have your context</span>
          <button onClick={clearBrand} className="text-primary/60 hover:text-primary transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <BrandNav />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(var(--primary))" }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(var(--secondary))" }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-5 text-foreground leading-tight">
            Your AI <span className="text-gradient-hero">workforce</span>
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 text-muted-foreground">
            29 expert agents trained on NZ legislation. Try any agent free.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button
              onClick={scrollToGrid}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              Browse agents <ArrowDown size={16} />
            </button>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border text-foreground hover:border-foreground/20 transition-all"
            >
              See pricing
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { value: "29", label: "Agents" },
              { value: "20+", label: "NZ Industries" },
              { value: "50+", label: "Acts Referenced" },
              { value: "24/7", label: "Always On" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl sm:text-2xl font-extrabold text-primary">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ AGENT GRID ═══════════════════════ */}
      <main ref={gridRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">Meet the team</h2>
          <p className="text-sm text-muted-foreground">Tap any agent to chat live — no signup needed.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setActiveSector(sector)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                activeSector === sector
                  ? "border-secondary/25 bg-secondary/5 text-secondary"
                  : "border-border text-muted-foreground hover:border-foreground/10 hover:text-foreground"
              }`}
            >
              {sector}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((agent, i) => (
            <Link
              key={agent.id}
              to={`/chat/${agent.id}`}
              className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 opacity-0 animate-fade-up"
              style={{
                animationDelay: `${i * 60}ms`,
                animationFillMode: "forwards",
                borderColor: "hsl(0 0% 100% / 0.03)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = agent.color + "30";
                e.currentTarget.style.boxShadow = `0 0 20px ${agent.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.03)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="absolute top-0 left-4 right-4 h-px opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
              />
              <div className="flex items-start justify-between mb-3">
                <RobotIcon color={agent.color} size={40} agentId={agent.id} />
                <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
              </div>
              <h3 className="text-base font-bold text-foreground tracking-wide">{agent.name}</h3>
              <p className="text-xs font-medium mb-1" style={{ color: agent.color }}>{agent.role}</p>
              <p className="text-xs italic mb-3 text-muted-foreground">"{agent.tagline}"</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {agent.traits.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-foreground/60">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.expertise.map(e => (
                  <span key={e} className="font-mono-jb text-[9px] px-1.5 py-0.5 rounded bg-muted text-foreground/50">{e}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: agent.color }}>
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                  style={{ backgroundColor: agent.color, boxShadow: `0 0 6px ${agent.color}` }}
                />
                Chat now →
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-center text-foreground mb-14">
            How it <span className="text-gradient-hero">works</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative rounded-xl border border-border bg-card p-6 group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono-jb text-[10px] font-bold text-primary">{item.step}</span>
                  <div className="text-primary">{item.icon}</div>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-3">
              Simple, honest <span className="text-gradient-hero">pricing</span>
            </h2>
            <p className="text-sm text-muted-foreground">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-xl border bg-card p-6 flex flex-col"
                style={{
                  borderColor: plan.highlighted ? plan.color + "40" : "hsl(0 0% 100% / 0.03)",
                  boxShadow: plan.highlighted ? `0 0 30px ${plan.color}10` : "none",
                }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: plan.color, color: "#0A0A14" }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 my-3">
                  <span className="text-3xl font-extrabold" style={{ color: plan.color }}>{plan.price}</span>
                  {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground/70">
                      <Check size={12} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className="block text-center text-xs font-bold py-2.5 rounded-lg transition-all"
                  style={{
                    background: plan.highlighted ? plan.color : "transparent",
                    color: plan.highlighted ? "#0A0A14" : plan.color,
                    border: `1px solid ${plan.color}30`,
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HELM SPOTLIGHT ═══════════════════════ */}
      <section className="py-20 sm:py-28 border-t border-border">
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
              <div className="w-64 h-64 rounded-2xl border flex items-center justify-center" style={{ borderColor: "#B388FF20", background: "#B388FF08" }}>
                <RobotIcon color="#B388FF" size={120} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MARINER SPOTLIGHT ═══════════════════════ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-64 h-64 rounded-2xl border flex items-center justify-center" style={{ borderColor: "#26C6DA20", background: "#26C6DA08" }}>
                <RobotIcon color="#26C6DA" size={120} />
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
      <section className="py-20 sm:py-28 border-t border-border">
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
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-2"
            style={{ borderColor: "hsl(var(--primary) / 0.3)" }}
            loading="lazy"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">Built in Aotearoa 🇳🇿</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve AI tools that understand our laws, our culture, and the way we work.
            Every agent is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p className="text-xs font-bold text-foreground">Kate</p>
          <p className="text-[11px] text-muted-foreground">Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="py-20 sm:py-28 border-t border-border">
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

      <BrandFooter />
    </div>
  );
};

export default AgentGrid;
