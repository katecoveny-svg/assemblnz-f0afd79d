import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UtensilsCrossed, ArrowRight, Check, Shield, Wine, Star, Leaf, Calendar } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

const BG = "#09090F";
const ACCENT = "#D4A843";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const WORKFLOWS = [
  { icon: Shield, label: "Food safety compliance", desc: "HACCP plans, temperature logs, supplier audits — documented and ready for inspection." },
  { icon: Wine, label: "Alcohol licensing support", desc: "DLC applications, manager certificates, duty manager rosters — compliance without the filing cabinet." },
  { icon: Star, label: "Guest experience intelligence", desc: "Review sentiment, VIP profiles, occasion tracking — every guest remembered, every stay personal." },
  { icon: Calendar, label: "Events & functions coordination", desc: "BEOs, dietary matrices, venue setup — events run without the last-minute scramble." },
  { icon: Leaf, label: "Sustainability & eco tracking", desc: "Waste audits, carbon reporting, Qualmark prep — your green story backed by evidence." },
  { icon: UtensilsCrossed, label: "Kitchen & menu intelligence", desc: "Costing, allergen matrices, seasonal menus — margin visibility without the spreadsheet maze." },
];

export default function ManaakiLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Manaaki — Hospitality & Tourism | Assembl"
          description="Food safety, alcohol licensing, guest experience, sustainability — hospitality compliance without the paperwork pile-up. Built for NZ operators."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <UtensilsCrossed size={36} style={{ color: ACCENT }} />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-4 max-w-3xl"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl mb-4"
            style={{ color: ACCENT }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Specialist tools for NZ hospitality operators.
          </motion.p>

          <motion.p
            className="text-base sm:text-lg max-w-xl mb-10"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            Food safety plans, alcohol licensing, guest profiles, sustainability reporting, and event coordination — handled, checked, and evidence-packed.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <Link
              to="/sample/manaaki"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: ACCENT, color: "#09090F" }}
            >
              See the Manaaki pack <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book a hospitality walk-through
            </Link>
          </motion.div>
        </main>

        {/* Workflows */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: "'Lato', sans-serif" }}
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          >
            Nine specialist agents. One operations hub.
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOWS.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <LiquidGlassCard className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                      <w.icon size={20} style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-sm font-semibold text-white/90">{w.label}</h3>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{w.desc}</p>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value prop */}
        <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <div className="rounded-2xl p-8" style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}>
            <p className="text-[10px] font-semibold tracking-[4px] uppercase mb-4" style={{ color: ACCENT }}>
              TE KETE ARONUI — THE BASKET OF LOVE AND CARE FOR PEOPLE
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              {[
                "Every workflow run ends in a signed evidence pack",
                "Privacy Act 2020 and IPP 3A alignment built in",
                "NZ data residency available on Enterprise",
                "No autonomous publishing — your team stays in control",
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Check size={14} style={{ color: ACCENT }} className="shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <BrandFooter />
      </div>
    </GlowPageWrapper>
  );
}
