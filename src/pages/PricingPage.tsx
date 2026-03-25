import { Link } from "react-router-dom";
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

const HELM_PLAN = { ...PRICING.helm, desc: "AI life admin for Kiwi families" };

const FAQS = [
  { q: "Can I try Assembl for free?", a: "Every agent is available for free — no signup required. You get 3 messages per agent to explore. If you like what you see, sign up for a plan to unlock more." },
  { q: "How do message limits work?", a: "Starter gives you 100 messages per month. Pro provides 500 per month. Business gives you 2,000 and Suite provides 5,000. Enterprise is unlimited." },
  { q: "What NZ legislation do the agents know?", a: "Our agents are trained on 50+ NZ Acts and regulations including the Employment Relations Act, Health & Safety at Work Act, Building Code, Food Act, Privacy Act, and many more." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month with no lock-in contracts. Cancel anytime from your dashboard." },
  { q: "What is HELM?", a: "HELM is our life admin AI agent designed for NZ families. It helps with meal planning, budgeting, school admin, and more — all with Kiwi context built in." },
  { q: "Do you offer discounts for nonprofits or startups?", a: "Yes! Through our AssemblFund initiative, we offer subsidised access for Kiwi startups and community organisations. Contact us at kate@assembl.co.nz." },
];

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (price: number | null, label?: string) => {
    if (price === null) return label || 'Custom';
    return `$${price}`;
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#09090B' }}>
      <BrandNav />

      {/* Hero */}
      <section className="pt-20 pb-10 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-5xl font-syne font-bold mb-3 leading-tight" style={{ color: '#FAFAFA', letterSpacing: '-0.025em' }}>
            Simple pricing. Serious capability.
          </h1>
          <p className="text-sm sm:text-base font-jakarta max-w-xl mx-auto mb-6" style={{ color: '#A1A1AA' }}>
            Every plan includes NZ legislation, document templates, and proactive compliance alerts.
          </p>

          <p className="text-xs font-jakarta" style={{ color: '#71717A' }}>
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
                className="relative flex flex-col rounded-xl p-6"
                style={{
                  background: 'rgba(15, 15, 18, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: plan.popular ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-0.5 rounded-full" style={{ background: '#10B981', color: '#09090B' }}>
                    Most Popular
                  </span>
                )}
                <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: '#71717A' }}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-syne text-4xl font-bold" style={{ color: '#FAFAFA' }}>
                    {formatPrice(plan.price, 'priceLabel' in plan ? String(plan.priceLabel) : undefined)}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: '#71717A' }}>{plan.period}</span>
                  )}
                </div>
                {'agents' in plan && (
                  <p className="text-xs font-jakarta mb-1" style={{ color: '#10B981' }}>{plan.agents}</p>
                )}
                {'messages' in plan && (
                  <p className="text-[11px] font-jakarta mb-4" style={{ color: '#71717A' }}>{plan.messages}</p>
                )}
                <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs font-jakarta" style={{ color: '#A1A1AA' }}>
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.link}
                  target={plan.link.startsWith('#') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={plan.popular
                    ? "cta-glass-green block w-full text-center text-sm font-semibold py-2.5 rounded-lg"
                    : "cta-glass-green block w-full text-center text-sm font-semibold py-2.5 rounded-lg"
                  }
                >
                  <span>{plan.cta}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Enterprise */}
          <div className="max-w-md mx-auto mt-6">
            <div
              className="flex flex-col rounded-xl p-6"
              style={{
                background: 'rgba(15, 15, 18, 0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: '#71717A' }}>
                Enterprise
              </p>
              <span className="font-syne text-4xl font-bold mb-1" style={{ color: '#FAFAFA' }}>Custom</span>
              <p className="text-xs font-jakarta mb-4" style={{ color: '#71717A' }}>Unlimited agents & messages</p>
              <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <ul className="space-y-2 mb-6 flex-1">
                {PRICING.enterprise.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs font-jakarta" style={{ color: '#A1A1AA' }}>
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="cta-glass-green block w-full text-center text-sm font-semibold py-2.5 rounded-lg"
              >
                <span>Contact Us</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HELM */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6"><div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} /></div>
      <section className="py-14">
        <div className="max-w-md mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-syne font-bold text-center mb-2" style={{ color: '#FAFAFA' }}>
            HELM — Life Admin for Families
          </h2>
          <p className="text-xs font-jakarta text-center mb-8" style={{ color: '#71717A' }}>
            AI life admin built for Kiwi households
          </p>
          <div
            className="flex flex-col rounded-xl p-6"
            style={{
              background: 'rgba(15, 15, 18, 0.8)',
              border: '1px solid rgba(179,136,255,0.15)',
            }}
          >
            <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: '#B388FF' }}>
              {HELM_PLAN.name}
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-syne text-3xl font-bold" style={{ color: '#FAFAFA' }}>
                ${HELM_PLAN.price}
              </span>
              <span className="text-sm" style={{ color: '#71717A' }}>/mo</span>
            </div>
            <p className="text-xs font-jakarta mb-4" style={{ color: '#71717A' }}>{HELM_PLAN.desc}</p>
            <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <ul className="space-y-2 mb-6 flex-1">
              {HELM_PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-jakarta" style={{ color: '#A1A1AA' }}>
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#B388FF' }} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={HELM_PLAN.link}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-glass-green block w-full text-center text-sm font-semibold py-2.5 rounded-lg"
            >
              <span>Get HELM — $29/mo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6"><div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} /></div>
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-syne font-bold text-center mb-8" style={{ color: '#FAFAFA' }}>
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-jakarta" style={{ minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left py-3 pr-4" style={{ color: '#71717A' }}>Feature</th>
                  <th className="text-center py-3 px-2" style={{ color: '#A1A1AA' }}>Starter $89</th>
                  <th className="text-center py-3 px-2" style={{ color: '#10B981' }}>Pro $299</th>
                  <th className="text-center py-3 px-2" style={{ color: '#A1A1AA' }}>Business $599</th>
                  <th className="text-center py-3 px-2" style={{ color: '#A1A1AA' }}>Suite $1,499</th>
                  <th className="text-center py-3 px-2" style={{ color: '#A1A1AA' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="py-2.5 pr-4" style={{ color: '#A1A1AA' }}>{row.feature}</td>
                    {(['starter', 'pro', 'business', 'suite', 'enterprise'] as const).map((tier) => {
                      const val = row[tier];
                      return (
                        <td key={tier} className="text-center py-2.5 px-2">
                          {val === true ? (
                            <Check size={14} className="mx-auto" style={{ color: '#10B981' }} />
                          ) : val === false ? (
                            <span style={{ color: '#3F3F46' }}>—</span>
                          ) : (
                            <span style={{ color: '#A1A1AA' }}>{val}</span>
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
          <p className="text-[11px] font-jakarta" style={{ color: '#71717A' }}>
            Payments secured by Stripe · Monthly billing · Cancel anytime · No lock-in · All plans include a 7-day money-back guarantee
          </p>
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6"><div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} /></div>
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <h2 className="text-lg sm:text-2xl font-syne font-bold text-center mb-8" style={{ color: '#FAFAFA' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'rgba(15, 15, 18, 0.8)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium font-jakarta pr-4" style={{ color: '#FAFAFA' }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    style={{ color: '#71717A' }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-jakarta leading-relaxed" style={{ color: '#A1A1AA' }}>{faq.a}</p>
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold font-jakarta transition-colors duration-200"
            style={{ background: '#10B981', color: '#09090B' }}
          >
            Not sure which plan? Chat with ECHO →
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="pb-14">
        <div className="max-w-lg mx-auto px-5 sm:px-6 text-center">
          <p className="text-sm font-jakarta" style={{ color: '#71717A' }}>
            Enterprise inquiries:{' '}
            <a href="mailto:kate@assembl.co.nz" className="underline" style={{ color: '#A1A1AA' }}>
              kate@assembl.co.nz
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
