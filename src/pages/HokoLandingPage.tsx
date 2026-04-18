import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Shield, ShoppingBag, TrendingDown, Package,
  Users, Megaphone, ShieldCheck, BarChart3, Sparkles, Zap,
} from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import TextUsButton from "@/components/kete/TextUsButton";
import HokoPriceScannerDemo from "@/components/hoko/HokoPriceScannerDemo";
import HokoWorkflowExplorer from "@/components/hoko/HokoWorkflowExplorer";

const ACCENT = "#C66B5C";
const ACCENT_LIGHT = "#E89484";
const POUNAMU = "#3A7D6E";
const BG = "#FAFBFC";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Live roster — verified against agent_prompts (pack='HOKO', is_active=true).
// 4 retail-specific specialists. Cross-cutting agents (MANA evidence pack, NOVA
// debtor watch) are shared across the platform and orchestrate with these four.
const AGENTS = [
  { code: "PRISM · Retail", role: "Competitor pricing intelligence (Temu, Amazon AU, PriceSpy)", icon: TrendingDown },
  { code: "FLUX · Retail", role: "POS-driven inventory & re-order recommendations", icon: Package },
  { code: "NOVA · Retail", role: "Multi-channel product copy & launch publisher", icon: Megaphone },
  { code: "ANCHOR · Retail", role: "FTA/CGA pre-publish compliance lint", icon: ShieldCheck },
];

const COMPLIANCE = [
  "Fair Trading Act 1986 — every claim audited pre-publish",
  "Consumer Guarantees Act 1993 — guarantee responses standardised",
  "Privacy Act 2020 · IPP 3A — loyalty data governed",
  "Commerce Commission Grocery Code — supplier terms tracked",
];

const WORKFLOWS = [
  {
    title: "Competitor Price Scanner",
    sub: "PRISM → LEDGER → NOVA → AURA",
    desc: "Daily scan of Temu, Amazon AU, PriceSpy + 5 local competitors. Honest gap analysis (freight + GST factored). Defensive bundle suggestions for high-value SKUs.",
    icon: TrendingDown,
    flagship: true,
  },
  {
    title: "Auto Re-Order Recommender",
    sub: "FLUX → LEDGER → APEX → AURA",
    desc: "12-month POS velocity + seasonality + supplier lead times → Monday morning re-order list grouped by supplier, one-tap-to-approve.",
    icon: Package,
  },
  {
    title: "Unified Customer View",
    sub: "PRISM → AURA → NOVA",
    desc: "POS + MailChimp + loyalty + Instagram DMs unified. Birthday, restock, lapsed, first-buyer triggers. Outreach drafted in your tone of voice.",
    icon: Users,
  },
  {
    title: "Multi-Channel Product Publisher",
    sub: "NOVA → SOCIAL → AURA → PRISM",
    desc: "One product input → website (SEO), Instagram reel, Facebook, Google Business, email, TikTok. Scheduled at optimal times. Engagement fed back.",
    icon: Megaphone,
  },
  {
    title: "FTA/CGA Compliance Lint",
    sub: "ANCHOR → APEX → MANA",
    desc: "Pre-publish review of every price tag, ad, and product claim. \"Was/now\" pricing 28-day check. Urgency claims verified. Approved version written to immutable audit.",
    icon: ShieldCheck,
  },
  {
    title: "True Contribution Margin",
    sub: "LEDGER → AXIS → FLUX",
    desc: "SKU-level gross margin + allocated overhead (shelf rent, staff time, shrinkage) → contribution ranking. Top 20, bottom 50, hidden losers exposed.",
    icon: BarChart3,
  },
];

