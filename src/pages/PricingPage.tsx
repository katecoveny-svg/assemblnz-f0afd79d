import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/data/stripeTiers";
import { toast } from "sonner";

/* ─── Standard Business Plans (3-col row) ─── */
const STANDARD_PLANS = [
  {
    name: "Starter",
    price: "$79",
    suffix: "/mo NZD",
    desc: "For sole traders and small businesses",
    features: [
      "1 AI agent",
      "100 messages per month",
      "NZ legislation references",
      "Email support",
    ],
    cta: "Get started",
    priceId: STRIPE_TIERS.starter.price_id,
    href: "/chat/helm",
    external: false,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$249",
    suffix: "/mo NZD",
    desc: "For growing NZ businesses",
    features: [
      "3 AI agents",
      "500 messages per month",
      "Website brand scan",
      "File upload and parsing",
      "Template library access",
      "Internal comms tools",
      "Priority support",
    ],
    cta: "Start Pro",
    priceId: STRIPE_TIERS.pro.price_id,
    href: "/chat/helm",
    external: false,
    highlighted: true,
  },
  {
    name: "Business",
    price: "$499",
    suffix: "/mo NZD",
    desc: "All agents, unlimited, built for teams",
    features: [
      "All 38 AI agents",
      "Unlimited messages",
      "Brand scan + file upload",
      "Template library access",
      "Internal comms tools",
      "Content generator (PRISM)",
      "Team access (5 seats)",
      "Usage analytics",
      "Priority support",
    ],
    cta: "Start Business",
    priceId: STRIPE_TIERS.business.price_id,
    href: "/chat/helm",
    external: false,
    highlighted: false,
  },
];

/* ─── Premium Plans (2-col row) ─── */
const INDUSTRY_SUITES = [
  { label: "Construction", agents: "APEX + AROHA + LEDGER + PRISM + SIGNAL" },
  { label: "Hospitality", agents: "AURA + AROHA + LEDGER + PRISM" },
  { label: "Property", agents: "HAVEN + ANCHOR + LEDGER + AROHA" },
  { label: "Legal", agents: "ANCHOR + AROHA + COMPASS + LEDGER" },
  { label: "Trade & Customs", agents: "NEXUS + FLUX + LEDGER + COMPASS" },
  { label: "Health", agents: "VITAE + ORA + AROHA + LEDGER" },
  { label: "Government", agents: "PŪNAHA + TIKA + AWA + KURA + ORA + MANAAKI + WHARE + HAUMARU" },
];

const INDUSTRY_FEATURES = [
  "4-6 specialist agents bundled for your sector",
  "All templates, document generators, and calculators",
  "Internal comms tools for your whole team",
  "ESG dashboard and reporting",
  "Awards tracker with nomination generator",
  "Tender and proposal writing engine",
  "Unlimited messages",
  "Team access (10 seats)",
  "Priority support with onboarding call",
];

const LUXURY_FEATURES = [
  "Full AURA lodge management platform",
  "Guest intelligence and pre-arrival dossiers",
  "Bespoke itinerary builder",
  "Revenue and yield management",
  "Kitchen and F&B operations",
  "PR campaign generator (Condé Nast, Virtuoso, Robb Report targeting)",
  "Trade partner management",
  "Sustainability reporting (TIA Tourism 2050 aligned)",
  "Staff training modules for luxury service",
  "Guest CRM with lifetime value tracking",
  "Unlimited team access",
  "Dedicated onboarding and support",
];

/* ─── Enterprise ─── */
const ENTERPRISE = {
  name: "Enterprise",
  price: "Custom",
  suffix: "",
  desc: "White-label, custom agents, your brand",
  features: [
    "White-label branding",
    "Custom system prompts",
    "API access",
    "Unlimited users",
    "Your own domain",
    "Dedicated account manager",
  ],
  cta: "Contact us",
  href: "#contact",
};

