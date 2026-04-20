import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Wrench, ShoppingBag, Package, Key, Shield, FileText, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import KeteSwitcherPill from "@/components/kete/KeteSwitcherPill";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import KeteAgentChat from "@/components/kete/KeteAgentChat";
import LiveStatusStrip from "@/components/kete/LiveStatusStrip";
import UseCaseToggle from "@/components/kete/UseCaseToggle";
import KeteUseCaseSection from "@/components/kete/KeteUseCaseSection";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import HeroBackdropNext from "@/components/next/HeroBackdropNext";
import TextUsButton from "@/components/kete/TextUsButton";
import { ARATAKI_USE_CASE } from "@/data/useCases";

const ACCENT = "#4AA5A8";
const ACCENT_LIGHT = "#7BC9CB";
const GLASS = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 10px 40px -10px rgba(74,165,168,0.15), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const VERTICALS = [
  {
    icon: Wrench, title: "Service", route: "/arataki/driver-compliance",
    desc: "Workshop scheduling, WoF/CoF tracking, service history, technician allocation. Every job documented with contemporaneous evidence.",
    persona: "James books 47 services a week across 12 bays. Arataki sequences them, flags overdue WoFs, and generates the compliance pack before the vehicle leaves.",
  },
  {
    icon: ShoppingBag, title: "Sales", route: "/arataki/vehicle-economy",
    desc: "Enquiry capture, test drive scheduling, finance pre-approval, trade-in valuation, delivery checklist. No lead dropped between showroom and desk.",
    persona: "A customer texts about a 2024 RAV4. Arataki captures the lead, checks stock, schedules the test drive, and prepares the finance comparison — before the sales rep sits down.",
  },
  {
    icon: Package, title: "Parts", route: "/arataki/fuel-oracle",
    desc: "Parts ordering, backorder tracking, warranty claims, EPC lookup assistance. Connected to service jobs so the right part arrives before the car does.",
    persona: "A brake pad order triggers automatically when a service job is booked. Arataki checks stock, places the order, and updates the job card — no phone call needed.",
  },
  {
    icon: Key, title: "Loan Fleet",
    desc: "Loan vehicle allocation, return tracking, damage inspection logs, insurance verification. Every movement documented.",
    persona: "When a service job exceeds 4 hours, Arataki allocates a loan car, records the handover, checks insurance, and schedules the return — all governed.",
  },
];

const COMPLIANCE = [
  "Land Transport Act — WoF/CoF expiry and licence compliance enforced",
  "Consumer Guarantees Act — Service warranty obligations tracked",
  "Health & Safety at Work Act 2015 — Workshop safety and hazard logs",
  "Fair Trading Act 1986 — Sales advertising claims verified",
  "Motor Vehicle Sales Act 2003 — Dealer disclosure obligations",
  "Privacy Act 2020 — Customer data handled per NZ privacy principles",
];

