import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";
import LiquidGlassCard from "@/components/LiquidGlassCard";

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
    color: "#D4A843",
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
    <GlowPageWrapper accentColor="#3A7D6E">
      <div className="min-h-screen" style={{ background: "#09090F", color: "#fff" }}>
        <SEO
          title="Case Studies — The packs our customers took to their boards | Assembl"
          description="Real evidence packs from real NZ businesses. See what assembl produces for hospitality, construction, privacy, and creative teams."
        />
        <BrandNav />

        <main className="max-w-5xl mx-auto px-6 py-24">
          <motion.div className="text-center mb-16" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <p className="text-[10px] uppercase tracking-[5px] mb-4" style={{ color: "#5AADA0", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              CASE STUDIES
            </p>
            <h1 className="text-3xl sm:text-5xl mb-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, letterSpacing: "-0.5px" }}>
              The packs our customers took to their boards.
            </h1>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Every pack tagged with the meeting it went into. Real outputs, real businesses, real outcomes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CASES.map((c, i) => (
              <motion.div key={c.kete} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5 + 1}>
                <LiquidGlassCard className="p-8 h-full" accentColor={c.color} delay={i * 0.1}>
                  <div className="flex items-center gap-3 mb-4">
                    <FileText size={18} style={{ color: c.color }} />
                    <span className="text-[10px] uppercase tracking-[3px]" style={{ color: c.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                      {c.kete} pack
                    </span>
                  </div>
                  <h3 className="text-base mb-2" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400 }}>
                    {c.packTitle}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {c.business} · {c.meeting}
                  </p>
                  <blockquote className="text-sm italic mt-4 pt-4" style={{ color: "rgba(255,255,255,0.6)", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    "{c.quote}"
                  </blockquote>
                  <Link to={`/sample/${c.kete.toLowerCase()}`} className="inline-flex items-center gap-1 mt-4 text-xs" style={{ color: c.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Read the pack story <ArrowRight size={11} />
                  </Link>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </div>
        </main>

        <BrandFooter />
      </div>
    </GlowPageWrapper>
  );
}