/* ─── HELM Plans ─── */
const HELM_PLANS = [
  {
    name: "HELM Free",
    price: "$0",
    suffix: "",
    desc: "Try HELM with basic features",
    features: [
      "10 messages per day",
      "Basic chat",
      "Meal plan suggestions",
    ],
    cta: "Try free",
    href: "/chat/helm",
    external: false,
    solid: false,
  },
  {
    name: "HELM Personal",
    price: "$14",
    suffix: "/mo NZD",
    desc: "Full life admin for one person",
    features: [
      "Unlimited HELM chat",
      "File upload (school newsletters)",
      "Meal plans and budgets",
      "Vehicle and subscription tracking",
      "Voice input",
      "2 lifestyle agents included",
    ],
    cta: "Start Personal",
    priceId: STRIPE_TIERS.helmPersonal.price_id,
    href: "/chat/helm",
    external: false,
    solid: true,
  },
  {
    name: "HELM Family",
    price: "$24",
    suffix: "/mo NZD",
    desc: "For busy NZ families",
    features: [
      "Everything in Personal",
      "Multi-child profiles",
      "Kids voice mode",
      "Sunday week-ahead briefing",
      "All 7 lifestyle agents",
      "Partner access (2 seats)",
    ],
    cta: "Start Family",
    priceId: STRIPE_TIERS.helmFamily.price_id,
    href: "/chat/helm",
    external: false,
    solid: false,
  },
];

const FAQS = [
  {
    q: "Can I try Assembl for free?",
    a: "Absolutely. Every agent is available for free — no signup required. You get 3 messages per agent to explore. If you like what you see, sign up for a plan to unlock more.",
  },
  {
    q: "How do message limits work?",
    a: "Starter gives you 100 messages per month. Pro provides 500 per month. Business plans have unlimited messages across all agents.",
  },
  {
    q: "What's the difference between brand scan and brand memory?",
    a: "Brand scan (Pro+) lets you scan your website so agents understand your business context for that session. Brand memory (Business+) persists your brand profile across sessions — every agent remembers your context automatically.",
  },
  {
    q: "Can I embed Assembl on my website?",
    a: "Yes! Business and Enterprise plans include embeddable chat widgets. You can add an iframe or a floating chat bubble to any website with one line of code.",
  },
  {
    q: "What NZ legislation do the agents know?",
    a: "Our agents are trained on 50+ NZ Acts and regulations including the Employment Relations Act, Health & Safety at Work Act, Building Code, Food Act, Privacy Act, and many more — specific to each agent's industry.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are month-to-month with no lock-in contracts. Cancel anytime from your dashboard.",
  },
  {
    q: "What is HELM?",
    a: "HELM is our life admin AI agent designed for NZ families. It helps with meal planning, budgeting, school admin, and more — all with Kiwi context built in.",
  },
  {
    q: "Do you offer discounts for nonprofits or startups?",
    a: "Yes! Through our AssemblFund initiative, we offer subsidised access for Kiwi startups and community organisations. Contact us at hello@assembl.co.nz.",
  },
];

