import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Palette, ArrowRight, Check, PenTool, Camera, Mic, BarChart3, Calendar, Globe } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

const BG = "#09090F";
const ACCENT = "#F0D078";
const POUNAMU = "#3A7D6E";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const WORKFLOWS = [
  { icon: PenTool, label: "Copy studio", desc: "Brand-voice copy for web, email, social, and print — drafted, checked, and ready for approval." },
  { icon: Camera, label: "Image & video studio", desc: "On-brand visuals generated from briefs. Style guides enforced automatically." },
  { icon: Mic, label: "Podcast & audio", desc: "Episode planning, show notes, transcript summaries — production without the production team." },
  { icon: BarChart3, label: "Campaign analytics", desc: "Cross-platform performance in one view. What worked, what didn't, what to do next." },
  { icon: Calendar, label: "Content calendar", desc: "Plan, draft, review, publish — one calendar across every platform and format." },
  { icon: Globe, label: "Web builder", desc: "Landing pages and microsites drafted from briefs. Copy, layout, and brand voice aligned." },
];

export default function AuahaLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Auaha — Creative & Media | Assembl"
          description="Strategy, content, brand voice, design, campaigns, analytics — one coordinated studio, not six tools and a freelancer. Built for NZ creative teams."
        />
        <BrandNav />

        <main className="flex flex-col items-center px-6 py-24 text-center">
          <LandingKeteHero accentColor="#D4A843" accentLight="#E8C76A" model="palette" size={160} />

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-4 max-w-3xl"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            One coordinated studio, not six tools and a freelancer.
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl mb-4"
            style={{ color: ACCENT }}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Nine specialist agents for NZ creative teams.
          </motion.p>

          <motion.p
            className="text-base sm:text-lg max-w-xl mb-10"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            Strategy, content, brand voice, design, campaigns, lead formation, analytics — coordinated from brief to publish.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <Link
              to="/sample/auaha"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: ACCENT, color: "#09090F" }}
            >
              See the Auaha pack <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book a creative walk-through
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
            From Rautaki to Studio Director — your full creative pipeline.
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
              TE KETE ARONUI — THE BASKET OF HUMAN EXPRESSION
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              {[
                "No autonomous publishing — every piece reviewed before it goes live",
                "Brand voice enforced across every format and channel",
                "Every workflow run ends in a signed evidence pack",
                "Privacy Act 2020 and IPP 3A alignment built in",
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
