import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const BG = "#09090F";
const GOLD = "#D4A843";
const TEAL = "#3A7D6E";
const ACCENT = "#5A8FBF";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function AratakiLandingPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff" }}>
      <SEO
        title="Arataki — Business Intelligence | Assembl"
        description="Arataki is your AI-powered business intelligence kete. Strategy, insights, and decision-making for NZ businesses."
      />
      <BrandNav />

      <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Briefcase size={36} style={{ color: ACCENT }} />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-6xl font-bold mb-4"
          style={{ fontFamily: "'Lato', sans-serif", letterSpacing: "-1px" }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Arataki
        </motion.h1>

        <motion.p
          className="text-xl sm:text-2xl mb-4"
          style={{ color: ACCENT }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          Business Intelligence
        </motion.p>

        <motion.p
          className="text-base sm:text-lg max-w-xl mb-10"
          style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          Your AI-powered business kete. Strategy, market insights, and smart
          decision-making tools — built for New Zealand businesses ready to lead.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <Link
            to="/contact"
            className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:opacity-90"
            style={{ background: ACCENT, color: "#fff" }}
          >
            Join the waitlist <ArrowRight size={16} />
          </Link>
          <Link
            to="/"
            className="px-8 py-3 rounded-full text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Back to home
          </Link>
        </motion.div>

        <motion.p
          className="mt-16 text-xs"
          style={{ color: "rgba(255,255,255,0.2)" }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          Coming soon — Arataki is in development.
        </motion.p>
      </main>

      <BrandFooter />
    </div>
  );
}
