import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const PROOF_STRIP = [
  { value: "44", label: "specialist agents", color: "#D4A843" },
  { value: "7", label: "industry kete", color: "#3A7D6E" },
  { value: "Built in", label: "Aotearoa", color: "#D4A843" },
  { value: "SMS", label: "-ready", color: "#3A7D6E" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative flex flex-col" style={{ minHeight: "100vh" }}>
      <div className="absolute inset-0 z-0" style={{ background: "#09090F" }} />
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 55%, rgba(212,168,67,0.05) 0%, transparent 70%)" }} />

      <motion.div className="relative z-[2] w-full flex items-center justify-center overflow-hidden" style={{ height: isMobile ? "45vh" : "50vh" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <video autoPlay loop muted playsInline className="w-full h-full object-cover" style={{ opacity: 0.85 }}>
          <source src="/videos/hero-matariki.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #09090F)" }} />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8" style={{ paddingTop: isMobile ? "1.5rem" : "2.5rem", paddingBottom: "3rem" }}>
        <motion.h1 className="max-w-3xl mx-auto"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: isMobile ? "1.6rem" : "2.75rem", lineHeight: 1.2, letterSpacing: "-0.01em", color: "#FFFFFF", marginBottom: "1.25rem" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
          The operating system for{" "}<span style={{ color: "#D4A843" }}>NZ business.</span>
        </motion.h1>

        <motion.p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: isMobile ? "15px" : "17px", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: "640px", marginBottom: "0.75rem" }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          All your business operations in one place: quoting, payroll, planning, marketing, compliance, execution — connected and intelligent.
        </motion.p>

        <motion.p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.4)", maxWidth: "520px", marginBottom: "1.5rem" }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}>
          44 specialist AI agents across seven industry kete. Built in New Zealand. Designed for real businesses.
        </motion.p>

        <motion.div className="flex flex-wrap justify-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
          {PROOF_STRIP.map((s) => (
            <span key={s.label} className="px-4 py-2 rounded-full text-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, background: "rgba(15,15,26,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", letterSpacing: "0.05em" }}>
              <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>{" "}{s.label}
            </span>
          ))}
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
          <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, background: "#D4A843", border: "1px solid #D4A843", color: "#09090F", boxShadow: "0 0 20px rgba(212,168,67,0.2)" }}>
            Book a Launch Sprint <ArrowRight size={16} />
          </Link>
          <button onClick={onScrollToGrid} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm rounded-full transition-all duration-300"
            style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, background: "transparent", border: "1px solid rgba(58,125,110,0.4)", color: "#3A7D6E" }}>
            Explore industry packs →
          </button>
        </motion.div>
      </div>

      <motion.button onClick={onScrollToGrid} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default AnimatedHero;
