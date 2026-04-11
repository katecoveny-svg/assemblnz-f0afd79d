import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Shield, FileText, Lock } from "lucide-react";
import LandingKeteHero from "@/components/kete/LandingKeteHero";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import GlowPageWrapper from "@/components/kete/GlowPageWrapper";

const BG = "#09090F";
const ACCENT = "#7ECFC2";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function PikauLandingPage() {
  return (
    <GlowPageWrapper accentColor={ACCENT}>
      <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
        <SEO
          title="Pikau — Freight & Customs | Assembl"
          description="Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble. Built for NZ importers and logistics teams."
        />
        <BrandNav />

        <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <motion.div
          <LandingKeteHero accentColor="#7ECFC2" accentLight="#A8E6DA" size={160} />

          <motion.h1
            className="text-4xl sm:text-6xl font-bold mb-4 max-w-3xl"
            style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Customs entries, freight quotes, and dangerous goods checks — border compliance without the scramble.
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl mb-4"
            style={{ color: ACCENT }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            AI for NZ importers and logistics teams.
          </motion.p>

          <motion.p
            className="text-base sm:text-lg max-w-xl mb-10"
            style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            HS code validation, incoterm handling, landed cost analysis, and broker hand-off — packed, checked, and ready to clear.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <Link
              to="/sample/pikau"
              className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90"
              style={{ background: ACCENT, color: "#09090F" }}
            >
              See the Pikau pack <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Book a freight walk-through
            </Link>
          </motion.div>
        </main>

        <BrandFooter />
      </div>
    </GlowPageWrapper>
  );
}
