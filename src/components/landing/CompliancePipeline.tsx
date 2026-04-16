import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { name: "Kahu", subtitle: "Compliance Gate", color: "#4AA5A8" },
  { name: "Iho", subtitle: "Intelligence Core", color: "#3D8F92" },
  { name: "Tā", subtitle: "Action Layer", color: "#E8A948" },
  { name: "Mahara", subtitle: "Memory & Audit", color: "#B8A5D0" },
  { name: "Mana", subtitle: "Governance Output", color: "#7BA88C" },
];

const CompliancePipeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-4 sm:px-6 py-16 sm:py-28">
      <div className="max-w-5xl mx-auto">
        <motion.p
          className="text-center text-[10px] font-medium tracking-[5px] uppercase mb-5"
          style={{ color: "#4AA5A8", fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Five-stage compliance pipeline
        </motion.p>

        <motion.h2
          className="text-center text-lg sm:text-[36px] lg:text-[42px] mb-16"
          style={{ fontFamily: "'Lato', sans-serif", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#1A1D29" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Every output passes through all five stages. No shortcuts.
        </motion.h2>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4">
          {/* Connecting line */}
          <div className="hidden sm:block absolute top-7 left-[55px] right-[55px] h-px" style={{ background: "rgba(74,165,168,0.1)" }}>
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #4AA5A8, #E8A948)" }}
              initial={{ width: "0%" }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />
          </div>

          {stages.map((stage, i) => (
            <motion.div
              key={stage.name}
              className="flex flex-col items-center text-center min-w-[120px] relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Glass node */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.85), rgba(238,238,242,0.65))",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.95)",
                  boxShadow: `4px 4px 12px rgba(166,166,180,0.35), -4px -4px 12px rgba(255,255,255,0.9), 0 0 20px ${stage.color}20`,
                }}>
                <div className="w-4 h-4 rounded-full" style={{ background: stage.color, boxShadow: `0 0 10px ${stage.color}50` }} />
              </div>
              <span className="text-[10px] tracking-[3px] uppercase font-medium"
                style={{ color: stage.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {stage.name}
              </span>
              <span className="text-[11px] mt-2 max-w-[130px] leading-[1.6]"
                style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stage.subtitle}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompliancePipeline;