export default function HokoLandingPage() {
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO
          title="Hoko — Retail | assembl"
          description="Pricing intelligence vs Temu/Amazon, POS-driven re-orders, FTA/CGA compliance lint, unified customer view. Built for NZ retail's $92.3bn frontline."
        />
        <BrandNav />

        {/* ── Hero ── */}
        <main className="relative flex flex-col items-center px-6 pt-16 pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}10 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 30% 60%, ${POUNAMU}06 0%, transparent 60%)`,
          }} />

          <LandingKeteHero accentColor={ACCENT} accentLight={`${ACCENT}40`} />

          {/* Sector context strip */}
          <motion.div
            className="relative z-10 mt-10 max-w-4xl w-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { stat: "$92.3bn", label: "Annual NZ retail revenue" },
                { stat: "10%", label: "Of all NZ jobs" },
                { stat: "20%+", label: "Annual import growth (Temu/Amazon)" },
                { stat: "3,744", label: "Grocery & convenience businesses" },
              ].map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 text-left"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${ACCENT}20`,
                  }}
                >
                  <div className="text-2xl font-light" style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}>
                    {m.stat}
                  </div>
                  <div className="text-[11px] tracking-wider mt-1" style={{ color: "#6B7280" }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-8 flex gap-3 flex-wrap justify-center relative z-10">
            <TextUsButton keteName="HOKO" accentColor={ACCENT} />
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light transition-all hover:gap-3"
              style={{
                background: ACCENT,
                color: "white",
                boxShadow: `0 8px 24px ${ACCENT}40`,
              }}
            >
              Join the HOKO pilot <ArrowRight size={14} />
            </Link>
          </div>
        </main>

        {/* ── Flagship demo: Price Scanner ── */}
        <section className="px-6 py-20" style={{ background: "rgba(198,107,92,0.03)" }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                FLAGSHIP WORKFLOW · LIVE DEMO
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                Competitor Price Scanner
              </h2>
              <p className="mt-3 text-sm" style={{ color: "#6B7280" }}>
                PRISM → LEDGER → NOVA → AURA · See your top SKUs vs Temu, Amazon AU and local competitors — daily.
              </p>
            </motion.div>

            <HokoPriceScannerDemo accent={ACCENT} accentLight={ACCENT_LIGHT} />
          </div>
        </section>

        {/* ── All 6 workflows (overview cards) ── */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                THE SIX HOKO WORKFLOWS
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                What ships with the kete
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
              {WORKFLOWS.map((w, i) => {
                const Icon = w.icon;
                return (
                  <motion.div
                    key={w.title}
                    custom={i}
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                    className="rounded-2xl p-6 relative"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      backdropFilter: "blur(20px)",
                      border: w.flagship ? `1.5px solid ${ACCENT}50` : "1px solid rgba(0,0,0,0.05)",
                      boxShadow: w.flagship ? `0 12px 40px ${ACCENT}20` : "0 4px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    {w.flagship && (
                      <span className="absolute top-3 right-3 text-[9px] tracking-[2px] uppercase px-2 py-0.5 rounded-full"
                        style={{ background: ACCENT, color: "white", fontFamily: "'JetBrains Mono', monospace" }}>
                        Flagship
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${ACCENT}15`, border: `1px solid ${ACCENT}25` }}>
                      <Icon size={18} style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-base font-medium mb-1" style={{ color: "#3D4250" }}>{w.title}</h3>
                    <p className="text-[10px] tracking-wider uppercase mb-3" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                      {w.sub}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{w.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Interactive explorer for the other 5 workflows */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="mb-6"
            >
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>
                EXPLORE THE PIPELINE · CLICK A WORKFLOW
              </p>
              <h3 className="text-2xl md:text-3xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                What an evidence-pack output looks like
              </h3>
              <p className="mt-2 text-sm max-w-2xl" style={{ color: "#6B7280" }}>
                Each workflow ends in a signed receipt — the trigger, the source data, the agents that touched it, and the output you can ship. Same governance posture across all five.
              </p>
            </motion.div>
            <HokoWorkflowExplorer accent={ACCENT} />
          </div>
        </section>

        {/* ── Agents ── */}
        <section className="px-6 py-20" style={{ background: "rgba(58,125,110,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[11px] tracking-[4px] uppercase mb-2" style={{ color: POUNAMU, fontFamily: "'JetBrains Mono', monospace" }}>
                YOUR HOKO TEAM
              </p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight" style={{ color: "#3D4250", fontFamily: "'Lato', sans-serif" }}>
                4 retail specialists · live
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {AGENTS.map((agent, i) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.code}
                    onMouseEnter={() => setHoveredAgent(i)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    className="rounded-xl p-4 text-center cursor-default transition-all"
                    style={{
                      background: hoveredAgent === i ? `${ACCENT}10` : "rgba(255,255,255,0.65)",
                      border: hoveredAgent === i ? `1px solid ${ACCENT}40` : "1px solid rgba(0,0,0,0.05)",
                      transform: hoveredAgent === i ? "translateY(-2px)" : "none",
                    }}
                  >
                    <Icon size={18} style={{ color: ACCENT, margin: "0 auto 8px" }} />
                    <div className="text-xs font-medium" style={{ color: "#3D4250", fontFamily: "'JetBrains Mono', monospace" }}>
                      {agent.code}
                    </div>
                    <div className="text-[10px] mt-1 leading-snug" style={{ color: "#6B7280" }}>
                      {agent.role}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Compliance strip ── */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto rounded-3xl p-10"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${POUNAMU}20`,
            }}>
            <div className="text-center mb-6">
              <Sparkles size={20} style={{ color: POUNAMU, margin: "0 auto 8px" }} />
              <h3 className="text-xl font-light" style={{ color: "#3D4250" }}>
                Every output evidence-pack ready
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {COMPLIANCE.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "#3D4250" }}>
                  <Check size={14} style={{ color: POUNAMU, marginTop: 3, flexShrink: 0 }} />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chat ── */}
        <section className="px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <KeteAgentChat
              keteName="HOKO"
              keteLabel="Retail"
              accentColor={ACCENT}
              defaultAgentId="prism-hoko"
              packId="hoko"
              starterPrompts={[
                "Scan my top 20 SKUs against Temu and Amazon AU",
                "Draft a defensive bundle for items I'm 30% more expensive on",
                "Show me which SKUs need a price correction this week",
              ]}
            />
          </div>
        </section>

        <BrandFooter />
      </div>
    </LightPageShell>
  );
}
