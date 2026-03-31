import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useState } from "react";
import { PRICING, COMPARISON_FEATURES } from "@/data/pricing";

const MAIN_PLANS = [
  PRICING.starter,
  PRICING.pro,
  PRICING.business,
  PRICING.suite,
];

const TOROA_PLAN = { ...PRICING.helm, desc: "Life admin for Kiwi families" };

const FAQS = [
  { q: "Can I try Assembl for free?", a: "Every specialist tool is available for free — no signup required. You get 3 messages per advisor to explore. If you like what you see, sign up for a plan to unlock more." },
  { q: "How do message limits work?", a: "Starter gives you 100 messages per month. Pro provides 500 per month. Business gives you 2,000 and Suite provides 5,000. Enterprise is unlimited." },
  { q: "What NZ legislation is built in?", a: "Our tools are trained on 50+ NZ Acts and regulations including the Employment Relations Act 2000, Health and Safety at Work Act 2015, Building Act 2004, Food Act 2014, Privacy Act 2020, and many more." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month with no lock-in contracts. Cancel anytime from your dashboard." },
  { q: "What is TŌROA?", a: "TŌROA is our family life admin advisor designed for NZ families. It helps with meal planning, budgeting, school admin, and more — all with Kiwi context built in." },
  { q: "Do you offer discounts for nonprofits or startups?", a: "Yes! Through our AssemblFund initiative, we offer subsidised access for Kiwi startups and community organisations. Contact us at assembl@assembl.co.nz." },
];

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (price: number | null, label?: string) => {
    if (price === null) return label || 'Custom';
    return `$${price}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-background">
      <SEO
        title="Assembl Pricing — Enterprise-Grade Business Intelligence | SME-Friendly Pricing"
        description="Starter $89/mo (1 tool). Pro $299/mo (3 tools + SPARK). Business $599/mo (all 45 tools). Industry Suite $1,499/mo (custom tools + white-label). TŌROA Family from $14/mo."
        path="/pricing"
      />
      <BrandNav />

      {/* Hero */}
      <section className="pt-20 pb-10 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-5xl font-display mb-3 leading-tight text-foreground" style={{ fontWeight: 300, letterSpacing: '-0.025em' }}>
            Enterprise-grade business intelligence. <span className="text-gradient-hero">SME-friendly pricing.</span>
          </h1>
          <p className="text-sm sm:text-base font-body max-w-xl mx-auto mb-6 text-muted-foreground">
            From $14/month. No lock-in. Cancel anytime. Every plan includes NZ legislation, document templates, and proactive compliance alerts.
          </p>
          <p className="text-xs font-body text-muted-foreground/60">
            All prices in NZD. GST inclusive. Billed monthly.
          </p>
        </div>
      </section>

      {/* Main Plans */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MAIN_PLANS.map((plan) => (
              <div
                key={plan.name}
                className="relative flex flex-col glass-card glow-card-hover p-6"
                style={{
                  borderColor: plan.popular ? 'rgba(212,168,67,0.3)' : undefined,
                }}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-display px-3 py-0.5 rounded-full" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Most Popular
                  </span>
                )}
                <p className="text-[11px] font-display tracking-[2px] uppercase mb-3 text-muted-foreground" style={{ fontWeight: 300 }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-4xl text-foreground" style={{ fontWeight: 300 }}>
                    {formatPrice(plan.price, 'priceLabel' in plan ? String(plan.priceLabel) : undefined)}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                {'agents' in plan && (
                  <p className="text-xs font-body mb-1" style={{ color: 'hsl(var(--primary))' }}>{plan.agents}</p>
                )}
                {'messages' in plan && (
                  <p className="text-[11px] font-body mb-4 text-muted-foreground">{plan.messages}</p>
                )}
                <div className="h-px mb-4" style={{ background: 'hsl(var(--border))' }} />
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.link}
                  target={plan.link.startsWith('#') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="cta-glass-green block w-full text-center text-sm py-2.5 rounded-lg"
                >
                  <span>{plan.cta}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="max-w-md mx-auto mt-6">
            <div className="glass-card glow-card-hover flex flex-col p-6">
              <p className="text-[11px] font-display tracking-[2px] uppercase mb-3 text-muted-foreground" style={{ fontWeight: 300 }}>
                Enterprise
              </p>
              <span className="font-display text-4xl text-foreground mb-1" style={{ fontWeight: 300 }}>Custom</span>
              <p className="text-xs font-body mb-4 text-muted-foreground">Unlimited agents & messages</p>
              <div className="h-px mb-4" style={{ background: 'hsl(var(--border))' }} />
              <ul className="space-y-2 mb-6 flex-1">
                {PRICING.enterprise.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="cta-glass-green block w-full text-center text-sm py-2.5 rounded-lg"
              >
                <span>Contact Us</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TŌROA */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6"><div className="section-divider" /></div>
      <section className="py-14">
        <div className="max-w-md mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-display text-center mb-2 text-foreground" style={{ fontWeight: 300 }}>
            TŌROA — Life Admin for Families
          </h2>
          <p className="text-xs font-body text-center mb-8 text-muted-foreground">
            Life admin built for Kiwi households
          </p>
          <div className="glass-card glow-card-hover flex flex-col p-6" style={{ borderColor: 'rgba(58,106,156,0.15)' }}>
            <p className="text-[11px] font-display tracking-[2px] uppercase mb-3" style={{ color: 'hsl(var(--tangaroa-light))', fontWeight: 300 }}>
              {TOROA_PLAN.name}
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-3xl text-foreground" style={{ fontWeight: 300 }}>
                ${TOROA_PLAN.price}
              </span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs font-body mb-4 text-muted-foreground">{TOROA_PLAN.desc}</p>
            <div className="h-px mb-4" style={{ background: 'hsl(var(--border))' }} />
            <ul className="space-y-2 mb-6 flex-1">
              {TOROA_PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'hsl(var(--tangaroa-light))' }} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={TOROA_PLAN.link}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-glass-green block w-full text-center text-sm py-2.5 rounded-lg"
            >
              <span>Get TŌROA — $29/mo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6"><div className="section-divider" /></div>
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-display text-center mb-8 text-foreground" style={{ fontWeight: 300 }}>
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-body" style={{ minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <th className="text-left py-3 pr-4 text-muted-foreground">Feature</th>
                  <th className="text-center py-3 px-2 text-muted-foreground">Starter $89</th>
                  <th className="text-center py-3 px-2 text-primary">Pro $299</th>
                  <th className="text-center py-3 px-2 text-muted-foreground">Business $599</th>
                  <th className="text-center py-3 px-2 text-muted-foreground">Suite $1,499</th>
                  <th className="text-center py-3 px-2 text-muted-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: '1px solid hsl(var(--border) / 0.4)', background: i % 2 === 0 ? 'transparent' : 'hsl(var(--muted) / 0.3)' }}>
                    <td className="py-2.5 pr-4 text-muted-foreground">{row.feature}</td>
                    {(['starter', 'pro', 'business', 'suite', 'enterprise'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="text-center py-2.5 px-2">
                          {val === true ? (
                            <Check size={14} className="mx-auto text-primary" />
                          ) : val === false ? (
                            <span className="text-muted-foreground/30">—</span>
                          ) : (
                            <span className="text-muted-foreground">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-[11px] font-body text-muted-foreground/60">
            Payments secured by Stripe · Monthly billing · Cancel anytime · No lock-in · All plans include a 7-day money-back guarantee
          </p>
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6"><div className="section-divider" /></div>
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-display text-center mb-8 text-foreground" style={{ fontWeight: 300 }}>
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass-card glow-card-hover rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium font-body pr-4 text-foreground">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 text-muted-foreground ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-body leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-14">
        <div className="max-w-lg mx-auto px-5 sm:px-6 text-center space-y-3">
          <Link
            to="/chat/echo"
            className="cta-glass-green inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm"
          >
            Not sure which plan? Chat with ECHO →
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="pb-14">
        <div className="max-w-lg mx-auto px-5 sm:px-6 text-center">
          <p className="text-sm font-body text-muted-foreground">
            Enterprise inquiries:{' '}
            <a href="mailto:assembl@assembl.co.nz" className="underline text-foreground/70 hover:text-foreground transition-colors">
              assembl@assembl.co.nz
            </a>
          </p>
        </div>
      </section>

      <div className="mt-auto">
        <BrandFooter />
      </div>
    </div>
  );
};

export default PricingPage;