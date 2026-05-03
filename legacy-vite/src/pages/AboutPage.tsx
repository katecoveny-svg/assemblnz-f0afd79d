import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const BONE = "#F5F0E8";
const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const GOLD = "#4AA5A8";


const MARKET_STATS = [
  { value: "$4.2B", label: "NZ SaaS Market by 2027" },
  { value: "620K", label: "NZ SMEs" },
  { value: "73%", label: "Want specialist tools but lack resources" },
  { value: "6+", label: "Avg. platforms per business" },
];

const AboutPage = () => {
  return (
    <LightPageShell>
    <div className="min-h-screen flex flex-col">
      <SEO title="About assembl — Operational intelligence for Aotearoa" description="We build the operational intelligence New Zealand businesses need to run smarter. Every workflow ends in a pack you can file, forward, or footnote." path="/about" />
      <BrandNav />

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${POUNAMU}10 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 70% 50%, ${GOLD}06 0%, transparent 60%)`,
        }} />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
            width: 3 + i, height: 3 + i, background: i % 2 === 0 ? POUNAMU : GOLD,
            left: `${20 + i * 15}%`, top: `${25 + (i % 3) * 20}%`, opacity: 0.12,
          }} animate={{ y: [0, -15, 0], opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-display text-foreground mb-4" style={{ fontWeight: 300 }}>
            Operational intelligence for the businesses that{" "}
            <span style={{ background: `linear-gradient(135deg, #3D4250, ${POUNAMU_LIGHT}, ${BONE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto" }}>
              build Aotearoa.
            </span>
          </h1>
          <p className="text-sm sm:text-base font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            A New Zealand company. Six industry kete plus Tōro for whānau, one compliance pipeline, every output signed and sourced.
          </p>
        </motion.div>
      </section>

      {/* Market */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${POUNAMU}06 0%, transparent 60%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-display text-center text-foreground mb-10" style={{ fontWeight: 300 }}>
            The{" "}
            <span style={{ background: `linear-gradient(135deg, #3D4250, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>market</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MARKET_STATS.map((s) => (
              <motion.div key={s.label} className="group relative text-center rounded-xl p-5 overflow-hidden transition-all duration-400 hover:translate-y-[-2px]" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                border: "1px solid rgba(74,165,168,0.15)",
              }} whileHover={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${GOLD}06` }}>
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />
                <p className="text-2xl sm:text-3xl font-display mb-1" style={{ fontWeight: 300, background: `linear-gradient(135deg, #3D4250, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</p>
                <p className="text-[10px] font-body text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Founder */}
      <section id="founder" className="relative z-10 py-24 border-t border-border">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${GOLD}10 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 30% 40%, ${POUNAMU}08 0%, transparent 50%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-14"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              border: "1px solid rgba(58,125,110,0.14)",
              boxShadow: `0 24px 60px rgba(58,125,110,0.10), 0 8px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)`,
            }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            {/* Decorative top hairline */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, ${POUNAMU}40, transparent)` }} />
            {/* Subtle corner glyphs */}
            <span aria-hidden className="absolute top-5 left-5 text-[10px] font-mono tracking-[3px]" style={{ color: `${GOLD}80` }}>◆</span>
            <span aria-hidden className="absolute top-5 right-5 text-[10px] font-mono tracking-[3px]" style={{ color: `${POUNAMU}80` }}>◆</span>

            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
              {/* Photo — premium framed portrait */}
              <motion.div className="shrink-0 relative"
                initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                {/* Outer halo ring */}
                <div className="absolute -inset-3 rounded-full opacity-60" style={{
                  background: `conic-gradient(from 180deg at 50% 50%, ${GOLD}30, ${POUNAMU}25, ${GOLD}10, ${POUNAMU}30, ${GOLD}30)`,
                  filter: "blur(14px)",
                }} />
                <div className="relative">
                  {/* Portrait container — circular, gallery-grade */}
                  <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden relative"
                    style={{
                      border: `1px solid rgba(255,255,255,0.9)`,
                      boxShadow: `
                        0 0 0 1px ${GOLD}25,
                        0 0 0 6px rgba(255,255,255,0.85),
                        0 0 0 7px ${POUNAMU}20,
                        0 24px 48px rgba(58,125,110,0.18),
                        0 8px 24px rgba(0,0,0,0.08)
                      `,
                      background: `radial-gradient(circle at 30% 25%, ${BONE}, ${GOLD}15 60%, ${POUNAMU}10)`,
                    }}>
                    <img src="/img/kate-neon.png" alt="Aotearoa, Founder of Assembl" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  {/* Small wordmark medallion */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-1.5" style={{
                    background: "rgba(255,255,255,0.95)",
                    border: `1px solid ${GOLD}30`,
                    boxShadow: `0 6px 16px rgba(58,125,110,0.15)`,
                  }}>
                    <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: POUNAMU }}
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.4, repeat: Infinity }} />
                    <span className="text-[9px] font-mono tracking-[2px] uppercase" style={{ color: POUNAMU }}>Building</span>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-[10px] font-mono font-semibold tracking-[5px] uppercase mb-3" style={{ color: GOLD }}>
                  Founder · est. 2025
                </p>
                <h2 className="text-3xl sm:text-4xl font-display mb-2" style={{ fontWeight: 300, color: "#3D4250", letterSpacing: "-0.01em" }}>
                  Built i{" "}
                  <span style={{ background: `linear-gradient(135deg, ${POUNAMU}, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aotearoa&nbsp;</span>
                </h2>
                <p className="text-[11px] font-mono tracking-[2px] uppercase mb-6" style={{ color: "#9CA3AF" }}>
                  Founder & CEO · Tāmaki Makaurau, Aotearoa
                </p>

                {/* Hairline divider */}
                <div className="h-px w-16 mx-auto lg:mx-0 mb-6" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />

                <blockquote className="text-base font-body leading-relaxed mb-8 relative italic" style={{ color: "#3D4250", fontFamily: "'Lora', Georgia, serif" }}>
                  <span aria-hidden className="absolute -left-4 -top-3 text-5xl leading-none select-none" style={{ color: `${GOLD}40`, fontFamily: "Georgia, serif" }}>“</span>
                  I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work. Every kete is grounded in real NZ legislation — not generic overseas advice. My goal is to give every Kiwi business access to specialist operational support at a price they can afford.
                </blockquote>

                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Link to="/contact" className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-body font-medium overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${POUNAMU}, #2D6A5E)` }} />
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 8px 24px ${POUNAMU}40` }} />
                    <span className="relative z-10 text-white">Get in touch</span>
                    <ArrowRight size={14} className="relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/brand-story" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-medium transition-all duration-300" style={{
                    border: `1px solid ${GOLD}40`,
                    color: "#3D4250",
                    background: "rgba(255,255,255,0.6)",
                  }}>
                    <span>Read the manifesto</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <BrandFooter />
    </div>
    </LightPageShell>
  );
};

export default AboutPage;
