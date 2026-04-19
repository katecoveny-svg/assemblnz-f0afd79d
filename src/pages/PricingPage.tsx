import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, X } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import FAQSectionShared from "@/components/FAQSection";
import { PRICING, COMPARISON_FEATURES, ADD_ONS, KETE } from "@/data/pricing";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const C = {
  bg: "#FAFBFC",
  surface: "#FFFFFF",
  pounamu: "#4AA5A8",
  pounamuGlow: "#5AADA0",
  pounamuLight: "#6CBFC1",
  gold: "#4AA5A8",
  goldLight: "#F0C670",
  white: "#3D4250",
  textSecondary: "#6B7280",
};

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease },
};

/* ═══ MAIN TIERS ═══ */
const TIERS = [
  {
    key: "operator" as const,
    badge: null,
    highlight: false,
    accent: C.pounamuGlow,
  },
  {
    key: "leader" as const,
    badge: "Most popular",
    highlight: true,
    accent: C.gold,
  },
  {
    key: "enterprise" as const,
    badge: null,
    highlight: false,
    accent: C.pounamuLight,
  },
];

const PricingPage = () => (
  <div className="min-h-screen" style={{ background: C.bg, color: "#3D4250" }}>
    <SEO
      title="Assembl Pricing — NZ workflow tools from $1,490/mo"
      description="Pick the kete that matches your industry. Operator $1,490/mo · Leader $1,990/mo · Enterprise $2,990/mo. NZD ex GST."
      path="/pricing"
    />
    <BrandNav />

    {/* ═══ HERO ═══ */}
    <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 40% at 50% 30%, rgba(212,168,83,0.08) 0%, transparent 60%)`,
      }} />
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-[10px] tracking-[5px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold, fontWeight: 700 }}>
          — Pricing —
        </p>
        <h1 className="text-3xl sm:text-[44px] mb-6" style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "6px",
          textTransform: "uppercase", lineHeight: 1.1, color: C.white,
        }}>
          Simple, honest pricing
        </h1>
        <p className="text-[16px] leading-[1.9] max-w-lg mx-auto mb-4" style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, color: "#6B7280",
        }}>
          Pick the kete that matches your industry. Every plan includes the full governance pipeline, SMS & WhatsApp, and your dashboard.
        </p>
        <p className="text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#9CA3AF" }}>
          All prices NZD · Exclude GST (add 15%)
        </p>
      </div>
    </section>

    {/* ═══ THREE BUSINESS TIERS ═══ */}
    <section className="px-6 pb-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {TIERS.map((tier, i) => {
          const data = PRICING[tier.key];
          return (
            <motion.div key={tier.key} {...fade} transition={{ ...fade.transition, delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "rgba(255,255,255,0.65)",
                border: tier.highlight ? `2px solid ${C.gold}50` : "1px solid rgba(255,255,255,0.10)",
                boxShadow: tier.highlight
                  ? `0 0 60px rgba(212,168,83,0.10), 0 20px 60px rgba(0,0,0,0.4)`
                  : "0 12px 48px rgba(0,0,0,0.3)",
              }}
            >
              {/* Top accent line */}
              <div className="h-[2px]" style={{
                background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)`,
              }} />

              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] tracking-[2px] uppercase px-3 py-1.5 rounded-full" style={{
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                    background: `${C.gold}18`, color: C.gold, border: `1px solid ${C.gold}30`,
                  }}>{tier.badge}</span>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Tier name */}
                <h3 className="text-[22px] mb-2" style={{
                  fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px",
                  textTransform: "uppercase", color: C.white,
                }}>{data.name}</h3>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-[32px]" style={{
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.white,
                  }}>${data.price.toLocaleString()}</span>
                  <span className="text-[14px] ml-1" style={{ color: "#6B7280" }}>/mo</span>
                </div>

                {/* Setup */}
                {data.setup !== null && data.setup > 0 && (
                  <p className="text-[12px] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>
                    + ${data.setup.toLocaleString()} setup
                  </p>
                )}
                <p className="text-[11px] mb-6" style={{ color: "#9CA3AF" }}>
                  {data.setupNote || "Setup splittable across 3 invoices"}
                </p>

                {/* Descriptor */}
                <p className="text-[13px] leading-[1.8] mb-6 pb-6" style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280",
                  borderBottom: "1px solid rgba(74,165,168,0.1)",
                }}>
                  {data.descriptor}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {data.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{
                        background: `${tier.accent}15`, border: `1px solid ${tier.accent}20`,
                      }}>
                        <Check size={11} style={{ color: tier.accent }} />
                      </div>
                      <span className="text-[13px] leading-[1.6]" style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF",
                      }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Value anchor */}
                {'valueAnchor' in data && data.valueAnchor && (
                  <div className="rounded-xl p-4 mb-6" style={{
                    background: `${tier.accent}08`, border: `1px solid ${tier.accent}15`,
                  }}>
                    <p className="text-[11px] leading-[1.7]" style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280",
                    }}>
                      <span style={{ color: tier.accent, fontWeight: 600 }}>ROI: </span>
                      {data.valueAnchor}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <Link to={data.link} className="block w-full text-center py-4 rounded-xl text-[12px] tracking-[2px] uppercase transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    fontFamily: "'Lato', sans-serif", fontWeight: 600,
                    background: tier.highlight ? `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` : "rgba(255,255,255,0.06)",
                    color: tier.highlight ? C.bg : "rgba(255,255,255,0.7)",
                    border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.10)",
                    boxShadow: tier.highlight ? `0 4px 30px rgba(212,168,83,0.3)` : "none",
                  }}>
                  {data.cta}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Annual discount note */}
      <p className="text-center mt-8 text-[13px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
        Annual prepay saves 12% on any business tier. <Link to="/contact" className="underline" style={{ color: C.gold }}>Talk to us</Link>.
      </p>
    </section>

    {/* ═══ DIVIDER ═══ */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
    </div>

    {/* ═══ FAMILY + OUTCOME — Side by side ═══ */}
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Family */}
        <motion.div {...fade} className="rounded-2xl p-8" style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(74,165,168,0.15)",
        }}>
          <span className="text-[9px] tracking-[3px] uppercase px-3 py-1 rounded-full mb-5 inline-block" style={{
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            background: `${C.pounamuGlow}12`, color: C.pounamuGlow, border: `1px solid ${C.pounamuGlow}20`,
          }}>Whānau</span>
          <h3 className="text-[20px] mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", color: C.white }}>
            Family
          </h3>
          <div className="mb-4">
            <span className="text-[28px]" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.white }}>$29</span>
            <span className="text-[14px] ml-1" style={{ color: "#6B7280" }}>/mo</span>
          </div>
          <p className="text-[13px] leading-[1.8] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
            SMS-first AI for NZ whānau. No app, no login — just text. School runs, meal planning, family admin.
          </p>
          <ul className="space-y-2 mb-6">
            {PRICING.family.features.slice(0, 4).map(f => (
              <li key={f} className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7280" }}>
                <Check size={12} style={{ color: C.pounamuGlow }} />{f}
              </li>
            ))}
          </ul>
          <Link to="/toroa" className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", color: C.pounamuGlow }}>
            Join the waitlist <ArrowRight size={12} />
          </Link>
        </motion.div>

        {/* Outcome */}
        <motion.div {...fade} className="rounded-2xl p-8" style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(74,165,168,0.15)",
        }}>
          <span className="text-[9px] tracking-[3px] uppercase px-3 py-1 rounded-full mb-5 inline-block" style={{
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            background: `${C.gold}12`, color: C.gold, border: `1px solid ${C.gold}20`,
          }}>Bespoke</span>
          <h3 className="text-[20px] mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", color: C.white }}>
            Outcome
          </h3>
          <div className="mb-4">
            <span className="text-[22px]" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: C.white }}>From $5,000</span>
            <span className="text-[14px] ml-1" style={{ color: "#6B7280" }}>/mo</span>
          </div>
          <p className="text-[13px] leading-[1.8] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
            Bespoke engagements where Assembl takes on the result. Base fee + 10–20% of measured savings.
          </p>
          <ul className="space-y-2 mb-6">
            {PRICING.outcome.features.slice(0, 4).map(f => (
              <li key={f} className="flex items-center gap-2 text-[12px]" style={{ color: "#6B7280" }}>
                <Check size={12} style={{ color: C.gold }} />{f}
              </li>
            ))}
          </ul>
          <Link to="/contact" className="inline-flex items-center gap-2 text-[12px] tracking-[2px] uppercase" style={{ fontFamily: "'Lato', sans-serif", color: C.gold }}>
            Contact sales <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ═══ DIVIDER ═══ */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
    </div>

    {/* ═══ COMPARISON TABLE ═══ */}
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fade} className="text-center mb-12">
          <p className="text-[10px] tracking-[5px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold, fontWeight: 700 }}>
            — Compare —
          </p>
          <h2 className="text-xl sm:text-[32px] mb-4" style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "5px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.92)",
          }}>Feature comparison</h2>
        </motion.div>

        <div className="rounded-2xl overflow-hidden" style={{
          background: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(74,165,168,0.15)",
        }}>
          {/* Header */}
          <div className="grid grid-cols-5 gap-0 px-6 py-4" style={{ borderBottom: "1px solid rgba(74,165,168,0.1)" }}>
            <div className="col-span-1" />
            {["Operator", "Leader", "Enterprise", "Outcome"].map((name) => (
              <div key={name} className="text-center">
                <p className="text-[11px] tracking-[2px] uppercase" style={{
                  fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#4AA5A8",
                }}>{name}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARISON_FEATURES.map((row, i) => (
            <div key={row.feature} className="grid grid-cols-5 gap-0 px-6 py-3 items-center" style={{
              borderBottom: i < COMPARISON_FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}>
              <div className="col-span-1 pr-4">
                <p className="text-[12px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#9CA3AF" }}>
                  {row.feature}
                </p>
              </div>
              {(["operator", "leader", "enterprise", "outcome"] as const).map((tier) => {
                const val = row[tier];
                return (
                  <div key={tier} className="text-center">
                    {val === true ? (
                      <Check size={14} className="mx-auto" style={{ color: C.pounamuGlow }} />
                    ) : val === false ? (
                      <X size={14} className="mx-auto" style={{ color: "#D1D5DB" }} />
                    ) : (
                      <span className="text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6B7280" }}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ DIVIDER ═══ */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
    </div>

    {/* ═══ ADD-ONS ═══ */}
    <section className="px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fade} className="text-center mb-10">
          <p className="text-[10px] tracking-[5px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.pounamuGlow, fontWeight: 700 }}>
            — Add-ons —
          </p>
          <h2 className="text-xl sm:text-[28px]" style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.9)",
          }}>Scale as you grow</h2>
        </motion.div>

        <div className="space-y-3">
          {ADD_ONS.map((addon) => (
            <div key={addon.name} className="flex items-center justify-between p-5 rounded-xl" style={{
              background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)",
            }}>
              <div>
                <p className="text-[14px] mb-0.5" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.8)" }}>
                  {addon.name}
                </p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
                  Available: {addon.available}
                </p>
              </div>
              <span className="text-[13px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold }}>
                {addon.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ DIVIDER ═══ */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
    </div>

    {/* ═══ INDUSTRY KETE — Simple reference ═══ */}
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fade} className="text-center mb-10">
          <p className="text-[10px] tracking-[5px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: C.gold, fontWeight: 700 }}>
            — Industry kete —
          </p>
          <h2 className="text-xl sm:text-[28px] mb-3" style={{
            fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "4px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.9)",
          }}>Five locked industries</h2>
          <p className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
            Pick 1, 2, or all 5 depending on your plan
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {KETE.map((k) => (
            <div key={k.key} className="rounded-xl p-5 text-center" style={{
              background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)",
            }}>
              <p className="text-[14px] mb-1" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>
                {k.name}
              </p>
              <p className="text-[11px]" style={{ color: "#6B7280" }}>{k.eng}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══ FAQ ═══ */}
    <div className="max-w-4xl mx-auto px-6">
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
    </div>
    <div id="faq">
      <FAQSectionShared />
    </div>

    {/* ═══ FINAL CTA ═══ */}
    <section className="px-6 py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212,168,83,0.06) 0%, transparent 60%)`,
      }} />
      <div className="relative z-10 max-w-xl mx-auto">
        <h2 className="text-xl sm:text-[32px] mb-4" style={{
          fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "5px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.92)",
        }}>Ready to start?</h2>
        <p className="text-[15px] leading-[1.8] mb-10" style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280",
        }}>
          Tell us about your business and we'll map your workflows to the right kete.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact" className="group inline-flex items-center justify-center gap-3 px-12 py-4 text-[11px] tracking-[2px] uppercase font-semibold rounded-full transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              color: C.bg, fontFamily: "'Lato', sans-serif",
              boxShadow: `0 4px 30px rgba(212,168,83,0.35)`,
            }}>
            Get started <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
          <Link to="/demos" className="inline-flex items-center justify-center gap-2 px-12 py-4 text-[11px] tracking-[2px] uppercase font-medium rounded-full transition-all duration-300"
            style={{ border: "1px solid rgba(74,165,168,0.15)", color: "#9CA3AF", fontFamily: "'Lato', sans-serif" }}>
            See the demos
          </Link>
        </div>
        <p className="mt-8 text-[12px]" style={{ color: "#9CA3AF" }}>
          Or email <a href="mailto:assembl@assembl.co.nz" className="underline" style={{ color: "#6B7280" }}>assembl@assembl.co.nz</a>
        </p>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default PricingPage;