export default function AratakiLandingPage() {
  return (
    <LightPageShell>
      <div style={{ minHeight: "100vh" }}>
        <SEO title="Arataki — Automotive Intelligence for NZ Dealerships | assembl" description="Service, sales, parts, loan fleet — four verticals, one governed agent. Built for NZ dealerships like Hamilton Toyota." />
        <BrandNav />
        <KeteSwitcherPill activeKete="arataki" />

        {/* Hero */}
        <HeroBackdropNext variant="layered" accentTint={`${ACCENT}10`}>
        <main className="relative flex flex-col items-center px-6 pt-24 pb-32 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}08 0%, transparent 70%)`,
          }} />

          <LandingKeteHero accentColor={ACCENT} accentLight={ACCENT_LIGHT} model="car" size={200} />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="text-[11px] tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: ACCENT }}>
            ARATAKI / Automotive
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-6xl font-light tracking-tight mb-6" style={{ fontFamily: "'Lato', sans-serif", color: "#1A1D29" }}>
            Four verticals.<br />One dealership brain.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[17px] max-w-2xl mb-4 leading-[1.75]" style={{ color: "#6B7280" }}>
            Service, sales, parts, and loan fleet — governed by one intelligence layer trained on NZ
            automotive legislation. Built for dealerships like Hamilton Toyota.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-[13px] mb-10" style={{ color: "#9CA3AF", fontStyle: "italic" }}>
            "James runs service at a Hamilton Toyota dealership. 47 jobs a week, 12 bays, zero dropped handoffs."
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4">
            <Link to="/simulator" className="px-8 py-4 rounded-full text-[13px] font-semibold text-white" style={{
              background: `linear-gradient(135deg, ${ACCENT}, #3D8F92)`,
              boxShadow: `0 4px 20px rgba(74,165,168,0.3)`,
            }}>
              See Arataki in action <ArrowRight className="inline ml-1" size={14} />
            </Link>
            <Link to="/contact" className="px-8 py-4 rounded-full text-[13px] font-semibold" style={{
              ...GLASS, color: ACCENT,
            }}>
              Talk to us
            </Link>
          </motion.div>
        </main>
        </HeroBackdropNext>

        {/* ── Persona Context ── */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <div className="rounded-3xl p-8 text-center" style={GLASS}>
            <p className="text-[12px] tracking-[2px] uppercase mb-3" style={{ color: ACCENT, fontFamily: "'JetBrains Mono', monospace" }}>The Arataki Persona</p>
            <p className="text-[17px] leading-[1.75] mb-2" style={{ color: "#1A1D29" }}>
              <strong style={{ fontWeight: 500 }}>James</strong> is a service manager at a Hamilton Toyota dealership.
            </p>
            <p className="text-[15px] leading-[1.75]" style={{ color: "#6B7280" }}>
              He manages 12 service bays, a 6-car loan fleet, parts ordering for 200+ SKUs, and
              coordinates with the sales team on trade-in inspections and new vehicle PDIs. Before
              Assembl, handoffs between service, sales, and parts fell through the cracks daily.
            </p>
          </div>
        </section>

        {/* ── Real Use Case (collapsed by default) ── */}
        <UseCaseToggle accent={ACCENT}>
          <KeteUseCaseSection data={ARATAKI_USE_CASE} />
        </UseCaseToggle>

        {/* Live status strip */}
        <section className="max-w-3xl mx-auto px-6 pb-12 text-center">
          <LiveStatusStrip pack="arataki" agentCodes={["catalyst", "flux", "guardian", "logistics"]} accent={ACCENT} />
        </section>

        {/* ── Four Verticals ── */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[3px] uppercase mb-3" style={{ fontFamily: "'JetBrains Mono', monospace", color: ACCENT }}>
              Four Dealership Verticals
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-light tracking-[-0.02em]" style={{ color: "#1A1D29" }}>
              Every department. One governed layer.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {VERTICALS.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                {v.route ? (
                  <Link to={v.route} className="block rounded-3xl p-8 h-full group transition-all hover:scale-[1.01]" style={GLASS}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                        <v.icon size={20} style={{ color: ACCENT }} />
                      </div>
                      <h3 className="text-[18px] font-medium flex items-center gap-2" style={{ color: "#1A1D29" }}>
                        {v.title} <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                      </h3>
                    </div>
                    <p className="text-[14px] leading-[1.7] mb-4" style={{ color: "#6B7280" }}>{v.desc}</p>
                    <p className="text-[13px] leading-[1.7] italic" style={{ color: "#9CA3AF" }}>{v.persona}</p>
                  </Link>
                ) : (
                  <div className="rounded-3xl p-8 h-full" style={GLASS}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}12` }}>
                        <v.icon size={20} style={{ color: ACCENT }} />
                      </div>
                      <h3 className="text-[18px] font-medium" style={{ color: "#1A1D29" }}>{v.title}</h3>
                    </div>
                    <p className="text-[14px] leading-[1.7] mb-4" style={{ color: "#6B7280" }}>{v.desc}</p>
                    <p className="text-[13px] leading-[1.7] italic" style={{ color: "#9CA3AF" }}>{v.persona}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Compliance — single line ── */}
        <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <p className="text-xs" style={{ color: "#5B6374", letterSpacing: "0.02em" }}>
            <span style={{ color: ACCENT, fontWeight: 500 }}>Governed by</span> Land Transport Act, Consumer Guarantees Act, HSWA 2015, Fair Trading Act 1986, Motor Vehicle Sales Act 2003, Privacy Act 2020.
          </p>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
          <div className="rounded-3xl p-10" style={GLASS}>
            <h3 className="text-[22px] font-light mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#1A1D29" }}>Try a scenario</h3>
            <p className="text-[15px] mb-6" style={{ color: "#6B7280" }}>
              Run a realistic dealership scenario and see every step — service booking, parts order, loan car, compliance pack.
            </p>
            <Link to="/simulator" className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-semibold text-white" style={{
              background: `linear-gradient(135deg, ${ACCENT}, #3D8F92)`,
              boxShadow: `0 4px 20px rgba(74,165,168,0.3)`,
            }}>
              Run Arataki scenario <ArrowRight size={14} />
            </Link>
            <div className="mt-6">
              <TextUsButton keteName="Arataki" accentColor={ACCENT} showWhatsApp={true} />
            </div>
          </div>
        </section>

        
        <BrandFooter />
        <KeteAgentChat keteName="Arataki" keteLabel="Automotive" accentColor="#4AA5A8"
          defaultAgentId="motor" packId="arataki"
          starterPrompts={[
            "How does Arataki handle service scheduling?",
            "Walk me through a vehicle sale workflow",
            "How do parts orders connect to service jobs?",
            "What compliance packs does a dealership get?",
          ]}
        />
      </div>
    </LightPageShell>
  );
}
