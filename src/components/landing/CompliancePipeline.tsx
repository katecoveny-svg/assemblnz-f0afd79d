import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { name: "KAHU", question: "What's allowed here?", subtitle: "Policy detection", color: "#4AA5A8", glow: "rgba(74,165,168,0.3)" },
  { name: "IHO", question: "Which specialist handles this?", subtitle: "Routing", color: "#4AA5A8", glow: "rgba(232,169,72,0.3)" },
  { name: "TĀ", question: "Does the work, properly", subtitle: "Execution + NZ English / te reo correctness", color: "#B8A5D0", glow: "rgba(184,165,208,0.35)" },
  { name: "MAHARA", question: "Checks against what we've learned", subtitle: "Memory + cross-verification", color: "#7BA88C", glow: "rgba(123,168,140,0.25)" },
  { name: "MANA", question: "Proves it was done right", subtitle: "Assurance, disclaimers, human-in-the-loop", color: "#4AA5A8", glow: "rgba(74,165,168,0.25)" },
];

const lineColors = [
  "linear-gradient(90deg, #4AA5A8, #4AA5A8)",
  "linear-gradient(90deg, #4AA5A8, #B8A5D0)",
  "linear-gradient(90deg, #B8A5D0, #7BA88C)",
  "linear-gradient(90deg, #7BA88C, #4AA5A8)",
];

const CompliancePipeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 sm:px-6 py-20 sm:py-32">
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
          className="text-center text-lg sm:text-[36px] lg:text-[42px] mb-20"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#3D4250" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Every output passes through all five stages. No shortcuts.
        </motion.h2>

        <motion.p
          className="text-center text-[13px] max-w-[640px] mx-auto -mt-12 mb-16"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#6B7280", lineHeight: 1.7 }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Every output passes through all five stages. Draft-only posture — no agent publishes, sends, or executes without a named human operator's approval.
        </motion.p>

        {/* Pipeline row */}
        <div className="relative flex items-center justify-center gap-0 mx-auto" style={{ maxWidth: 900 }}>
          {stages.map((stage, i) => (
            <div key={stage.name} className="flex items-center" style={{ flex: i < stages.length - 1 ? 1 : undefined }}>
              {/* Glass sphere */}
              <motion.div
                className="relative z-10 flex items-center justify-center shrink-0"
                style={{ width: i === 2 ? 120 : 100, height: i === 2 ? 120 : 100 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* Outer glow */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${stage.glow} 0%, transparent 70%)`,
                    transform: "scale(1.4)",
                  }}
                />
                {/* Glass sphere body */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, ${stage.color}15 60%, ${stage.color}25 100%)`,
                    border: `1.5px solid ${stage.color}40`,
                    boxShadow: `
                      inset 0 -8px 20px ${stage.color}15,
                      inset 0 4px 12px rgba(255,255,255,0.9),
                      0 8px 32px ${stage.glow},
                      0 2px 8px rgba(0,0,0,0.04)
                    `,
                  }}
                />
                {/* Specular highlight */}
                <div
                  className="absolute rounded-full"
                  style={{
                    top: "12%",
                    left: "20%",
                    width: "45%",
                    height: "30%",
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 100%)",
                  }}
                />
                {/* Label */}
                <span
                  className="relative z-10"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: stage.name.length > 4 ? 13 : 16,
                    letterSpacing: "0.08em",
                    color: "#3D4250",
                    textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                  }}
                >
                  {stage.name}
                </span>
              </motion.div>

              {/* Connecting line */}
              {i < stages.length - 1 && (
                <div className="relative flex-1 h-[2px] mx-[-2px]" style={{ minWidth: 40 }}>
                  <div className="absolute inset-0" style={{ background: "rgba(200,200,210,0.15)" }} />
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ background: lineColors[i] }}
                    initial={{ width: "0%" }}
                    animate={isInView ? { width: "100%" } : {}}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.2, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage descriptions grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-16">
          {stages.map((stage, i) => (
            <motion.div
              key={`desc-${stage.name}`}
              className="text-center px-2"
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
            >
              <p className="text-[10px] tracking-[2px] uppercase mb-2" style={{ color: stage.color, fontFamily: "'JetBrains Mono', monospace" }}>
                Stage {i + 1} · {stage.name}
              </p>
              <p className="text-[14px] mb-1.5" style={{ color: "#1A1D29", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, lineHeight: 1.35 }}>
                "{stage.question}"
              </p>
              <p className="text-[11px]" style={{ color: "#6B7280", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5 }}>
                {stage.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompliancePipeline;
