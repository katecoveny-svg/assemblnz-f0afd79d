import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight, Loader2 } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/data/stripeTiers";
import { toast } from "sonner";

/* ─── Standard Business Plans ─── */
const STANDARD_PLANS = [
  {
    name: "Starter",
    price: "$79",
    suffix: "/mo",
    desc: "For sole traders and small businesses",
    features: [
      "1 AI agent",
      "100 messages per month",
      "NZ legislation references",
      "Email support",
    ],
    cta: "Get started",
    priceId: STRIPE_TIERS.starter.price_id,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$249",
    suffix: "/mo",
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
    highlighted: true,
  },
  {
    name: "Business",
    price: "$499",
    suffix: "/mo",
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
    highlighted: false,
  },
];

/* ─── Premium Plans ─── */
const INDUSTRY_SUITES = [
  { label: "Construction" },
  { label: "Hospitality" },
  { label: "Property" },
  { label: "Legal" },
  { label: "Trade & Customs" },
  { label: "Health" },
  { label: "Government" },
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
  "PR campaign generator",
  "Trade partner management",
  "Sustainability reporting",
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
    priceId: undefined as string | undefined,
    solid: false,
  },
  {
    name: "HELM Personal",
    price: "$14",
    suffix: "/mo",
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
    href: "#",
    priceId: STRIPE_TIERS.helmPersonal.price_id,
    solid: true,
  },
  {
    name: "HELM Family",
    price: "$24",
    suffix: "/mo",
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
    href: "#",
    priceId: STRIPE_TIERS.helmFamily.price_id,
    solid: false,
  },
];

