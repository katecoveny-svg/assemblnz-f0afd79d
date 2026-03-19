import { Link } from "react-router-dom";
import { Check, ChevronDown, ArrowRight } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import { useState } from "react";

const BUSINESS_PLANS = [
  {
    name: "Starter",
    price: "$49",
    suffix: "/mo NZD",
    desc: "For sole traders and micro businesses",
    features: [
      "1 AI agent",
      "100 messages per month",
      "NZ legislation references",
      "Email support",
    ],
    cta: "Get started",
    href: "https://pay.airwallex.com/sghgspa33ccg",
    external: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
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
    href: "https://pay.airwallex.com/sghgspe6mx61",
    external: true,
    highlighted: true,
  },
  {
    name: "Business",
    price: "$349",
    suffix: "/mo NZD",
    desc: "All agents, unlimited, built for teams",
    features: [
      "All 37 AI agents",
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
    href: "https://pay.airwallex.com/sghgspfps04o",
    external: true,
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    desc: "White-label, custom agents, your brand",
    features: [
      "Your logo and branding",
      "Custom system prompts",
      "API access",
      "Unlimited users",
      "Your own domain",
      "Dedicated support",
    ],
    cta: "Contact us",
    href: "#contact",
    external: false,
    highlighted: false,
  },
];

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
    price: "$12",
    suffix: "/mo NZD",
    desc: "Full life admin for one person",
    features: [
      "Unlimited HELM chat",
      "File upload (school newsletters)",
      "Meal plans and budgets",
      "Vehicle and subscription tracking",
      "2 lifestyle agents included",
    ],
    cta: "Start Personal",
    href: "https://pay.airwallex.com/sghgsph924ew",
    external: true,
    solid: true,
  },
  {
    name: "HELM Family",
    price: "$19",
    suffix: "/mo NZD",
    desc: "For busy NZ families",
    features: [
      "Everything in Personal",
      "Multi-child profiles",
      "Sunday week-ahead briefing",
      "All 7 lifestyle agents",
      "Partner access (2 seats)",
    ],
    cta: "Start Family",
    href: "https://pay.airwallex.com/sghgspijg05v",
    external: true,
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

/* Shared button renderer */
const PlanButton = ({
  href,
  external,
  label,
  solid,
  color,
}: {
  href: string;
  external: boolean;
  label: string;
  solid: boolean;
  color: string;
}) => {
  const solidStyle: React.CSSProperties = { background: color, color: "#0A0A14" };
  const outlinedStyle: React.CSSProperties = {
    background: "transparent",
    color: color === "#00FF88" ? "#fff" : color,
    border: `1px solid ${color}40`,
  };
  const style = solid ? solidStyle : outlinedStyle;
  const className = "block w-full text-center text-[13px] font-bold py-3 rounded-[10px] transition-all hover:opacity-90";

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
            Simple, honest <span className="text-gradient-hero">pricing</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-4">
            Start free. Upgrade when you're ready. No lock-in contracts.
          </p>
          <p className="text-xs" style={{ color: "#ffffff50" }}>All prices in NZD. GST inclusive.</p>
        </div>
      </section>

      {/* Business Plans */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-foreground mb-12">
            Plans for <span className="text-gradient-hero">NZ Businesses</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUSINESS_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col"
                style={{
                  background: "#0E0E1A",
                  border: plan.highlighted ? "1px solid #00FF8830" : "1px solid #ffffff08",
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
                <h3 className="text-[11px] font-bold tracking-[2px] uppercase mb-3" style={{ color: "#ffffff60" }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span style={{ color: "#ffffff40", fontSize: 16 }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] mb-6" style={{ color: "#ffffff50" }}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#ffffffa0" }}>
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
        </div>
      </section>

      {/* HELM Family Plans */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-foreground mb-2">
            HELM — For <span style={{ color: "#B388FF" }}>NZ Families</span>
          </h2>
          <p className="text-[13px] text-center mb-12" style={{ color: "#ffffff50" }}>
            AI life admin built for Kiwi households
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HELM_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col"
                style={{
                  background: "#0E0E1A",
                  border: "1px solid #ffffff08",
                  borderRadius: 16,
                  padding: 32,
                }}
              >
                <h3 className="text-[11px] font-bold tracking-[2px] uppercase mb-3" style={{ color: "#B388FF" }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span style={{ color: "#FF2D9B", fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span style={{ color: "#ffffff40", fontSize: 16 }}>{plan.suffix}</span>
                  )}
                </div>
                <p className="text-[12px] mb-6" style={{ color: "#ffffff50" }}>{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#ffffffa0" }}>
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

      {/* FAQ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-foreground mb-14">
            Frequently asked <span className="text-gradient-hero">questions</span>
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section id="contact" className="py-16 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-3">Ready to get started?</h2>
          <p className="text-sm text-muted-foreground mb-6">Try any agent free — no signup required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
            >
              Browse agents <ArrowRight size={16} />
            </Link>
            <a
              href="mailto:hello@assembl.co.nz?subject=Enterprise Inquiry"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border text-foreground hover:border-foreground/20 transition-all"
            >
              Talk to us about Enterprise
            </a>
          </div>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default PricingPage;
