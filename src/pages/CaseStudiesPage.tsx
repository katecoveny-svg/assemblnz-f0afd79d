import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import LightPageShell from "@/components/LightPageShell";
import HeroParticlesLight from "@/components/HeroParticlesLight";

const POUNAMU = "#3A7D6E";
const POUNAMU_LIGHT = "#7ECFC2";
const GOLD = "#4AA5A8";
const BONE = "#F5F0E8";

const CASES = [
  {
    kete: "Manaaki",
    business: "Boutique lodge, Queenstown",
    meeting: "Council compliance review",
    packTitle: "Food safety & liquor licensing pack",
    color: "#3A7D6E",
    quote: "The inspector read the pack in 10 minutes. Usually that visit takes an hour.",
  },
  {
    kete: "Waihanga",
    business: "Civil contractor, Waikato",
    meeting: "Principal's H&S audit",
    packTitle: "Site safety & contract compliance pack",
    color: "#1A3A5C",
    quote: "We handed the pack to the principal's safety officer. First time we didn't get a corrective action.",
  },
  {
    kete: "Arataki",
    business: "SaaS company, Wellington",
    meeting: "Board privacy review",
    packTitle: "IPP3A privacy compliance pack",
    color: "#E8E8E8",
    quote: "Our Privacy Officer signed the pack and sent it straight to the commissioner's office.",
  },
  {
    kete: "Auaha",
    business: "Creative agency, Auckland",
    meeting: "Funder acquittal",
    packTitle: "Rights, releases & commercial pack",
    color: "#4AA5A8",
    quote: "The funder said it was the cleanest acquittal pack they'd received all year.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function CaseStudiesPage() {
  return (
    <LightPageShell>
      <div className="min-h-screen" style={{ background: "transparent", color: "#3D4250" }}>
        <SEO
          title="Case Studies — The packs our customers took to their boards | Assembl"
          description="Real evidence packs from real NZ businesses. See what assembl produces for hospitality, construction, privacy, and creative teams."
        />
        <BrandNav />

        <main className="relative max-w-5xl mx-auto px-6 py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 20%, ${POUNAMU}08 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 50%, ${GOLD}05 0%, transparent 60%)`,
          }} />

          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{
              width: 3 + i, height: 3 + i, background: i % 2 === 0 ? POUNAMU : GOLD,
              left: `${15 + i * 20}%`, top: `${10 + (i % 3) * 15}%`, opacity: 0.1,
            }} animate={{ y: [0, -12, 0], opacity: [0.06, 0.15, 0.06] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
          ))}

          <motion.div className="text-center mb-16 relative z-10" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <p className="text-[10px] uppercase tracking-[5px] mb-4" style={{ color: POUNAMU_LIGHT, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              CASE STUDIES
            </p>
            <h1 className="text-3xl sm:text-5xl mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "-0.5px" }}>
              The packs our customers took to their{" "}
              <span style={{ background: `linear-gradient(135deg, #3D4250, ${POUNAMU_LIGHT}, ${BONE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto" }}>
                boards.
              </span>
            </h1>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Every pack tagged with the meeting it went into. Real outputs, real businesses, real outcomes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            {CASES.map((c, i) => (
              <motion.div key={c.kete} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5 + 1}>
                <div className="group relative p-8 h-full rounded-2xl overflow-hidden transition-all duration-400 hover:translate-y-[-3px]" style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${c.color}05`,
                }}>
                  <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `linear-gradient(90deg, transparent, ${c.color}50, transparent)`,
                  }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15`, boxShadow: `0 0 12px ${c.color}10` }}>
                      <FileText size={16} style={{ color: c.color }} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[3px]" style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                      {c.kete} pack
                    </span>
                  </div>
                  <h3 className="text-base mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
                    {c.packTitle}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {c.business} · {c.meeting}
                  </p>
                  <blockquote className="text-sm italic mt-4 pt-4" style={{ color: "#9CA3AF", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    "{c.quote}"
                  </blockquote>
                  <Link to={`/sample/${c.kete.toLowerCase()}`} className="inline-flex items-center gap-1 mt-4 text-xs group/link" style={{ color: c.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Read the pack story <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        <BrandFooter />
      </div>
    </LightPageShell>
  );
}