const FAQS = [
  { q: "Can I try Assembl for free?", a: "Absolutely. Every agent is available for free — no signup required. You get 3 messages per agent to explore. If you like what you see, sign up for a plan to unlock more." },
  { q: "How do message limits work?", a: "Starter gives you 100 messages per month. Pro provides 500 per month. Business plans have unlimited messages across all agents." },
  { q: "What's the difference between brand scan and brand memory?", a: "Brand scan (Pro+) lets you scan your website so agents understand your business context for that session. Brand memory (Business+) persists your brand profile across sessions." },
  { q: "Can I embed Assembl on my website?", a: "Yes! Business and Enterprise plans include embeddable chat widgets. You can add an iframe or a floating chat bubble to any website with one line of code." },
  { q: "What NZ legislation do the agents know?", a: "Our agents are trained on 50+ NZ Acts and regulations including the Employment Relations Act, Health & Safety at Work Act, Building Code, Food Act, Privacy Act, and many more." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month with no lock-in contracts. Cancel anytime from your dashboard." },
  { q: "What is HELM?", a: "HELM is our life admin AI agent designed for NZ families. It helps with meal planning, budgeting, school admin, and more — all with Kiwi context built in." },
  { q: "Do you offer discounts for nonprofits or startups?", a: "Yes! Through our AssemblFund initiative, we offer subsidised access for Kiwi startups and community organisations. Contact us at hello@assembl.co.nz." },
];

/* ─── Checkout button ─── */
const CheckoutButton = ({
  label,
  priceId,
  primary,
}: {
  label: string;
  priceId?: string;
  primary?: boolean;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const style: React.CSSProperties = primary
    ? {
        background: 'rgba(255,255,255,0.08)',
        color: '#E4E4EC',
        border: '1px solid rgba(255,255,255,0.12)',
      }
    : {
        background: 'transparent',
        color: 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
      };

  const handleCheckout = async () => {
    if (!priceId) return;
    if (!user) { navigate("/login?redirect=/pricing"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
    }
  };

  if (priceId) {
    return (
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="block w-full text-center text-[13px] font-semibold py-3 rounded-[10px] transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.2]"
        style={style}
      >
        {loading ? <Loader2 size={16} className="inline animate-spin" /> : label}
      </button>
    );
  }

  return null;
};

/* ─── Feature dot ─── */
const FeatureDot = () => (
  <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(255,255,255,0.2)' }} />
);

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#09090F' }}>
      <ParticleField />
      <BrandNav />

      {/* Hero */}
      <section className="pt-12 pb-10 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-syne font-extrabold mb-3 leading-tight" style={{ color: '#E4E4EC' }}>
            Simple, honest pricing
          </h1>
          <p className="text-sm sm:text-base font-jakarta max-w-xl mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            From solo operators to luxury lodges. No lock-in. Cancel anytime.
          </p>
          <p className="text-xs font-jakarta" style={{ color: 'rgba(255,255,255,0.2)' }}>
            All prices in NZD. GST inclusive.
          </p>
        </div>
      </section>

      {/* ═══ Business Plans ═══ */}
      <section className="pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-syne font-extrabold text-center mb-8 sm:mb-12" style={{ color: '#E4E4EC' }}>
            Plans for NZ Businesses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
            {STANDARD_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:border-white/[0.1]"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: plan.highlighted
                    ? '1px solid rgba(255,255,255,0.08)'
                    : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {plan.highlighted && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[1.5px]"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Most Popular
                  </span>
                )}
                <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-syne text-3xl sm:text-5xl font-extrabold" style={{ color: '#E4E4EC' }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] font-jakarta mb-5 sm:mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {plan.desc}
                </p>
                <ul className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <FeatureDot />
                      {f}
                    </li>
                  ))}
                </ul>
                <CheckoutButton label={plan.cta} priceId={plan.priceId} primary={plan.highlighted} />
              </div>
            ))}
          </div>

          {/* Premium 2-col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Industry Suite */}
            <div
              className="relative flex flex-col rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:border-white/[0.1]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[1.5px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Premium
              </span>

              <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Industry Suite
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-syne text-3xl sm:text-5xl font-extrabold" style={{ color: '#E4E4EC' }}>$799</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>/mo</span>
              </div>
              <p className="text-[13px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Deep expertise for your entire industry
              </p>
              <p className="text-[11px] mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Choose your industry. Get every agent relevant to it, fully loaded.
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {INDUSTRY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FeatureDot />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Available suites
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_SUITES.map((s) => (
                    <span
                      key={s.label}
                      className="text-[10px] px-3 py-1.5 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <CheckoutButton label="Start Industry Suite" priceId={STRIPE_TIERS.industry.price_id} primary />
            </div>

            {/* Luxury Hospitality */}
            <div
              className="relative flex flex-col rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:border-white/[0.1]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-[1.5px]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Luxury
              </span>

              <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Luxury Hospitality
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-syne text-3xl sm:text-5xl font-extrabold" style={{ color: '#E4E4EC' }}>$799</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>/mo per property</span>
              </div>
              <p className="text-[13px] font-medium mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                AI operations for luxury lodges and premium hotels
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {LUXURY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FeatureDot />
                    {f}
                  </li>
                ))}
              </ul>

              <p className="text-[11px] mb-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Multi-property groups: $1,499/mo for up to 3 properties
              </p>

              <CheckoutButton label="Book a Demo" priceId={STRIPE_TIERS.luxury.price_id} primary />
              <a
                href="#contact"
                className="block text-center text-[12px] mt-3 transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                Or speak to us first →
              </a>
            </div>
          </div>

          {/* Enterprise */}
          <div className="max-w-md mx-auto">
            <div
              className="relative flex flex-col rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:border-white/[0.1]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {ENTERPRISE.name}
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-syne text-3xl sm:text-5xl font-extrabold" style={{ color: '#E4E4EC' }}>
                  {ENTERPRISE.price}
                </span>
              </div>
              <p className="text-[12px] font-jakarta mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {ENTERPRISE.desc}
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {ENTERPRISE.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <FeatureDot />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={ENTERPRISE.href}
                className="block w-full text-center text-[13px] font-semibold py-3 rounded-[10px] transition-all duration-300"
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = '#E4E4EC';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                {ENTERPRISE.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HELM ═══ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="h-px rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <section className="py-14 sm:py-24 relative">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-syne font-extrabold text-center mb-2" style={{ color: '#E4E4EC' }}>
            HELM — For NZ Families
          </h2>
          <p className="text-[13px] font-jakarta text-center mb-8 sm:mb-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
            AI life admin built for Kiwi households
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {HELM_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col rounded-2xl p-5 sm:p-8 transition-all duration-300 hover:border-white/[0.1]"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-syne text-3xl sm:text-5xl font-extrabold" style={{ color: '#E4E4EC' }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] font-jakarta mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] font-jakarta" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <FeatureDot />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
                  <CheckoutButton label={plan.cta} priceId={plan.priceId} primary={plan.solid} />
                ) : (
                  <Link
                    to={plan.href}
                    className="block w-full text-center text-[13px] font-semibold py-3 rounded-[10px] transition-all duration-300"
                    style={{
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.06)',
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

      {/* Trust signals */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <div
            className="inline-block px-5 sm:px-8 py-3 rounded-2xl font-jakarta"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <p className="text-[10px] sm:text-[11px] tracking-wide" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Payments secured by Stripe · Monthly billing · Cancel anytime · No lock-in · Prices NZD incl GST
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-px rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-center mb-14" style={{ color: '#E4E4EC' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium font-jakarta pr-4" style={{ color: '#E4E4EC' }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-jakarta leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="h-px rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Bottom CTA */}
      <section id="contact" className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-2xl p-10"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h2 className="text-xl sm:text-2xl font-syne font-extrabold mb-3" style={{ color: '#E4E4EC' }}>
              Ready to get started?
            </h2>
            <p className="text-sm font-jakarta mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Try any agent free — no signup required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold font-jakarta transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#E4E4EC',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                }}
              >
                Browse agents <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:assembl@assembl.co.nz?subject=Enterprise Inquiry"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold font-jakarta transition-all duration-300"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#E4E4EC';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
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