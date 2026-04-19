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
const GOLD = "#D4A843";


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
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="group relative px-8 py-3.5 rounded-full text-sm font-body font-medium overflow-hidden">
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${POUNAMU}, #2D6A5E)` }} />
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 30px ${POUNAMU}40` }} />
              <span className="relative z-10 text-foreground">Meet the team</span>
            </Link>
            <Link to="/about#founder" className="group px-8 py-3.5 rounded-full text-sm font-body font-medium transition-all duration-300" style={{ border: "1px solid rgba(74,165,168,0.15)", color: "#6B7280", background: "rgba(255,255,255,0.5)" }}>
              <span className="group-hover:text-white/80 transition-colors">Read the founder note</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Vision */}
      <section className="relative z-10 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-mono-jb uppercase tracking-[3px]" style={{ color: POUNAMU }}>Our Vision</span>
              <h2 className="text-2xl sm:text-3xl font-display mt-2 mb-4" style={{ fontWeight: 300, color: "#3D4250" }}>
                Built for{" "}
                <span style={{ background: `linear-gradient(135deg, #3D4250, ${POUNAMU})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aotearoa</span>
              </h2>
              <p className="text-sm font-body leading-relaxed mb-4" style={{ color: "#4B5563" }}>
                Most business tools are trained on US data, US laws, and US business practices. They don't know what PAYE is. They've never heard of the Building Act. They can't calculate KiwiSaver contributions.
              </p>
              <p className="text-sm font-body leading-relaxed" style={{ color: "#4B5563" }}>
                Assembl changes that. Every kete is grounded in NZ legislation and policy workflows — the specific regulations, standards, and cultural context that NZ businesses operate within.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { mark: "I", title: "Purpose-built", desc: "Not adapted — built from the ground up for Aotearoa" },
                { mark: "II", title: "Legislation-first", desc: "Grounded in NZ legislation and policy workflows" },
                { mark: "III", title: "SME-focused", desc: "Priced for the 620K businesses that need it most" },
                { mark: "IV", title: "Always on", desc: "Twenty-four-hour specialist support that never takes leave" },
              ].map((item) => (
                <motion.div key={item.title} className="group relative rounded-xl p-5 overflow-hidden transition-all duration-400 hover:-translate-y-0.5" style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(58,125,110,0.15)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                }} whileHover={{ boxShadow: `0 10px 32px rgba(58,125,110,0.12)` }}>
                  <div className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${POUNAMU}50, transparent)` }} />
                  <p className="text-[11px] font-mono-jb mb-3 tracking-[2px]" style={{ color: GOLD }}>{item.mark}</p>
                  <p className="text-sm font-display mb-1" style={{ fontWeight: 400, color: "#3D4250" }}>{item.title}</p>
                  <p className="text-[11px] font-body leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
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
      <section id="founder" className="relative z-10 py-20 border-t border-border">
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${GOLD}08 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 30% 40%, ${POUNAMU}05 0%, transparent 50%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            className="relative rounded-2xl overflow-hidden p-8 sm:p-10"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(74,165,168,0.15)",
              boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 80px ${GOLD}05, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, ${POUNAMU}30, transparent)` }} />

            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Photo */}
              <motion.div className="shrink-0"
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <div className="relative">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden relative"
                    style={{
                      border: `2px solid ${GOLD}30`,
                      boxShadow: `0 0 40px ${GOLD}15, 0 0 80px ${POUNAMU}08`,
                      background: `linear-gradient(135deg, ${GOLD}10, ${POUNAMU}10)`,
                    }}>
                    <img src="/img/kate-neon.png" alt="Kate, Founder of Assembl" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  {/* Status dot */}
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                    background: "rgba(14,14,26,0.9)",
                    border: `1px solid ${POUNAMU}30`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                  }}>
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: POUNAMU }}
                      animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[9px] font-mono" style={{ color: POUNAMU }}>Building</span>
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-[10px] font-bold tracking-[4px] uppercase mb-3" style={{ color: GOLD, fontFamily: "'JetBrains Mono', monospace" }}>
                  FOUNDER
                </p>
                <h2 className="text-2xl sm:text-3xl font-display text-foreground mb-4" style={{ fontWeight: 300 }}>
                  Built by{" "}
                  <span style={{ background: `linear-gradient(135deg, #3D4250, ${GOLD})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kate</span>
                </h2>
                <blockquote className="text-sm font-body text-muted-foreground leading-relaxed mb-6 relative">
                  <span className="absolute -left-3 top-0 text-2xl" style={{ color: `${GOLD}30`, fontFamily: "Georgia, serif" }}>"</span>
                  I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work. Every kete is grounded in real NZ legislation — not generic overseas advice. My goal is to give every Kiwi business access to specialist operational support at a price they can afford.
                </blockquote>
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <div>
                    <p className="text-sm font-display text-foreground" style={{ fontWeight: 400 }}>Kate</p>
                    <p className="text-[11px] font-body text-muted-foreground">Founder & CEO · Auckland, New Zealand</p>
                  </div>
                  <Link to="/contact" className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-body font-medium overflow-hidden sm:ml-auto">
                    <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD}DD)` }} />
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `0 0 20px ${GOLD}40` }} />
                    <span className="relative z-10" style={{ color: "#09090F" }}>Get in touch</span>
                    <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" style={{ color: "#09090F" }} />
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
