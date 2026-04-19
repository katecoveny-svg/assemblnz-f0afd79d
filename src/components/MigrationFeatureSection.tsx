import { motion } from "framer-motion";
import { Database, Shield, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MaungaDivider } from "@/components/landing/AnimatedTaniko";

const ease = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease },
};
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.1, duration: 0.6, ease },
});

const CARDS = [
  {
    icon: Database,
    label: "Extract",
    description: "Connect to your existing system — POS, DMS, ERP, spreadsheets, or legacy database — and pull your data out cleanly.",
  },
  {
    icon: Shield,
    label: "Validate",
    description: "Every record passes through our compliance pipeline. Privacy Act checks, data format validation, duplicate detection, NZ-specific field verification.",
  },
  {
    icon: Rocket,
    label: "Go Live",
    description: "Your kete is loaded and operational. Staff accounts, historical records, compliance documents — all in place before you flip the switch.",
  },
];

const MigrationFeatureSection = () => (
  <section className="px-4 sm:px-6 py-16 sm:py-32 relative">
    {/* Background glow */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(74,165,168,0.06), transparent 70%)",
    }} />

    <div className="max-w-[1200px] mx-auto relative z-10">
      <motion.div {...fade} className="text-center mb-12">
        <MaungaDivider color="#4AA5A8" width={180} className="mb-4" />
        <div className="inline-flex items-center gap-3 mb-5">
          {/* Left peak */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M0 10 L7 0 L14 10 Z" fill="#4AA5A8" fillOpacity="0.18" stroke="#4AA5A8" strokeOpacity="0.7" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
          <p className="text-[10px] font-medium tracking-[5px] uppercase"
            style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}>
            Nuku Mai
          </p>
          {/* Right peak */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <path d="M0 10 L7 0 L14 10 Z" fill="#4AA5A8" fillOpacity="0.18" stroke="#4AA5A8" strokeOpacity="0.7" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-lg sm:text-[36px] lg:text-[42px] mb-4 uppercase tracking-[3px]"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, color: "#1A1D29" }}>
          Nuku Mai · Seamless Migration
        </h2>
        <p className="text-[15px] mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "#6B7280" }}>
          Your data moves with you — not against you
        </p>
        <p className="text-[14px] leading-[1.8] max-w-2xl mx-auto"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, color: "#6B7280" }}>
          Switching systems shouldn't mean starting over. Assembl's migration agents extract your data from legacy platforms, clean and validate it against NZ compliance requirements, and load it into your new kete — ready to work from day one. No lost records. No manual re-entry. No compliance gaps during the handover.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {CARDS.map((card, i) => (
          <motion.div key={card.label} {...stagger(i)}
            className="rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(74,165,168,0.1)",
              boxShadow: "6px 6px 16px rgba(166,166,180,0.2), -6px -6px 16px rgba(255,255,255,0.85)",
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "rgba(74,165,168,0.1)" }}>
              <card.icon size={20} style={{ color: "#4AA5A8" }} />
            </div>
            <p className="text-[11px] tracking-[2px] uppercase mb-2 font-medium"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#4AA5A8" }}>
              {card.label}
            </p>
            <p className="text-[14px] leading-[1.7]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280" }}>
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div {...fade} className="text-center">
        <Link to="/migration"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-semibold transition-all duration-300 hover:scale-[1.03] group"
          style={{
            background: "linear-gradient(145deg, #55BFC1, #4AA5A8)",
            color: "#FFFFFF",
            boxShadow: "0 6px 24px rgba(74,165,168,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
            fontFamily: "'Lato', sans-serif",
          }}>
          See how migration works
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default MigrationFeatureSection;