/* ─── Shared button renderer ─── */
const PlanButton = ({
  href,
  external,
  label,
  solid,
  color,
  gradient,
  priceId,
}: {
  href: string;
  external: boolean;
  label: string;
  solid: boolean;
  color: string;
  gradient?: string;
  priceId?: string;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const solidStyle: React.CSSProperties = {
    background: gradient || color,
    color: "#0A0A14",
  };
  const outlinedStyle: React.CSSProperties = {
    background: "transparent",
    color: color === "#00FF88" ? "#fff" : color,
    border: `1px solid ${color}40`,
  };
  const style = solid ? solidStyle : outlinedStyle;
  const className =
    "block w-full text-center text-[13px] font-bold py-3 rounded-[10px] transition-all hover:opacity-90";

  const handleCheckout = async () => {
    if (!priceId) return;
    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  // If has a priceId, use integrated checkout
  if (priceId) {
    return (
      <button onClick={handleCheckout} disabled={loading} className={className} style={style}>
        {loading ? <Loader2 size={16} className="inline animate-spin" /> : label}
      </button>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style}>
        {label}
      </a>
    );
  }
  return (
    <Link to={href} className={className} style={style}>
      {label}
    </Link>
  );
};

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen star-field flex flex-col relative">
      <ParticleField />
      <BrandNav />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-syne font-extrabold text-foreground mb-4 leading-tight">
            Plans that scale <span className="text-gradient-hero">with you</span>
          </h1>
          <p className="text-sm sm:text-base font-jakarta max-w-xl mx-auto mb-4" style={{ color: "#ffffffa0" }}>
            From solo operators to luxury lodges. No lock-in. Cancel anytime.
          </p>
          <p className="text-xs font-jakarta" style={{ color: "#ffffff50" }}>
            All prices in NZD. GST inclusive.
          </p>
        </div>
      </section>

      {/* ═══ Business Plans Section ═══ */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-center text-foreground mb-12">
            Plans for <span className="text-gradient-hero">NZ Businesses</span>
          </h2>

          {/* Row 1: Starter / Pro / Business (3-col) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {STANDARD_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col"
                style={{
                  background: "rgba(14,14,26,0.7)",
                  backdropFilter: "blur(12px)",
                  border: plan.highlighted
                    ? "1px solid rgba(0,255,136,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 32,
                  boxShadow: plan.highlighted ? "0 0 48px #00FF8810" : "none",
                }}
              >
                {plan.highlighted && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-4 py-1 rounded-full"
                    style={{ background: "#00FF88", color: "#0A0A14" }}
                  >
                    MOST POPULAR
                  </span>
                )}
                <h3
                  className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
                  style={{ color: "#ffffff60" }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-syne" style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] font-jakarta mb-6" style={{ color: "#ffffff50" }}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: "#ffffffa0" }}>
                      <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#00FF88" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <PlanButton
                  href={plan.href}
                  external={plan.external}
                  label={plan.cta}
                  solid={plan.highlighted}
                  color="#00FF88"
                />
              </div>
            ))}
          </div>

          {/* Row 2: Industry Suite / Luxury Hospitality (2-col, premium) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* ── Industry Suite ── */}
            <div
              className="relative flex flex-col"
              style={{
                background: "rgba(14,14,26,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,229,255,0.15)",
                borderRadius: 20,
                padding: "40px 36px 36px",
                boxShadow: "0 0 60px rgba(0,229,255,0.06)",
              }}
            >
              {/* Top glow edge */}
              <div
                className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00FF88, #00E5FF, #FF2D9B)",
                }}
              />
              {/* Badge */}
              <span
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #00FF88, #00E5FF)",
                  color: "#0A0A14",
                }}
              >
                PREMIUM
              </span>

              <h3
                className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
                style={{ color: "#00E5FF" }}
              >
                Industry Suite
              </h3>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-syne" style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                  $799
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>/mo NZD</span>
              </div>
              <p className="text-[13px] font-medium mb-1" style={{ color: "#ffffffc0" }}>
                Deep expertise for your entire industry
              </p>
              <p className="text-[11px] mb-6" style={{ color: "#ffffff40" }}>
                Choose your industry. Get every agent relevant to it, fully loaded.
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {INDUSTRY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#ffffffa0" }}>
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#00E5FF" }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Suite tags */}
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "#ffffff40" }}>
                  Available suites
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_SUITES.map((s) => (
                    <span
                      key={s.label}
                      className="text-[10px] px-3 py-1.5 rounded-full"
                      style={{
                        background: "rgba(0,229,255,0.08)",
                        border: "1px solid rgba(0,229,255,0.15)",
                        color: "#00E5FF",
                      }}
                      title={s.agents}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <PlanButton
                priceId={STRIPE_TIERS.industry.price_id}
                href="#"
                external={false}
                label="Start Industry Suite"
                solid={true}
                color="#00E5FF"
                gradient="linear-gradient(135deg, #00FF88, #00E5FF)"
              />
            </div>

            {/* ── Luxury Hospitality ── */}
            <div
              className="relative flex flex-col"
              style={{
                background: "rgba(14,14,26,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,184,0,0.12)",
                borderRadius: 20,
                padding: "40px 36px 36px",
                boxShadow: "0 0 60px rgba(255,184,0,0.06)",
              }}
            >
              {/* Top glow edge */}
              <div
                className="absolute top-0 left-4 right-4 h-[2px] rounded-full"
                style={{
                  background: "linear-gradient(90deg, #FFB800, #FF2D9B)",
                }}
              />
              {/* Badge */}
              <span
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #FFB800, #FF2D9B)",
                  color: "#0A0A14",
                }}
              >
                LUXURY
              </span>

              <h3
                className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
                style={{ color: "#FFB800" }}
              >
                Luxury Hospitality
              </h3>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-syne" style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                  $799
                </span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>/mo NZD per property</span>
              </div>
              <p className="text-[13px] font-medium mb-6" style={{ color: "#ffffffc0" }}>
                AI operations for luxury lodges and premium hotels
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {LUXURY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#ffffffa0" }}>
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#FFB800" }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Multi-property note */}
              <p className="text-[11px] mb-6" style={{ color: "#ffffff40" }}>
                Multi-property groups: $1,499/mo for up to 3 properties
              </p>

              <PlanButton
                priceId={STRIPE_TIERS.luxury.price_id}
                href="#"
                external={false}
                label="Book a Demo"
                solid={true}
                color="#FFB800"
                gradient="linear-gradient(135deg, #FFB800, #FF2D9B)"
              />
              <a
                href="#contact"
                className="block text-center text-[12px] mt-3 transition-colors hover:text-foreground"
                style={{ color: "#ffffff50" }}
              >
                Or speak to us first →
              </a>
            </div>
          </div>

          {/* Row 3: Enterprise (single card, outlined) */}
          <div className="max-w-md mx-auto">
            <div
              className="relative flex flex-col"
              style={{
                background: "rgba(14,14,26,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: 32,
              }}
            >
              <h3
                className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
                style={{ color: "#ffffff60" }}
              >
                {ENTERPRISE.name}
              </h3>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-syne" style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                  {ENTERPRISE.price}
                </span>
              </div>
              <p className="text-[12px] font-jakarta mb-6" style={{ color: "#ffffff50" }}>
                {ENTERPRISE.desc}
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {ENTERPRISE.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: "#ffffffa0" }}>
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#00FF88" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <PlanButton
                href={ENTERPRISE.href}
                external={false}
                label={ENTERPRISE.cta}
                solid={false}
                color="#00FF88"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HELM Family Plans ═══ */}
      {/* HELM gradient divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-px rounded-full opacity-40" style={{ background: "linear-gradient(90deg, transparent, #B388FF, #FF2D9B, transparent)" }} />
      </div>
      <section className="py-24 relative">
        {/* Purple ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center top, rgba(179,136,255,0.04) 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-center text-foreground mb-2">
            HELM — For <span style={{ color: "#B388FF" }}>NZ Families</span>
          </h2>
          <p className="text-[13px] font-jakarta text-center mb-12" style={{ color: "#ffffff50" }}>
            AI life admin built for Kiwi households
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HELM_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col"
                style={{
                  background: "rgba(14,14,26,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 32,
                }}
              >
                <h3
                  className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
                  style={{ color: "#B388FF" }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-syne" style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] font-jakarta mb-6" style={{ color: "#ffffff50" }}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: "#ffffffa0" }}>
                      <Check size={14} className="shrink-0 mt-0.5" style={{ color: "#B388FF" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <PlanButton
                  href={plan.href}
                  external={plan.external}
                  label={plan.cta}
                  solid={plan.solid}
                  color="#B388FF"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-block px-8 py-3 rounded-2xl font-jakarta"
            style={{
              background: "rgba(14,14,26,0.5)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-[11px] tracking-wide" style={{ color: "#ffffff50" }}>
              Payments secured by Stripe · Monthly billing · Cancel anytime · No lock-in · Prices NZD incl GST · Visa, Mastercard, Amex
            </p>
          </div>
        </div>
      </section>

      {/* FAQ gradient divider */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-px rounded-full opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, #00E5FF, #FF2D9B, transparent)" }} />
      </div>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-center text-foreground mb-14">
            Frequently asked <span className="text-gradient-hero">questions</span>
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: "rgba(14,14,26,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium font-jakarta text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    style={{ color: "#ffffff50" }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-jakarta leading-relaxed" style={{ color: "#ffffffa0" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA gradient divider */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-px rounded-full opacity-30" style={{ background: "linear-gradient(90deg, transparent, #00FF88, #00E5FF, #FF2D9B, transparent)" }} />
      </div>

      {/* Bottom CTA */}
      <section id="contact" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-2xl p-10"
            style={{
              background: "rgba(14,14,26,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-xl sm:text-2xl font-syne font-extrabold text-foreground mb-3">
              Ready to get started?
            </h2>
            <p className="text-sm font-jakarta mb-6" style={{ color: "#ffffffa0" }}>
              Try any agent free — no signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold font-jakarta bg-primary text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.15),0_0_60px_rgba(0,255,136,0.08)]"
              >
                <span className="relative z-10 flex items-center gap-2">Browse agents <ArrowRight size={16} /></span>
                <span className="absolute inset-0 animate-shimmer-sweep" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
              </Link>
              <a
                href="mailto:hello@assembl.co.nz?subject=Enterprise Inquiry"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold font-jakarta text-foreground transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                Talk to us about Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
};

export default PricingPage;
