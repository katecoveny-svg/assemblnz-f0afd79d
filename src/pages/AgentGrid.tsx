import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Send, Check } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import FAQSection from "@/components/FAQSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PackGrid from "@/components/landing/PackGrid";
import SpecialistTeamGrid from "@/components/landing/SpecialistTeamGrid";
import SocialProofSection from "@/components/landing/SocialProofSection";
import TeKahuiReoSection from "@/components/landing/TeKahuiReoSection";
import EmbedDemoSection from "@/components/landing/EmbedDemoSection";

const PRICING_PLANS = [
  {
    name: "Free",
    monthlyPrice: 0,
    color: "#A1A1AA",
    features: ["3 messages per advisor", "All 44 specialist tools", "NZ legislation knowledge", "No signup required"],
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
    features: ["All 44 specialist tools", "2,000 messages/month", "Command Centre", "MCP API", "Phone support"],
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl | Business Intelligence Platform for NZ | 44 Specialist Tools"
        description="44 specialist tools trained on 50+ NZ Acts. Employment, hospitality, construction, property, sports, and more. Enterprise-grade business intelligence at SME pricing. From $14/mo. Built in Aotearoa."
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

      {/* ═══════ HERO ═══════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToGrid} />
      </div>

      {/* ═══════ SPECIALIST TEAM (one per pack) ═══════ */}
      <div ref={gridRef}>
        <SpecialistTeamGrid />
      </div>

      {/* ═══════ INDUSTRY PACKS (expandable) ═══════ */}
      <PackGrid />

      {/* ═══════ HOW IT WORKS ═══════ */}
      <HowItWorksSection />

      {/* ═══════ SOCIAL PROOF ═══════ */}
      <SocialProofSection />

      {/* ═══════ TE KĀHUI REO ═══════ */}
      <TeKahuiReoSection />

      {/* ═══════ EMBED DEMO ═══════ */}
      <EmbedDemoSection />

      {/* ═══════ PRICING ═══════ */}
      <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2
              className="mb-3"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "2rem",
                color: "#FFFFFF",
              }}
            >
              Enterprise-grade intelligence. <span style={{ color: "#D4A843" }}>SME-friendly pricing.</span>
            </h2>
            <p
              className="mb-6"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              From $14/month. No lock-in. Cancel anytime.
            </p>

            <div
              className="inline-flex items-center gap-3 rounded-full px-1.5 py-1.5"
              style={{
                background: "rgba(15,15,26,0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                onClick={() => setIsAnnual(false)}
                className="px-4 py-1.5 rounded-full text-xs transition-all"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 300,
                  background: !isAnnual ? "#D4A843" : "transparent",
                  color: !isAnnual ? "#09090F" : "rgba(255,255,255,0.65)",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className="px-4 py-1.5 rounded-full text-xs transition-all"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 300,
                  background: isAnnual ? "#D4A843" : "transparent",
                  color: isAnnual ? "#09090F" : "rgba(255,255,255,0.65)",
                }}
              >
                Annual
                <span className="ml-1.5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", opacity: 0.8 }}>-15%</span>
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
              const isPro = plan.highlighted;

              return (
                <div key={plan.name} className="relative pt-4">
                  {isPro && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] px-4 py-1 rounded-full"
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 700,
                        fontSize: "10px",
                        background: "#3A7D6E",
                        color: "#FFFFFF",
                        letterSpacing: "1px",
                      }}
                    >
                      MOST POPULAR
                    </span>
                  )}
                  <div
                    className="relative rounded-xl p-5 flex flex-col h-full"
                    style={{
                      background: "rgba(15,15,26,0.7)",
                      backdropFilter: "blur(10px)",
                      border: isPro ? "1px solid #3A7D6E" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isPro ? "0 0 40px rgba(58,125,110,0.15)" : "none",
                      paddingTop: isPro ? "1.75rem" : "1.25rem",
                      paddingBottom: isPro ? "1.75rem" : "1.25rem",
                      transition: "all 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <span
                      className="absolute top-0 left-[15%] right-[15%] h-px opacity-30"
                      style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }}
                    />
                    <h3
                      style={{
                        fontFamily: "'Lato', sans-serif",
                        fontWeight: 300,
                        fontSize: "16px",
                        color: "#FFFFFF",
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-0.5 my-3">
                      <span
                        className="text-2xl"
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 300,
                          color: plan.color,
                        }}
                      >
                        {price}
                      </span>
                      {period && (
                        <span
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          {period}
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p
                        className="-mt-2 mb-2"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: "9px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        Billed ${Math.round(plan.monthlyPrice * 0.85 * 12)}/year
                      </p>
                    )}
                    <ul className="flex-1 space-y-1.5 mb-5">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2"
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.65)",
                          }}
                        >
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
                        className="block text-center text-xs py-2.5 rounded-xl transition-all duration-300"
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 400,
                          background: isPro ? plan.color : "transparent",
                          color: isPro ? "#09090F" : plan.color,
                          border: `1px solid ${plan.color}30`,
                          boxShadow: isPro ? `0 0 20px ${plan.color}20` : "none",
                        }}
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link
                        to={plan.href}
                        className="block text-center text-xs py-2.5 rounded-xl transition-all duration-300"
                        style={{
                          fontFamily: "'Lato', sans-serif",
                          fontWeight: 400,
                          background: isPro ? plan.color : "transparent",
                          color: isPro ? "#09090F" : plan.color,
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

      {/* ═══════ FAQ ═══════ */}
      <FAQSection />

      {/* ═══════ FOUNDER ═══════ */}
      <section className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            className="w-32 h-32 rounded-full mx-auto mb-6 relative overflow-hidden"
            style={{
              border: "2px solid rgba(212,168,67,0.4)",
              boxShadow: "0 0 30px rgba(212,168,67,0.15), 0 0 60px rgba(58,125,110,0.1)",
              background: "linear-gradient(135deg, rgba(212,168,67,0.1) 0%, rgba(58,125,110,0.1) 100%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <img
              src="/img/kate-neon.png"
              alt="Kate, Founder of Assembl"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </motion.div>
          <h2
            className="mb-3 flex items-center justify-center gap-2"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "1.75rem",
              color: "#FFFFFF",
            }}
          >
            Built in <span className="ml-2" style={{ color: "#D4A843" }}>Aotearoa</span>
          </h2>
          <p
            className="max-w-lg mx-auto mb-4"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
            }}
          >
            "I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work.
            Every tool is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "14px", color: "#FFFFFF" }}>Kate</p>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" className="relative z-10 py-16 sm:py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              className="mb-3"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: "1.75rem",
                color: "#FFFFFF",
              }}
            >
              Get in touch
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>
              Custom builds, enterprise pricing, or just to say kia ora.
            </p>
          </div>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-xl p-6"
            style={{
              background: "rgba(15,15,26,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,168,67,0.03)",
            }}
          >
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(212,168,67,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(212,168,67,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(212,168,67,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                placeholder="Tell us what you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-300"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(58,125,110,0.2))",
                border: "1px solid rgba(212,168,67,0.3)",
                color: "#D4A843",
                boxShadow: "0 0 20px rgba(212,168,67,0.1)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 35px rgba(212,168,67,0.2)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(212,168,67,0.1)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.3)"; }}
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
