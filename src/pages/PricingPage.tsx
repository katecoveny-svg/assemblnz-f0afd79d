import { Link } from "react-router-dom";
import { Check, ChevronDown, ArrowRight } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import ParticleField from "@/components/ParticleField";
import { useState } from "react";

const BUSINESS_PLANS = [
  {
    name: "STARTER",
    price: "$49",
    desc: "For sole traders and micro businesses",
    features: ["1 AI agent", "100 messages/month", "NZ legislation references", "Email support"],
    cta: "Get started",
    href: "https://pay.airwallex.com/sghgspa33ccg",
    external: true,
    highlighted: false,
    borderColor: "#ffffff10",
    btnStyle: "outlined" as const,
  },
  {
    name: "PRO",
    price: "$149",
    desc: "For growing NZ businesses that need expert backup",
    features: ["3 AI agents", "500 messages/month", "Website brand scan", "File upload and parsing", "Priority support"],
    cta: "Start Pro",
    href: "https://pay.airwallex.com/sghgspe6mx61",
    external: true,
    highlighted: true,
    borderColor: "#00FF8830",
    btnStyle: "green" as const,
  },
  {
    name: "BUSINESS",
    price: "$349",
    desc: "All agents, unlimited access, built for teams",
    features: ["All 22 industry agents", "Unlimited messages", "Brand scan + file upload", "Team access (5 seats)", "Usage analytics", "Priority support"],
    cta: "Start Business",
    href: "https://pay.airwallex.com/sghgspfps04o",
    external: true,
    highlighted: false,
    borderColor: "#ffffff10",
    btnStyle: "outlined" as const,
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    desc: "White-label, custom agents, your brand",
    features: ["Your logo and branding", "Custom system prompts", "API access", "Unlimited users", "Your own domain", "Dedicated support"],
    cta: "Contact us",
    href: "#contact",
    external: false,
    highlighted: false,
    borderColor: "#ffffff10",
    btnStyle: "outlined" as const,
  },
];

const HELM_PLANS = [
  {
    name: "FREE",
    price: "$0",
    desc: "Try HELM with basic features",
    features: ["10 messages/day", "Basic chat", "Meal plan suggestions"],
    cta: "Try free",
    href: "/chat/helm",
    external: false,
  },
  {
    name: "PERSONAL",
    price: "$12",
    desc: "Full life admin for one person",
    features: ["Unlimited HELM chat", "File upload", "Meal plans and budgets", "2 lifestyle agents"],
    cta: "Start Personal",
    href: "https://pay.airwallex.com/sghgsph924ew",
    external: true,
  },
  {
    name: "FAMILY",
    price: "$19",
    desc: "For busy NZ families",
    features: ["Everything in Personal", "Multi-child profiles", "Sunday briefing", "All lifestyle agents", "Partner access"],
    cta: "Start Family",
    href: "https://pay.airwallex.com/sghgspijg05v",
    external: true,
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

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          <p className="text-xs text-muted-foreground/50">All prices in NZD. GST inclusive.</p>
        </div>
      </section>

      {/* Business Plans */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-foreground mb-10">
            Plans for every <span className="text-gradient-hero">NZ business</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BUSINESS_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-xl p-6 flex flex-col"
                style={{
                  background: "#0E0E1A",
                  border: `1px solid ${plan.borderColor}`,
                  boxShadow: plan.highlighted ? "0 0 40px #00FF8810" : "none",
                }}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full" style={{ background: "#00FF88", color: "#0A0A14" }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-xs font-bold tracking-widest text-muted-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold" style={{ color: "#FF2D9B" }}>{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-xs text-muted-foreground">/mo NZD</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check size={13} className="shrink-0 mt-0.5" style={{ color: "#00FF88" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.external ? (
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs font-bold py-3 rounded-lg transition-all"
                    style={
                      plan.btnStyle === "green"
                        ? { background: "#00FF88", color: "#0A0A14" }
                        : { background: "transparent", color: "#fff", border: "1px solid #ffffff20" }
                    }
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.href}
                    className="block text-center text-xs font-bold py-3 rounded-lg transition-all"
                    style={
                      plan.btnStyle === "green"
                        ? { background: "#00FF88", color: "#0A0A14" }
                        : { background: "transparent", color: "#fff", border: "1px solid #ffffff20" }
                    }
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELM Family Plans */}
      <section className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-center text-foreground mb-3">
            HELM — For <span style={{ color: "#B388FF" }}>Families</span>
          </h2>
          <p className="text-xs text-center text-muted-foreground mb-10">Life admin, sorted. Built for Kiwi households.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HELM_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl p-6 flex flex-col"
                style={{ background: "#0E0E1A", border: "1px solid #ffffff08" }}
              >
                <h3 className="text-xs font-bold tracking-widest mb-2" style={{ color: "#B388FF" }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold" style={{ color: "#FF2D9B" }}>{plan.price}</span>
                  {plan.price !== "$0" && <span className="text-xs text-muted-foreground">/mo NZD</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                      <Check size={13} className="shrink-0 mt-0.5" style={{ color: "#B388FF" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.external ? (
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs font-bold py-3 rounded-lg transition-all"
                    style={{ background: "#B388FF", color: "#0A0A14" }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to={plan.href}
                    className="block text-center text-xs font-bold py-3 rounded-lg transition-all"
                    style={{ background: "#B388FF", color: "#0A0A14" }}
                  >
                    {plan.cta}
                  </Link>
                )}
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
                  <ChevronDown size={16} className={`text-muted-foreground shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
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
            <Link to="/" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all">
              Browse agents <ArrowRight size={16} />
            </Link>
            <a href="mailto:hello@assembl.co.nz?subject=Enterprise Inquiry" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border text-foreground hover:border-foreground/20 transition-all">
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
