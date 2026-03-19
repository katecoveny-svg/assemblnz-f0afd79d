import { Link } from "react-router-dom";
import { Check, X, Minus, ArrowRight, ChevronDown } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    color: "#00FF88",
    cta: "Start free",
    href: "/",
    highlighted: false,
    desc: "Try every agent with zero commitment.",
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    color: "#00E5FF",
    cta: "Get started",
    href: "/signup",
    highlighted: false,
    desc: "For solo operators who need daily AI support.",
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    color: "#FF2D9B",
    cta: "Go Pro",
    href: "/signup",
    highlighted: true,
    desc: "Unlimited power for growing businesses.",
  },
  {
    name: "Business",
    price: "$199",
    period: "/mo",
    color: "#FFB800",
    cta: "Contact us",
    href: "mailto:hello@assembl.co.nz",
    highlighted: false,
    desc: "For teams that need custom AI agents.",
  },
];

type FeatureValue = boolean | string;

interface FeatureRow {
  label: string;
  free: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
  business: FeatureValue;
}

const FEATURE_GROUPS: { group: string; features: FeatureRow[] }[] = [
  {
    group: "Core",
    features: [
      { label: "Access to all 29 agents", free: true, starter: true, pro: true, business: true },
      { label: "NZ legislation knowledge base", free: true, starter: true, pro: true, business: true },
      { label: "Daily message limit", free: "3/agent", starter: "50/day", pro: "Unlimited", business: "Unlimited" },
      { label: "Conversation history", free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    group: "Brand & Context",
    features: [
      { label: "Website brand scan", free: false, starter: true, pro: true, business: true },
      { label: "Brand memory (persisted context)", free: false, starter: false, pro: true, business: true },
      { label: "Custom brand profile upload", free: false, starter: true, pro: true, business: true },
    ],
  },
  {
    group: "Productivity",
    features: [
      { label: "Template library", free: false, starter: true, pro: true, business: true },
      { label: "File & image uploads", free: false, starter: true, pro: true, business: true },
      { label: "PDF export (structured outputs)", free: false, starter: false, pro: true, business: true },
      { label: "HELM (Life Admin Agent)", free: false, starter: false, pro: true, business: true },
      { label: "MARINER (Maritime Agent)", free: false, starter: false, pro: true, business: true },
    ],
  },
  {
    group: "Embed & Integrate",
    features: [
      { label: "Embed chat on your website", free: false, starter: false, pro: true, business: true },
      { label: "Floating chat bubble widget", free: false, starter: false, pro: true, business: true },
      { label: "API access", free: false, starter: false, pro: false, business: true },
      { label: "Webhook notifications", free: false, starter: false, pro: false, business: true },
    ],
  },
  {
    group: "Support & Team",
    features: [
      { label: "Email support", free: false, starter: true, pro: true, business: true },
      { label: "Priority support", free: false, starter: false, pro: true, business: true },
      { label: "Dedicated account manager", free: false, starter: false, pro: false, business: true },
      { label: "Team seats", free: "1", starter: "1", pro: "1", business: "5" },
      { label: "Custom agent training", free: false, starter: false, pro: false, business: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I try Assembl for free?",
    a: "Absolutely. Every agent is available for free — no signup required. You get 3 messages per agent to explore. If you like what you see, sign up for a plan to unlock more.",
  },
  {
    q: "How do message limits work?",
    a: "On Free, you get 3 messages per agent per session. Starter gives you 50 messages per day across all agents. Pro and Business plans have unlimited messages.",
  },
  {
    q: "What's the difference between brand scan and brand memory?",
    a: "Brand scan (Starter+) lets you scan your website so agents understand your business context for that session. Brand memory (Pro+) persists your brand profile across sessions — every agent remembers your context automatically.",
  },
  {
    q: "Can I embed Assembl on my website?",
    a: "Yes! Pro and Business plans include embeddable chat widgets. You can add an iframe or a floating chat bubble to any website with one line of code.",
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
    q: "What is custom agent training?",
    a: "Business plan customers can request custom-trained agents that learn from your internal SOPs, policies, and data. These agents become exclusive to your team.",
  },
  {
    q: "Do you offer discounts for nonprofits or startups?",
    a: "Yes! Through our AssemblFund initiative, we offer subsidised access for Kiwi startups and community organisations. Contact us at hello@assembl.co.nz.",
  },
];

const CellValue = ({ value, color }: { value: FeatureValue; color: string }) => {
  if (value === true) return <Check size={14} style={{ color }} className="mx-auto" />;
  if (value === false) return <Minus size={12} className="mx-auto text-muted-foreground/30" />;
  return <span className="text-[11px] font-medium text-foreground/70">{value}</span>;
};

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annual, setAnnual] = useState(false);

  const getPrice = (plan: typeof PLANS[number]) => {
    if (plan.price === "$0") return "$0";
    const monthly = parseInt(plan.price.replace("$", ""));
    if (!annual) return plan.price;
    return "$" + Math.round(monthly * 10 / 12); // 2 months free
  };

  return (
    <div className="min-h-screen star-field flex flex-col">
      <BrandNav />

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight">
            Simple, honest <span className="text-gradient-hero">pricing</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-4">
            Start free. Upgrade when you're ready. No lock-in contracts.
          </p>
          <p className="text-xs text-muted-foreground/50 mb-8">All prices in NZD. GST inclusive.</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
            <span className={`text-xs font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className={`text-xs font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
            <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] px-2 py-0.5">Save 17%</Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-xl border bg-card p-6 flex flex-col"
                style={{
                  borderColor: plan.highlighted ? plan.color + "40" : "hsl(0 0% 100% / 0.03)",
                  boxShadow: plan.highlighted ? `0 0 40px ${plan.color}10` : "none",
                }}
              >
                {plan.highlighted && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full"
                    style={{ background: plan.color, color: "#0A0A14" }}
                  >
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-0.5 mb-6">
                  <span className="text-4xl font-extrabold" style={{ color: plan.color }}>{getPrice(plan)}</span>
                  {plan.price !== "$0" && <span className="text-xs text-muted-foreground">{annual ? "/mo billed annually" : "/mo"}</span>}
                </div>
                <Link
                  to={plan.href}
                  className="block text-center text-xs font-bold py-3 rounded-lg transition-all mb-4"
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

      {/* Feature Comparison Table */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-foreground mb-14">
            Full feature <span className="text-gradient-hero">comparison</span>
          </h2>

          <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-4 font-medium text-muted-foreground w-[40%]">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.name} className="text-center px-3 py-4 font-bold" style={{ color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_GROUPS.map((group) => (
                  <>
                    <tr key={group.group}>
                      <td
                        colSpan={5}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-primary bg-muted/30"
                      >
                        {group.group}
                      </td>
                    </tr>
                    {group.features.map((f) => (
                      <tr key={f.label} className="border-b border-border/50 hover:bg-muted/10">
                        <td className="px-5 py-3 text-foreground/80">{f.label}</td>
                        <td className="text-center px-3 py-3"><CellValue value={f.free} color={PLANS[0].color} /></td>
                        <td className="text-center px-3 py-3"><CellValue value={f.starter} color={PLANS[1].color} /></td>
                        <td className="text-center px-3 py-3"><CellValue value={f.pro} color={PLANS[2].color} /></td>
                        <td className="text-center px-3 py-3"><CellValue value={f.business} color={PLANS[3].color} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
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
              <div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
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
      <section className="py-16 border-t border-border">
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
